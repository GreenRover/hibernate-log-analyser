let sqlFormatter = require('../../sql-formatter.min.js');

import { part } from './abstract';
import { HibernateLogExtractorConfig } from '../config';

export class statistic extends part {
    static testRegex = /\.StatisticalLoggingSessionEventListener \- \[[^\]]*\] Session Metrics/i;

    private statLines: Array<Stat> = [];

    public static test(line: string): statistic|null {
        var result = statistic.testRegex.exec(line);
        if (result !== null) {
            return new statistic();
        }

        return null;
    }

    constructor() {
        super();
    }

    public getOutput(config: HibernateLogExtractorConfig): string {
        let stats: string = "";
        this.statLines.forEach(stat => {
            stats += stat.getLine() + "\n";  
        });

        return "/*\n" + stats.trim() + "\n*/";
    }

    public complete(behind: string): void {
        let statRegex = /^\s+(\d+) nanoseconds spent (.+);?/i;
        behind.split("\n").forEach(line => {
            let stat = statRegex.exec(line);
            if (stat !== null) {
                this.statLines.push(new Stat(parseInt(stat[1]), stat[2]));    
            } else {
                return false;
            }
        });
    }
}

class Stat {
    constructor(private ns: number, private action: string) {}

    public getLine(): string {
        return this.ns + " ns " + this.action;
    }
}