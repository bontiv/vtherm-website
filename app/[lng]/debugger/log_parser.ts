import { HEADER_DELIMITER, LogHeader, parseHeader, parsePythonLiteral } from "./header_parser";
import { LOG_LEVELS, LogIndex, LogLevel, NO_THERMOSTAT } from "./log_index";
import { parseTimestamp, TimeZoneMode } from "./time";

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


/** Cède le contrôle au navigateur (évite le freeze) */
export function yieldToMain(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Lit un Blob par chunks et produit ses lignes, avec la position lue.
 * Le décodage UTF-8 est fait en flux pour ne pas couper un caractère multi-octets
 * à la frontière de deux chunks, et la dernière ligne (sans \n final) est émise.
 */
export async function* readLines(blob: Blob, chunkSize = CHUNK_SIZE): AsyncGenerator<{ lines: string[], offset: number }> {
    const decoder = new TextDecoder('utf-8');
    let offset = 0;
    let leftover = '';

    while (offset < blob.size) {
        const chunk = blob.slice(offset, offset + chunkSize);
        const text = decoder.decode(await chunk.arrayBuffer(), { stream: true });
        offset += chunk.size;

        const lines = (leftover + text).split('\n');
        leftover = lines.pop() ?? '';
        yield { lines, offset };
    }

    leftover += decoder.decode();
    if (leftover.length > 0) yield { lines: [leftover], offset };
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
    public power_percents: { timestamp: Date, value: number }[] = [];

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

/** true when the line is noise: not a VTherm log, or a very frequent VTherm log */
export function advFilterLog(line: string): boolean {
    if (!line.includes('[custom_components.versatile_thermostat') && !VTHERM_FORMAT_RE.test(line)) {
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

export type ThermostatConfig = {
    source: 'header' | 'setup_entry',
    values: Record<string, unknown>,
    /** File line of the async_setup_entry log (setup_entry source) */
    line?: number,
    timestamp?: Date,
}

export type ConfigDiff = {
    key: string,
    startup: unknown,
    current: unknown,
}

export type LevelCounts = Record<LogLevel, number>;

const LINE_TIMESTAMP_RE = /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)?)\s+(?:(DEBUG|INFO|WARNING|ERROR|CRITICAL|FATAL)\b)?/;
const HA_FORMAT_RE = /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d{3})?) \w+ \(MainThread\) \[custom_components\.versatile_thermostat[\].]/;
const VTHERM_FORMAT_RE = /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d{3})?)\s+\w+\s+\[\s*\w+\s*\] /;
const SETUP_ENTRY_RE = /\] (?:VersatileThermostat-)?(.+?) - Calling async_setup_entry entry(?:: entry_id='[^']*', value='|=[^,]*, data=)(\{.*\})'?\s*$/;

function levelCode(level: string | undefined): number {
    switch (level) {
        case 'INFO': return 1;
        case 'WARNING': return 2;
        case 'ERROR':
        case 'CRITICAL':
        case 'FATAL': return 3;
        default: return 0;
    }
}

export class LogParser {
    private thermostats: Map<string, VThermLogParser> = new Map();
    private thermostatNames: string[] = [];
    private last_thermo: string | null = null;

    private headerState: 'start' | 'in_header' | 'body' = 'start';
    private headerLines: string[] = [];
    private lineNo = 0;
    private setupConfigs: Map<string, ThermostatConfig[]> = new Map();

    public header?: LogHeader;
    public timezone: TimeZoneMode = 'local';
    public index = new LogIndex();

    public central_boiler: { timestamp: Date, value: FeatureState }[] = []
    public central_mode: { timestamp: Date, value: string }[] = []

    public constructor(logs?: string) {
        if (logs) {
            for (const line of logs.split('\n')) {
                this.parseLine(line);
            }
            this.finalize();
        }
    }

    public getThermostats(): string[] {
        return Array.from(this.thermostats.keys());
    }

    public getThermostat(name: string): VThermLogParser | undefined {
        return this.thermostats.get(name);
    }

    public getThermostatIndex(name: string): number {
        return this.thermostatNames.indexOf(name);
    }

    /** Current configuration of a thermostat: the export header first, then the last async_setup_entry */
    public getConfig(name: string): ThermostatConfig | undefined {
        if (this.header?.config && this.header.thermostatName === name) {
            return { source: 'header', values: this.header.config, timestamp: this.header.generated };
        }
        const list = this.setupConfigs.get(name);
        return list?.[list.length - 1];
    }

