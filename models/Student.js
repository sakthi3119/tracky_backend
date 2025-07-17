const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  rollNo: { 
    type: String, 
    required: true, 
    unique: true,
    index: true,
    match: [/^\d{2}AD\d{3}$/, 'Please enter a valid roll number (e.g., 23AD001)']
  },
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
});


module.exports = mongoose.model('Student', StudentSchema);
