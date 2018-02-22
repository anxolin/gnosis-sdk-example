const browserSync = require('browser-sync');

/**
 * Run Browsersync with server config
 */
browserSync({
  server: ['src/static'],
  port: 8080,
  files: ['static/**/*']
});