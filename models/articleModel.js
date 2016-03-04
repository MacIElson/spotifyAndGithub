var mongoose = require('mongoose');

// Create a Schema
var articleSchema = mongoose.Schema({
  title: String,
  introText: String,
  content: [ {heading: String, 
  	text: String
  }]
});

module.exports = mongoose.model("Article", articleSchema);