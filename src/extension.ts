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

    let previewSchema = 'sql-log';

    let extractHibernateLogCommand = vscode.commands.registerCommand('extension.extractHibernateLog', () => {
        return extractSqlFromHibernateLog();
    });
    let hibernateExtractorProvider = new HibernateExtractorContentProvider();
    vscode.window.onDidChangeTextEditorSelection((e: vscode.TextEditorSelectionChangeEvent) => {
		if (e.textEditor === vscode.window.activeTextEditor) {
			hibernateExtractorProvider.update(vscode.Uri.parse(previewSchema + "?" + vscode.window.activeTextEditor.document.uri.path));
		}
    })
    
    context.subscriptions.push(extractHibernateLogCommand, vscode.Disposable.from(
        vscode.workspace.registerTextDocumentContentProvider(previewSchema, hibernateExtractorProvider)
    ));

    let reloadFileCommand = vscode.commands.registerCommand('extension.reloadFile', () => {
       return reloadFile();
    });
    let fileReload = new FileReloadContentProvider();
    
    context.subscriptions.push(reloadFileCommand, vscode.Disposable.from(
        vscode.workspace.registerTextDocumentContentProvider('fileReload', fileReload)
    ));


    let clearFileCommand = vscode.commands.registerCommand('extension.clearFile', () => {
        clearFile();
        return reloadFile();
     });
     context.subscriptions.push(clearFileCommand, vscode.Disposable.from(
         vscode.workspace.registerTextDocumentContentProvider('fileReload', fileReload)
     ));
    

    function extractSqlFromHibernateLog() {
        var editor = vscode.window.activeTextEditor;
        var path;
        if (editor) {
            path = editor.document.uri.path;
        } else {
            console.log("No open text editor");
            
            if (vscode.workspace.textDocuments.length == 1) {
                path = vscode.workspace.textDocuments[0].uri.path;
            } else {
                vscode.window.showErrorMessage("Please open any Text in Editor or check that log file is not to big");
                return null;
            }
        }

        return vscode.workspace.openTextDocument(vscode.Uri.parse(previewSchema + ":" + path)).then(doc => {
            vscode.window.showTextDocument(doc, vscode.ViewColumn.One).then(editor => {
                
            });
        }, err => {
            vscode.window.showErrorMessage(err);
        });
    }

    function clearFile() {
        let editor = vscode.window.activeTextEditor;
        fs.truncateSync(vscode.window.activeTextEditor.document.uri.fsPath);
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