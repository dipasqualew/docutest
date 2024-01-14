import { defineConfig } from 'vitest/config'
import { DocutestReporter } from './src/reporter'

export default defineConfig({
    test: {
        // reporters: [
        //     new DocutestReporter('./.cache'),
        // ],
    },
})
