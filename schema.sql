-- quizitnow database schema
-- Run in Hostinger MySQL / phpMyAdmin

CREATE DATABASE IF NOT EXISTS quizitnow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE quizitnow;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  plan ENUM('free','basic','pro') DEFAULT 'free',
  plan_expires_at DATETIME NULL,
  trial_start_date DATETIME NULL,
  language ENUM('english','hindi','odia') DEFAULT 'english',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS books (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  board ENUM('odia_board','cbse','icse') NOT NULL,
  class_level VARCHAR(10) NOT NULL COMMENT 'lkg, ukg, 1, 2, ... 12',
  title VARCHAR(500),
  original_filename VARCHAR(500),
  file_type ENUM('pdf','images') NOT NULL,
  extracted_text LONGTEXT,
  processing_status ENUM('pending','processing','completed','failed') DEFAULT 'pending',
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS study_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  book_id INT NOT NULL,
  user_id INT NOT NULL,
  total_days INT DEFAULT 200,
  start_date DATE NOT NULL,
  syllabus_topics JSON,
  plan_data JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS daily_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  book_id INT NOT NULL,
  user_id INT NOT NULL,
  day_number INT NOT NULL,
  session_date DATE NOT NULL,
  topic VARCHAR(500),
  lecture_content LONGTEXT,
  lecture_at DATETIME,
  quiz_questions JSON,
  quiz_answers JSON,
  quiz_score INT,
  completed BOOLEAN DEFAULT FALSE,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_session (book_id, user_id, day_number),
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS doubt_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  book_id INT NOT NULL,
  user_id INT NOT NULL,
  week_number INT NOT NULL,
  messages JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_doubt (book_id, user_id, week_number),
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  razorpay_signature VARCHAR(500),
  plan ENUM('basic','pro'),
  amount INT COMMENT 'in paise',
  status ENUM('pending','success','failed') DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS badges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  badge_type VARCHAR(100) NOT NULL,
  earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
