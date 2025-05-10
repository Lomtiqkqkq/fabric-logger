import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

type LogLevel = 'log' | 'error' | 'warn' | 'debug' | 'verbose';
const levelPriority: Record<LogLevel, number> = {
    error: 0,
    warn: 1,
    log: 2,
    debug: 3,
    verbose: 4,
};

interface ProxyLoggerOptions {
    prefix?: string;
    colors?: boolean;
    logFile?: string;
    level?: LogLevel;
}

export class ProxyLogger {
    private readonly prefix: string;
    private readonly colors: boolean;
    private readonly logFile?: string;
    private readonly level: LogLevel;

    constructor(options: ProxyLoggerOptions = {}) {
        this.prefix = options.prefix ?? 'Proxy';
        this.colors = options.colors ?? true;
        this.logFile = options.logFile;
        this.level = options.level ?? (process.env.LOG_LEVEL as LogLevel) ?? 'log';
    }

    private shouldLog(currentLevel: LogLevel): boolean {
        return levelPriority[currentLevel] <= levelPriority[this.level];
    }

    private writeToFile(level: string, args: any[]) {
        if (!this.logFile) return;

        const message = `[${this.prefix}] [${level.toUpperCase()}] ${args
            .map((a) => (typeof a === 'string' ? a : JSON.stringify(a)))
            .join(' ')}\n`;

        fs.appendFileSync(this.logFile, message);
    }

    private format(level: LogLevel, colorFn: (msg: string) => string, ...args: any[]) {
        if (!this.shouldLog(level)) return;

        const tag = `[${this.prefix}] [${level.toUpperCase()}]`;
        const msg = this.colors ? colorFn(tag) : tag;

        console.log(msg, ...args);
        this.writeToFile(level, args);
    }

    log(...args: any[]) {
        this.format('log', chalk.cyanBright, ...args);
    }

    warn(...args: any[]) {
        this.format('warn', chalk.yellowBright, ...args);
    }

    error(...args: any[]) {
        this.format('error', chalk.redBright, ...args);
    }

    debug(...args: any[]) {
        this.format('debug', chalk.magentaBright, ...args);
    }

    verbose(...args: any[]) {
        this.format('verbose', chalk.gray, ...args);
    }
}
