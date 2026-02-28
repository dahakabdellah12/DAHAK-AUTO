import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import db from './src/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';

const JWT_SECRET = process.env.JWT_SECRET || 'dahak-auto-secret-key-change-this';
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

// Configure Multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use('/uploads', express.static(UPLOADS_DIR));

  // --- SEED ADMIN USER ---
  const seedAdmin = async () => {
    const admin = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
    if (!admin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)').run('admin', hashedPassword, 'admin');
      console.log('Admin user created: admin / admin123');
    }
  };
  seedAdmin();

  // --- MIDDLEWARE ---
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // --- API ROUTES ---

  // Auth
  app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const user: any = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    
    if (!user) return res.status(400).json({ message: 'User not found' });

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) return res.status(400).json({ message: 'Invalid password' });

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  });

  // Upload
  app.post('/api/upload', authenticateToken, (req, res) => {
    upload.single('image')(req, res, (err) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({ message: err.message });
      }
      if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
      const imageUrl = `/uploads/${req.file.filename}`;
      res.json({ url: imageUrl });
    });
  });

  // Products
  app.get('/api/products', (req, res) => {
    const { category, brand, search, featured, sort, limit } = req.query;
    let query = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id';
    
    // If sorting by popularity, we need to join with reservations
    if (sort === 'popular') {
      query += ' LEFT JOIN reservations r ON p.id = r.product_id';
    }

    query += ' WHERE 1=1';
    const params = [];

    if (category) {
      query += ' AND c.slug = ?';
      params.push(category);
    }
    if (brand) {
      query += ' AND p.brand LIKE ?';
      params.push(`%${brand}%`);
    }
    if (search) {
      query += ' AND (p.name LIKE ? OR p.compatible_models LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (featured === 'true') {
      query += ' AND p.is_featured = 1';
    }

    // Group by if joined with reservations
    if (sort === 'popular') {
      query += ' GROUP BY p.id';
    }

    // Sorting
    if (sort === 'popular') {
      query += ' ORDER BY COUNT(r.id) DESC, p.created_at DESC';
    } else {
      query += ' ORDER BY p.created_at DESC';
    }

    // Limit
    if (limit) {
      query += ` LIMIT ${parseInt(limit as string)}`;
    }

    const products = db.prepare(query).all(...params);
    
    // Parse images JSON
    const parsedProducts = products.map((p: any) => ({
      ...p,
      images: JSON.parse(p.images_json || '[]')
    }));
    
    res.json(parsedProducts);
  });

  app.get('/api/products/:id', (req, res) => {
    const product: any = db.prepare('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?').get(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    product.images = JSON.parse(product.images_json || '[]');
    res.json(product);
  });

  app.post('/api/products', authenticateToken, (req, res) => {
    const { name, description, price, condition, stock_status, category_id, brand, compatible_models, images, is_featured, quantity } = req.body;
    const stmt = db.prepare(`
      INSERT INTO products (name, description, price, condition, stock_status, category_id, brand, compatible_models, images_json, is_featured, quantity)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(name, description, price, condition, stock_status, category_id, brand, compatible_models, JSON.stringify(images), is_featured ? 1 : 0, quantity || 1);
    res.json({ id: result.lastInsertRowid });
  });

  app.put('/api/products/:id', authenticateToken, (req, res) => {
    const { name, description, price, condition, stock_status, category_id, brand, compatible_models, images, is_featured, quantity } = req.body;
    const stmt = db.prepare(`
      UPDATE products SET name = ?, description = ?, price = ?, condition = ?, stock_status = ?, category_id = ?, brand = ?, compatible_models = ?, images_json = ?, is_featured = ?, quantity = ?
      WHERE id = ?
    `);
    stmt.run(name, description, price, condition, stock_status, category_id, brand, compatible_models, JSON.stringify(images), is_featured ? 1 : 0, quantity || 1, req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/products/:id', authenticateToken, (req, res) => {
    try {
      // First delete associated reservations to avoid foreign key constraint violation
      db.prepare('DELETE FROM reservations WHERE product_id = ?').run(req.params.id);
      db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting product:', error);
      res.status(500).json({ message: 'Error deleting product: ' + error.message });
    }
  });

  // Categories
  app.get('/api/categories', (req, res) => {
    const categories = db.prepare('SELECT * FROM categories').all();
    res.json(categories);
  });

  app.post('/api/categories', authenticateToken, (req, res) => {
    const { name, slug, image_url } = req.body;
    try {
      const result = db.prepare('INSERT INTO categories (name, slug, image_url) VALUES (?, ?, ?)').run(name, slug, image_url);
      res.json({ id: result.lastInsertRowid });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.delete('/api/categories/:id', authenticateToken, (req, res) => {
    try {
      // Set category_id to null for products in this category
      db.prepare('UPDATE products SET category_id = NULL WHERE category_id = ?').run(req.params.id);
      db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting category:', error);
      res.status(500).json({ message: 'Error deleting category: ' + error.message });
    }
  });

  // Reservations
  app.post('/api/reservations', (req, res) => {
    const { product_id, customer_name, phone, city, quantity, message } = req.body;
    const stmt = db.prepare(`
      INSERT INTO reservations (product_id, customer_name, phone, city, quantity, message)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(product_id, customer_name, phone, city, quantity, message);
    res.json({ id: result.lastInsertRowid, success: true });
  });

  app.get('/api/reservations', authenticateToken, (req, res) => {
    const reservations = db.prepare(`
      SELECT r.*, p.name as product_name 
      FROM reservations r 
      LEFT JOIN products p ON r.product_id = p.id 
      ORDER BY r.created_at DESC
    `).all();
    res.json(reservations);
  });

  app.put('/api/reservations/:id/status', authenticateToken, (req, res) => {
    const { status } = req.body;
    db.prepare('UPDATE reservations SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/reservations/:id', authenticateToken, (req, res) => {
    try {
      db.prepare('DELETE FROM reservations WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting reservation:', error);
      res.status(500).json({ message: 'Error deleting reservation: ' + error.message });
    }
  });

  // Messages
  app.post('/api/messages', (req, res) => {
    const { name, email, phone, message } = req.body;
    const stmt = db.prepare('INSERT INTO messages (name, email, phone, message) VALUES (?, ?, ?, ?)');
    stmt.run(name, email, phone, message);
    res.json({ success: true });
  });

  app.get('/api/messages', authenticateToken, (req, res) => {
    const messages = db.prepare('SELECT * FROM messages ORDER BY created_at DESC').all();
    res.json(messages);
  });

  app.delete('/api/messages/:id', authenticateToken, (req, res) => {
    try {
      db.prepare('DELETE FROM messages WHERE id = ?').run(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting message:', error);
      res.status(500).json({ message: 'Error deleting message: ' + error.message });
    }
  });

  // Settings
  app.get('/api/settings', (req, res) => {
    const settings = db.prepare('SELECT * FROM settings').all();
    const settingsObj: any = {};
    settings.forEach((s: any) => {
      settingsObj[s.key] = s.value;
    });
    res.json(settingsObj);
  });

  app.post('/api/settings', authenticateToken, (req, res) => {
    try {
      const { settings } = req.body;
      console.log('Received settings update:', settings);

      if (!settings || typeof settings !== 'object') {
        return res.status(400).json({ message: 'Invalid settings format' });
      }

      const insert = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
      const transaction = db.transaction((settingsToSave) => {
        for (const [key, value] of Object.entries(settingsToSave)) {
          // Ensure value is a string, handle null/undefined
          const stringValue = value === null || value === undefined ? '' : String(value);
          insert.run(key, stringValue);
        }
      });
      
      transaction(settings);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      res.status(500).json({ message: 'Error saving settings: ' + error.message });
    }
  });

  // Dashboard Stats
  app.get('/api/stats', authenticateToken, (req, res) => {
    const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get() as any;
    const reservationCount = db.prepare('SELECT COUNT(*) as count FROM reservations').get() as any;
    const messageCount = db.prepare('SELECT COUNT(*) as count FROM messages').get() as any;
    const recentReservations = db.prepare(`
      SELECT r.*, p.name as product_name 
      FROM reservations r 
      LEFT JOIN products p ON r.product_id = p.id 
      ORDER BY r.created_at DESC LIMIT 5
    `).all();

    res.json({
      products: productCount.count,
      reservations: reservationCount.count,
      messages: messageCount.count,
      recentReservations
    });
  });

  // Seed Initial Data if empty
  // REMOVED: User requested empty store.
  // Cleanup default categories if they exist (one-time cleanup for user request)
  try {
    const defaultSlugs = ['engine-parts', 'brake-system', 'suspension', 'electrical', 'body-parts', 'accessories'];
    const placeholders = defaultSlugs.map(() => '?').join(',');
    
    // 1. Get IDs of categories to delete
    const categoriesToDelete = db.prepare(`SELECT id FROM categories WHERE slug IN (${placeholders})`).all(...defaultSlugs) as {id: number}[];
    
    if (categoriesToDelete.length > 0) {
      const ids = categoriesToDelete.map(c => c.id);
      const idPlaceholders = ids.map(() => '?').join(',');

      // 2. Unlink products from these categories
      db.prepare(`UPDATE products SET category_id = NULL WHERE category_id IN (${idPlaceholders})`).run(...ids);

      // 3. Delete the categories
      db.prepare(`DELETE FROM categories WHERE id IN (${idPlaceholders})`).run(...ids);
      console.log('Cleaned up default categories');
    }
  } catch (err) {
    console.error('Error cleaning up default categories:', err);
  }

  // Global Error Handler for API
  app.use('/api/*', (err: any, req: any, res: any, next: any) => {
    console.error('API Error:', err);
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: 'File upload error: ' + err.message });
    }
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
