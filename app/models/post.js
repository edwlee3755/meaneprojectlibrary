var mongoose = require('mongoose');
var postSchema = mongoose.Schema;
var validate = require('mongoose-validator');

var PostSchema = new postSchema({
  title: { type: String, required: true},
  postDescription: { type: String},
  date: { type: String},
  postAuthor: {type: String, required: true},
  //postImg: { data: Buffer, contentType: String},
  postImg: { data: String, contentType: String},
  postImgUrl: { type: String},
  upvotes: { type: Number, default: 0},
  downvotes: { type: Number, default: 0},
  postComments: [String]
});


module.exports = mongoose.model('Post', PostSchema);
