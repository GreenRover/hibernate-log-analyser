'use strict';
import * as vscode from 'vscode';
import { HibernateLogExtractor } from './HibernateLogExtractor';
import { HibernateLogExtractorConfig } from './HibernateLogExtractor/config';

import * as fs from 'fs';

export class HibernateExtractorContentProvider implements vscode.TextDocumentContentProvider {

        private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
        private readonly status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);

        public provideTextDocumentContent(uri: vscode.Uri): string {
            let stats: Map<string, number> = new Map();

            let text: string = fs.readFileSync(uri.fsPath, "utf8");
            let logExtractor = new HibernateLogExtractor(this.getConfig());
            let sql: string = logExtractor.extract(text, stats);

            this.updateStatus(stats); 

            return sql;
        }

        get onDidChange(): vscode.Event<vscode.Uri> {
            return this._onDidChange.event;
        }

        public update(uri: vscode.Uri) {
            this._onDidChange.fire(uri);
        }

        private getConfig(): HibernateLogExtractorConfig {
            let rawConfig: any = vscode.workspace.getConfiguration('hibernateLogExtract');
            let config = new HibernateLogExtractorConfig();
            config.hql = rawConfig.hql;
            config.sqlComment = rawConfig.sqlComment;
            config.statistic = rawConfig.statistic;

            return config;
        }

        private updateStatus(stats: Map<string, number>): void {
            let statusStrings: Array<string> = [];
            stats.forEach((value: number, key: string) => {
                statusStrings.push(key + " " + value);
            });

            this.status.text = statusStrings.join(", ");
            this.status.show();
        }
    }
