const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const log = require('saga-logger').create({ module: module.id });

const routeFromPaths = (basePath, filePath) =>
  filePath.substr(basePath.length).replace(/(\/index)?\.js$/i, '') || '/';

const findControllers = basePath => {
  const files = fs.readdirSync(basePath);
  const controllerFiles = [];

  files.forEach(file => {
    // Skip ., .., .something_hidden
    if (file[0] === '.') {
      return;
    }

    const fullPath = path.join(basePath, file);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      controllerFiles.push(...findControllers(fullPath));
    }

    if (path.extname(file) === '.js') {
      controllerFiles.push(fullPath);
    }
  });
  // Important to have the files from directories first for routing
  return controllerFiles;
};

const createRouteHandler = (controller, action, metaList) => {
  return async (req, res, next) => {
    const options = Object.assign({}, req.query, req.body, req.params);
    const meta = Object.keys(req).reduce((result, key) => {
      // Additional req keys needed (e.q.: 'user')
      if (metaList.indexOf(key) !== -1) {
        result[key] = req[key];
      }

      return result;
    }, {});

    try {
      const result = await controller[action](options, meta);
      const logMeta = _.pick(req, ['method', 'path', 'query', 'body']);
      log.debug('API_SUCCESS', result, logMeta);
      res.json(result);
    } catch (e) {
      return next(e);
    }
  };
};

const registerController = (router, route, controller, actionsMap, metaList) => { // NOSONAR
  Object.keys(controller).forEach(action => {
    if (!(action in actionsMap)) {
      return;
    }
    // 'Verb should be 'head', 'get', 'post', 'put', 'patch', 'delete'
    const verb = actionsMap[action].toLowerCase();
    let finalRoutes;

    if (['head', 'get'].indexOf(verb) !== -1) {
      finalRoutes = [route, route.replace(/\/$/, '') + '/:id'];
    } else if (['put', 'patch', 'delete'].indexOf(verb) !== -1) {
      // Remove ending '/', most likely for the root path
      finalRoutes = [route.replace(/\/$/, '') + '/:id'];
    } else {
      // For the post verb
      finalRoutes = [route];
    }
    const routeHandler = createRouteHandler(controller, action, metaList);
    // Assign routeHandler to routes
    finalRoutes.forEach(finalRoute => router[verb](finalRoute, routeHandler));
  });
};

module.exports = (Router, controllersBasePath, actionsMap, metaList = []) => {
  const controllerPaths = findControllers(controllersBasePath);
  const router = new Router();
  // Need to sort to have longest/most-specific route first
  controllerPaths
    .map(controllerPath => {
      return {
        path: controllerPath,
        route: routeFromPaths(controllersBasePath, controllerPath)
      };
    })
    .sort((controllerInfoA, controllerInfoB) => {
      const partsA = controllerInfoA.route.split('/');
      const partsB = controllerInfoB.route.split('/');
      // Most specific route first (descending sort)
      return partsB.length - partsA.length;
    })
    .forEach(controllerInfo => {
      const controller = require(controllerInfo.path);
      registerController(router, controllerInfo.route, controller, actionsMap, metaList); // NOSONAR
    });

  return router;
};
