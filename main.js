
var path = require('path');
var fs = require('fs');
var connect = require("connect");
var dispatch = require("dispatch");
var quip = require("quip");
var browserify = require("browserify");
var _ = require("underscore");
var jsdom = require("jsdom");
//var hash = require("mhash").hash;
var less = require('less');
var resource = require("resource/server");
var server = require("./server");

var defaults = {
	api_root: "/api",
	
	wrap_host: function (server, options) {
		var host = this.host;
		return host ? connect.vhost(host, server) : server;
	},
	wrap_libs: function (server, options) {
		var host = this.libs_host || this.host;
		return host ? connect.vhost(host, server) : server;
	},
	wrap_api: function (server, options) {
		var root = {};
		root[this.api_root + '/'] = server;
		root[this.api_root + '.*'] = function(req, res) {
			res.notFound('resource not found');
		}

		var host = this.api_host || this.host;
		server = dispatch(root);
		return host ? connect.vhost(host, server) : server;
	},
	
	port: process.env.PORT || 8080
}

module.exports = function(options) {
	options = connect.utils.merge(defaults, options);
	
	console.log("starting server @ " + options.host + ":" + options.port);
	
	// Process the site template
	var template = fs.readFileSync(
		options.template || "./template.html",
		"utf8"
	);
	
	var konode_js = browserify({
		mount: "/site.js",
		require: ["./viewmodel"]
	});
	
	// Add libraries to bundle
	(function buildLibs(dir) {
		fs.readdirSync(dir).sort().forEach(function(f) {
			if(f[0] == '.') return;
			
			f = dir + '/' + f;
			if(fs.statSync(f).isDirectory()) {
				buildLibs(f);
			} else {
				konode_js.append(fs.readFileSync(f));
			}
		});
	})(__dirname + "/lib");
	
	// Load CSS
	// TODO: versioning
	var styles = "body {color: blue}";
	if(options.styles) {
		styles = fs.readFileSync(options.styles).toString();
		var parser = new less.Parser({
			paths: [path.dirname(options.styles)],
			filename: options.styles
		});
		parser.parse(styles, function (e, tree) {
		    styles = tree.toCSS();
		});
	}
	
	var server = connect(
		options.wrap_libs(konode_js),
		
		quip(),

		dispatch({
			"/styles.css": function (req, res) {
				res.css(styles);
			}
		}),

		options.wrap_api(resource.createAPI()),
		

		// Template server (main index)
		options.wrap_host(connect(
			function(req, response) {
				if(req.url == "/" || req.url == "")
					response.end(template);
				else {
					// Redirect to homepage with path in hash
					response.statusCode = 302;
					response.setHeader("Location", "/#" + req.url);
					response.end();
				}
			}
		))
	
	);
	
	//var wnd = jsdom.jsdom(template).createWindow();
	//console.log(wnd);
	
	return server;
};

module.exports.core = require("./core");
module.exports.defaults = defaults;
//module.exports.server = require("konode/server");
