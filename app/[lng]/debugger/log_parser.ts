const IGNORED_PATTERNS = [
    /auto_tpi_manager\s*\]/,
    /Last_sent_temperature/,
    /no change in valve_open_percent/,
    /recalculate the open percent/,
    /underlying_climate_start_hvac_action_date to calculate energy/,
    /thermostat_climate\s*\] .+ - usage time_delta:/,
    /thermostat_climate\s*\] .+ - usage regulation_step:/,
    /feature_heating_failure_detection_manager\s*\]/,
    /thermostat_climate\s*\] .+ - Calling ThermostatClimate\._send_regulated_temperature/,
    /feature_auto_start_stop_manager\s*\] .* - auto start\/stop is /,
    /base_thermostat\s*\] .+ - last_change_time is now/,
    /feature_safety_manager\s*\] SafetyManager-.+ - checking safety delta_temp=/,
    /thermostat_climate_valve\s*\] .+ - last_regulation_change is now/,
    /thermostat_climate\s*\] .+ - period \([0-9.]+\) min is .+ min -> /,
    /base_thermostat\s*\] .+ - After setting _last/,
    /Forget the event/,
    /After setting _last_temperature_measure/,
    /Window auto event is ignored/,
    /feature_window_manager\].+check the alert/,
    /thermostat_climate\s*\] .+ - added energy is/,
    /thermostat_climate\s*\] .+ - incremente_energy incremented energy is/,
    /thermostat_climate\s*\] .+ - don't send regulated temperature/,
    /auto_start_stop_algorithm\s*\] AutoStartStopDetectionAlgorithm-.* - new calculation of auto_start_stop/,
    /auto_start_stop_algorithm\s*\] AutoStartStopDetectionAlgorithm-.* - calculate_action: requested_hvac_mode=/,
    /auto_start_stop_algorithm\s*\] AutoStartStopDetectionAlgorithm-.* - nothing to do/,
    /underlying event is received less than 10 sec after command/,
    /do_set_temperature_later call/,
    / new last_temperature_measure is now: /,
]

const ADV_FILTER_RULES = [
    /Receive power sensor state/,
    /New current power has been retrieved/,
    /Last seen temperature changed to state/,
    /Periodical control cycle started/,
    /Calling update_custom_attributes/,
    /find preset temp:/,
    /Calling ThermostatClimate\._send_regulated_temperature/,
    / -> forget the auto-regulation send/,
    /of calculate_shedding/,
    /shedding calculation/,
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

export type ZoomType = {
    mindate?: Date,
    maxdate?: Date,
    enabled: boolean
}

export const CHUNK_SIZE = 2 * 1024 * 1024; // 2 Mo par chunk
export const LINES_PER_TICK = 500;         // lignes traitées avant de céder le thread + mise à jour de la progression

/** Lit un Blob en texte de façon asynchrone */
export function readBlobAsText(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(blob);
    });
}


/** Cède le contrôle au navigateur (évite le freeze) */
export function yieldToMain(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 0));
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
    public startstop_state: { timestamp: Date, value: FeatureState }[] = [];
    public preset: { timestamp: Date, value: string }[] = [];
    public hvac_mode: { timestamp: Date, value: string }[] = [];

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
    }
}

export function advFilterLog(line: string): boolean {
    if (!line.includes('[custom_components.versatile_thermostat')) {
        return true;
    }

    for (const rule of ADV_FILTER_RULES) {
        if (line.match(rule)) {
            return true;
        }
    }

    return false;
}

export function clearLineStr(line: string): string {
    const txt = line.replaceAll(/\x1b[^m]+m/g, '');
    return txt
}

export class LogParser {
    private logs: string[] = [];
    private thermostats: Map<string, VThermLogParser> = new Map();
    private last_thermo: string | null = null;

    public central_boiler: { timestamp: Date, value: FeatureState }[] = []
    public central_mode: { timestamp: Date, value: string }[] = []

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

