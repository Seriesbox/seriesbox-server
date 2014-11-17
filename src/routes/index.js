var async = require('async'),
fs = require('fs');
module.exports = function loadRoutes(app, models, _callback){
	var routes = fs.readdirSync(__dirname);
	async.forEach(routes, function(route, next){
		if(route.indexOf('.js') == route.length - 3 && route !== 'index.js'){
			require('./' + route)(app, models);
		}
		next();
	}, function(err, results){
		console.log('All routes loaded!');
		_callback();
	});
};