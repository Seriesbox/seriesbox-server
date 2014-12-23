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
		if(err){
			return callback(err);
		}
		Object.keys(shows).forEach(function(show){
			if(show){
				Show.findOne(show, function(err, result){
						if(!err && (!result || !result.length)){
							console.log(show.replace(/\s/g, '-'))
							trakt.showSummary({
								'title': encodeURI(show.replace(/\s/g, '-')),
								'extended': false
							}, function(err, data){
								if(err){
									console.log(err)
									return callback(err);
								}
								if(data && typeof data == 'object' && data.url && data.title){
									data.url = data.url.replace('http://trakt.tv/show/', '');
									var show = new Show(data);
									show.save(function(err, result){
										console.log(err, result);
										self.addEpisodes(show, shows[show]);
										callback(err, show);
									});
								}
							});
						}
				});
			}else{
				callback(new Error('TV show not found'));
			}
		});
	});
};
module.exports = ShowImporter;