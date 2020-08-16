const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  ticker: { type: String, required: true },
  ip: { type: String, required: true }
});

module.exports = mongoose.model('Like', likeSchema);