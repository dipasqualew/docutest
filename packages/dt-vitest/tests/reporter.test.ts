import * as path from 'path';
import { promises as fs } from 'node:fs';

import { describe, test, beforeAll } from 'vitest';

import { DocutestReporter, annotateTest } from '../src/reporter';
import { runVitest } from './utils';

beforeAll((suite) => {
    suite.meta.title = "api/DocutestReporter";
    suite.meta.description = `
        A Vitest customer reporter that leverages test annotations
        to generate documentation.
    `;
})


describe('DocutestReporter', () => {
    describe("Generates markdown files based on the contents of the tests", () => {
        const root = path.resolve(__dirname, '../fixtures')
        const docutestReporterBasePath = path.resolve(__dirname, "../.cache");

        test("Using expectations", async ({ task }) => {
            const expect = await annotateTest(task, `
                Users can leverage the 'annotateTest' function
                to generate an extended 'expect' that will track expectations as 'expect' is called.
            `);

            const { stderr } = await runVitest({
                reporters: [new DocutestReporter(docutestReporterBasePath)],
                root,
            }, ["MagicWandWithoutExpectations"]);

            expect(stderr, `Does not generate any errors in stderr`).toEqual("");

            const documentPath = path.resolve(docutestReporterBasePath, "Magic Wands/With Expectations.md");
            const documentContents = (await fs.readFile(documentPath)).toString()
            expect(documentContents, `Generates the expected document with expectations`).toMatchSnapshot();
            expect(documentContents, 'Contains the filename in the frontmatter').toContain("filename: MagicWandWithExpectations.test.ts");
        });

        test("Without using expectations", async ({ task }) => {
            const expect = await annotateTest(task, `
                Tests can be run using Vitest's 'expect'.
                However, in that case, the expectations won't be recorded
                as additional documentation.
            `);

            const { stderr } = await runVitest({
                reporters: [new DocutestReporter(docutestReporterBasePath)],
                root,
            }, ["MagicWandWithExpectations"]);

            expect(stderr, `Does not generate any errors in stdrr`).toEqual("");

            const documentPath = path.resolve(docutestReporterBasePath, "Magic Wands/Without Expectations.md");
            const documentContents = (await fs.readFile(documentPath)).toString()
            expect(documentContents, `Generates the expected document without expectations`).toMatchSnapshot();
            expect(documentContents, 'Contains the filename in the frontmatter').toContain("filename: MagicWandWithoutExpectations.test.ts");
        });
    });
});
