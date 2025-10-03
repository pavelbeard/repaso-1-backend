import { defineConfig } from 'vitest/config'

const folders = {
  unit: ['./src/**/*.test.ts'],
  int: ['./tests/**/*.test.ts'],
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
          setupFiles: ['./tests/helpers/setup.ts'],
          name: { label: 'int', color: 'blue' },
          include: folders.int,
          exclude: folders.unit.concat(folders.nodeModules),
          env: { ...process.env },
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
