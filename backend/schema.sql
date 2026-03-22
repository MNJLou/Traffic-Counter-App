/**
 * SQL Schema for Cloudflare D1 Database
 * 
 * Run this SQL to initialize your database:
 */

-- Users table  
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'staff',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Traffic tracking table
CREATE TABLE traffic (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  location TEXT NOT NULL,
  date TEXT NOT NULL,
  in_count INTEGER DEFAULT 0,
  out_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(location, date)
);

-- Audit log (for analytics)
CREATE TABLE audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  location TEXT,
  action TEXT,
  old_value TEXT,
  new_value TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes for faster queries
CREATE INDEX idx_traffic_location ON traffic(location);
CREATE INDEX idx_traffic_date ON traffic(date);
CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_location ON audit_log(location);
