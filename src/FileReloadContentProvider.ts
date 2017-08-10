'use strict';
import * as vscode from 'vscode';
import * as fs from 'fs';
import {
    Observable
} from 'rxjs/Observable';
import 'rxjs/add/observable/bindNodeCallback';
import 'rxjs/add/operator/toPromise';

export class FileReloadContentProvider implements vscode.TextDocumentContentProvider {
    provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken) {
        let readFile$: any = Observable.bindNodeCallback(fs.readFile);
        let content = readFile$(uri.fsPath, 'utf-8').toPromise();
        return content;
    }
}