'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { HibernateLogExtractor } from './HibernateLogExtractor';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    let previewUri = vscode.Uri.parse('sql-log://preview/sql-log');

    let disposable = vscode.commands.registerCommand('extension.extractHibernateLog', () => {
        return vscode.commands.executeCommand('vscode.previewHtml', previewUri, vscode.ViewColumn.Two, 'Integrated SQL Log').then((success) => {
        }, (reason) => {
            vscode.window.showErrorMessage(reason);
        });
    });

    class TextDocumentContentProvider implements vscode.TextDocumentContentProvider {

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

    let provider = new TextDocumentContentProvider();
    let registration = vscode.workspace.registerTextDocumentContentProvider('sql-log', provider);

    vscode.workspace.onDidChangeTextDocument((e: vscode.TextDocumentChangeEvent) => {
		if (e.document === vscode.window.activeTextEditor.document) {
			provider.update(previewUri);
		}
	});

	vscode.window.onDidChangeTextEditorSelection((e: vscode.TextEditorSelectionChangeEvent) => {
		if (e.textEditor === vscode.window.activeTextEditor) {
			provider.update(previewUri);
		}
	})

    context.subscriptions.push(disposable, registration);
}

// this method is called when your extension is deactivated
export function deactivate() {
}