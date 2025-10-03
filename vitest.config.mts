import { defineConfig } from 'vitest/config'

const folders = {
  unit: ['./src/**/*.test.ts'],
  int: ['./__tests__/**/*.test.ts'],
  intCookies: ['./__tests__/**/*.cookies.test.ts'],
  nodeModules: ['./node_modules/**'],
}

export default defineConfig({
  test: {
    fileParallelism: false,
    projects: [
      {
        extends: true,
        test: {
          name: { label: 'unit', color: 'red' },
          include: folders.unit,
          exclude: folders.int.concat(folders.nodeModules),
          env: { ...process.env },
          alias: {
            lib: './src/lib',
          },
        },
      },
      {
        extends: true,
        test: {
          globals: true,
          environment: 'node',
          setupFiles: ['./__tests__/helpers/setup.ts'],
          name: { label: 'int', color: 'blue' },
          include: folders.int,
          exclude: folders.unit.concat(folders.nodeModules, folders.intCookies),
          env: { ...process.env },
          alias: {
            lib: './src/lib',
            features: './src/features',
          },
          isolate: true,
        },
      },
      {
        extends: true,
        test: {
          globals: true,
          environment: 'node',
          setupFiles: ['./__tests__/helpers/setup.ts'],
          poolOptions: {
            threads: {
              singleThread: true, // Ensure tests run in a single thread
            },
          },
          name: { label: 'int:cookies', color: 'blue' },
          include: folders.intCookies,
          exclude: folders.unit.concat(folders.nodeModules),
          env: { ...process.env, JWT_SAVE_TO_COOKIE: 'true' },
          alias: {
            lib: './src/lib',
            features: './src/features',
          },
          isolate: true,
        },
      },
    ],
  },
})
