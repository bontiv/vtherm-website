export const LOG_LEVELS = ['DEBUG', 'INFO', 'WARNING', 'ERROR'] as const;
export type LogLevel = typeof LOG_LEVELS[number];

/** Thermostat index of a line which does not belong to any thermostat */
export const NO_THERMOSTAT = -1;

/**
 * Compact storage of every displayed log line, filled during the single
 * parsing pass. Metadata lives in typed arrays to keep memory low on big files.
 */
export class LogIndex {
    public lines: string[] = [];
    public lineNo = new Uint32Array(4096);
    public ts = new Float64Array(4096);
    public level = new Uint8Array(4096);
    public thermo = new Int16Array(4096);
    public length = 0;

    public push(text: string, lineNo: number, ts: number, level: number, thermo: number) {
        if (this.length === this.lineNo.length) this.grow();
        const i = this.length++;
        this.lines.push(text);
        this.lineNo[i] = lineNo;
        this.ts[i] = ts;
        this.level[i] = level;
        this.thermo[i] = thermo;
    }

    /** Release the unused capacity once parsing is done */
    public finalize() {
        this.lineNo = this.lineNo.slice(0, this.length);
        this.ts = this.ts.slice(0, this.length);
        this.level = this.level.slice(0, this.length);
        this.thermo = this.thermo.slice(0, this.length);
    }

    private grow() {
        const size = this.lineNo.length * 2;
        const lineNo = new Uint32Array(size); lineNo.set(this.lineNo); this.lineNo = lineNo;
        const ts = new Float64Array(size); ts.set(this.ts); this.ts = ts;
        const level = new Uint8Array(size); level.set(this.level); this.level = level;
        const thermo = new Int16Array(size); thermo.set(this.thermo); this.thermo = thermo;
    }
}
