import * as fs from 'fs';
import * as util from 'util';
import * as stream from 'stream';
import * as es from 'event-stream';

export class FileUtils {

    public static getFilesize(path: string): number {
        let fd: number = fs.openSync(path, 'r');
        let stats: fs.Stats = fs.fstatSync(fd);
        fs.closeSync(fd);

        return stats.size;
    }

    public static readLines(path: string, processLine: (line : string, lineNr: number) => void, onFinish: () => void, onError: (err: Error) => void) {
        let lineNr: number = 0;
        
        let s: fs.ReadStream = fs.createReadStream(path)
            .pipe(es.split())
            .pipe(es.mapSync(function(line) {
        
                // pause the readstream
                s.pause();
        
                lineNr += 1;
        
                // process line here and call s.resume() when rdy
                // function below was for logging memory usage
                processLine(line, lineNr);
        
                // resume the readstream, possibly from a callback
                s.resume();
            })
            .on('error', function(err: Error){
                onError(err);
            })
            .on('end', function(){
                onFinish();
            })
        );
    }
}