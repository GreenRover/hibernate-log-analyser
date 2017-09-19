import { HibernateLogExtractorConfig } from '../config';

export abstract class part {
    abstract getOutput(config: HibernateLogExtractorConfig): string;

    abstract complete(behind: string): void;

    abstract getStats(stats: Map<string, number>): void;

    protected addToStats(stats: Map<string, number>, key: string, value: number): void {
        if (stats.has(key)) {
            stats.set(key, stats.get(key) + value);
        } else {
           stats.set(key, value);
        }
    }

    protected extractDate(rawLine: string, regexString: string): string {
        try {
            let regex = new RegExp(regexString);

            let result = regex.exec(rawLine);
 
            return (result != null && result[1] && result[1].length > 0) ? result[1] : null;
        } catch (err) {
            return null;
        }
    }
}