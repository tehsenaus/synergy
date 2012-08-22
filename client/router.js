/**
 * File: client.router
 * Implements client-side URL routing
 */

var Router = require("../core").Router;

Router.implement({
	listen: function () {
		$(window).bind('hashchange', function (e) {
	        console.log(e);
	    } .bind(this));

        this.initListener();
	},

	initListener: function () {},
	/*makeUrl: function (url) {
		return "#" + url;
	}*/
});

if(typeof history.pushState == "function") {
	Router.implement({
		initListener: function () {
			if(window.location.hash && this.dispatch(decodeURIComponent(window.location.hash.slice(1)))) {
				history.replaceState(null, null, window.location.hash.slice(1));
			}

			var router = this;
			$('a').live('click', function (e) {
				var url = $(this).attr('href');
				if ( this.go(url) ) {
					e.preventDefault();
					return false;
				}
			});

			$(window).bind('popstate', function () {
				router.dispatch(decodeURIComponent(window.location.pathname));
			});
		},

		go: function (url) {
			if ( url[0] !== '/' ) {
				var path = window.location.pathname;
				url = path.slice(0, path.lastIndexOf('/') + 1) + url;
			}

			if(this.dispatch(url)) {
				history.pushState(null, null, url);
				return true;
			}
		}
	});
}

module.exports = Router;
