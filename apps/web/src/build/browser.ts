await Bun.build({
  entrypoints: ['src/browser/index.tsx'],
  outdir: './out',
  target: 'browser',
  format: 'esm',
  splitting: false, // Change to true to enable splitting
  sourcemap: 'linked',
  minify: false, // Change to true to make the code fucking unreadable for almost no performance boost
  root: '.'
});
