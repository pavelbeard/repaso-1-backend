import { defineConfig } from 'vitest/config'

const folders = {
  unit: ['./src/**/*.test.ts'],
  int: ['./test/**/*.test.ts'],
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
        },
      },
    ],
  },
})
