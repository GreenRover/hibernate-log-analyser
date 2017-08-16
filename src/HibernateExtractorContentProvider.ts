'use strict';
import * as vscode from 'vscode';
import { HibernateLogExtractor } from './HibernateLogExtractor';

import * as fs from 'fs';

export class HibernateExtractorContentProvider implements vscode.TextDocumentContentProvider {

        private _onDidChange = new vscode.EventEmitter<vscode.Uri>();

        public provideTextDocumentContent(uri: vscode.Uri): string {
            let text: string = fs.readFileSync(uri.fsPath, "utf8");
            let logExtractor = new HibernateLogExtractor();
            return logExtractor.extract(text);
        }

        get onDidChange(): vscode.Event<vscode.Uri> {
            return this._onDidChange.event;
        }

        public update(uri: vscode.Uri) {
            console.log("update");
            this._onDidChange.fire(uri);
        }
    }
