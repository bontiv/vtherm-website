const IGNORED_PATTERNS = [
    /\[custom_components.versatile_thermostat.auto_tpi_manager\]/,
    /Last_sent_temperature/,
    /no change in valve_open_percent/,
    /recalculate the open percent/,
    /underlying_climate_start_hvac_action_date to calculate energy/,
    /\[custom_components\.versatile_thermostat\.thermostat_climate\] .+ - usage time_delta:/,
    /\[custom_components\.versatile_thermostat\.thermostat_climate\] .+ - usage regulation_step:/,
    /\[custom_components\.versatile_thermostat\.feature_heating_failure_detection_manager\]/,
    /\[custom_components\.versatile_thermostat\.thermostat_climate\] .+ - Calling ThermostatClimate\._send_regulated_temperature/,
    /\[custom_components\.versatile_thermostat\.feature_auto_start_stop_manager\] .* - auto start\/stop is /,
    /\[custom_components\.versatile_thermostat\.base_thermostat\] .+ - last_change_time is now/,
    /\[custom_components\.versatile_thermostat\.feature_safety_manager\] SafetyManager-.+ - checking safety delta_temp=/,
    /\[custom_components\.versatile_thermostat\.thermostat_climate_valve\] .+ - last_regulation_change is now/,
    /\[custom_components\.versatile_thermostat\.thermostat_climate\] VersatileThermostat-.+ - period \([0-9.]+\) min is .+ min -> /,
    /\[custom_components\.versatile_thermostat\.base_thermostat\] VersatileThermostat-.+ - Checking new cycle\./,
    /\[custom_components\.versatile_thermostat\.base_thermostat\] VersatileThermostat-.+ - After setting _last/,
    /Forget the event/,
]

export type LogTextInfo = {
    level: string,
    climate: string,
    date?: Date,
    txt: string
}

export enum FeatureState {
    BYPASS = -1,
    NORMAL = 0,
    TRIGGER = 1,
}

class VThermLogParser {
    private name: string;
    public underlying_setpoints: { timestamp: Date, value: number }[] = [];
    public underlying_temps: { timestamp: Date, value: number }[] = [];
    public room_temps: { timestamp: Date, value: number }[] = [];
    public ext_temps: { timestamp: Date, value: number }[] = [];
    public target_temps: { timestamp: Date, value: number }[] = [];
    public offset_temps: { timestamp: Date, value: number }[] = [];
    public regulated_temps: { timestamp: Date, value: number }[] = [];
    public valve_open_percents: { timestamp: Date, value: number }[] = [];
    public on_percents: { timestamp: Date, value: number }[] = [];

    public window_state: { timestamp: Date, value: FeatureState }[] = [];
    public safety_state: { timestamp: Date, value: FeatureState }[] = [];

    public config: any = {};

    public constructor(name: string) {
        this.name = name;
    }

    public parseLog(timestamp: Date, log: string) {
        let match = undefined;

        match = log.match(/Outdoor temperature changed to state ([\d.]+) /)
        if (match) {
            this.ext_temps.push({ timestamp, value: parseFloat(match[1]) })
            return;
        }

        match = log.match(/Temperature changed to state ([\d.]+) /)
        if (match) {
            this.room_temps.push({ timestamp, value: parseFloat(match[1]) })
            return;
        }

        match = log.match(/Underlying climate .* changed from .* to new_state .* current_temperature=([\d.]+),/)
        if (match) {
            this.underlying_temps.push({ timestamp, value: parseFloat(match[1]) })
            return;
        }

        match = log.match(/Window is detected as closed/)
        if (match) {
            this.window_state.push({ timestamp, value: FeatureState.NORMAL })
            return;
        }

            match = log.match(/Window sensor changed to state off/)
        if (match) {
            this.window_state.push({ timestamp, value: FeatureState.NORMAL })
            return;
        }

        match = log.match(/Window sensor changed to state on/)
        if (match) {
            this.window_state.push({ timestamp, value: FeatureState.TRIGGER })
            return;
        }

        match = log.match(/Starting safety mode/)
        if (match) {
            this.safety_state.push({ timestamp, value: FeatureState.TRIGGER })
            return;
        }

        match = log.match(/Ending safety mode/)
        if (match) {
            this.safety_state.push({ timestamp, value: FeatureState.NORMAL })
            return;
        }

        //console.log('Not parsed line', log)
    }

