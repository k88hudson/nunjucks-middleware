(function() {
var templates = {};
templates["index.html"] = (function() {function root(env, context, frame, runtime) {
var lineno = null;
var colno = null;
var output = "";
try {
var parentTemplate = env.getTemplate("layout.html", true);
for(var t_1 in parentTemplate.blocks) {
context.addBlock(t_1, parentTemplate.blocks[t_1]);
}
output += "\n";
output += "\n";
return parentTemplate.rootRenderFunc(env, context, frame, runtime);
} catch (e) {
  runtime.handleError(e, lineno, colno);
}
}
function b_content(env, context, frame, runtime) {
var lineno = null;
var colno = null;
var output = "";
try {
var l_super = context.getSuper(env, "content", b_content, frame, runtime);
output += "\n<h1>Hi, welcome to  Stuff ";
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "title"), env.autoesc);
output += runtime.suppressValue(runtime.contextOrFrameLookup(context, frame, "title"), env.autoesc);
output += "</h1>\n";
var includeTemplate = env.getTemplate("parts/part.html");
output += includeTemplate.render(context.getVariables(), frame.push());
output += "\n";
return output;
} catch (e) {
  runtime.handleError(e, lineno, colno);
}
}
return {
b_content: b_content,
root: root
};
})();
templates["layout.html"] = (function() {function root(env, context, frame, runtime) {
var lineno = null;
var colno = null;
var output = "";
try {
output += "<!DOCTYPE html>\n<html lang=\"en\">\n  <head>\n    <meta charset=\"utf-8\">\n    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge,chrome=1\">\n    <title>Example</title>\n    <meta name=\"description\" content=\"Example app\">\n  </head>\n  <body>\n    <main>";
output += context.getBlock("content")(env, context, frame, runtime);
output += "</main>\n    <script src=\"js/require.js\"></script>\n    <script>\n    requirejs.config({baseUrl: '/js'});\n    require(['nunjucks', 'templates'], function(nunjucks){\n      var test = nunjucks.env.render(\"parts/part.html\", {title: \"ASdasd\"});\n      var test2 = nunjucks.env.render(\"parts/lower/stuff.html\", {title: \"Styff\"});\n      console.log(test, test2);\n    });\n    </script>\n  </body>\n</html>\n";
return output;
} catch (e) {
  runtime.handleError(e, lineno, colno);
}
}
function b_content(env, context, frame, runtime) {
var lineno = null;
var colno = null;
var output = "";
try {
var l_super = context.getSuper(env, "content", b_content, frame, runtime);
return output;
} catch (e) {
  runtime.handleError(e, lineno, colno);
}
}
return {
b_content: b_content,
root: root
};
})();
templates["parts/lower/stuff2.html"] = (function() {function root(env, context, frame, runtime) {
var lineno = null;
var colno = null;
var output = "";
try {
output += "<p>this too is a part.</p>\n";
return output;
} catch (e) {
  runtime.handleError(e, lineno, colno);
}
}
return {
root: root
};
})();
templates["parts/part.html"] = (function() {function root(env, context, frame, runtime) {
var lineno = null;
var colno = null;
var output = "";
try {
output += "<p>this too is a part.</p>\n";
return output;
} catch (e) {
  runtime.handleError(e, lineno, colno);
}
}
return {
root: root
};
})();
if(typeof define === "function" && define.amd) {
    define(["nunjucks"], function(nunjucks) {
        nunjucks.env = new nunjucks.Environment([], {});
        nunjucks.env.registerPrecompiled(templates);
        return nunjucks;
    });
}
else if(typeof nunjucks === "object") {
    nunjucks.env = new nunjucks.Environment([], {});
    nunjucks.env.registerPrecompiled(templates);
}
else {
    console.error("ERROR: You must load nunjucks before the precompiled templates");
}
})();