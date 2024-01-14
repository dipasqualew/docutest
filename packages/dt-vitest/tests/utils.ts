import { Console } from 'node:console'
import { Writable } from 'node:stream'

import { type UserConfig, type VitestRunMode, afterEach } from 'vitest'
import { startVitest } from 'vitest/node'
import type { Vitest } from 'vitest/node'
import stripAnsi from 'strip-ansi'

/**
 * Runs vitest.
 *
 * Copied from the vitest repo as it can't be installed:
 * https://github.com/vitest-dev/vitest/blob/8b4a44ad16461612fa9884dbe7b831a2f80eacfc/test/test-utils/index.ts
 * @param config
 * @param cliFilters
 * @param mode
 * @returns
 */
export async function runVitest(config: UserConfig, cliFilters: string[] = [], mode: VitestRunMode = 'test') {
    // Reset possible previous runs
    process.exitCode = 0
    let exitCode = process.exitCode

    // Prevent possible process.exit() calls, e.g. from --browser
    const exit = process.exit
    process.exit = (() => { }) as never

    const { getLogs, restore } = captureLogs()

    let vitest: Vitest | undefined
    try {
        vitest = await startVitest(mode, cliFilters, {
            watch: false,
            reporters: ['verbose'],
            ...config,
        })
    }
    catch (e: any) {
        return {
            stderr: `${getLogs().stderr}\n${e.message}`,
            stdout: getLogs().stdout,
            exitCode,
            vitest,
        }
    }
    finally {
        exitCode = process.exitCode
        process.exitCode = 0
        process.exit = exit

        restore()
    }

    return { ...getLogs(), exitCode, vitest }
}

function captureLogs() {
    const stdout: string[] = []
    const stderr: string[] = []

    const streams = {
        stdout: new Writable({
            write(chunk, _, callback) {
                stdout.push(chunk.toString())
                callback()
            },
        }),
        stderr: new Writable({
            write(chunk, _, callback) {
                stderr.push(chunk.toString())
                callback()
            },
        }),
    }

    const originalConsole = globalThis.console
    globalThis.console = new Console(streams)

    const originalStdoutWrite = process.stdout.write
    process.stdout.write = streams.stdout.write.bind(streams.stdout) as any

    const originalStderrWrite = process.stderr.write
    process.stderr.write = streams.stderr.write.bind(streams.stderr) as any

    return {
        restore: () => {
            globalThis.console = originalConsole
            process.stdout.write = originalStdoutWrite
            process.stderr.write = originalStderrWrite
        },
        getLogs() {
            return {
                stdout: stripAnsi(stdout.join('')),
                stderr: stripAnsi(stderr.join('')),
            }
        },
    }
}
