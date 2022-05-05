import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

export default class Logger {
    private stack: string[];
    private stats: {
        debug: number;
        success: number;
        info: number;
        warn: number;
        error: number;
    }

    readonly C_DEBUG = '\x1b[1mDEBUG\x1b[0m';
    readonly C_INFO = '\x1b[34mINFO\x1b[0m';
    readonly C_WARN = '\x1b[33mWARN\x1b[0m';
    readonly C_ERROR = '\x1b[31mERROR\x1b[0m';

    constructor(private debugMode: boolean, ensureSave: boolean) {
        this.stack = [];
        this.stats = {
            debug: 0,
            success: 0,
            info: 0,
            warn: 0,
            error: 0
        };

        if (ensureSave) {
            const guard = () => {
                this.warn(
                    'ensuring logs save...',
                    'note: this is a risky process and can result in loss of logs'
                );
                this.save();
                this.info('logs saved; exiting');
                process.exit(0);
            }
            process.on('SIGINT', () => guard());
            process.on('SIGTERM', () => guard());
        }
    }

    private write(level: string, data: string[]): void {
        // @ts-ignore
        this.stats[level]++;
        const date = new Date().toLocaleTimeString();
        data = data.map(d => `[${date} ${d}`);
        this.stack = this.stack.concat(data);
        if (level === 'debug' && !this.debugMode) return;
        data.forEach(d => console.log(d));
    }

    save(): void {
        let path = join(process.cwd(), 'logs');
        if (!existsSync(path)) {
            try {
                mkdirSync(path);
            } catch (err) {
                throw new Error(
                    `Failed to create log directory\n${(err as Error).message}`
                );
            }
        }

        const date = new Date();
        path = join(path, `${date.getTime()}.log`);
        const out = [
            `Logs Requested: ${date.toLocaleString()}\n`,
            ...this.stack.map(d => d.replace(/\x1b\[\d+m/gm, ''))
        ];

        try {
            writeFileSync(path, out.join('\n'), { encoding: 'utf-8' });
        } catch (err) {
            throw new Error(`Could not save logs\n${(err as Error).message}`);
        }
    }

    debug(...data: string[]): void {
        this.write('debug', data.map(d => `${this.C_DEBUG}] ${d}`));
    }

    info(...data: string[]): void {
        this.write('info', data.map(d => `${this.C_INFO}] ${d}`));
    }

    warn(...data: string[]): void {
        this.write('warn', data.map(d => `${this.C_WARN}] ${d}`));
    }

    error(...data: string[]): void {
        this.write('error', data.map(d => `${this.C_ERROR}] ${d}`));
    }

    withError(err: Error): void {
        this.write('error', err.message.split('\n').map(d => `${this.C_ERROR}] ${d}`));
    }

    fatal(...data: string[]): never {
        this.write('error', data.map(d => `${this.C_ERROR}] ${d}`));
        process.exit(1);
    }
}
