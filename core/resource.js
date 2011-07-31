
var core = require("konode/core");

function Resource(name, options) {
	this.name = name;
};

module.exports = function(name, options) {
	var resource = new Resource(name, options);
	if(name in core.resources) {
		throw new Error("Resource name collision: " + name);
	}
	core.resources[name] = resource;
	return resource;
}
module.exports.Resource = Resource;