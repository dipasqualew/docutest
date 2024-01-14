import * as path from 'path';
import { promises as fs } from 'node:fs';

import { describe, test, expect } from 'vitest';

import { DocutestReporter } from '../src/reporter';
import { runVitest } from './utils';


describe('DocutestReporter', () => {
    test("Generates markdown files based on the contents of the tests", async () => {
        const root = path.resolve(__dirname, '../fixtures')
        const docutestReporterBasePath = path.resolve(__dirname, "../.cache");

        await runVitest({
            reporters: [new DocutestReporter(docutestReporterBasePath)],
            root
        });

        const documentPath = path.resolve(docutestReporterBasePath, "Magic Wand.md");
        const documentContents = (await fs.readFile(documentPath)).toString()
        expect(documentContents).toMatchSnapshot();
    });
});
