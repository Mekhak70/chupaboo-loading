/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    './postcss-project-root.cjs': {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {}),
  },
}

export default config
