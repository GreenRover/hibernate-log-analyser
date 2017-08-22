let sqlFormatter = require('../../sql-formatter.min.js');

import { part } from './abstract';
import { HibernateLogExtractorConfig } from '../config';

export class hql extends part {
    static testRegex = /\: HQL: (.+)\, time: (\d+)ms, rows: (\d+)/i;

    private query: string;
    private time: number;
    private rows: number;

    public static test(line: string): hql|null {
        var result = hql.testRegex.exec(line);
        if (result !== null) {
            return new hql(result[1], parseInt(result[2]), parseInt(result[3]));
        }

        return null;
    }

    constructor(query: string, time: number, rows: number) {
        super();
        
        this.query = query.trim();
        this.time = time;
        this.rows = rows;
    }

    public getOutput(config: HibernateLogExtractorConfig): string {
        return "/* " + this.query + ", time: " + this.time + "ms, rows: " + this.rows + " */";
    }

    public complete(behind: string): void {
        // noop
    }
}