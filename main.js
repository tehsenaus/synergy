
var fs = require('fs');
var connect = require("connect");
var browserify = require("konode_browserify");
var _ = require("underscore");
var jsdom = require("jsdom");

var defaults = {
	host: "localhost",
	port: 8080,
	apps: []
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
		require: ["konode/client", "./viewmodel"]
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
	
	
	var server = connect(
		connect.vhost(options.libHost || options.host, connect(
			konode_js
		)),
		
		// Template server (main index)
		connect.vhost(options.host, connect(
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
		
	).listen(options.port);
	
	//var wnd = jsdom.jsdom(template).createWindow();
	//console.log(wnd);
	
	return server;
};

module.exports.core = require("konode/core");
//module.exports.server = require("konode/server");
