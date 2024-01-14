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

            await Promise.all(
                files.map(async (file) => {
                    const parsed = this.parseFile(file);
                    const title = file.meta.title || file.name.replace(/\.(js|ts)/g, "");
                    this.writeMarkdown(title, parsed);
                })
            );
        } catch (err) {
            console.log({ err })
        }
    }

    async writeMarkdown(title: string, parsed: string): Promise<void> {
        const filePath = path.resolve(this.basePath, `${title}.md`);
        const parent = path.dirname(filePath);
        await fs.promises.mkdir(parent, { recursive: true });
        await fs.promises.writeFile(filePath, parsed);
    }

    parseFile(file: File) {
        const title = 'title' in file.meta ? file.meta.title : file.name.replace(/\W+/g, "__");
        const parsedTasks = file.tasks.map((task) => this.parseTask(task));

        if ('description' in file.meta) {
            parsedTasks.unshift(String(file.meta.description).trim());
        }

        const frontmatter = `---\nfilename: ${file.name}\n---\n\n`;
        const body = this.parseBody(`# ${title}\n\n${parsedTasks.join('\n\n')}`);

        return frontmatter + body;
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
            const expectations = task.meta.expectations.map((expectation) => `- ${expectation}`).join('\n');
            content.push(`Expectations:\n${expectations}`);
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
        }

        return vitestExpect(value, message);
    };

    Object.assign(expectWrapper, vitestExpect);

    return expectWrapper as ExpectStatic;
};
