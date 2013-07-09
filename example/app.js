
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    path = require('path'),
    nunjucksMiddleware = require('./../index.js');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(nunjucksMiddleware({
    baseDir: __dirname,
    src: "/views",
    output: "/public/js/templates.js",
    express: app
  }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);

app.get('/js/nunjucks.js', function(req,res) {
  res.sendfile( path.resolve(__dirname,"node_modules/nunjucks/browser/nunjucks.js" ));
});

app.get('/js/require.js', function(req,res) {
  res.sendfile( path.resolve(__dirname,"node_modules/requirejs/require.js" ));
});


http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
