import { HibernateLogExtractorConfig } from '../config';

export abstract class part {
    abstract getOutput(config: HibernateLogExtractorConfig): string;

    abstract complete(behind: string): void;
}