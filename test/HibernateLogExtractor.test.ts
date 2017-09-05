// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { HibernateLogExtractor } from '../src/HibernateLogExtractor';
import { HibernateLogExtractorConfig } from '../src/HibernateLogExtractor/config';
import * as fs from 'fs';

suite("HibernateLogExtractor Tests", () => {

    let config: HibernateLogExtractorConfig = new HibernateLogExtractorConfig();

    test("Include bindings basic", () => {
        return testFile("bindingsBasic");
    });

    test("Include bindings complicated", () => {
        return testFile("bindingsComplicated");
    });

    test("comments", () => {
        return testFile("comments");
    });

    test("traillingColon", () => {
        return testFile("traillingColon");
    });

    test("commentsInSql", () => {
        config.sqlComment = true;
        return testFile("commentsInSql");
    });

    test("hqlWithCommentsInSql", () => {
        config.hql = true;
        config.sqlComment = true;
        return testFile("hqlWithCommentsInSql");
    });

    test("hqlWithoutCommentsInSql", () => {
        config.hql = true;
        config.sqlComment = false;
        return testFile("hqlWithoutCommentsInSql");
    });

    test("statistic", () => {
        config.statistic = true;
        return testFile("statistic");
    });

    test("bindingsLongVarChar", () => {
        return testFile("bindingsLongVarChar");
    });

    let testFile = (baseName: string): Promise<void> => {
        let path: string = __dirname + "/../../test/hibernateLog/" + baseName;
        let expectedSql: string = fs.readFileSync(path + ".sql", "utf8") //
            .trim().replace(/\r\n/g, "\n");

        let logExtractor = new HibernateLogExtractor(config);
        let fileReadet: Promise<void> = logExtractor.extractFromFile(path + ".log");
  
        return fileReadet.then(
            () => {
                let sql: string = logExtractor.getSql() //
                .trim().replace(/\r\n/g, "\n");
    
                assert.notEqual(sql, "", "Empty result");
    
                assert.equal(sql, expectedSql);
            },
            (err: Error) => {
                assert.equal(1, 0, err.message);
            }
        );    
    };
});