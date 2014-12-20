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
			// HACK: All DW episodes after 2005 are separated
			if(show == 'Doctor Who' && shows[show].year == '2005'){
				shows['Doctor Who (2005)'] = shows
			}
			if(show){
				Show.findOne(show, function(err, result){
						if(!result || !result.length){
							trakt.showSummary({
								'title': show.replace(/\s/g, '-'),
								'extended': false
							}, function(err, data){
								if(err){
									console.log(err)
									return callback(err);
								}
								if(data) console.log(data);
								if(data && data.length > 0 && typeof data !== 'string'){
									var show = new Show(data[0]);
									show.save(function(err, result){
										console.log(err, result);
										callback(err, show);
									});
								}
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