const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const Student = require('./models/Student');
const User = require('./models/User');
const Attendance = require('./models/Attendance');
const Marks = require('./models/Marks');
const AuditLog = require('./models/AuditLog');

// Load environment variables
dotenv.config();

const studentsData = [
  { name: 'Aarav Sharma', email: 'aarav.sharma@edu.com', course: 'Computer Science', phone: 9876543210 },
  { name: 'Aditi Rao', email: 'aditi.rao@edu.com', course: 'Information Technology', phone: 9876543211 },
  { name: 'Arjun Verma', email: 'arjun.verma@edu.com', course: 'Data Science', phone: 9876543212 },
  { name: 'Diya Patel', email: 'diya.patel@edu.com', course: 'Business Administration', phone: 9876543213 },
  { name: 'Ishaan Gupta', email: 'ishaan.gupta@edu.com', course: 'Mechanical Engineering', phone: 9876543214 },
  { name: 'Kavya Nair', email: 'kavya.nair@edu.com', course: 'Computer Science', phone: 9876543215 },
  { name: 'Kabir Singh', email: 'kabir.singh@edu.com', course: 'Information Technology', phone: 9876543216 },
  { name: 'Meera Iyer', email: 'meera.iyer@edu.com', course: 'Data Science', phone: 9876543217 },
  { name: 'Nikhil Reddy', email: 'nikhil.reddy@edu.com', course: 'Civil Engineering', phone: 9876543218 },
  { name: 'Riya Sen', email: 'riya.sen@edu.com', course: 'Business Administration', phone: 9876543219 },
  { name: 'Rohan Das', email: 'rohan.das@edu.com', course: 'Mechanical Engineering', phone: 9876543220 },
  { name: 'Sanya Malhotra', email: 'sanya.malhotra@edu.com', course: 'Computer Science', phone: 9876543221 },
  { name: 'Shaurya Roy', email: 'shaurya.roy@edu.com', course: 'Information Technology', phone: 9876543222 },
  { name: 'Tanya Kapoor', email: 'tanya.kapoor@edu.com', course: 'Data Science', phone: 9876543223 },
  { name: 'Uday Kiran', email: 'uday.kiran@edu.com', course: 'Civil Engineering', phone: 9876543224 },
  { name: 'Vivaan Joshi', email: 'vivaan.joshi@edu.com', course: 'Business Administration', phone: 9876543225 },
  { name: 'Zara Khan', email: 'zara.khan@edu.com', course: 'Computer Science', phone: 9876543226 },
  { name: 'Devendra Kumar', email: 'devendra.kumar@edu.com', course: 'Electrical Engineering', phone: 9876543227 },
  { name: 'Harish Raghav', email: 'harish.raghav@edu.com', course: 'Mechanical Engineering', phone: 9876543228 },
  { name: 'Jaspreet Singh', email: 'jaspreet.singh@edu.com', course: 'Information Technology', phone: 9876543229 },
  { name: 'Karan Johar', email: 'karan.johar@edu.com', course: 'Data Science', phone: 9876543230 },
  { name: 'Lavanya Sundar', email: 'lavanya.sundar@edu.com', course: 'Business Administration', phone: 9876543231 },
  { name: 'Manoj Bajpayee', email: 'manoj.bajpayee@edu.com', course: 'Civil Engineering', phone: 9876543232 },
  { name: 'Nisha Pillai', email: 'nisha.pillai@edu.com', course: 'Computer Science', phone: 9876543233 },
  { name: 'Pranav Anand', email: 'pranav.anand@edu.com', course: 'Electrical Engineering', phone: 9876543234 },
  { name: 'Rahul Dravid', email: 'rahul.dravid@edu.com', course: 'Mechanical Engineering', phone: 9876543235 },
  { name: 'Sneha Paul', email: 'sneha.paul@edu.com', course: 'Information Technology', phone: 9876543236 },
  { name: 'Tarun Tej', email: 'tarun.tej@edu.com', course: 'Data Science', phone: 9876543237 },
  { name: 'Vikram Seth', email: 'vikram.seth@edu.com', course: 'Business Administration', phone: 9876543238 },
  { name: 'Yuvraj Singh', email: 'yuvraj.singh@edu.com', course: 'Computer Science', phone: 9876543239 }
];