    public parseState(time: Date, state: string) {
        let match = state.match(/'ext_current_temperature': ([0-9.]+),/)
        if (match) {
            this.ext_temps.push({ timestamp: time, value: parseFloat(match[1]) });
        }

        match = state.match(/'target_temperature': ([0-9.]+),/)
        if (match) {
            this.target_temps.push({ timestamp: time, value: parseFloat(match[1]) });
        }

        match = state.match(/'on_percent': ([0-9.]+),/)
        if (match) {
            this.on_percents.push({ timestamp: time, value: parseFloat(match[1]) * 100 });
        }

        match = state.match(/'valve_open_percent': ([0-9.]+),/)
        if (match) {
            this.valve_open_percents.push({ timestamp: time, value: parseFloat(match[1]) * 100 });
        }

        try {
            const config_json = state.replace(/'/g, '"')
                .replace(/None/g, 'null')
                .replace(/True/g, 'true')
                .replace(/False/g, 'false')
                .replace(/<([^:]*): ([^>]*)>/g, '{"$1": $2}')
                ;
            this.config = JSON.parse(config_json);
        } catch (e) {
            // console.error('Failed to parse config JSON for thermostat', this.name, 'from state:', state, 'error:', e);
        }
    }
}

function clearLineStr(line: string): string {
    const txt = line.replaceAll(/\x1b[^m]+m/g, '');
    return txt
}

export class LogParser {
    private logs: string[] = [];
    private thermostats: Map<string, VThermLogParser> = new Map();
    private last_thermo: string | null = null;

    public constructor(logs?: string) {
        if (logs) {
            const log_lines = logs.split('\n');
            for (const line of log_lines) {
                const cleaned_line = line.replaceAll(/\x1b[^m]+m/g, '');

                if (cleaned_line.match(/^[^[]+\[[^]]+\]\s*$/)) {
                    continue;
                }

                this.parseLine(cleaned_line);
                this.logs.push(cleaned_line);
            }

            console.info(`Parsed log with ${this.logs.length} lines and ${this.thermostats.size} thermostats.`);
        }
    }

    public getThermostats(): string[] {
        return Array.from(this.thermostats.keys());
    }

    public getThermostat(name: string): VThermLogParser | undefined {
        return this.thermostats.get(name);
    }

