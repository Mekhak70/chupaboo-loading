import { fileURLToPath } from 'node:url'

const projectTailwindPlugin = fileURLToPath(new URL('./postcss-project-root.cjs', import.meta.url))

/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    [projectTailwindPlugin]: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {}),
  },
}

export default config