const calculateGradeDetails = (totalMarks) => {
  if (totalMarks >= 90) return { grade: 'O', gradePoints: 10 };
  if (totalMarks >= 80) return { grade: 'A+', gradePoints: 9 };
  if (totalMarks >= 70) return { grade: 'A', gradePoints: 8 };
  if (totalMarks >= 60) return { grade: 'B+', gradePoints: 7 };
  if (totalMarks >= 50) return { grade: 'B', gradePoints: 6 };
  if (totalMarks >= 40) return { grade: 'C', gradePoints: 5 };
  return { grade: 'F', gradePoints: 0 };
};

const seedDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing from backend env configuration!');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding...');

    // 1. Clear existing database collections
    await Student.deleteMany({});
    await User.deleteMany({});
    await Attendance.deleteMany({});
    await Marks.deleteMany({});
    await AuditLog.deleteMany({});
    console.log('Cleared all existing collections: Students, Users, Attendance, Marks, AuditLogs.');

    // 2. Create standard system roles accounts
    console.log('Creating standard system users...');
    const adminUser = await User.create({
      username: 'Admin User',
      email: 'admin@eduportal.com',
      password: 'password123',
      role: 'admin'
    });

    const staffUser = await User.create({
      username: 'Staff User',
      email: 'staff@eduportal.com',
      password: 'password123',
      role: 'staff'
    });

    // Create accounts associated with the first few students for role-access testing
    const studentUser1 = await User.create({
      username: 'Aarav Sharma',
      email: 'aarav.sharma@edu.com',
      password: 'password123',
      role: 'student'
    });

    const studentUser2 = await User.create({
      username: 'Aditi Rao',
      email: 'aditi.rao@edu.com',
      password: 'password123',
      role: 'student'
    });

    console.log('Standard users created:');
    console.log('- Admin: admin@eduportal.com (password: password123)');
    console.log('- Staff: staff@eduportal.com (password: password123)');
    console.log('- Student 1: aarav.sharma@edu.com (password: password123)');
    console.log('- Student 2: aditi.rao@edu.com (password: password123)');

    // 3. Seed Students
    console.log('Seeding 30 dummy student records...');
    const seededStudents = await Student.insertMany(studentsData);
    console.log(`Successfully seeded ${seededStudents.length} student records.`);

    // Map email/name to student ObjectId for quick references
    const studentMap = {};
    seededStudents.forEach(s => {
      studentMap[s.email] = s._id;
    });

    // 4. Seed Attendance Logs
    console.log('Seeding attendance registry records for the past 4 days...');
    const attendanceRecords = [];
    const dateOffsets = [0, 1, 2, 3]; // past 4 days
    
    for (const offset of dateOffsets) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - offset);
      targetDate.setUTCHours(0, 0, 0, 0); // normalize date

      seededStudents.forEach((student, index) => {
        // Randomly mark present (85% probability) or absent (15% probability)
        const isPresent = Math.random() > 0.15;
        attendanceRecords.push({
          student: student._id,
          date: targetDate,
          status: isPresent ? 'Present' : 'Absent',
          recordedBy: staffUser._id
        });
      });
    }

    await Attendance.insertMany(attendanceRecords);
    console.log(`Successfully seeded ${attendanceRecords.length} attendance registry logs.`);

    // 5. Seed Student Subject Marks/Results
    console.log('Seeding subject marks for all students...');
    const marksData = [];
    
    // We will populate Marks sheets for all students in multiple subjects for Semester 1, and Semester 2 for first 10 students
    const targetStudentIndices = Array.from({ length: seededStudents.length }, (_, i) => i);
    const subjects = [
      { name: 'Mathematics', credits: 4 },
      { name: 'Applied Physics', credits: 3 },
      { name: 'Computer Architecture', credits: 4 },
      { name: 'Technical Writing', credits: 2 }
    ];

    targetStudentIndices.forEach(idx => {
      const student = seededStudents[idx];
      
      // Semester 1 marks
      subjects.forEach(subject => {
        const internalMarks = Math.floor(25 + Math.random() * 15); // 25 to 40
        const semesterMarks = Math.floor(35 + Math.random() * 25); // 35 to 60
        const totalMarks = internalMarks + semesterMarks;
        const { grade, gradePoints } = calculateGradeDetails(totalMarks);

        marksData.push({
          student: student._id,
          semester: 1,
          subject: subject.name,
          internalMarks,
          semesterMarks,
          totalMarks,
          grade,
          gradePoints,
          credits: subject.credits,
          recordedBy: adminUser._id
        });
      });

      // Semester 2 marks for first 10 students
      if (idx < 10) {
        const sem2Subjects = [
          { name: 'Data Structures & Algorithms', credits: 4 },
          { name: 'Discrete Mathematics', credits: 4 },
          { name: 'Environmental Sciences', credits: 2 }
        ];

        sem2Subjects.forEach(subject => {
          const internalMarks = Math.floor(22 + Math.random() * 18);
          const semesterMarks = Math.floor(30 + Math.random() * 30);
          const totalMarks = internalMarks + semesterMarks;
          const { grade, gradePoints } = calculateGradeDetails(totalMarks);

          marksData.push({
            student: student._id,
            semester: 2,
            subject: subject.name,
            internalMarks,
            semesterMarks,
            totalMarks,
            grade,
            gradePoints,
            credits: subject.credits,
            recordedBy: staffUser._id
          });
        });
      }
    });


    await Marks.insertMany(marksData);
    console.log(`Successfully seeded ${marksData.length} subject marks cards.`);

    // 6. Seed Audit Logs
    console.log('Seeding system Audit Log trail logs...');
    const auditLogs = [
      {
        action: 'LOGIN',
        targetModel: 'User',
        targetId: adminUser._id,
        details: 'User session logged in: Admin User',
        performedBy: adminUser._id,
        timestamp: new Date(Date.now() - 3600000 * 2) // 2 hours ago
      },
      {
        action: 'LOGIN',
        targetModel: 'User',
        targetId: staffUser._id,
        details: 'User session logged in: Staff User',
        performedBy: staffUser._id,
        timestamp: new Date(Date.now() - 3600000) // 1 hour ago
      },
      {
        action: 'CREATE',
        targetModel: 'Student',
        details: 'Added 30 database registry enrollees records successfully via bulk seeding script.',
        performedBy: adminUser._id,
        timestamp: new Date(Date.now() - 1800000) // 30 mins ago
      },
      {
        action: 'CREATE',
        targetModel: 'Attendance',
        details: `Recorded daily attendance logs registry for ${seededStudents.length} students on date ${new Date().toLocaleDateString()}`,
        performedBy: staffUser._id,
        timestamp: new Date(Date.now() - 900000) // 15 mins ago
      },
      {
        action: 'CREATE',
        targetModel: 'Marks',
        details: 'Aggregated subject marks grades entries and weighted GPAs for student cohorts.',
        performedBy: adminUser._id,
        timestamp: new Date(Date.now() - 300000) // 5 mins ago
      }
    ];

    await AuditLog.insertMany(auditLogs);
    console.log(`Successfully seeded ${auditLogs.length} audit logs trail entries.`);

    console.log('\n======================================================');
    console.log('DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================\n');

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database collections:', error.message);
    process.exit(1);
  }
};

seedDB();
