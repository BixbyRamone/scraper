

var mongoose = require("mongoose");
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;


var ArticleSchema = new Schema({

	title: {
		type: String,
		required: true,
		unique: true
	},

	link: {
		type: String
	},

	note :[{
		type: Schema.Types.ObjectId,
		ref: "Note"// ask about this reference. Is it Note file?
	}]
});


var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;

//No index file for mongoose?