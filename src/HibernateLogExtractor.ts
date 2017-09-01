import { part } from './HibernateLogExtractor/part/abstract';
import { sql } from './HibernateLogExtractor/part/sql';
import { hql } from './HibernateLogExtractor/part/hql';
import { comment } from './HibernateLogExtractor/part/comment';
import { statistic } from './HibernateLogExtractor/part/statistic';
import { HibernateLogExtractorConfig } from './HibernateLogExtractor/config';
import { FileUtils } from './FileUtils';

export class HibernateLogExtractor {
    private parts: Array<part> = [];
    private behind: string = "";

    constructor(private config: HibernateLogExtractorConfig = new HibernateLogExtractorConfig()) {
    }

    public getSql<T extends part>(stats: Map<string, number> = new Map()): string {
        var that = this;
        var output = "";
        this.parts.forEach(function (p: T) {
            output += "\n\n" + p.getOutput(that.config);
            p.getStats(stats);
        });

        return output.trim();
    }

    public extract(input: string): void {
        this.extractLines(input, true);
    }

    public extractFromFile(path: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            FileUtils.readLines(
                path, 
                (line: string, lineNr: number) => {
                    this.extractLine(line);
                },
                () => {
                    this.completeLastPart();
                    resolve();
                },
                (err: Error) => {
                    console.log("Error reading file \"" + path + "\"", err);
                    reject(err)
                });
        });
    }

    private extractLines(rawText: string, performLastLine: boolean): string {
        

        let lastLine: string = "";
        let lines: Array<string> = rawText.split("\n");

        lines.forEach((line: string, index: number) => {
            if (!performLastLine && (index + 1) == lines.length) {
                lastLine = line;
                return;
            }
            
            this.extractLine(line);
        });

        if (performLastLine) {
            this.completeLastPart();
            return "";
        }

        return lastLine;
    }

    private extractLine(line: string): void {
        this.testAndTake( sql.test(line) );
        this.testAndTake( comment.test(line) );
        if (this.config.hql) {
            this.testAndTake( hql.test(line) );
        }
        if (this.config.statistic) {
            this.testAndTake( statistic.test(line) );
        }

        this.behind += line + "\n";
    }

    private completeLastPart(): void {
        if (this.parts.length >= 1) {
            this.parts[this.parts.length - 1].complete(this.behind);
        }
        this.behind = "";
    }

    private testAndTake(hit: part | null): void {
        if (hit !== null) {
            this.completeLastPart();
            this.parts.push(hit);
        }           
    }
}