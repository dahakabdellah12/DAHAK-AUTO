import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

const db = new Database(path.join(dataDir, 'dahak_auto.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize Database Schema
const initDb = () => {
  // Users (Admin)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'admin'
    );
  `);

  // Categories
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      image_url TEXT
    );
  `);

  // Products
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      condition TEXT CHECK(condition IN ('New', 'Used')) NOT NULL,
      stock_status TEXT CHECK(stock_status IN ('In Stock', 'Out of Stock', 'On Order')) DEFAULT 'In Stock',
      category_id INTEGER,
      brand TEXT,
      compatible_models TEXT,
      images_json TEXT, -- JSON array of image URLs
      is_featured BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );
  `);

  // Reservations
  db.exec(`
    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      city TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      message TEXT,
      status TEXT DEFAULT 'pending', -- pending, confirmed, cancelled
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `);

  // Messages (Contact Form)
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT NOT NULL,
      message TEXT NOT NULL,
      read BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Settings (Contact Info & Social Links)
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  // Add quantity column to products if it doesn't exist
  try {
    db.exec('ALTER TABLE products ADD COLUMN quantity INTEGER DEFAULT 1');
  } catch (err: any) {
    // Column likely already exists
  }

  // Seed Admin User if not exists (password: admin123)
  // In a real app, we would hash this properly. For this demo, I'll insert a pre-hashed one or handle it in auth.
  // Let's just check if user exists.
  const admin = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
  if (!admin) {
    // Hash for 'admin123' using bcrypt (simulated here or done in server startup if bcrypt is available)
    // For simplicity in this init script, we will rely on the auth route to handle login verification
    // But we need to insert a record. I'll use a placeholder and update it in server.ts if needed, 
    // or just assume the server.ts will handle seeding with bcrypt.
    // Actually, let's just leave it empty and let server.ts seed it properly with bcrypt.
  }
};

initDb();

export default db;