    public getLogTextInfos(line: string): LogTextInfo {
        let climate = '';
        const txt = clearLineStr(line)

        for (const know_climate of this.getThermostats()) {
            if (txt.includes(know_climate)) {
                climate = know_climate;
            }
        }

        let level = "DEBUG";
        if (txt.search(/ERROR|CRITICAL|FATAL/) !== -1) {
            level = "ERROR";
        } else if (txt.search(/WARNING/) !== -1) {
            level = "WARNING";
        } else if (txt.search(/INFO/) !== -1) {
            level = "INFO";
        }

        let match = line.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d{3})?/)
        const date = match ? new Date(match[0]) : undefined
        return { climate, level, date, txt }
    }

    private getThermoParser(thermo: string): VThermLogParser {
        if (thermo.startsWith('VersatileThermostat-')) {
            console.error('Thermostat name should not start with "VersatileThermostat-", removing prefix for parser key:', thermo);
            throw new Error('Thermostat name should not start with "VersatileThermostat-", removing prefix for parser key:' + thermo);
        }
        if (!this.thermostats.has(thermo)) {
            this.thermostats.set(thermo, new VThermLogParser(thermo));
        }
        return this.thermostats.get(thermo)!;
    }

    public parseLine(line: string) {
        for (const pattern of IGNORED_PATTERNS) {
            if (line.search(pattern) !== -1) {
                return;
            }
        }

        let match = line.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d{3})?/)
        if (!match) {
            console.warn('Date not found:', line)
            return
        }
        const time = match[0];

        match = line.match(/NEW EVENT: VersatileThermostat-(.+) - /)
        if (match) {
            this.getThermoParser(match[1]).parseLog(new Date(time), line);
            return;
        }

        match = line.match(/\[custom_components\.versatile_thermostat\.underlyings\] VersatileThermostat-(.+)-climate\..+ Set setpoint temperature to: ([0-9.]+)/)
        if (match) {
            this.getThermoParser(match[1]).underlying_setpoints.push({ timestamp: new Date(time), value: parseFloat(match[2]) });
            return;
        }

        match = line.match(/\[custom_components\.versatile_thermostat\.prop_algorithm\] (.+) - heating percent calculated for current_temp ([0-9.]+), ext_current_temp ([0-9.]+) and target_temp ([0-9.]+)/)
        if (match) {
            this.getThermoParser(match[1]).room_temps.push({ timestamp: new Date(time), value: parseFloat(match[2]) });
            this.getThermoParser(match[1]).ext_temps.push({ timestamp: new Date(time), value: parseFloat(match[3]) });
            this.getThermoParser(match[1]).target_temps.push({ timestamp: new Date(time), value: parseFloat(match[4]) });
            return;
        }

        match = line.match(/\[custom_components\.versatile_thermostat\.thermostat_climate\] VersatileThermostat-(.+) - The device offset temp for regulation is ([0-9.]+) - internal temp is ([0-9.]+). New target is ([0-9.]+)/)
        if (match) {
            this.getThermoParser(match[1]).offset_temps.push({ timestamp: new Date(time), value: parseFloat(match[2]) });
            this.getThermoParser(match[1]).underlying_temps.push({ timestamp: new Date(time), value: parseFloat(match[3]) });
            this.getThermoParser(match[1]).underlying_setpoints.push({ timestamp: new Date(time), value: parseFloat(match[4]) });
            return;
        }

        match = line.match(/\[custom_components\.versatile_thermostat\.thermostat_climate(_valve)?\] VersatileThermostat-(.+) - Calling update_custom_attributes: (.+)/)
        if (match) {
            this.getThermoParser(match[2]).parseState(new Date(time), match[3]);
            return
        }

        match = line.match(/\[custom_components\.versatile_thermostat\.thermostat_climate\] VersatileThermostat-(.+) - Regulated temp have changed to ([0-9.]+)\. Resend it to underlyings/)
        if (match) {
            this.getThermoParser(match[1]).regulated_temps.push({ timestamp: new Date(time), value: parseFloat(match[2]) });
            return;
        }

        match = line.match(/\[custom_components\.versatile_thermostat\.thermostat_climate\] VersatileThermostat-(.+) - regulation calculation will be done/)
        if (match) {
            this.last_thermo = match[1];
            return;
        }

        match = line.match(/\[custom_components\.versatile_thermostat\.pi_algorithm\] PITemperatureRegulator - Error: ([0-9.]+) accumulated_error: ([0-9.]+) \(overheat protection True and delta ([0-9.]+)\) offset: ([0-9.]+) offset_ext: ([0-9.]+) target_tem: ([0-9.]+) regulatedTemp: ([0-9.]+)/)
        if (match && this.last_thermo) {
            // this.getThermoParser(this.last_thermo).pi_errors.push({ timestamp: new Date(time), value: parseFloat(match[1]) });
            // this.getThermoParser(this.last_thermo).pi_accumulated_errors.push({ timestamp: new Date(time), value: parseFloat(match[2]) });
            // this.getThermoParser(this.last_thermo).pi_deltas.push({ timestamp: new Date(time), value: parseFloat(match[3]) });
            this.getThermoParser(this.last_thermo).offset_temps.push({ timestamp: new Date(time), value: parseFloat(match[4]) });
            // this.getThermoParser(this.last_thermo).pi_offset_exts.push({ timestamp: new Date(time), value: parseFloat(match[5]) });
            this.getThermoParser(this.last_thermo).target_temps.push({ timestamp: new Date(time), value: parseFloat(match[6]) });
            this.getThermoParser(this.last_thermo).regulated_temps.push({ timestamp: new Date(time), value: parseFloat(match[7]) });
            return;
        }

        match = line.match(/\[custom_components\.versatile_thermostat\.base_thermostat\] VersatileThermostat-(.+) - Applying new target temperature: ([0-9.]+)/)
        if (match) {
            this.getThermoParser(match[1]).target_temps.push({ timestamp: new Date(time), value: parseFloat(match[2]) });
            return;
        }

        match = line.match(/\[custom_components\.versatile_thermostat\.ema\] EMA-(.+) - .+ measurement=([0-9.]+) /)
        if (match) {
            this.getThermoParser(match[1]).room_temps.push({ timestamp: new Date(time), value: parseFloat(match[2]) });
            return;
        }

        match = line.match(/\[custom_components\.versatile_thermostat\.prop_algorithm\] (.+) - Proportional algorithm: on_percent is forced to 0 cause current_temp \(([0-9.]+)\) /)
        if (match) {
            this.getThermoParser(match[1]).room_temps.push({ timestamp: new Date(time), value: parseFloat(match[2]) });
            return;
        }

        match = line.match(/\[custom_components\.versatile_thermostat\.base_thermostat\] VersatileThermostat-(.+) - current state changed to VThermState\(hvac_mode=.+, target_temperature=([0-9.]+), preset=/)
        if (match) {
            this.getThermoParser(match[1]).target_temps.push({ timestamp: new Date(time), value: parseFloat(match[2]) });
            return;
        }

        //console.log('No parse for line:', line);
    }
}
