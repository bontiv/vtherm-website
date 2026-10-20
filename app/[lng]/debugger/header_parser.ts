import { parseTimestamp, TimeZoneMode } from "./time";

/** Header written by the Versatile Thermostat log export */
export type LogHeader = {
    thermostatName: string,
    entityId?: string,
    period?: { start: Date, end: Date },
    timezone: TimeZoneMode,
    level?: string,
    entries?: number,
    generated?: Date,
    /** undefined when the configuration block is missing or is not valid JSON */
    config?: Record<string, unknown>,
    rawText: string,
    /** Number of file lines used by the header (delimiters included) */
    lineCount: number,
}

export const HEADER_DELIMITER = /^={20,}\s*$/;
const HEADER_TITLE = /Versatile Thermostat - Log Export/;
const TIMESTAMP = String.raw`\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)?`;
const FIELD_RE = /^([A-Za-z][A-Za-z ]*?)\s*:\s*(.*)$/;
const PERIOD_RE = new RegExp(`^(${TIMESTAMP})\\s*(?:→|->)\\s*(${TIMESTAMP})\\s*([A-Za-z]+)?\\s*$`);
const DATE_TZ_RE = new RegExp(`^(${TIMESTAMP})\\s*([A-Za-z]+)?\\s*$`);
const THERMOSTAT_RE = /^(.*?)\s*\(([^()]+)\)\s*$/;

/**
 * Parse the lines of an export header, delimiters included.
 * Returns undefined when the block is not a Versatile Thermostat export header.
 */
export function parseHeader(lines: string[]): LogHeader | undefined {
    if (!lines.some(l => HEADER_TITLE.test(l))) return undefined;

    const fields = new Map<string, string>();
    let configStart = -1;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (/^Configuration\s*:\s*$/.test(line)) {
            configStart = i + 1;
            break;
        }
        const match = line.match(FIELD_RE);
        if (match) fields.set(match[1].trim().toLowerCase(), match[2].trim());
    }

    const thermostat = fields.get('thermostat') ?? '';
    const thermostatMatch = thermostat.match(THERMOSTAT_RE);
    const thermostatName = thermostatMatch ? thermostatMatch[1] : thermostat;
    if (!thermostatName) return undefined;

    let timezone: TimeZoneMode = 'local';
    const periodMatch = fields.get('period')?.match(PERIOD_RE);
    const generatedMatch = fields.get('generated')?.match(DATE_TZ_RE);
    if (periodMatch?.[3]?.toUpperCase() === 'UTC' || generatedMatch?.[2]?.toUpperCase() === 'UTC') {
        timezone = 'UTC';
    }

    let config: Record<string, unknown> | undefined = undefined;
    if (configStart >= 0) {
        const end = HEADER_DELIMITER.test(lines[lines.length - 1]) ? lines.length - 1 : lines.length;
        try {
            const parsed = JSON.parse(lines.slice(configStart, end).join('\n'));
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) config = parsed;
        } catch {
            config = undefined;
        }
    }

    const entries = parseInt(fields.get('entries') ?? '', 10);

    return {
        thermostatName,
        entityId: thermostatMatch?.[2],
        period: periodMatch ? {
            start: parseTimestamp(periodMatch[1], timezone),
            end: parseTimestamp(periodMatch[2], timezone),
        } : undefined,
        timezone,
        level: fields.get('level'),
        entries: isNaN(entries) ? undefined : entries,
        generated: generatedMatch ? parseTimestamp(generatedMatch[1], timezone) : undefined,
        config,
        rawText: lines.join('\n'),
        lineCount: lines.length,
    };
}

/**
 * Parse a Python literal as printed by repr() (dict, list, tuple, str,
 * numbers, True/False/None). Unknown reprs such as <HVACMode.OFF: 'off'>
 * are kept as strings. Throws on malformed input.
 */
export function parsePythonLiteral(src: string): unknown {
    let pos = 0;

    const fail = (msg: string): never => {
        throw new Error(`${msg} at ${pos}`);
    };
    const skipSpaces = () => {
        while (pos < src.length && /\s/.test(src[pos])) pos++;
    };

    const parseString = (): string => {
        const quote = src[pos++];
        let out = '';
        while (pos < src.length && src[pos] !== quote) {
            if (src[pos] === '\\' && pos + 1 < src.length) {
                const c = src[pos + 1];
                const escapes: Record<string, string> = { n: '\n', t: '\t', r: '\r', '\\': '\\', "'": "'", '"': '"' };
                out += escapes[c] ?? '\\' + c;
                pos += 2;
            } else {
                out += src[pos++];
            }
        }
        if (src[pos] !== quote) fail('Unterminated string');
        pos++;
        return out;
    };

    const parseSequence = (close: string): unknown[] => {
        pos++;
        const items: unknown[] = [];
        skipSpaces();
        while (src[pos] !== close) {
            items.push(parseValue());
            skipSpaces();
            if (src[pos] === ',') {
                pos++;
                skipSpaces();
            } else if (src[pos] !== close) {
                fail(`Expected "," or "${close}"`);
            }
        }
        pos++;
        return items;
    };

    const parseDict = (): Record<string, unknown> => {
        pos++;
        const out: Record<string, unknown> = {};
        skipSpaces();
        while (src[pos] !== '}') {
            const key = parseValue();
            skipSpaces();
            if (src[pos] !== ':') fail('Expected ":"');
            pos++;
            out[String(key)] = parseValue();
            skipSpaces();
            if (src[pos] === ',') {
                pos++;
                skipSpaces();
            } else if (src[pos] !== '}') {
                fail('Expected "," or "}"');
            }
        }
        pos++;
        return out;
    };

    const parseRepr = (): string => {
        const start = pos;
        let depth = 0;
        while (pos < src.length) {
            const c = src[pos];
            if (c === "'" || c === '"') {
                parseString();
                continue;
            }
            if (c === '<') depth++;
            if (c === '>') {
                depth--;
                if (depth === 0) {
                    pos++;
                    return src.slice(start, pos);
                }
            }
            pos++;
        }
        return fail('Unterminated repr');
    };

    const parseValue = (): unknown => {
        skipSpaces();
        const c = src[pos];
        if (c === '{') return parseDict();
        if (c === '[') return parseSequence(']');
        if (c === '(') return parseSequence(')');
        if (c === "'" || c === '"') return parseString();
        if (c === '<') return parseRepr();
        const word = src.slice(pos).match(/^(True|False|None|-?inf|nan|-?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)/);
        if (!word) return fail('Unexpected token');
        pos += word[0].length;
        switch (word[0]) {
            case 'True': return true;
            case 'False': return false;
            case 'None': return null;
            case 'inf': return Infinity;
            case '-inf': return -Infinity;
            case 'nan': return NaN;
            default: return parseFloat(word[0]);
        }
    };

    const value = parseValue();
    skipSpaces();
    if (pos !== src.length) fail('Trailing characters');
    return value;
}
