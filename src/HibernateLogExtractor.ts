import { part } from './HibernateLogExtractor/part/abstract';
import { sql } from './HibernateLogExtractor/part/sql';
import { hql } from './HibernateLogExtractor/part/hql';
import { comment } from './HibernateLogExtractor/part/comment';
import { statistic } from './HibernateLogExtractor/part/statistic';
import { HibernateLogExtractorConfig } from './HibernateLogExtractor/config';

export class HibernateLogExtractor {
    constructor(private config: HibernateLogExtractorConfig = new HibernateLogExtractorConfig()) {
    }

    public extract<T extends part>(input: string, stats: Map<string, number> = new Map()): string {
        var that = this;
        var output = "";
        this.split(input).forEach(function (p: T) {
            output += "\n\n" + p.getOutput(that.config);
            p.getStats(stats);
        });

        return output.trim();
    }

    private split(rawText: string): Array<part> {
        let parts: Array<part> = [];
        let behind: string = "";
        let completeLastPart = (): void => {
            if (parts.length >= 1) {
                parts[parts.length - 1].complete(behind);
            }
            behind = "";
        };

        let testAndTake = (hit: part | null): void => {
            if (hit !== null) {
                completeLastPart();
                parts.push(hit);
            }           
        };

        rawText.split("\n").forEach(line => {
            testAndTake( sql.test(line) );
            testAndTake( comment.test(line) );
            if (this.config.hql) {
                testAndTake( hql.test(line) );
            }
            if (this.config.statistic) {
                testAndTake( statistic.test(line) );
            }

            behind += line + "\n";
        });

        completeLastPart();

        return parts;
    }
}