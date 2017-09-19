let sqlFormatter = require('../../sql-formatter.min.js');

import { part } from './abstract';
import { HibernateLogExtractorConfig } from '../config';

export class hql extends part {
    static testRegex = /\: HQL: (.+)\, time: (\d+)ms, rows: (\d+)/i;

    private query: string;
    private queryTime: number;
    private rows: number;
    private rawLine: string;

    public static test(line: string): hql|null {
        let result = hql.testRegex.exec(line);
        if (result !== null) {
            return new hql(result[1], parseInt(result[2]), parseInt(result[3]), line);
        }

        return null;
    }

    constructor(query: string, time: number, rows: number, rawLine: string) {
        super();
        
        this.query = query.trim();
        this.queryTime = time;
        this.rows = rows;
        this.rawLine = rawLine.trim();
    }

    public getOutput(config: HibernateLogExtractorConfig): string {
        let dateString: string = "";
        if (config.extractDate) {
            dateString = this.getDatePart(config.dateRegex);
        }

        return "/* " + dateString + this.query + ", time: " + this.queryTime + "ms, rows: " + this.rows + " */";
    }

    public complete(behind: string): void {
        // noop
    }

    public getStats(stats: Map<string, number>): void {
        this.addToStats(stats, "queryTime", this.queryTime);
    }

    private getDatePart(dateRegex: string): string {
        let dateString = this.extractDate(this.rawLine, dateRegex);
        return (dateString == null) ? "" : dateString + "  ";
    }
}