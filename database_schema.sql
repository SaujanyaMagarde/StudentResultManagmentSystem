-- ===============================================
-- STUDENT RESULT MANAGEMENT SYSTEM (DEPARTMENT-WISE)
-- ===============================================

-- Create Database
CREATE DATABASE IF NOT EXISTS student_result_mgmt;
USE student_result_mgmt;

-- ==============================
-- 1️⃣ DEPARTMENTS
-- ==============================
CREATE TABLE departments (
    dept_id INT PRIMARY KEY AUTO_INCREMENT,
    dept_name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO departments (dept_name) VALUES
('Electronics'),
('Computer Science');

-- ==============================
-- 2️⃣ CLASSES
-- ==============================
CREATE TABLE classes (
    class_id INT PRIMARY KEY AUTO_INCREMENT,
    class_name VARCHAR(50) NOT NULL,
    dept_id INT NOT NULL,
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO classes (class_name, dept_id) VALUES
('ELEX-1', 1),
('ELEX-2', 1),
('CS-1', 2),
('CS-2', 2);

-- ==============================
-- 3️⃣ SUBJECTS
-- ==============================
CREATE TABLE subjects (
    subject_id INT PRIMARY KEY AUTO_INCREMENT,
    subject_name VARCHAR(100) NOT NULL,
    class_id INT NOT NULL,
    max_marks INT DEFAULT 100,
    FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Electronics Department Subjects
INSERT INTO subjects (subject_name, class_id) VALUES
('Basic Electronics', 1),
('Digital Circuits', 1),
('Analog Systems', 1),
('Microprocessors', 2),
('Control Systems', 2),

-- Computer Science Department Subjects
('Programming in C', 3),
('Data Structures', 3),
('Database Management', 3),
('Operating Systems', 4),
('Computer Networks', 4);


CREATE TABLE teachers (
    teacher_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    dept_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dept_id) REFERENCES departments(dept_id) ON DELETE CASCADE
);

INSERT INTO teachers (name, email, password, dept_id) VALUES
('Anita Verma', 'anita.verma@elex.edu', 'password123', 1),
('Rohit Mehta', 'rohit.mehta@elex.edu', 'password123', 1),
('Pooja Nair', 'pooja.nair@elex.edu', 'password123', 1),
('Deepak Rao', 'deepak.rao@cs.edu', 'password123', 2),
('Sneha Iyer', 'sneha.iyer@cs.edu', 'password123', 2),
('Arjun Deshmukh', 'arjun.deshmukh@cs.edu', 'password123', 2);

CREATE TABLE teacher_subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    teacher_id INT NOT NULL,
    subject_id INT NOT NULL,
    FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE,
    UNIQUE KEY unique_teacher_subject (teacher_id, subject_id)
);

INSERT INTO teacher_subjects (teacher_id, subject_id) VALUES

(1, 1), (1, 2),
(2, 3), (2, 4),
(3, 5),


(4, 6), (4, 7),
(5, 8),
(6, 9), (6, 10);


CREATE TABLE students (
    student_id INT PRIMARY KEY AUTO_INCREMENT,
    roll_no VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    class_id INT NOT NULL,
    FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_roll_class (roll_no, class_id)
);


INSERT INTO students (roll_no, name, class_id) VALUES
('E001', 'Rahul Sharma', 1),
('E002', 'Priya Patel', 1),
('E003', 'Amit Kumar', 1),
('E004', 'Neha Reddy', 2),
('E005', 'Vivek Yadav', 2),

('C001', 'Sanya Mehta', 3),
('C002', 'Nikhil Verma', 3),
('C003', 'Kiran Das', 3),
('C004', 'Snehal Patil', 4),
('C005', 'Harsh Agarwal', 4);


CREATE TABLE results (
    result_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    marks_obtained INT NOT NULL,
    teacher_id INT NOT NULL,
    exam_date DATE NOT NULL,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON DELETE CASCADE
);

-- Results for Electronics Students
INSERT INTO results (student_id, subject_id, marks_obtained, teacher_id, exam_date, remarks) VALUES
(1, 1, 88, 1, '2025-03-10', 'Excellent'),
(1, 2, 76, 1, '2025-03-11', 'Good'),
(1, 3, 82, 2, '2025-03-12', 'Very good'),
(1, 4, 79, 2, '2025-03-13', 'Good'),
(1, 5, 85, 3, '2025-03-14', 'Strong understanding'),

(2, 1, 90, 1, '2025-03-10', 'Excellent'),
(2, 2, 88, 1, '2025-03-11', 'Very good'),
(2, 3, 80, 2, '2025-03-12', 'Good'),
(2, 4, 75, 2, '2025-03-13', 'Nice effort'),
(2, 5, 83, 3, '2025-03-14', 'Consistent'),

-- Results for Computer Science Students
(6, 6, 91, 4, '2025-03-15', 'Outstanding'),
(6, 7, 87, 4, '2025-03-16', 'Excellent'),
(6, 8, 90, 5, '2025-03-17', 'Perfect work'),
(6, 9, 85, 6, '2025-03-18', 'Good grasp'),
(6, 10, 88, 6, '2025-03-19', 'Very good'),

(7, 6, 77, 4, '2025-03-15', 'Satisfactory'),
(7, 7, 80, 4, '2025-03-16', 'Improved'),
(7, 8, 79, 5, '2025-03-17', 'Good'),
(7, 9, 70, 6, '2025-03-18', 'Needs practice'),
(7, 10, 74, 6, '2025-03-19', 'Average');

