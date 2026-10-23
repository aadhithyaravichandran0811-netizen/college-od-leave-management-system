const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _id: { type: String },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['STUDENT', 'FACULTY', 'HOD', 'ADMIN'], required: true },
  name: { type: String, required: true, trim: true },
  phone: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
