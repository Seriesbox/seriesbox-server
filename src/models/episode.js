var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Episode = new Schema({
	episodeName: {
		type: String,
		required: false
	},
	show: {
		type: Schema.ObjectId,
		required: true
	},
	file: {
		type: String,
		required: true
	},
	season: {
		type: Number,
		required: true
	},
	episode: {
		type: Number,
		required: true
	},
	year: {
		type: Number
	},
	resolution: {
		type: String
	},
	quality: {
		type: String
	},
	codec: {
		type: String
	}
});

module.exports = mongoose.model('Episode', Episode);