'use strict';
import * as vscode from 'vscode';
import * as fs from 'fs';

export class FileReloadContentProvider implements vscode.TextDocumentContentProvider {
    provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken) {
        return fs.readFileSync(uri.fsPath, 'utf-8');
    }
}