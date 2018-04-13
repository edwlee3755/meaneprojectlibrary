var mongoose = require('mongoose');
var postSchema = mongoose.Schema;
var validate = require('mongoose-validator');

var PostSchema = new postSchema({
  title: { type: String, required: true},
  postDescription: { type: String},
  date: { type: Date},
  postAuthor: {type: String, required: true},
  postImg: { data: Buffer, contentType: String},
  upvotes: { type: Number, default: 0},
  downvotes: { type: Number, default: 0}
});


module.exports = mongoose.model('Post', PostSchema);
