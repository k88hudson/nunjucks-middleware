"use strict";

var nunjucks = require("nunjucks");
var fs = require("fs");
var path = require("path");
var url = require("url");
var debug = require("debug")("nunjucks-middleware");
var mkdirp = require("mkdirp");
var gaze = require("gaze");
var glob = require("glob")
var async = require("async");

var index = [];

// OPTIONS
//  force
//  debug
//  filename
module.exports = function(options) {
  options = options || {};

  // Force compilation every time
  var force = options.force;

  // Base directory
  var baseDir = options.baseDir;

  // Source dir
  var sourceDir = path.join(baseDir, options.src);

  // Glob
  var patterns = path.join(sourceDir, "**/*.html");

  // Where does the compiled output live?
  var outputPath = path.join(baseDir, options.output || "/js/template.js");

  // Nunjucks
  var compiler = nunjucks.compiler;

  // Express
  if ( options.express ) {
    var nunjucksEnv = new nunjucks.Environment(new nunjucks.FileSystemLoader(sourceDir));
    nunjucksEnv.express(options.express);
  }

  function build() {
    var compiledText = "";
    var envOpts = "{}";

    compiledText += '(function() {\n';
    compiledText += 'var templates = {};\n';
    Object.keys(index).forEach(function(filename) {
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
    mkdirp(path.dirname(outputPath), function(err) {
      if (err) {
        return error(err);
      }
      fs.writeFile(outputPath, compiledText, 'utf8', function(err) {
        if (err) {
          return error(err);
        }
        console.log( "Updated file " + outputPath );
      });
    });
  }

  function compileFile(filepath, callback) {
    var filename = path.relative(sourceDir, filepath);
    fs.readFile(filepath, 'utf-8', function(err, data) {
      if (err) {
        delete index[filename];
      } else {
        index[filename] = compiler.compile(data);
      }
      if ( callback ) {
        callback();
      }
    });

  }

  gaze(patterns, function(err, watcher) {
    var watched = this.watched();
    this.on('all', function(event, filepath) {
      compileFile(filepath, build);
    });
  });

  glob(patterns, function(err, files) {
    async.map(files, compileFile, build);
  });



  // Middleware
  return function nunjucksMiddleware(req, res, next) {
    // Only deal with GET or HEAD requests
    if (req.method.toUpperCase() != "GET" && req.method.toUpperCase() != "HEAD") {
      return next();
    }

    if (!outputPath === req.path ) {
      return next();
    }

    if (!index) {

    }

    return next();
  };

};
