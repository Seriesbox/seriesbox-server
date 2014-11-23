var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');

var Account = new Schema({
	email: {
		type: String,
		required: true,
		lowercase: true,
		unique: true
	}
});

Account.plugin(passportLocalMongoose);

module.exports = mongoose.model('Account', Account);