let sqlFormatter = require('./sql-formatter.min.js')

export class HibernateLogExtractor {

    constructor() {

    }

    public extract(input: string): string {
        var that = this;
        var output = "";
        this.splitByCommentLines(input).forEach(function (block) {
            var sqlQuerys = (block.behind) ? that.splitByQuery(block.behind) : [];

            if (block.comment.length > 0) {
                output += block.comment + "\n\n";
            }

            if (sqlQuerys.length > 0) {
                sqlQuerys.forEach((sql) => {
                    output += sqlFormatter.format(sql) + "\n\n";
                });
            }
        });

        return output;
    }

    private splitByCommentLines(rawText: string) {
        var blockStrings = rawText.split(/(\#{4}.*)/g); // Each Line starts witch #### is a comment!

        var block = null;
        var blocks = [];
        for (let i = 0; i < blockStrings.length; i++) {
            var str = blockStrings[i].trim();
            if (str.length < 1) {
                continue;
            }

            if (/^[\r|\n]?#{4}/.test(str)) {
                // Is comment.
                if (block != null) {
                    blocks.push(block);
                }

                block = {
                    comment: str
                }
            } else {
                if (block == null) {
                    block = {
                        comment: ""
                    };
                }

                block.behind = str;
            }
        }
        if (block != null) {
            blocks.push(block);
        }

        return blocks;
    }

    private splitByQuery(str: string) {
        var sqlQuerys = [];

        this.splitByQueryUsingRegex(str, sqlQuerys, /Hibernate: (select .+|insert .+|update .+)/gi);
        if (sqlQuerys.length < 1) {
            this.splitByQueryUsingRegex(str, sqlQuerys, /org\.hibernate\.SQL.* \[[^\]]*\] (\/\*.+\*\/)?\s(select .+|insert .+|update .+)/gi);
        }

        return sqlQuerys;
    }

    private splitByQueryUsingRegex(str: string, sqlQuerys, regex) {
        var that = this;
        var sqlBlocks = str.split(regex);
        var sqlRaw = null;
        var bindings = {};

        for (let x = 0; x < sqlBlocks.length; x++) {
            var blockStr = (sqlBlocks[x] == null) ? "" : sqlBlocks[x].trim();
            if (blockStr.length < 1) {
                continue;
            }

            var isQuery = (/^(select|insert|update)/i).test(blockStr);

            if (isQuery) {
                if (sqlRaw != null) {
                    sqlQuerys.push(that.replaceBindings(sqlRaw, bindings) + ";");
                }
                sqlRaw = blockStr;
                bindings = {};
            } else {
                Object.assign(bindings, that.extractBindings(blockStr));
            }
        }

        if (sqlRaw != null) {
            sqlQuerys.push(that.replaceBindings(sqlRaw, bindings) + ";");
        }
    }

    private extractBindings(bindsString: string) {
        var bindings = {};
        var bindsRegexA = /binding parameter \[(\d*)\] as .* \- \[(.*)\]/g;
        let m;
        while ((m = bindsRegexA.exec(bindsString)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === bindsRegexA.lastIndex) {
                bindsRegexA.lastIndex++;
            }

            var bindIndex = parseInt(m[1]);
            var bindValue = m[2];

            bindings[bindIndex] = bindValue;
        }

        var bindsRegexB = /Binding (.+) to parameter\: \[(\d+)\]/g;
        while ((m = bindsRegexB.exec(bindsString)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === bindsRegexB.lastIndex) {
                bindsRegexB.lastIndex++;
            }

            var bindIndex = parseInt(m[2]);
            var bindValue = m[1];

            bindings[bindIndex] = bindValue;
        }

        return bindings;
    }

    private replaceBindings(sql, bindings) {
        if (bindings == null) {
            return sql;
        }

        var expectedBindingsCount = sql.split("?").length - 1;

        for (let i = 1; i <= expectedBindingsCount; i++) {
            var value;
            if (i in bindings) {
                value = this.prepareBindValue(bindings[i]);
            } else {
                value = "VALUE_NOT_FOUND";
            }

            sql = sql.replace(/\?/, value);
        }

        return sql;
    }

    private prepareBindValue(value) {
        if (typeof value == "string") {
            if (!isNaN(parseFloat(value))) {
                // Is Number as String
                return value;
            }
            if (value == "null") {
                // Is NULL
                return value;
            }
            if (value == "false") {
                return 0;
            }
            if (value == "true") {
                return 1;
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

        return value;
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