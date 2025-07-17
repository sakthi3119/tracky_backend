const Student = require('../models/Student');
const Attendance = require('../models/Attendance');

// 🔥 MARK ATTENDANCE
const markAttendance = async (req, res) => {
  try {
    const { detectedRollNumbers } = req.body;

    if (!Array.isArray(detectedRollNumbers))
      return res.status(400).json({ error: 'Invalid detectedRollNumbers' });

    // Normalize all detected roll numbers to uppercase and trimmed
    const normalizedDetected = detectedRollNumbers.map(r => r.trim().toUpperCase());

    // Fetch all student roll numbers
    const students = await Student.find({}, 'rollNo');
    const masterRollNumbers = students.map(s => s.rollNo.trim().toUpperCase());

    const present = masterRollNumbers.filter(roll => normalizedDetected.includes(roll));
    const absent = masterRollNumbers.filter(roll => !normalizedDetected.includes(roll));

    const date = new Date().toLocaleDateString('en-GB'); // dd/mm/yyyy

    // Remove existing entries for the day
    await Attendance.deleteMany({ date });

    // Create logs
    const presentLogs = present.map(rollNo => ({ date, rollNo, status: true }));
    const absentLogs = absent.map(rollNo => ({ date, rollNo, status: false }));

    await Attendance.insertMany([...presentLogs, ...absentLogs]);

    return res.json({ present, absent });
  } catch (err) {
    console.error('[Mark Attendance Error]', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// 🔥 ATTENDANCE BY DATE
const getAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.body;
    if (!date) return res.status(400).json({ error: 'Date is required' });

    const records = await Attendance.find({ date });
    const result = {};

    records.forEach(record => {
      result[record.rollNo] = record.status;
    });

    return res.json(result);
  } catch (err) {
    console.error('[Get Attendance Error]', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
};

module.exports = { markAttendance, getAttendanceByDate };
