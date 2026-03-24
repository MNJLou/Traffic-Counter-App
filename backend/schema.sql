/**
 * SQL Schema for Cloudflare D1 Database
 * 
 * Run this SQL to initialize your database:
 */

-- Traffic sessions tracking table
CREATE TABLE traffic_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  session TEXT NOT NULL,
  location TEXT NOT NULL,
  customer_in INTEGER DEFAULT 0,
  customer_out INTEGER DEFAULT 0,
  out_with_bags INTEGER DEFAULT 0,
  notes TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX idx_traffic_sessions_name ON traffic_sessions(name);
CREATE INDEX idx_traffic_sessions_location ON traffic_sessions(location);
CREATE INDEX idx_traffic_sessions_session ON traffic_sessions(session);
CREATE INDEX idx_traffic_sessions_timestamp ON traffic_sessions(timestamp);
