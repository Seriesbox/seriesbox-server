var _ = require('lodash'),
	trakt = require('node-trakt');
var ShowParser = require('../parsers/tv/Parser.js');
var ShowImporter = function(apiKey, models){
	var self = this;
	self.models = models;
	trakt.init(apiKey);
};
ShowImporter.prototype.addEpisodes = function(show, episodes, callback){}; 
ShowImporter.prototype.importAll = function(dir, callback){
	var self = this;
	var Show = self.models.Show;
	ShowParser.FolderParser(dir, function(err, shows){
		Object.keys(shows).forEach(function(show){
			if(show){
				Show.findOne(show, function(err, result){
					if(!result){
						var query = encodeURIComponent(show);
						if(shows[show].year){
							query += year;
						}
						trakt.searchShows({
							'query': query,
							'limit': 1,
							'seasons': true
						}, function(err, data){
							if(err){
								return callback(err);
							}
							if(data) console.log(data);
							return;
							var show = new Show(data[0]);
							show.save(function(err, result){
								console.log(err, result);
								callback(err, show);
							});
						});
					}
				})
			}else{
				callback(new Error('TV show not found'));
			}
		});
	});
};
module.exports = ShowImporter;