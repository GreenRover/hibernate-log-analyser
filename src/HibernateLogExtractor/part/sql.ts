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
        let resultA = sql.testRegexA.exec(line);
        if (resultA !== null) {
            return new sql(resultA[2], resultA[1] || "", resultA[3]);
        }

        let resultB = sql.testRegexB.exec(line);
        if (resultB !== null) {
            return new sql(resultB[2], resultB[1] || "", resultB[3]);
        }

        return null;
    }

    constructor(query: string, comment: string, queryType: string) {
        super();
        
        this.query = query.trim();
        this.comment = comment.trim();

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
        let expectedBindingsCount = this.query.split("?").length - 1;

        let query = this.query;
        for (let i = 1; i <= expectedBindingsCount; i++) {
            let value;
            if (i in this.bindings) {
                value = this.prepareBindValue(this.bindings[i]);
            } else {
                value = "VALUE_NOT_FOUND";
            }

            query = query.replace(/\?/, value);
        }

        return query;
    }

    public complete(rawLogLines: string): void {
        // Handle multy line querys. // First line is the main query, ignore it.
        let logLines = rawLogLines.split("\n");
        for (let i = 1 ; i < logLines.length ; i++) {
            if (logLines[i].substring(0, 4) == "    ") {
                this.query += " " + logLines[i].trim();
            } else {
                break;
            }
        }

        let bindsRegexA = /binding parameter \[(\d*)\] as .* \- \[([^\]]+)\]/g;
        let m;
        while ((m = bindsRegexA.exec(rawLogLines)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === bindsRegexA.lastIndex) {
                bindsRegexA.lastIndex++;
            }

            let bindIndex = parseInt(m[1]);
            let bindValue = m[2];

            this.bindings[bindIndex] = bindValue;
        }

        let bindsRegexB = /Binding (.+) to parameter\: \[(\d+)\]/g;
        while ((m = bindsRegexB.exec(rawLogLines)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === bindsRegexB.lastIndex) {
                bindsRegexB.lastIndex++;
            }

            let bindIndex = parseInt(m[2]);
            let bindValue = m[1];

            this.bindings[bindIndex] = bindValue;
        }

        if (this.query.substr(this.query.length -1, 1) != ";") {
            this.query += ";";
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

            // Date by @Type
            let dateRegexType = /\w+ (\w+) (\d+) (\d+)\:(\d+)\:(\d+)\ (\w+) (\d+)/;
            let datePartsType = dateRegexType.exec(value);
            if (datePartsType != null) {
                // Is DateTime  Example: 
                //     1   2  3  4  5  6    7
                // Wed Jul 05 22:06:46 CEST 2017
                let sqlDate = datePartsType[7] + "-" + this.monthToNumber(datePartsType[1]) + "-" + parseInt(datePartsType[2]) + " " + datePartsType[3] + ":" + datePartsType[4] + ":" + datePartsType[5];
                return "TO_TIMESTAMP('" + sqlDate + "', 'YYYY-MM-DD HH24:MI:SS') /* " + value + " */";
            }

            // Date by @Converter
            let dateRegexConverter = /^(\d{4})\-(\d{2})\-(\d{2})\ (\d{2})\:(\d{2})\:(\d{2})\.(\d+)$/;
            if (value.match(dateRegexConverter)) {
                // Is DateTime  Example: 
                // 2019-02-22 09:00:55.53
                return "TO_TIMESTAMP('" + value + "', 'YYYY-MM-DD HH24:MI:SS') /* " + value + " */";
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