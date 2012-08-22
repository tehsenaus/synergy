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
				if(router.dispatch(url)) {
					e.preventDefault();
					history.pushState(null, null, url);
					return false;
				}
			});

			$(window).bind('popstate', function () {
				router.dispatch(decodeURIComponent(window.location.pathname));
			});
		}
	});
}

module.exports = Router;
