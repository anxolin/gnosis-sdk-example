const browserSync = require('browser-sync');

browserSync({
  server: ['src/static'],
  port: 8080,
  files: ['static/**/*']
});