import { part } from './HibernateLogExtractor/part/abstract';
import { sql } from './HibernateLogExtractor/part/sql';
import { comment } from './HibernateLogExtractor/part/comment';

export class HibernateLogExtractor {

    constructor() {

    }

    public extract<T extends part>(input: string): string {
        var that = this;
        var output = "";
        this.split(input).forEach(function (p: T) {
            output += "\n\n" + p.getOutput();
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

            behind += line + "\n";
        });

        completeLastPart();

        return parts;
    }
}