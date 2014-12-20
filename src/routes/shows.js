var ShowImporter = require('../importers/ShowImporter.js');
var traktConfig = require('../../config/trakt');
module.exports = function home(app, models){
	app.get('/shows', function(req, res){
		var Show = models.Show;
		if(req.isAuthenticated()){
			Show.find(function(err, shows){
				res.render('shows/index', {
					user: req.user,
					shows: shows
				});
			});
		}else{
			res.redirect('/auth/login');
		}
	});
	app.get('/import', function(req, res){
		var dir = '\/\\192.168.0.11\/htpc\/TV',
			importer = new ShowImporter(traktConfig.apiKey, models);
		importer.importAll(dir, console.log);
		res.end();
	});
};