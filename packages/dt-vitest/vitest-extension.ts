import "vitest"

declare module 'vitest' {
    interface TaskMeta {
        title?: string;
        description?: string;
    }
}
