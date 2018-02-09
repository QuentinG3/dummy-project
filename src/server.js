const _ = require('lodash');
const BPromise = require('bluebird');
const qs = require('qs');
const config = require('config');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const ManagedError = require('saga-managed-error');

const autoroute = require('./libs/autoroute');

const log = require('saga-logger').create({ module: module.id });

module.exports.run = async () => new BPromise((resolve, reject) => {
  log.debug('ROUTER_LOADING');
  const app = express();

  const router = autoroute(
    express.Router,
    path.join(__dirname, './controllers'),
    {
      read: 'get',
      create: 'post',
      update: 'put',
      destroy: 'delete'
    }
  );

  // Allow querystring parsing of object dot representation
  app.set('query parser', query => qs.parse(query, {
    arrayLimit: 9999,
    allowDots: true
  }));

  app.use(
    bodyParser.json({
      strict: true,
      limit: '200mb'
    })
  );

  app.use('/', router);

  app.all('*', (req, res, next) => {
    next(new ManagedError('API_GENERAL', 404));
  });

  // Error Handler (the 4 arguments are required!)
  app.use((error, req, res, next) => { // NOSONAR
    const statusCode = error.statusCode || 500;
    const data = { error: error.message };

    if (error.validations) {
      data.validations = error.validations;
    }

    const meta = _.pick(req, ['method', 'path', 'query', 'body']);

    log.error('API_FAIL', error, meta);
    res.status(statusCode).json(data);
  });

  app.listen(config.app.port, err => {
    if (err) {
      log.error('ROUTER_LOADING_FAIL', err);
      return reject(err);
    } else {
      log.debug('ROUTER_LOADING_SUCCESS');
      resolve();
    }
  });
});