        const match = line.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d{3})?/)
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
        let time: string | undefined = undefined;

        // Format HA
        let match = line.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d{3})?) \w+ \(MainThread\) \[custom_components\.versatile_thermostat\./)
        if (match) {
            time = match[1];
        }

        // Format VTherm
        match = line.match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d{3})?)\s+\w+\s+\[\s*\w+\s*\] /)
        if (match) {
            time = match[1];
        }

        if (!time) {
            console.warn('Date not found or not vTherm:', line)
            return;
        }

        for (const pattern of IGNORED_PATTERNS) {
            if (line.search(pattern) !== -1) {
                return;
            }
        }


        match = line.match(/NEW EVENT: (VersatileThermostat-)?(.+) - /)
        if (match) {
            this.getThermoParser(match[2]).parseLog(new Date(time), line);
            return;
        }

        // Log Exporter format
        match = line.match(/\] (.+) - ---------------------> NEW EVENT:/)
        if (match && match[1] != 'VersatileThermostat-Central Mode') {
            this.getThermoParser(match[1]).parseLog(new Date(time), line);
            return;
        }

        match = line.match(/underlyings\s*\] (VersatileThermostat-)?(.+)-climate\..+ Set setpoint temperature to: ([0-9.]+)/)
        if (match) {
            this.getThermoParser(match[2]).underlying_setpoints.push({ timestamp: new Date(time), value: parseFloat(match[3]) });
            return;
        }

        match = line.match(/prop_algorithm\s*\] (.+) - heating percent calculated for current_temp ([0-9.]+), ext_current_temp ([0-9.]+) and target_temp ([0-9.]+)/)
        if (match) {
            this.getThermoParser(match[1]).room_temps.push({ timestamp: new Date(time), value: parseFloat(match[2]) });
            this.getThermoParser(match[1]).ext_temps.push({ timestamp: new Date(time), value: parseFloat(match[3]) });
            this.getThermoParser(match[1]).target_temps.push({ timestamp: new Date(time), value: parseFloat(match[4]) });
            return;
        }

        match = line.match(/thermostat_climate\s*\] (VersatileThermostat-)?(.+) - The device offset temp for regulation is ([0-9.]+) - internal temp is ([0-9.]+)\. New target is ([0-9.]+)/)
        if (match) {
            if (match[3] != "0.00" && match[4] != "0.00") {
                this.getThermoParser(match[2]).offset_temps.push({ timestamp: new Date(time), value: parseFloat(match[3]) });
                this.getThermoParser(match[2]).underlying_temps.push({ timestamp: new Date(time), value: parseFloat(match[4]) });
            }
            this.getThermoParser(match[2]).underlying_setpoints.push({ timestamp: new Date(time), value: parseFloat(match[5]) });
            return;
        }

        match = line.match(/thermostat_climate(_valve)?\s*\] (VersatileThermostat-)?(.+) - Calling update_custom_attributes: (.+)/)
        if (match) {
            this.getThermoParser(match[3]).parseState(new Date(time), match[4]);
            return
        }

        match = line.match(/thermostat_climate\s*\] (VersatileThermostat-)?(.+) - Regulated temp have changed to ([0-9.]+)\. Resend it to underlyings/)
        if (match) {
            this.getThermoParser(match[2]).regulated_temps.push({ timestamp: new Date(time), value: parseFloat(match[3]) });
            return;
        }

        match = line.match(/thermostat_climate\s*\] (VersatileThermostat-)?(.+) - regulation calculation will be done/)
        if (match) {
            this.last_thermo = match[2];
            return;
        }

        match = line.match(/pi_algorithm\s*\] PITemperatureRegulator - Error: ([0-9.]+) accumulated_error: ([0-9.]+) \(overheat protection True and delta ([0-9.]+)\) offset: ([0-9.]+) offset_ext: ([0-9.]+) target_tem: ([0-9.]+) regulatedTemp: ([0-9.]+)/)
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

        match = line.match(/base_thermostat\s*\] (VersatileThermostat-)?(.+) - Applying new target temperature: ([0-9.]+)/)
        if (match) {
            this.getThermoParser(match[2]).target_temps.push({ timestamp: new Date(time), value: parseFloat(match[3]) });
            return;
        }

        match = line.match(/ema\s*\] EMA-(.+) - .+ measurement=([0-9.]+) /)
        if (match) {
            this.getThermoParser(match[1]).room_temps.push({ timestamp: new Date(time), value: parseFloat(match[2]) });
            return;
        }

        match = line.match(/prop_algorithm\s*\] (.+) - Proportional algorithm: on_percent is forced to 0 cause current_temp \(([0-9.]+)\) /)
        if (match) {
            this.getThermoParser(match[1]).room_temps.push({ timestamp: new Date(time), value: parseFloat(match[2]) });
            return;
        }

        match = line.match(/base_thermostat\s*\] (VersatileThermostat-)?(.+) - current state changed to VThermState\(hvac_mode=(\w+), target_temperature=([0-9.]+), preset=(\w+),/)
        if (match) {
            this.getThermoParser(match[2]).target_temps.push({ timestamp: new Date(time), value: parseFloat(match[4]) });
            this.getThermoParser(match[2]).preset.push({ timestamp: new Date(time), value: match[5] });
            this.getThermoParser(match[2]).hvac_mode.push({ timestamp: new Date(time), value: match[3] });
            return;
        }

        match = line.match(/underlyings\s*\] (VersatileThermostat-)?(.+)-climate\..* --------> Underlying state change received:.*current_temperature=([0-9.]+), temperature=([0-9.]+),/)
        if (match) {
            this.getThermoParser(match[2]).underlying_temps.push({ timestamp: new Date(time), value: parseFloat(match[3]) });
            this.getThermoParser(match[2]).underlying_setpoints.push({ timestamp: new Date(time), value: parseFloat(match[4]) });
            return;
        }

        match = line.match(/feature_auto_start_stop_manager\s*\] AutoStartStopManager-(.*) - VTherm should be OFF/)
        if (match) {
            this.getThermoParser(match[1]).startstop_state.push({ timestamp: new Date(time), value: FeatureState.TRIGGER });
            return;
        }

        match = line.match(/feature_auto_start_stop_manager\s*\] AutoStartStopManager-(.*) - VTherm should be ON/)
        if (match) {
            this.getThermoParser(match[1]).startstop_state.push({ timestamp: new Date(time), value: FeatureState.NORMAL });
            return;
        }

        match = line.match(/feature_auto_start_stop_manager\s*\] AutoStartStopManager-(.*) - auto_start_stop should be off is True/)
        if (match) {
            this.getThermoParser(match[1]).startstop_state.push({ timestamp: new Date(time), value: FeatureState.TRIGGER });
            return;
        }

        match = line.match(/feature_auto_start_stop_manager\s*\] AutoStartStopManager-(.*) - auto_start_stop should be off is False/)
        if (match) {
            this.getThermoParser(match[1]).startstop_state.push({ timestamp: new Date(time), value: FeatureState.NORMAL });
            return;
        }

        match = line.match(/auto_start_stop_algorithm\s*\] AutoStartStopDetectionAlgorithm-(.*) - We need to stop, there is no need for cooling for a long time/)
        if (match) {
            this.getThermoParser(match[1]).startstop_state.push({ timestamp: new Date(time), value: FeatureState.TRIGGER });
            return;
        }

        match = line.match(/auto_start_stop_algorithm\s*\] AutoStartStopDetectionAlgorithm-(.*) - We need to start cooling./)
        if (match) {
            this.getThermoParser(match[1]).startstop_state.push({ timestamp: new Date(time), value: FeatureState.NORMAL });
            return;
        }

        match = line.match(/Central boiler is being turned on /)
        if (match) {
            this.central_boiler.push({ timestamp: new Date(time), value: 1 })
            return;
        }

        match = line.match(/Central boiler is being turned off /)
        if (match) {
            this.central_boiler.push({ timestamp: new Date(time), value: 0 })
            return;
        }

        match = line.match(/Central mode is being changed from \w+ to (\w+)/)
        if (match) {
            this.central_mode.push({ timestamp: new Date(time), value: match[1] })
            return;
        }

        match = line.match(/base_thermostat\s*\] (.+) - Applying new hvac mode: (\w+)/)
        if (match) {
            this.getThermoParser(match[1]).hvac_mode.push({ timestamp: new Date(time), value: match[2] })
            return;
        }

        match = line.match(/base_thermostat\s*\] (.+) - Checking new cycle\. hvac_mode=(\w+), safety_state=(\w+), preset_mode=(\w+),/)
        if (match) {
            this.getThermoParser(match[1]).hvac_mode.push({ timestamp: new Date(time), value: match[2] })
            this.getThermoParser(match[1]).preset.push({ timestamp: new Date(time), value: match[4] })
            this.getThermoParser(match[1]).safety_state.push({ timestamp: new Date(time), value: match[3] == 'on' ? FeatureState.TRIGGER : FeatureState.NORMAL })
            return
        }

        /*
         * Fallback parsing section
         */

        match = line.match(/underlyings\s*] ([^.]+)-\w+\.\w+ -------->/)
        if (match) {
            this.getThermoParser(match[1]); // Annonce the thermostat
            return;
        }
        //console.log('No parse for line:', line);
    }
}