    /** Thermostats whose configuration was found in an async_setup_entry log */
    public getSetupConfigThermostats(): string[] {
        return Array.from(this.setupConfigs.keys());
    }

    /** Configuration logged at the first startup found in the file */
    public getStartupConfig(name: string): ThermostatConfig | undefined {
        return this.setupConfigs.get(name)?.[0];
    }

    /** Values which changed between the startup found in the log and the export header */
    public getConfigDiff(name: string): ConfigDiff[] {
        const current = this.getConfig(name);
        const startup = this.getStartupConfig(name);
        if (!current || !startup || current.source !== 'header') return [];
        return Object.keys(startup.values)
            .filter(key => key in current.values && JSON.stringify(startup.values[key]) !== JSON.stringify(current.values[key]))
            .map(key => ({ key, startup: startup.values[key], current: current.values[key] }));
    }

    /** Number of lines per level, for a thermostat or for the whole file */
    public getLevelCounts(name?: string): LevelCounts {
        const counts: LevelCounts = { DEBUG: 0, INFO: 0, WARNING: 0, ERROR: 0 };
        const thermo = name === undefined ? undefined : this.getThermostatIndex(name);
        const { level, ts, length } = this.index;
        for (let i = 0; i < length; i++) {
            if (isNaN(ts[i])) continue; // continuation lines (tracebacks…)
            if (thermo !== undefined && this.index.thermo[i] !== thermo) continue;
            counts[LOG_LEVELS[level[i]]]++;
        }
        return counts;
    }

    /** First and last timestamps of the indexed lines */
    public getTimeBounds(): { start: Date, end: Date } | undefined {
        let min = Infinity, max = -Infinity;
        const { ts, length } = this.index;
        for (let i = 0; i < length; i++) {
            if (ts[i] < min) min = ts[i];
            if (ts[i] > max) max = ts[i];
        }
        return min <= max ? { start: new Date(min), end: new Date(max) } : undefined;
    }

    private getThermoParser(thermo: string): VThermLogParser {
        if (thermo.startsWith('VersatileThermostat-')) {
            console.error('Thermostat name should not start with "VersatileThermostat-", removing prefix for parser key:', thermo);
            throw new Error('Thermostat name should not start with "VersatileThermostat-", removing prefix for parser key:' + thermo);
        }
        if (!this.thermostats.has(thermo)) {
            this.thermostats.set(thermo, new VThermLogParser(thermo));
            this.thermostatNames.push(thermo);
        }
        return this.thermostats.get(thermo)!;
    }

    /** Thermostat a line belongs to: the longest known name found in the line */
    private findThermostat(line: string): number {
        let found = NO_THERMOSTAT;
        let foundLength = 0;
        for (let i = 0; i < this.thermostatNames.length; i++) {
            const name = this.thermostatNames[i];
            if (name.length > foundLength && line.includes(name)) {
                found = i;
                foundLength = name.length;
            }
        }
        return found;
    }

    /** Must be called once every line has been parsed */
    public finalize() {
        if (this.headerState === 'in_header') {
            // Header never closed: these lines are regular logs
            this.flushHeaderAsBody();
        }
        // Lines read before their thermostat was discovered
        const { index } = this;
        for (let i = 0; i < index.length; i++) {
            if (index.thermo[i] === NO_THERMOSTAT && !isNaN(index.ts[i])) {
                index.thermo[i] = this.findThermostat(index.lines[i]);
            }
        }
        index.finalize();
    }

    private flushHeaderAsBody() {
        const lines = this.headerLines;
        const first = this.lineNo - lines.length + 1;
        this.headerLines = [];
        this.headerState = 'body';
        lines.forEach((l, i) => this.parseBody(l, first + i));
    }

