const { run: runServer } = require('./server');
const log = require('saga-logger').create({ module: module.id });

runServer()
.then(() => {
  log.info('APP_RUNNING');
});

// Catch all uncaught exception, log it and then die properly
process.on('uncaughtException', err => {
  log.fatal('UNCAUGHT_EXCEPTION', err);
  process.exit(1);
});
