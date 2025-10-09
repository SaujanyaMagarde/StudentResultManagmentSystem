// hash-password.js
// Use this script to generate hashed passwords for teachers

const bcrypt = require('bcrypt');

async function hashPassword(password) {
  try {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('\n========================================');
    console.log('Password:', password);
    console.log('Hashed Password:', hash);
    console.log('========================================\n');
    console.log('Copy the hashed password above and use it in your SQL INSERT statement');
    console.log('Example:');
    console.log(`INSERT INTO teachers (name, email, password, class_id, subject_id) VALUES ('Teacher Name', 'teacher@school.com', '${hash}', 1, 1);`);
    console.log('\n');
  } catch (error) {
    console.error('Error hashing password:', error);
  }
}

// Get password from command line argument or use default
const password = process.argv[2] || 'teacher123';

console.log('Hashing password...');
hashPassword(password);