    public parseLine(rawLine: string) {
        this.lineNo++;
        const line = clearLineStr(rawLine).replace(/\r$/, '');

        if (this.headerState === 'start') {
            if (line.trim() === '') return;
            if (HEADER_DELIMITER.test(line)) {
                this.headerState = 'in_header';
                this.headerLines = [line];
                return;
            }
            this.headerState = 'body';
        } else if (this.headerState === 'in_header') {
            this.headerLines.push(line);
            if (HEADER_DELIMITER.test(line) && this.headerLines.length > 1) {
                const header = parseHeader(this.headerLines);
                if (header) {
                    this.header = header;
                    this.timezone = header.timezone;
                    this.getThermoParser(header.thermostatName);
                    this.headerLines = [];
                    this.headerState = 'body';
                } else {
                    this.flushHeaderAsBody();
                }
            } else if (this.headerLines.length > 5000) {
                this.flushHeaderAsBody();
            }
            return;
        }

        this.parseBody(line, this.lineNo);
    }

    private indexLine(line: string, lineNo: number) {
        if (line.trim() === '') return;
        const match = line.match(LINE_TIMESTAMP_RE);
        const { index } = this;
        if (match) {
            const ts = parseTimestamp(match[1], this.timezone).getTime();
            index.push(line, lineNo, ts, levelCode(match[2]), this.findThermostat(line));
        } else if (index.length > 0) {
            // Continuation of the previous line (traceback, multi-line message)
            const prev = index.length - 1;
            index.push(line, lineNo, NaN, index.level[prev], index.thermo[prev]);
        } else {
            index.push(line, lineNo, NaN, 0, NO_THERMOSTAT);
        }
    }

    private parseBody(line: string, lineNo: number) {
        this.indexLine(line, lineNo);

        let time: string | undefined = undefined;

        // Format HA
        let match = line.match(HA_FORMAT_RE)
        if (match) {
            time = match[1];
        }

        // Format VTherm
        match = line.match(VTHERM_FORMAT_RE)
        if (match) {
            time = match[1];
        }

        if (!time) {
            return;
        }

        const timestamp = parseTimestamp(time, this.timezone);

        match = line.match(SETUP_ENTRY_RE)
        if (match) {
            this.addSetupConfig(match[1], match[2], lineNo, timestamp);
            return;
        }

        for (const pattern of IGNORED_PATTERNS) {
            if (line.search(pattern) !== -1) {
                return;
            }
        }


        match = line.match(/NEW EVENT: (VersatileThermostat-)?(.+) - /)
        if (match) {
            this.getThermoParser(match[2]).parseLog(timestamp, line);
            return;
        }

        // Log Exporter format
        match = line.match(/\] (.+) - ---------------------> NEW EVENT:/)
        if (match && match[1] != 'VersatileThermostat-Central Mode') {
            this.getThermoParser(match[1]).parseLog(timestamp, line);
            return;
        }

