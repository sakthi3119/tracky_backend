const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  rollNo: { type: String, required: true },
  date: { type: String, required: true }, // <-- STRING
  status: { type: Boolean, required: true } // true = present, false = absent
});

module.exports = mongoose.model('Attendance', AttendanceSchema);
