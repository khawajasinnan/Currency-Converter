const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  is_verified: { type: Boolean, default: false },
  verification_token: String,
  reset_token: String,
  reset_token_expiry: Date,
  created_at: { type: Date, default: Date.now },
  last_login: Date,
  role: { type: String, default: 'user' }
});

module.exports = mongoose.model('User', userSchema);