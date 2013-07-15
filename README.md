Nunjucks Middleware
========

See example/

 app.use(nunjucksMiddleware({
    src: "/views",
    output: "/public/js/templates.js",
    endpoint: "/js/templates.js",
    express: app,
    debug: true
  }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
