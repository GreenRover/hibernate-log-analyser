import * as fs from 'fs';
import * as util from 'util';
import * as stream from 'stream';

export class FileUtils {

    public static getFilesize(path: string): number {
        let fd: number = fs.openSync(path, 'r');
        let stats: fs.Stats = fs.fstatSync(fd);
        fs.closeSync(fd);

        return stats.size;
    }

    public static readLines(path: string, processLine: (line: string, lineNr: number) => void, onFinish: () => void, onError: (err: Error) => void) {
        let lineNr: number = 0;

        try {
            let liner = new LineByLine(path, {});

            let line;
            while (line = liner.next()) {
                processLine(line.toString("utf8").trimRight(), lineNr);
                lineNr++;
            }
            onFinish();
        } catch (err) {
            onError(err);
        }
    }
}

class LineByLine {
    private fd: number;
    private options: any;

    private bufferData: Buffer = null;
    private bytesRead: number = 0;

    private bufferPosition: number = 0;
    private eofReached: boolean = false;

    private linesCache: Array<Buffer> = [];

    private fdPosition: number = 0;

    constructor(file: string | number, options: any) {
        if (!options.readChunk) {
            options.readChunk = 1024;
        }

        if (!options.newLineCharacter) {
            options.newLineCharacter = 0x0a; //linux line ending
        } else {
            options.newLineCharacter = options.newLineCharacter.charCodeAt(0);
        }

        if (typeof file === 'number') {
            this.fd = file;
        } else {
            this.fd = fs.openSync(file, 'r');
        }

        this.options = options;

        this.reset();
    }

    private searchInBuffer(buffer: Buffer, hexNeedle: number): number {
        for (var i = 0; i <= buffer.length; i++) {
            let b_byte: number = buffer[i];

            if (b_byte === hexNeedle) {
                return i;
            }
        }

        return -1;
    }

    public reset(): void {
        this.bufferData = null;
        this.bytesRead = 0;

        this.bufferPosition = 0;
        this.eofReached = false;

        this.linesCache = [];

        this.fdPosition = 0;
    }

    private extractLines(buffer: Buffer): Array<Buffer> {
        let line: Buffer;
        let lines: Array<Buffer> = [];
        let bufferPosition: number = 0;

        let lastNewLineBufferPosition = 0;
        while (true) {
            let bufferPositionValue = buffer[bufferPosition++];

            if (bufferPositionValue === this.options.newLineCharacter) {
                line = buffer.slice(lastNewLineBufferPosition, bufferPosition);
                lines.push(line);
                lastNewLineBufferPosition = bufferPosition;
            } else if (!bufferPositionValue) {
                break;
            }
        }

        let leftovers = buffer.slice(lastNewLineBufferPosition, bufferPosition);
        if (leftovers.length) {
            lines.push(leftovers);
        }

        return lines;
    };

    private readChunk(lineLeftovers: Buffer): number {
        let totalBytesRead = 0;

        let bytesRead: number;
        let buffers: Array<Buffer> = [];
        do {
            let readBuffer = new Buffer(this.options.readChunk);

            bytesRead = fs.readSync(this.fd, readBuffer, 0, this.options.readChunk, this.fdPosition);
            totalBytesRead = totalBytesRead + bytesRead;

            this.fdPosition = this.fdPosition + bytesRead;
            buffers.push(readBuffer);
        } while (bytesRead > 0 && this.searchInBuffer(buffers[buffers.length - 1], this.options.newLineCharacter) === -1);

        let bufferData = Buffer.concat(buffers);

        if (bytesRead < this.options.readChunk) {
            this.eofReached = true;
            bufferData = bufferData.slice(0, totalBytesRead);
        }

        if (bytesRead > 0) {
            this.linesCache = this.extractLines(bufferData);

            if (lineLeftovers != null) {
                this.linesCache[0] = Buffer.concat([lineLeftovers, this.linesCache[0]]);
            }
        }

        return totalBytesRead;
    }

    public next(): Buffer | boolean {
        let line: Buffer;

        if (this.eofReached && this.linesCache.length === 0) {
            return false;
        }

        let bytesRead: number;

        if (this.linesCache.length == 0) {
            bytesRead = this.readChunk(null);
        }

        if (this.linesCache.length > 0) {
            // Found line in buffer
            line = this.linesCache.shift();

            let lastLineCharacter = line[line.length - 1];

            if (lastLineCharacter !== this.options.newLineCharacter) {
                // Last line in buffer seams to be incomplete
                bytesRead = this.readChunk(line);

                if (bytesRead > 0) {
                    line = this.linesCache.shift();
                }
            }
        }

        if (this.eofReached && this.linesCache.length === 0) {
            // End of file reached
            fs.closeSync(this.fd);
            this.fd = null;
        }

        return line;
    }
}