        match = line.match(/underlyings\s*\] (VersatileThermostat-)?(.+)-climate\..+ Set setpoint temperature to: ([0-9.]+)/)
        if (match) {
            this.getThermoParser(match[2]).underlying_setpoints.push({ timestamp: timestamp, value: parseFloat(match[3]) });
            return;
        }

        match = line.match(/prop_algorithm\s*\] (.+) - heating percent calculated for current_temp ([0-9.]+), ext_current_temp ([0-9.]+) and target_temp ([0-9.]+)/)
        if (match) {
            this.getThermoParser(match[1]).room_temps.push({ timestamp: timestamp, value: parseFloat(match[2]) });
            this.getThermoParser(match[1]).ext_temps.push({ timestamp: timestamp, value: parseFloat(match[3]) });
            this.getThermoParser(match[1]).target_temps.push({ timestamp: timestamp, value: parseFloat(match[4]) });
            return;
        }

        match = line.match(/thermostat_climate\s*\] (VersatileThermostat-)?(.+) - The device offset temp for regulation is ([0-9.]+) - internal temp is ([0-9.]+)\. New target is ([0-9.]+)/)
        if (match) {
            if (match[3] != "0.00" && match[4] != "0.00") {
                this.getThermoParser(match[2]).offset_temps.push({ timestamp: timestamp, value: parseFloat(match[3]) });
                this.getThermoParser(match[2]).underlying_temps.push({ timestamp: timestamp, value: parseFloat(match[4]) });
            }
            this.getThermoParser(match[2]).underlying_setpoints.push({ timestamp: timestamp, value: parseFloat(match[5]) });
            return;
        }

        match = line.match(/thermostat_climate(_valve)?\s*\] (VersatileThermostat-)?(.+) - Calling update_custom_attributes: (.+)/)
        if (match) {
            this.getThermoParser(match[3]).parseState(timestamp, match[4]);
            return
        }

        match = line.match(/thermostat_climate\s*\] (VersatileThermostat-)?(.+) - Regulated temp have changed to ([0-9.]+)\. Resend it to underlyings/)
        if (match) {
            this.getThermoParser(match[2]).regulated_temps.push({ timestamp: timestamp, value: parseFloat(match[3]) });
            return;
        }

        match = line.match(/thermostat_climate\s*\] (VersatileThermostat-)?(.+) - regulation calculation will be done/)
        if (match) {
            this.last_thermo = match[2];
            return;
        }

        match = line.match(/pi_algorithm\s*\] PITemperatureRegulator - Error: ([0-9.]+) accumulated_error: ([0-9.]+) \(overheat protection True and delta ([0-9.]+)\) offset: ([0-9.]+) offset_ext: ([0-9.]+) target_tem: ([0-9.]+) regulatedTemp: ([0-9.]+)/)
        if (match && this.last_thermo) {
            // this.getThermoParser(this.last_thermo).pi_errors.push({ timestamp: timestamp, value: parseFloat(match[1]) });
            // this.getThermoParser(this.last_thermo).pi_accumulated_errors.push({ timestamp: timestamp, value: parseFloat(match[2]) });
            // this.getThermoParser(this.last_thermo).pi_deltas.push({ timestamp: timestamp, value: parseFloat(match[3]) });
            this.getThermoParser(this.last_thermo).offset_temps.push({ timestamp: timestamp, value: parseFloat(match[4]) });
            // this.getThermoParser(this.last_thermo).pi_offset_exts.push({ timestamp: timestamp, value: parseFloat(match[5]) });
            this.getThermoParser(this.last_thermo).target_temps.push({ timestamp: timestamp, value: parseFloat(match[6]) });
            this.getThermoParser(this.last_thermo).regulated_temps.push({ timestamp: timestamp, value: parseFloat(match[7]) });
            return;
        }

        match = line.match(/base_thermostat\s*\] (VersatileThermostat-)?(.+) - Applying new target temperature: ([0-9.]+)/)
        if (match) {
            this.getThermoParser(match[2]).target_temps.push({ timestamp: timestamp, value: parseFloat(match[3]) });
            return;
        }

        match = line.match(/ema\s*\] EMA-(.+) - .+ measurement=([0-9.]+) /)
        if (match) {
            this.getThermoParser(match[1]).room_temps.push({ timestamp: timestamp, value: parseFloat(match[2]) });
            return;
        }

        match = line.match(/prop_algorithm\s*\] (.+) - Proportional algorithm: on_percent is forced to 0 cause current_temp \(([0-9.]+)\) /)
        if (match) {
            this.getThermoParser(match[1]).room_temps.push({ timestamp: timestamp, value: parseFloat(match[2]) });
            return;
        }

        match = line.match(/base_thermostat\s*\] (VersatileThermostat-)?(.+) - current state changed to VThermState\(hvac_mode=(\w+), target_temperature=([0-9.]+), preset=(\w+),/)
        if (match) {
            this.getThermoParser(match[2]).target_temps.push({ timestamp: timestamp, value: parseFloat(match[4]) });
            this.getThermoParser(match[2]).preset.push({ timestamp: timestamp, value: match[5] });
            this.getThermoParser(match[2]).hvac_mode.push({ timestamp: timestamp, value: match[3] });
            return;
        }

        match = line.match(/underlyings\s*\] (VersatileThermostat-)?(.+)-climate\..* --------> Underlying state change received:.*current_temperature=([0-9.]+), temperature=([0-9.]+),/)
        if (match) {
            this.getThermoParser(match[2]).underlying_temps.push({ timestamp: timestamp, value: parseFloat(match[3]) });
            this.getThermoParser(match[2]).underlying_setpoints.push({ timestamp: timestamp, value: parseFloat(match[4]) });
            return;
        }

        match = line.match(/feature_auto_start_stop_manager\s*\] AutoStartStopManager-(.*) - VTherm should be OFF/)
        if (match) {
            this.getThermoParser(match[1]).startstop_state.push({ timestamp: timestamp, value: FeatureState.TRIGGER });
            return;
        }

        match = line.match(/feature_auto_start_stop_manager\s*\] AutoStartStopManager-(.*) - VTherm should be ON/)
        if (match) {
            this.getThermoParser(match[1]).startstop_state.push({ timestamp: timestamp, value: FeatureState.NORMAL });
            return;
        }

        match = line.match(/feature_auto_start_stop_manager\s*\] AutoStartStopManager-(.*) - auto_start_stop should be off is True/)
        if (match) {
            this.getThermoParser(match[1]).startstop_state.push({ timestamp: timestamp, value: FeatureState.TRIGGER });
            return;
        }

        match = line.match(/feature_auto_start_stop_manager\s*\] AutoStartStopManager-(.*) - auto_start_stop should be off is False/)
        if (match) {
            this.getThermoParser(match[1]).startstop_state.push({ timestamp: timestamp, value: FeatureState.NORMAL });
            return;
        }

        match = line.match(/auto_start_stop_algorithm\s*\] AutoStartStopDetectionAlgorithm-(.*) - We need to stop, there is no need for cooling for a long time/)
        if (match) {
            this.getThermoParser(match[1]).startstop_state.push({ timestamp: timestamp, value: FeatureState.TRIGGER });
            return;
        }

        match = line.match(/auto_start_stop_algorithm\s*\] AutoStartStopDetectionAlgorithm-(.*) - We need to start cooling./)
        if (match) {
            this.getThermoParser(match[1]).startstop_state.push({ timestamp: timestamp, value: FeatureState.NORMAL });
            return;
        }

        match = line.match(/Central boiler is being turned on /)
        if (match) {
            this.central_boiler.push({ timestamp: timestamp, value: 1 })
            return;
        }

        match = line.match(/Central boiler is being turned off /)
        if (match) {
            this.central_boiler.push({ timestamp: timestamp, value: 0 })
            return;
        }

        match = line.match(/Central mode is being changed from \w+ to (\w+)/)
        if (match) {
            this.central_mode.push({ timestamp: timestamp, value: match[1] })
            return;
        }

        match = line.match(/base_thermostat\s*\] (.+) - Applying new hvac mode: (\w+)/)
        if (match) {
            this.getThermoParser(match[1]).hvac_mode.push({ timestamp: timestamp, value: match[2] })
            return;
        }

        match = line.match(/base_thermostat\s*\] (?:VersatileThermostat-)?(.+?) - End of cycle\. current_state: (\{[^{}]*\})/)
        if (match) {
            let state: Record<string, unknown> = {};
            try {
                state = parsePythonLiteral(match[2]) as Record<string, unknown>;
            } catch {
                return;
            }
            const vtherm = this.getThermoParser(match[1]);
            if (typeof state.room_temperature === 'number') {
                vtherm.room_temps.push({ timestamp, value: state.room_temperature });
            }
            if (typeof state.outdoor_temperature === 'number') {
                vtherm.ext_temps.push({ timestamp, value: state.outdoor_temperature });
            }
            // Heating power (on_percent) applied by VTherm: the valve opening for TRVs
            if (typeof state.power_percent === 'number') {
                vtherm.power_percents.push({ timestamp, value: state.power_percent });
            }
            return
        }

        match = line.match(/base_thermostat\s*\] (.+) - Checking new cycle\. hvac_mode=(\w+), safety_state=(\w+), preset_mode=(\w+),/)
        if (match) {
            this.getThermoParser(match[1]).hvac_mode.push({ timestamp: timestamp, value: match[2] })
            this.getThermoParser(match[1]).preset.push({ timestamp: timestamp, value: match[4] })
            this.getThermoParser(match[1]).safety_state.push({ timestamp: timestamp, value: match[3] == 'on' ? FeatureState.TRIGGER : FeatureState.NORMAL })
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

    private addSetupConfig(name: string, literal: string, line: number, timestamp: Date) {
        let values: unknown;
        try {
            values = parsePythonLiteral(literal);
        } catch {
            return;
        }
        if (!values || typeof values !== 'object' || Array.isArray(values)) return;

        const list = this.setupConfigs.get(name) ?? [];
        const last = list[list.length - 1];
        // Every platform (climate, sensor, number…) logs the same entry at startup
        if (last && Math.abs(timestamp.getTime() - (last.timestamp?.getTime() ?? 0)) < 60_000
            && JSON.stringify(last.values) === JSON.stringify(values)) {
            return;
        }
        list.push({ source: 'setup_entry', values: values as Record<string, unknown>, line, timestamp });
        this.setupConfigs.set(name, list);
    }
}
