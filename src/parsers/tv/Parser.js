var fs = require('fs'),
	path = require('path'),
	_ = require('lodash');
	ptn = require('parse-torrent-name'),
	replaceExt = require('replace-ext'),
	junk = require('junk');

var SUPPORTED_FILETYPES = new RegExp("(avi|mkv|mpeg|mov|mp4|m4v|wmv)$","g");  //Pipe seperated

var walk = function(dir, done) {
	var results = [];
	fs.readdir(dir, function(err, list) {
		if (err)
			return done(err);
		var i = 0;
		(function next() {
			var file = list[i++];
			if (!file)
				return done(null, results);
			file = dir + '/' + file;
			fs.stat(file, function(err, stat) {
				if (stat && stat.isDirectory()) {
					walk(file, function(err, res) {
						results = results.concat(res);
						next();
					});
				} else {
					var ext = file.split(".");
					ext = ext[ext.length - 1];
					if (ext.match(SUPPORTED_FILETYPES)) {
						results.push(file);
					}
					next();
				}
			});
		})();
	});
};
var FileParser = function(file){
	var name = replaceExt(file, '');
	//console.log(info);
	return ptn(name);
};
var FolderParser = function(dir){
	walk(dir, function(err, files){
		if(err){
			throw err;
		}
		files = files.filter(junk.not);
		list = _.each(files, function(file){
			console.log(file)
			return FileParser(file);
		});
		console.log(list)
		var shows = [];
		_.each(list,  function(item){
			if(!shows[item.title]){
				shows[item.title] = [];
			}
			// Filter all undefined properties 
			// http://stackoverflow.com/questions/14058193/remove-empty-properties-falsy-values-from-object-with-underscore-js
			var ep = _.pick(item, _.identity);
			shows[item.title].push(ep);
		});
		return shows;
	});
};
module.exports = {
	FolderParser: FolderParser
};
console.log(FolderParser('\/\\192.168.0.11\/htpc\/TV'));