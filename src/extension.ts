'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import { HibernateLogExtractor } from './HibernateLogExtractor';
import { HibernateLogExtractorConfig } from './HibernateLogExtractor/config';
import { FileReloadContentProvider } from './FileReloadContentProvider';


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    const status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);

    let extractHibernateLogCommand = vscode.commands.registerCommand('hibernateLogExtract.extractHibernateLog', () => {
        return extractSqlFromHibernateLog();
    });

    let reloadFileCommand = vscode.commands.registerCommand('hibernateLogExtract.reloadFile', () => {
       return reloadFile();
    });
    let fileReload = new FileReloadContentProvider();
    
    context.subscriptions.push(reloadFileCommand, vscode.Disposable.from(
        vscode.workspace.registerTextDocumentContentProvider('fileReload', fileReload)
    ));


    let clearFileCommand = vscode.commands.registerCommand('hibernateLogExtract.clearFile', () => {
        clearFile();
        return reloadFile();
     });
     context.subscriptions.push(clearFileCommand, vscode.Disposable.from(
         vscode.workspace.registerTextDocumentContentProvider('fileReload', fileReload)
     ));

     function extractSqlFromHibernateLog() {
        var editor = vscode.window.activeTextEditor;
        var path: string;
        if (editor) {
            path = editor.document.uri.fsPath;
        } else {
            console.log("No open text editor");
            
            if (vscode.workspace.textDocuments.length == 1) {
                path = vscode.workspace.textDocuments[0].uri.fsPath;
            } else {
                vscode.window.showErrorMessage("Please open any Text in Editor or check that log file is not to big");
                return null;
            }
        }
    
        let stats: Map<string, number> = new Map();        
    
        let options: Object = {
            content: getSQL(path, stats),
            language: "sql"
        };
    
        return vscode.workspace.openTextDocument(options).then(doc => {
            vscode.window.showTextDocument(doc, vscode.ViewColumn.One);
            updateStatus(stats);
        }, err => {
            vscode.window.showErrorMessage(err);
        });
    }

     function updateStatus(stats: Map<string, number>): void {
        let statusStrings: Array<string> = [];
        stats.forEach((value: number, key: string) => {
            statusStrings.push(key + " " + value);
        });
    
        status.text = statusStrings.join(", ");
        status.show();
    }
}

// this method is called when your extension is deactivated
export function deactivate() {
}

function getSQL(path: string, stats: Map<string, number>): string {
    let text: string = fs.readFileSync(path, "utf8");
    let logExtractor = new HibernateLogExtractor(getConfig());
    let sql: string = logExtractor.extract(text, stats);

    return sql;
}

function getConfig(): HibernateLogExtractorConfig {
    let rawConfig: any = vscode.workspace.getConfiguration('hibernateLogExtract');
    let config = new HibernateLogExtractorConfig();
    config.hql = rawConfig.hql;
    config.sqlComment = rawConfig.sqlComment;
    config.statistic = rawConfig.statistic;

    return config;
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