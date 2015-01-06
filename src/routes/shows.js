var _ = require('lodash');
var ShowImporter = require('../importers/ShowImporter.js');
var traktConfig = require('../../config/trakt');
module.exports = function home(app, models){
	app.get('/shows', function(req, res){
		var Show = models.Show;
		if(req.isAuthenticated()){
			Show.find(function(err, shows){
				console.log(shows)
				res.render('shows/index', {
					shows: shows
				});
			});
		}else{
			res.redirect('/auth/login');
		}
	});
	app.get('/show/:show', function(req, res){
		var Show = models.Show,
			Episode = models.Episode;
		if(req.isAuthenticated()){
			Show.findOne({url: req.params.show}, function(err, show){
				if(!show || show.length == 0){
					return res.render('error.html', {
						message: 'Show not found'
					});
				}
				//console.log(show)
				if(show && show.seasons){
					show.seasons = show.seasons.sort(function(a, b){
							if(a.season > b.season){
								return 1;
							}else if(a.season < b.season){
								return -1;
							}
							return 0;
					});
				}
				Episode.find({'show': show._id}, function(err, episodes){
					if(err){
						console.log(err);
					}
					//console.log('lol', episodes)
					var seasons = {};
					_.each(episodes, function (el){ 
						var s = el.season,
							e = el.episode;
						if(!seasons[s]){
							seasons[s] = {};
							seasons[s].num = s;
						}
						var season = seasons[s];
						if(!season.episodes){
							season.episodes = [];
						}
						if(show && show.seasons){
							if(show.seasons && show.seasons[s] && show.seasons[s].episodes){
								el = _.merge(el, show.seasons[s].episodes[e-1])
								//console.log(show.seasons[s].episodes[e])
							}
						}
						season.episodes.push(el)
					});
					seasons = _.each(seasons, function(season){
						if(season){
							season.episodes = season.episodes.sort(function(a, b){							
								if(a.episode > b.episode){
									return 1;
								}else if(a.episode < b.episode){
									return -1;
								}
								return 0;
							});
						}
					});
					res.render('shows/single', {
						show: show,
						seasons: seasons
					});
				})
			});
		}else{
			res.redirect('/auth/login');
		}
	});
	app.get('/import', function(req, res){
		var dir = '\/\\192.168.0.11\/media\/TV',
			importer = new ShowImporter(traktConfig.apiKey, models);
		importer.importAll(dir, function(){});
		res.end();
	});
};