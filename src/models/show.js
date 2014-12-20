var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Show = new Schema({
	title: {
		type: String,
		required: true,
		unique: true
	},
	url: {
		type: String,
		required: true,
		unique: true
	},
	year: Number,
	network: String,
	first_aired: Number,
	overview: String,
	runtime: Number,
	imdb_id: String,
	tvdb_id: Number,
	ended: Boolean,
	images: Object,
	genres: Array,
	seasons: Array
});

module.exports = mongoose.model('Show', Show);