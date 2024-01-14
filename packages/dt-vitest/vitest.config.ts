import { defineConfig } from 'vitest/config'
import { DocutestReporter } from './src/reporter'

export default defineConfig({
    test: {
        // root: "./tests",
        reporters: [
            "default",
            new DocutestReporter('./docs'),
        ],
    },
})
