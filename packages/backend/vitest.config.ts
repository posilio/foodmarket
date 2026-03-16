import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/__tests__/**/*.test.ts'],
    // Use forked processes so env vars are isolated between runs
    // and the .env file loaded by vitest propagates to workers.
    pool: 'forks',
    poolOptions: { forks: { singleFork: true } },
  },
});
