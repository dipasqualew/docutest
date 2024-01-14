import "vitest"

declare module 'vitest' {
    interface TaskMeta {
        title?: string;
        docutest__path?: string;
        description?: string;
        expectations?: string[];
    }
}
