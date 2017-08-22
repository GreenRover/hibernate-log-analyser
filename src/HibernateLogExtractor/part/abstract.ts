
export abstract class part {
    abstract getOutput(): string;

    abstract complete(behind: string): void;
}