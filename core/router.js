/**
 * File: core.router
 * Shared URL router
 */

var Class = require("coop").Class;

console.log("core.router", module.id);

var Router = new Class({
    initialize: function (routes) {
        this.routes = (routes || []).map(function (r) {
            var regex = r[0], fn = r[1], name_or_clear = r[2], name = r[3];
            return {
                regex: regex, dispatch: fn,
                clear: typeof name_or_clear == "function" ? name_or_clear : null,
                name: typeof name_or_clear == "function" ? name : name_or_clear
            };
        });
    },
    
    listen: function () {
    	throw new Error("No client/server adaptor loaded");
    },
    
    dispatch: function (url) {
    	console.log("dispatch", url, this.routes);
    	
    	return (this.routes.some(function (r) {
            var m = r.regex.exec(url);
            if (m) {

                // Clear state
                this.routes.each(function (_r) {
                    if (_r != r && typeof _r.clear == "function")
                        _r.clear();
                });

                r.dispatch.apply(this, m);
                return r;
            }
        }, this) || (
            // Clear state
            this.routes.each(function (_r) {
                if (typeof _r.clear == "function") _r.clear();
            }) && false)
        );
    },
    
    reverse: function (routeName, args) {
        args = args || [];
        for (var i = 0; i < this.routes.length; i++) {
            var r = this.routes[i];
            if (r.name === routeName) {
                // Build URL
                var url = "";
                var src = r.regex.source.replace(/(\^|\$)/, "").replace('\\/', '/');
                for (var j = 0, a = 0; a < args.length && j < src.length; j++) {
                    if (src[j] === '(') {
                        var lvl = 1;
                        url += args[a++];
                        for (; j < src.length; j++) {
                            if (src[j] === '(') lvl++;
                            else if (src[j] === ')') lvl--;

                            if (lvl == 0) break;
                        };
                    } else url += src[j];
                };
                return this.makeUrl(url + src.slice(j, src.length));
            };
        };
        throw "No such route: " + routeName;
    },
    
    makeUrl: function (url) {
        return url;    
    },

    observable: function (regex, name, value) {
        var o = ko.observable(value);
        this.routes.push({
            regex: regex, name: name,
            dispatch: function () {
                if (arguments.length > 2) {
                    o(Array.prototype.slice.call(arguments, 1, arguments.length));
                } else {
                    o(arguments[arguments.length - 1]);
                }
            },
            clear: function () {
                // Reset to initial value
                o(value);
            }
        });
        return o;
    }
});


module.exports = Router;
