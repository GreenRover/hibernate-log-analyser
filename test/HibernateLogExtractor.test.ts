// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { HibernateLogExtractor } from '../src/HibernateLogExtractor';
import * as fs from 'fs';

suite("HibernateLogExtractor Tests", () => {

        test("Include bindings basic", () => {
            testFile("bindingsBasic");
        });

        test("Include bindings complicated", () => {
            testFile("bindingsComplicated");
        });

        test("comments", () => {
            testFile("comments");
        });

        test("traillingColon", () => {
            testFile("traillingColon");
        });

        let testFile = (baseName: string): void => {
            let path: string = __dirname + "/../../test/hibernateLog/" + baseName;
            let log: string = fs.readFileSync(path + ".log", "utf8");
            let expectedSql: string = fs.readFileSync(path + ".sql", "utf8") //
                .trim().replace(/\r\n/g, "\n");

            let logExtractor = new HibernateLogExtractor();
            let sql: string = logExtractor.extract(log) //
                .trim().replace(/\r\n/g, "\n");

            assert.notEqual(sql, "", "Empty result");

            assert.equal(sql, expectedSql);        
        };
    });