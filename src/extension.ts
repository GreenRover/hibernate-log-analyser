'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import { HibernateExtractorContentProvider } from './HibernateExtractorContentProvider';
import { FileReloadContentProvider } from './FileReloadContentProvider';


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    let previewUri = vscode.Uri.parse('sql-log://preview/sql-log');

    let extractHibernateLogCommand = vscode.commands.registerCommand('extension.extractHibernateLog', () => {
        return extractSqlFromHibernateLog();
    });
    let hibernateExtractorProvider = new HibernateExtractorContentProvider();
    vscode.window.onDidChangeTextEditorSelection((e: vscode.TextEditorSelectionChangeEvent) => {
		if (e.textEditor === vscode.window.activeTextEditor) {
			hibernateExtractorProvider.update(previewUri);
		}
    })
    
    context.subscriptions.push(extractHibernateLogCommand, vscode.Disposable.from(
        vscode.workspace.registerTextDocumentContentProvider('sql-log', hibernateExtractorProvider)
    ));

    let reloadFileCommand = vscode.commands.registerCommand('extension.reloadFile', () => {
       return reloadFile();
    });
    let fileReload = new FileReloadContentProvider();
    
    context.subscriptions.push(reloadFileCommand, vscode.Disposable.from(
        vscode.workspace.registerTextDocumentContentProvider('fileReload', fileReload)
    ));

    function extractSqlFromHibernateLog() {
        return vscode.commands.executeCommand('vscode.previewHtml', previewUri, vscode.ViewColumn.Two, 'Integrated SQL Log').then((success) => {
            }, (reason) => {
                vscode.window.showErrorMessage(reason);
            });
    }

    function reloadFile() {
        let editor = vscode.window.activeTextEditor;
        let uri = encodeUri(vscode.window.activeTextEditor.document.uri);
        return vscode.workspace.openTextDocument(uri).then(doc => {
            vscode.commands.executeCommand('workbench.action.closeActiveEditor');
            vscode.window.showTextDocument(doc, editor.viewColumn)
        }, err => {
            vscode.window.showErrorMessage(err);
        });
    }

    function encodeUri(uri: vscode.Uri): vscode.Uri {
        return vscode.Uri
            .parse(`fileReload:${uri.path}`);
    }
}

// this method is called when your extension is deactivated
export function deactivate() {
}