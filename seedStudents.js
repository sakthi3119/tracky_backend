require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('✅ Connected to MongoDB for seeding'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Generate student data
const generateStudents = () => {
  const students = [];
  const batch = '23AD';
  
  // Generate roll numbers from 23AD001 to 23AD030
  for (let i = 1; i <= 30; i++) {
    const rollNo = `${batch}${i.toString().padStart(3, '0')}`;
    students.push({
      rollNo,
      name: `Student ${i}`, // You can replace with actual names later
      isActive: true
    });
  }
  
  return students;
};

// Seed the database
const seedDatabase = async () => {
  try {
    // Clear existing data
    await Student.deleteMany({});
    console.log('🧹 Cleared existing student data');
    
    // Insert new data
    const students = generateStudents();
    await Student.insertMany(students);
    
    console.log(`✅ Successfully seeded ${students.length} students`);
    console.log('Sample student:', students[0]);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
