var fs = require('graceful-fs'),
	findit = require('findit'),
	path = require('path'),
	_ = require('lodash');
	ptn = require('parse-torrent-name'),
	replaceExt = require('replace-ext'),
	junk = require('junk');

var SUPPORTED_FILETYPES = new RegExp("(avi|mkv|mpeg|mov|mp4|m4v|wmv)$","g");  //Pipe seperated

var getFiles = function(dir, callback){
	var results = [];
	var finder = findit(dir, {
		fs: fs
	});

	finder.on('file', function(file, stat){
		if(file){
			file = path.basename(file);
			var ext = file.split(".");
			ext = ext[ext.length - 1];
			if(ext.match(SUPPORTED_FILETYPES)){
				results.push(file);
			}
		}
	});

	finder.on('error', function(err){

	});

    finder.on('end', function(err){
		callback(err, results);
    });
};
var FileParser = function(file){
	var name = replaceExt(file, '');
	// MAJOR HACK: parse-torrent-name wrongly parsing releases wrapped in []
	name = name.replace(/(\[)(.){1,20}(\]).(-||_)/, '');
	parsed = ptn(name);
	return parsed;
};
var FolderParser = function(dir, callback){
	getFiles(dir, function(err, files){
		if(err){
			return callback(err);
		}
		var list;
		files = files.filter(junk.not);
		list = _.each(files, function(file, index, list){
			if(file){			
				var parsedFile = FileParser(path.basename(file));
				parsedFile.file = path.basename(file);
				if(file !== parsedFile && typeof parsedFile == 'object' && parsedFile.title){
					list[index] = parsedFile;
				}else{
					list[index] = null;
				}
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
				// HACK: The Office
				if(item.title == 'The Office' && item.season > 3){
					item.title = 'The Office US';
				}
				// HACK: House of Cards
				if(item.title == 'House of Cards' && (item.year >= 2013 || item.season >= 2)){
					item.title = 'House of Cards US';
				}
				if(item.title == 'hoc' && item.season >= 2){
					item.title = 'House of Cards US';
				}
				// HACK: HIMYM is How I Met Your Mother
				if(item.title == 'HIMYM'){
					item.title = 'How I Met Your Mother';
				}
				// Lowercase show title to avoid duplicates in array
				item.title = item.title.toLowerCase();
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
//FolderParser('\/\\192.168.0.11\/media\/TV', console.log);