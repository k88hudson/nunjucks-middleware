var nunjucks = require('nunjucks');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var gaze = require('gaze');
var glob = require('glob')
var async = require('async');

var index = false;
var built = false;

var red = '\u001b[31m';
var blue = '\u001b[34m';
var reset = '\u001b[0m';
var grey = '\x1B[90m'

module.exports = function (options) {
  options = options || {};

  // Once?
  var once = options.once;

  // Show console messages?
  var debug = options.debug;

  // Base directory
  var baseDir = options.baseDir || './';

  // Source dir
  var sourceDir = path.join(baseDir, options.src);

  // Glob
  var patterns = path.join(sourceDir, '**/*.html');

  // What endpoint are we dealing with?
  var endpoint = options.endpoint || '/js/template.js';

  var nunjucksEndpoint = options.nunjucksEndpoint || path.dirname(endpoint) + '/nunjucks.js';

  // Where does the compiled output live?
  var outputPath = path.join(baseDir, options.output || options.endpoint);

  // Nunjucks
  var compiler = nunjucks.compiler;

  // Express
  if (options.express) {
    var nunjucksEnv = new nunjucks.Environment(new nunjucks.FileSystemLoader(sourceDir));
    nunjucksEnv.express(options.express);
  }

  function log(message, type) {
    if (debug) {
      type = type || 'log';
      var color = type === 'error' ? red : blue;

      console[type](grey + 'Nunjucks: ' + color + message + reset);
    }
  };

  // Middleware
  return function nunjucksMiddleware(req, res, next) {
    // Only deal with GET or HEAD requests
    if (req.method.toUpperCase() != 'GET' && req.method.toUpperCase() != 'HEAD') {
      return next();
    }

    if (req.path === nunjucksEndpoint) {
      return res.sendfile(path.resolve(__dirname, 'node_modules/nunjucks/browser/nunjucks' + (once ? '-min' : '') + '.js'));
    }

    if (req.path !== endpoint) {
      return next();
    }

    if (built && once) {
      return next();
    }

    function build(err, compiledFiles) {
      var compiledText = '';
      var envOpts = '{}';

      log('Building ' + outputPath + '...');
      compiledText += '(function() {\n';
      compiledText += 'var templates = {};\n';

      Object.keys(index).forEach(function (filename) {
        var src = index[filename];
        compiledText += 'templates["' + filename + '"] = (function() {';
        compiledText += src;
        compiledText += '})();\n';
      });
      compiledText += 'if(typeof define === "function" && define.amd) {\n' +
        '    define(["nunjucks"], function(nunjucks) {\n' +
        '        nunjucks.env = new nunjucks.Environment([], ' + envOpts + ');\n' +
        '        nunjucks.env.registerPrecompiled(templates);\n' +
        '        return nunjucks;\n' +
        '    });\n' +
        '}\n' +
        'else if(typeof nunjucks === "object") {\n' +
        '    nunjucks.env = new nunjucks.Environment([], ' + envOpts + ');\n' +
        '    nunjucks.env.registerPrecompiled(templates);\n' +
        '}\n' +
        'else {\n' +
        '    console.error("ERROR: You must load nunjucks before the precompiled templates");\n' +
        '}\n' +
        '})();'
      mkdirp(path.dirname(outputPath), function (err) {
        if (err) {
          return next(err);
        }
        fs.writeFile(outputPath, compiledText, 'utf8', function (err) {
          if (err) {
            return next(err);
          }
          built = compiledText;
          log('Updated ' + outputPath);
          return next();
        });
      });
    }

    function compileFile(filepath, callback) {
      var filename = path.relative(sourceDir, filepath);
      if (index[filename]) {
        return callback(null, index[filename]);
      }
      fs.readFile(filepath, 'utf-8', function (err, data) {
        if (err) {
          log('Error reading ' + filepath, 'error');
          delete index[filename];
          return callback();
        } else {
          log('Compiling ' + filename);
          index[filename] = compiler.compile(data);
          return callback(null, index[filename]);
        }
      });
    }

    // No files registered yet
    if (!index) {
      log('Beginning first build...');
      index = {};
      if (!once) {
        gaze(patterns, function (err, watcher) {
          var watched = this.watched();
          log('Debug mode: Watching files in /' + sourceDir);
          this.on('all', function (event, filepath) {
            var filename = path.relative(sourceDir, filepath);
            log('Looks like ' + filename + ' was ' + event + '. Flagging to recompile');
            delete index[filename];
            built = false;
          });
        });
      }
    }

    if (!built) {
      glob(patterns, function (err, files) {
        async.map(files, compileFile, build);
      });
    } else {
      return next();
    }

  };

};
