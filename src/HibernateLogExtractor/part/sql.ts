let sqlFormatter = require('../../sql-formatter.min.js');

import { part } from './abstract';
import { HibernateLogExtractorConfig } from '../config';

export class sql extends part {
    static testRegexA = /Hibernate: (\/\*.+\*\/\s)?((select|insert|update|delete) .+)/i;
    static testRegexB = /org\.hibernate\.SQL.* \[[^\]]*\] (\/\*.+\*\/\s)?((select|insert|update|delete) .+)/i

    private query: string;
    private queryType: string;
    private bindings = {};
    private comment: string;

    public static test(line: string): sql|null {
        var resultA = sql.testRegexA.exec(line);
        if (resultA !== null) {
            return new sql(resultB[2], resultB[1] || "", resultB[3]);
        }

        var resultB = sql.testRegexB.exec(line);
        if (resultB !== null) {
            return new sql(resultB[2], resultB[1] || "", resultB[3]);
        }

        return null;
    }

    constructor(query: string, comment: string, queryType: string) {
        super();
        
        this.query = query.trim();
        this.comment = comment.trim();

        if (this.query.substr(this.query.length -1, 1) != ";") {
            this.query += ";";
        }

        this.queryType = queryType.toLowerCase();
    }

    public getOutput(config: HibernateLogExtractorConfig): string {
        let query: string = this.query;
        if (Object.keys(this.bindings).length > 0) {
            query = this.joinBindings();
        }

        query = sqlFormatter.format(query);

        if (config.sqlComment && this.comment.length > 0) {
            return this.comment + "\n" + query;
        }

        return query;
    }

    public getStats(stats: Map<string, number>): void {
        this.addToStats(stats, this.queryType, 1);
    }

    private joinBindings(): string {
        var expectedBindingsCount = this.query.split("?").length - 1;

        let query = this.query;
        for (let i = 1; i <= expectedBindingsCount; i++) {
            var value;
            if (i in this.bindings) {
                value = this.prepareBindValue(this.bindings[i]);
            } else {
                value = "VALUE_NOT_FOUND";
            }

            query = query.replace(/\?/, value);
        }

        return query;
    }

    public complete(bindsString: string): void {
        var bindsRegexA = /binding parameter \[(\d*)\] as .* \- \[(.*)\]/g;
        let m;
        while ((m = bindsRegexA.exec(bindsString)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === bindsRegexA.lastIndex) {
                bindsRegexA.lastIndex++;
            }

            var bindIndex = parseInt(m[1]);
            var bindValue = m[2];

            this.bindings[bindIndex] = bindValue;
        }

        var bindsRegexB = /Binding (.+) to parameter\: \[(\d+)\]/g;
        while ((m = bindsRegexB.exec(bindsString)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === bindsRegexB.lastIndex) {
                bindsRegexB.lastIndex++;
            }

            var bindIndex = parseInt(m[2]);
            var bindValue = m[1];

            this.bindings[bindIndex] = bindValue;
        }
    }

    private prepareBindValue(value: string|number): string {
        if (typeof value == "string") {
            if (value.match(/^(\d+[\.\,])?\d+$/)) {
                // Is Number as String
                return value;
            }
            if (value == "null") {
                // Is NULL
                return value;
            }
            if (value == "false") {
                return "0";
            }
            if (value == "true") {
                return "1";
            }
            var dateRegex = /\w+ (\w+) (\d+) (\d+)\:(\d+)\:(\d+)\ (\w+) (\d+)/;
            var dateParts = dateRegex.exec(value);
            if (dateParts != null) {
                // Is DateTime  Example: 
                //     1   2  3  4  5  6    7
                // Wed Jul 05 22:06:46 CEST 2017
                var sqlDate = dateParts[7] + "-" + this.monthToNumber(dateParts[1]) + "-" + parseInt(dateParts[2]) + " " + dateParts[3] + ":" + dateParts[4] + ":" + dateParts[5];
                return "TO_TIMESTAMP('" + sqlDate + "', 'YYYY-MM-DD HH24:MI:SS') /* " + value + " */";
            }

            // Is a real String.
            return "'" + value + "'";
        }

        return "" + value;
    }

    private monthToNumber(monthString: string): string {
        switch (monthString.toLowerCase()) {
            case "jan":
                return "01";
            case "feb":
                return "02";
            case "mar":
            case "mrz":
            case "mae":
                return "03";
            case "apr":
                return "04";
            case "mai":
            case "may":
                return "04";
            case "jun":
                return "06";
            case "jul":
                return "07";
            case "aug":
                return "08";
            case "sep":
                return "09";
            case "okt":
            case "oct":
                return "10";
            case "nov":
                return "11";
            case "dez":
            case "dec":
                return "12";
        }
    }
}