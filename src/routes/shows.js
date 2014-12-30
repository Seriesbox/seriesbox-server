var ShowImporter = require('../importers/ShowImporter.js');
var traktConfig = require('../../config/trakt');
module.exports = function home(app, models){
	app.get('/shows', function(req, res){
		var Show = models.Show;
		if(req.isAuthenticated()){
			Show.find(function(err, shows){
				console.log(shows)
				res.render('shows/index', {
					user: req.user,
					shows: shows
				});
			});
		}else{
			res.redirect('/auth/login');
		}
	});
	app.get('/show/:show', function(req, res){
		var Show = models.Show;
		if(req.isAuthenticated()){
			Show.findOne({url: req.params.show}, function(err, show){
				res.render('shows/single', {
					user: req.user,
					show: show
				});
			});
		}else{
			res.redirect('/auth/login');
		}
	});
	app.get('/import', function(req, res){
		var dir = '\/\\192.168.0.11\/media\/TV',
			importer = new ShowImporter(traktConfig.apiKey, models);
		importer.importAll(dir, console.log);
		res.end();
	});
};