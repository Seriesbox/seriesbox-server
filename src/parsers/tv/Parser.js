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
	parsed = ptn(name);
	//console.log(info);
	return ptn(name);
};
var FolderParser = function(dir, callback){
	walk(dir, function(err, files){
		if(err){
			return callback(err);
		}
		var list;
		files = files.filter(junk.not);
		list = _.each(files, function(file, index, list){
			var parsedFile = FileParser(path.basename(file));
			parsedFile.file = path.basename(file);
			if(file !== parsedFile && typeof parsedFile == 'object' && parsedFile.title){
				list[index] = parsedFile;
			}else{
				list[index] = null;
			}
			return file;
		});
		//console.log(list)
		var shows = [];
		_.each(list,  function(item){
			if(item && item.title && item.season){
				// HACK: All DW episodes after 2005 are separated
				if(item.title == 'Doctor Who' && item.year == '2005'){
					item.title = 'Doctor Who 2005';
				}
				// START HACK: Hack around the various parse-torrent-name bugs
				// Trim whitespaces
				var tmp = item.title.trim();
				// Is there an - or _ at the end? Then there probably was a parsing error
				if(tmp[tmp.length - 1] == '-' 
					|| tmp[tmp.length - 1] == '_'){
					// Remove the offending - or _
					tmp = tmp.slice(0, tmp.length - 1);
				}
				// Use whitespace instead of - and _ to separate words
				tmp = tmp.replace(/_.*_/, ' ');
				tmp = tmp.replace(/-.*-/, ' ');
				// Trim once more
				tmp = tmp.trim();
				// Use tmp variable as show title from now on
				if(tmp){
					item.title = tmp;
				}
				// END HACK
				if(!shows[item.title]){
					shows[item.title] = [];
				}

				// Filter all undefined properties 
				// http://stackoverflow.com/questions/14058193/remove-empty-properties-falsy-values-from-object-with-underscore-js
				var ep = _.pick(item, _.identity);
				shows[item.title].push(ep);
			}
		});
		if(callback){
			callback(null, shows);
		}
		return shows;
	});
};
module.exports = {
	FolderParser: FolderParser
};
//console.log(FolderParser('\/\\192.168.0.11\/htpc\/TV'));