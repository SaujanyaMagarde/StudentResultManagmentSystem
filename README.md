# Student Result Management System

A full-stack web application for managing student results, built with React, Node.js, Express, and MySQL.

## Features

### Student Portal
- View results by roll number and class
- Comprehensive result cards with subject-wise marks
- Overall performance statistics

### Teacher Portal
- Secure login system
- Add/Update student results
- Class and subject-specific access control

### Admin Portal
- Register new teachers
- Assign classes and subjects to teachers

## Tech Stack

### Frontend
- React with Vite
- TailwindCSS for styling
- Lucide React for icons

### Backend
- Node.js & Express
- MySQL database
- JWT for authentication
- Bcrypt for password hashing

## Project Structure

```
student-result-management/
├── backend/
│   ├── server.js              # Express server setup
│   ├── hash-password.js       # Password hashing utility
│   ├── package.json           # Backend dependencies
│   └── .env                   # Backend environment variables
├── Frontend/
│   ├── src/
│   │   ├── App.jsx            # Main React component
│   │   └── main.jsx           # React entry point
│   ├── package.json           # Frontend dependencies
│   └── index.html             # HTML template
└── database_schema.sql        # MySQL database schema
```

## Prerequisites

Before starting, ensure you have the following installed on your system:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MySQL** (v8.0 or higher) - [Download here](https://dev.mysql.com/downloads/mysql/)
- **MySQL Workbench** (for database management) - [Download here](https://dev.mysql.com/downloads/workbench/)
- **Git** (optional, for cloning) - [Download here](https://git-scm.com/)

## Complete Setup Instructions

### Step 1: Download/Clone the Project

**Option A: Using Git**
```bash
git clone https://github.com/yourusername/student-result-management.git
cd student-result-management
```

**Option B: Download ZIP**
- Download the project ZIP file
- Extract it to your desired location
- Open terminal/command prompt in the extracted folder

### Step 2: MySQL Database Setup

#### 2.1 Start MySQL Server

**Windows:**
- Open MySQL Workbench
- Click on your local MySQL connection
- Enter your root password

**macOS/Linux:**
```bash
# Start MySQL service
sudo systemctl start mysql
# OR
sudo service mysql start
```

#### 2.2 Create Database Using MySQL Workbench

**Method 1: Using Workbench GUI**
1. Open MySQL Workbench
2. Connect to your local MySQL instance
3. Click on "File" → "Open SQL Script"
4. Navigate to your project folder and select `database_schema.sql`
5. Click the lightning bolt icon (⚡) or press `Ctrl+Shift+Enter` to execute
6. Verify the database was created by expanding the "Schemas" panel

**Method 2: Using Command Line**
```bash
# Navigate to project directory
cd /path/to/student-result-management

# Login to MySQL
mysql -u root -p

# Enter your MySQL password when prompted
# Then run these commands:
```

```sql
-- In MySQL prompt
source database_schema.sql;

-- Verify database creation
SHOW DATABASES;

-- Use the database
USE student_result_mgmt;

-- Verify tables
SHOW TABLES;

-- Exit MySQL
exit;
```

**Example Output:**
```
mysql> source database_schema.sql;
Query OK, 1 row affected (0.02 sec)
Database changed
Query OK, 0 rows affected (0.15 sec)
...

mysql> SHOW TABLES;
+--------------------------------+
| Tables_in_student_result_mgmt  |
+--------------------------------+
| classes                        |
| results                        |
| students                       |
| subjects                       |
| teachers                       |
+--------------------------------+
5 rows in set (0.00 sec)
```

### Step 3: Backend Configuration

#### 3.1 Navigate to Backend Directory
```bash
cd backend
```

#### 3.2 Install Backend Dependencies
```bash
npm install
```

**Expected Output:**
```
added 245 packages, and audited 246 packages in 15s

42 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

#### 3.3 Create Environment File

Create a file named `.env` in the `backend` directory:

```bash
# Windows (Command Prompt)
type nul > .env

# Windows (PowerShell)
New-Item .env -ItemType File

# macOS/Linux
touch .env
```

#### 3.4 Configure Environment Variables

Open `backend/.env` in your text editor and add:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=student_result_mgmt

# Server Configuration
PORT=5000

# JWT Secret (generate a random string)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

**⚠️ Important:** Replace `your_mysql_password` with your actual MySQL root password

**Example:**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=MySecurePass123!
DB_NAME=student_result_mgmt
PORT=5000
JWT_SECRET=a8f5h2k9j3m7n4p1q6r8s2t5v9w3x7y1z4
```

### Step 4: Generate Admin/Teacher Password

#### 4.1 Create Hash Password Utility

Ensure `backend/hash-password.js` exists with this content:

```javascript
const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter password to hash: ', (password) => {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  console.log('\nHashed Password:');
  console.log(hash);
  console.log('\nUse this hash when inserting teacher records into the database.');
  rl.close();
});
```

#### 4.2 Generate Password Hash

```bash
# Make sure you're in the backend directory
node hash-password.js
```

**Example Interaction:**
```
Enter password to hash: admin123

Hashed Password:
$2a$10$rK8qL9mP3nF7sJ4xT6vY8.eH2dW5pQ1rA3sC7tE9uB4vF6wN8zM0k

Use this hash when inserting teacher records into the database.
```

**Save this hash! You'll need it in the next step.**

### Step 5: Create Admin/Teacher Account

#### 5.1 Insert Admin Account in MySQL

Open MySQL Workbench or terminal and connect to MySQL:

```bash
mysql -u root -p
```

```sql
USE student_result_mgmt;

-- Insert a sample teacher/admin account
INSERT INTO teachers (name, email, password, phone, address) 
VALUES (
  'Admin User',
  'admin@school.com',
  '$2a$10$rK8qL9mP3nF7sJ4xT6vY8.eH2dW5pQ1rA3sC7tE9uB4vF6wN8zM0k',
  '9876543210',
  '123 School Street'
);

-- Verify the insertion
SELECT teacher_id, name, email FROM teachers;
```

**Example Output:**
```
+------------+------------+-------------------+
| teacher_id | name       | email             |
+------------+------------+-------------------+
|          1 | Admin User | admin@school.com  |
+------------+------------+-------------------+
1 row in set (0.00 sec)
```

**Login Credentials to Remember:**
- Email: `admin@school.com`
- Password: `admin123` (or whatever you used to generate the hash)

### Step 6: Start the Backend Server

```bash
# Make sure you're in the backend directory
npm run dev
```

**Expected Output:**
```
> backend@1.0.0 dev
> nodemon server.js

[nodemon] 2.0.22
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,json
[nodemon] starting `node server.js`
Server is running on port 5000
MySQL Connected: localhost
```

**Keep this terminal window open!**

### Step 7: Frontend Setup

#### 7.1 Open New Terminal

Open a **new** terminal window/tab (keep the backend running in the first one)

#### 7.2 Navigate to Frontend Directory

```bash
# From project root
cd Frontend
```

#### 7.3 Install Frontend Dependencies

```bash
npm install
```

**Expected Output:**
```
added 328 packages, and audited 329 packages in 22s

89 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

#### 7.4 Start the Frontend Development Server

```bash
npm run dev
```

**Expected Output:**
```
> frontend@0.0.0 dev
> vite

  VITE v5.0.8  ready in 523 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Step 8: Access the Application

Open your web browser and navigate to:

**Frontend:** http://localhost:5173/

**Backend API:** http://localhost:5000/api/

## Testing the Setup

### Test 1: Student Portal
1. Go to http://localhost:5173/
2. Navigate to "View Results"
3. Try searching with any roll number (no results expected initially)

### Test 2: Teacher Login
1. Click on "Teacher Login"
2. Use credentials:
   - Email: `admin@school.com`
   - Password: `admin123`
3. You should be redirected to the teacher dashboard

### Test 3: Add Sample Data

In MySQL Workbench, add sample data:

```sql
USE student_result_mgmt;

-- Add a class
INSERT INTO classes (class_name, section) VALUES ('Class 10', 'A');

-- Add a subject
INSERT INTO subjects (subject_name, class_id) VALUES ('Mathematics', 1);

-- Add a student
INSERT INTO students (name, roll_no, class_id, dob, email, phone) 
VALUES ('John Doe', 'S001', 1, '2008-05-15', 'john@example.com', '9876543210');

-- Add a result
INSERT INTO results (student_id, subject_id, exam_type, marks, max_marks, exam_date, teacher_id)
VALUES (1, 1, 'Midterm', 85, 100, '2025-10-01', 1);
```

Now test the Student Portal with roll number `S001`.

## Common Issues and Solutions

### Issue 1: MySQL Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Solution:**
- Verify MySQL is running: `sudo systemctl status mysql` (Linux) or check Services (Windows)
- Check your `.env` credentials match your MySQL setup

### Issue 2: Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:**
- Change `PORT` in `backend/.env` to another port (e.g., 5001)
- Update frontend API calls to use the new port

### Issue 3: Module Not Found
```
Error: Cannot find module 'express'
```
**Solution:**
- Run `npm install` again in the respective directory
- Delete `node_modules` and `package-lock.json`, then run `npm install`

### Issue 4: Database Schema Not Found
```
ERROR 1146: Table 'student_result_mgmt.teachers' doesn't exist
```
**Solution:**
- Re-run the database schema: `source database_schema.sql;` in MySQL
- Verify you're using the correct database: `USE student_result_mgmt;`

## Project URLs

- **Frontend:** http://localhost:5173/
- **Backend API:** http://localhost:5000/api/
- **MySQL Workbench:** Connect to `localhost:3306`

## Stopping the Application

1. **Stop Frontend:** Press `Ctrl + C` in the frontend terminal
2. **Stop Backend:** Press `Ctrl + C` in the backend terminal
3. **Stop MySQL:** 
   ```bash
   sudo systemctl stop mysql  # Linux
   # OR close MySQL Workbench and stop service in Windows
   ```

## Next Steps

1. **Add more sample data** to test all features
2. **Customize the application** according to your needs
3. **Set up additional teachers** with different class/subject access
4. **Configure production environment** for deployment

## Security Recommendations

- Change the default `JWT_SECRET` to a strong, random string
- Never commit `.env` file to version control
- Use strong passwords for teacher accounts
- Enable MySQL security features in production
- Implement rate limiting for API endpoints

## Support

For issues or questions:
- Check the "Common Issues" section above
- Review MySQL and Node.js logs for error details
- Open an issue in the GitHub repository

---

**Note**: This setup is configured for development. For production deployment, additional security measures and optimizations are required.
