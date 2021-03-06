var _ = require('lodash'),
	async = require('async'),
	trakt = require('node-trakt');
var ShowParser = require('../parsers/tv/Parser.js');
var ShowImporter = function(apiKey, models){
	var self = this;
	self.models = models;
	trakt.init(apiKey);
};

ShowImporter.prototype.addEpisodes = function(show, episodes, callback){
	var self = this;
	var Episode = self.models.Episode;
	if(show){
		console.log(episodes);
		if(Array.isArray(episodes)){
			episodes.forEach(function(ep){
				Episode.findOne({
					show: show._id,
					seasons: ep.season,
					episode: ep.episode
				}, function(err, e){
					if(!ep){
						var ep = this.ep;
					}
					console.log(self)
					if(!e || !e.length){
						if(ep.title && ep.season && ep.episode){
							ep.show = show._id;
							var ep = new Episode(ep);
							ep.save(function(err, result){
								console.log(err, result);
							});
						}
					}
				}.bind({ep: ep}));
			});
		}
};
ShowImporter.prototype.addEpisodeFile = function(show, ep, callback){
	var self = this;
	var Episode = self.models.Episode;
	if(show){
			if(ep.title && ep.season && ep.episode){
				Episode.update({
					show: show._id,
					episode: ep.episode,
					season: ep.season
				}, {file: ep.file}, function(err, result){
					console.log(err, result)
				});
			}
		}
	}
}; 
ShowImporter.prototype.importAll = function(dir, callback){
	var self = this;
	var Show = self.models.Show;
	ShowParser.FolderParser(dir, function(err, shows){
		if(err){
			return callback(err);
		}
		Object.keys(shows).forEach(function(show){
			if(show){
				var origShow = show;
				setTimeout(function(){
					trakt.showSummary({
						'title': encodeURI(show.replace(/\s/g, '-')),
						'extended': false
					}, function(err, data){
						if(err){
							return console.log(err);
						}
						if(data && typeof data == 'object' && data.url && data.title){
							data.url = data.url.replace('http://trakt.tv/shows/', '');
							data.url = data.url.replace('http://api.trakt.tv/shows/', '');
							data.url = data.url.replace('/shows/', '');
							Show.findOne({title: data.title}, function(err, result){
								if(!err || (result && !result.length)){
									var show = new Show(data);
								}else{
									show = result;
								}
								if(show){
									show.save(function(err, result){
										// If this is not an duplicate show error
										if(err && err.code !== '11000'){
											//return console.log(err);
										}
										async.waterfall([
											function(next){	
												var i = 0,
													seasons;
												shows[origShow].forEach(function(episode){
													if(data.seasons){
														seasons = data.seasons.sort(function(a, b){
																if(a.season > b.season){
																	return 1;
																}else if(a.season < b.season){
																	return -1;
																}
																return 0;
														});
														seasons = _.each(data.seasons, function(season){
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
														data.seasons = seasons;
													}
													if(data.seasons
															&& episode
															&& episode.season
															&& episode.episode
															&& data.seasons[episode.season]
															&& data.seasons[episode.season].episodes
															&& data.seasons[episode.season].episodes[episode.episode - 1]){
															data.seasons[episode.season].episodes[episode.episode - 1].file = episode.file;
													}
													if(i == shows[origShow].length - 1){
														next();
													}
													i++;
												});
											},
											function(){	
												if(data.seasons){
													data.seasons.forEach(function(season){
														if(season && season.episodes){
															self.addEpisodes(show, season.episodes);
														}
													});
												}
											}
											]);
											//console.log(err, result);
											callback(err, show);
										});
								}else{
									callback(err);
								}
							});
						}
					});
				}, 1000);
			}else{
				callback(new Error('TV show not found'));
			}
		});
	});
};
module.exports = ShowImporter;