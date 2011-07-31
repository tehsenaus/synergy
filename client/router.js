/**
 * File: client.router
 * Implements client-side URL routing
 */

console.log("cl");

var Router = require("../core").Router;

console.log("client.router");

Router.implement({
	listen: function () {
		$(window).bind('hashchange', function (e) {
	        console.log(e);
	    } .bind(this));
		
		$(document).ready(function () {
            $(window).trigger('hashchange');
        });
	}
});

module.exports = Router;
