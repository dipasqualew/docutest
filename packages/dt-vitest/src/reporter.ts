// ./custom-reporter.js
import * as fs from 'fs';
import * as path from 'path';

import { BasicReporter } from 'vitest/reporters'
import type { File, Task } from '@vitest/runner'
import type { Assertion, ExpectStatic } from '@vitest/expect'


export class DocutestReporter extends BasicReporter {
    basePath: string;

    constructor(basePath: string) {
        super();
        this.basePath = basePath;
    }

    async reportSummary() {
        try {
            const files = this.ctx.state.getFiles(this.watchFilters);

            files.forEach((file) => {
                const parsed = this.parseFile(file);
                const title = 'title' in file.meta ? file.meta.title : file.name.replace(/\W+/g, "__");
                const filePath = path.resolve(this.basePath, `${title}.md`);
                fs.writeFileSync(filePath, parsed);
            });
        } catch (err) {
            console.log({ err })
        }
    }

    parseFile(file: File) {
        const title = 'title' in file.meta ? file.meta.title : file.name.replace(/\W+/g, "__");
        const parsedTasks = file.tasks.map((task) => this.parseTask(task));

        if ('description' in file.meta) {
            parsedTasks.unshift(String(file.meta.description).trim());
        }

        return this.parseBody(`# ${title}\n\n${parsedTasks.join('\n\n')}`);
    }

    parseTask(task: Task, level: number = 2) {
        const title = task.name;

        let content = [];

        if ("description" in task.meta) {
            content.push(String(task.meta.description).trim())
        }

        if ("tasks" in task) {
            task.tasks.forEach((subtask) => {
                content.push(this.parseTask(subtask, level + 1))
            });
        }

        if (task.meta.expectations?.length) {
            content.push(task.meta.expectations.map((expectation) => `- ${expectation}`).join('\n'));
        }

        return `${'#'.repeat(level)} ${title}\n\n${content.join('\n\n')}`;
    }

    parseBody(body: string) {
        return body
            // trims whitespace at the beginning and end of each line
            .split('\n').map(line => line.trim()).join('\n');
    }
}

export const annotateTest = async (task: Task, description: string): Promise<ExpectStatic> => {
    const { expect: vitestExpect } = await import("vitest")
    task.meta.description = description;
    task.meta.expectations = [];

    const expectWrapper = (value: unknown, message: string | undefined): Assertion => {
        if (message) {
            (task.meta.expectations as string[]).push(message);
            console.log(message);
        }

        return vitestExpect(value, message);
    };

    Object.assign(expectWrapper, vitestExpect);

    return expectWrapper as ExpectStatic;
};
