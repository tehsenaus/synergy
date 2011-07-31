
function makeArray(a) {
	return a instanceof Array ? a : [a];
}

function merge(a) {
	var lin = [];
	while(a.length) {
		
		var head = null;
		for(var i = 0; i < a.length; i++) {
			var h = a[i][0];
			if(!a.some(function(b) {
				return b.indexOf(h) > 0;
			}))
			{
				head = h;
				break;
			}
		}
		if(!head) {
			throw new Error("No linearization possible for " + a.join(','));
		}
		
		lin.push(head);
		
		a = a.map(function (b) {
			return b.filter(function (c) {
				return c !== head;
			});
		});
		a = a.filter(function (b) {
			return b.length;
		});
		
	}
	return lin;
}

module.exports = function(bases_or_klass, klass) {
	var bases = klass ? makeArray(bases_or_klass) : [];
	klass = klass || bases_or_klass;
	
	function Class() {
		if(this.initialize)
			this.initialize.apply(this, arguments);
	}
	
	Class.prototype = {};
	Class.__dict__ = {};
	Class.prototype.constructor = Class;
	Class.subclasses = [];
	
	Class.implement = function(props, subclass) {
		for(var n in props) {
			if(!subclass || !(n in Class.__dict__)) {
				var p = props[n];
				Class.prototype[n] = p;
				if(!subclass) Class.__dict__[n] = p;
			}
		}
		Class.subclasses.forEach(function(s) {
			s.implement(props, true);
		});
	}
	
	Class.implement(klass);
	bases.forEach(function(b) {
		b.subclasses.push(Class);
		Class.implement(b.prototype, true);
	});
	
	var base_mros = bases.map(function(b) { return b.__mro__; });
	if(bases.length) base_mros.push(bases);
	
	Class.__mro__ = [Class].concat(merge(base_mros));
	Class.prototype.super = function () {
		var caller = Class.prototype.super.caller;
		var klass = caller.__class__;
		if(!klass)
			throw new Error("super must be called from within method");
		
		var mro = this.constructor.__mro__;
		for(var i = mro.indexOf(klass); i < mro.length; i++) {
			var c = mro[i];
			if(caller.name in c.prototype) {
				return c.prototype[caller.name].apply(this, arguments);
			}
		}
		throw new Error("Method " + caller.name + " has no parent");
	}
	
	Class.isinstance = function (obj) {
		return obj.constructor.__mro__.indexOf(this) >= 0;
	}
	
	return Class;
};

