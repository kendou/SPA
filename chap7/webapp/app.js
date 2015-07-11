/**
 * Created by kenthuang on 15/7/11.
 * Simple express server
 */

//-------------------Begin Module scope variables
'use strict';
var
  http = require('http'),
  express = require('express'),
  routes = require('./routes'),
  logger = require('morgan'),
  bodyParser = require('body-parser'),
  methodOverride = require('method-override'),
  errorHandler = require('errorhandler'),

  app = express(),
  router = express.Router(),
  server = http.createServer(app);

//------------------End Module scope variables

//------------------Begin Server configuration

app.use(bodyParser.json());
app.use(methodOverride());
app.use(express.static(__dirname + '/public'));
app.use(router);

if(app.get('env') === 'development') {
  app.use(logger('dev'));
  app.use(errorHandler({
    dumpExceptions : true,
    showStack : true
  }));
}

if('production' === app.get('env')){
  app.use(errorHandler());
}

routes.configRoutes(app, server);
//------------------End Server configuration

//------------------Begin start server
server.listen(3000);
console.log(
  'Express server listenening on port %d in %s mode',
  server.address().port, app.settings.env
);

