var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var validate = require('mongoose-validator');

var PostSchema = new Schema({
  title: { type: String, required: true},
  description: { type: String},
  date: { type: Date, default: Date.now},
  postUsername: {type: String, required: true},
  img: { data: Buffer, contentType: String},
  upvotes: { type: Number, default: 0},
  downvotes: { type: Number, default: 0}
});


module.exports = mongoose.model('Post', PostSchema);
