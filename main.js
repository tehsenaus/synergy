
var fs = require('fs');
var connect = require("connect");
var browserify = require("browserify");
var _ = require("underscore");

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
	
	
	var server = connect(
		connect.vhost(options.libHost || options.host, connect(
			browserify({
				require: __dirname + "/client/index.js",
				mount: "/konode.js"
			}),
			browserify({
				require: [{us: "underscore"}, "./routes"],
				mount: "/site.js",
				root: __dirname
			})
		)),
		connect.vhost(options.host, connect(
			function(req, res) {
				res.end(template);
			}
		))
		
	).listen(options.port);
	
	return server;
};
