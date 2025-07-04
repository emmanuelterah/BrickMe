const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isConfirmed: { type: Boolean, default: false },
  confirmationToken: { type: String },
  profile: {
    name: { type: String },
    avatar: { type: String },
    // Add more profile fields as needed
  },
  theme: { type: String, default: 'default' },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema); 