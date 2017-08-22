import { HibernateLogExtractorConfig } from '../config';
import { part } from './abstract';

export class comment extends part {
    
        static testRegex = /(\#{4}.*)/; // Each Line starts witch #### is a comment!  
        private comment: string;
        
        public static test(line: string): comment|null {
            var result = comment.testRegex.exec(line);
            if (result !== null) {
                return new comment(result[1]);
            }
    
            return null;
        }
    
        constructor(comment: string) {
            super();
            this.comment = comment.trim();
        }
    
        public getOutput(config: HibernateLogExtractorConfig): string {
            return "/* " + this.comment + " */";
        }
    
        public complete(behind: string): void {
            // noop
        }
    }