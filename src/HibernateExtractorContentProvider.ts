'use strict';
import * as vscode from 'vscode';
import { HibernateLogExtractor } from './HibernateLogExtractor';

export class HibernateExtractorContentProvider implements vscode.TextDocumentContentProvider {

        private _onDidChange = new vscode.EventEmitter<vscode.Uri>();

        public provideTextDocumentContent(uri: vscode.Uri): string {
            var editor = vscode.window.activeTextEditor;
            if (!editor) {
                console.log("No open text editor");
                return "<body>Please open any Text in Editor or check that log file is not to big</body>";
            }

            var selection = editor.selection;

            let logExtractor = new HibernateLogExtractor();
            let text = selection.isSingleLine ? editor.document.getText() : editor.document.getText(selection);
            let html = logExtractor.extract(text);
            return "<body><pre>" + html + "</pre></body>";
        }

        get onDidChange(): vscode.Event<vscode.Uri> {
            return this._onDidChange.event;
        }

        public update(uri: vscode.Uri) {
            this._onDidChange.fire(uri);
        }
    }
