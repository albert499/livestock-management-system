const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { initDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize DB
const db = initDB();

// ─────────────────────────────────────────
// FARMERS ROUTES
// ─────────────────────────────────────────

// GET all farmers
app.get('/api/farmers', (req, res) => {
  try {
    const farmers = db.prepare('SELECT * FROM farmers ORDER BY created_at DESC').all();
    res.json({ success: true, data: farmers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single farmer + their listings
app.get('/api/farmers/:id', (req, res) => {
  try {
    const farmer = db.prepare('SELECT * FROM farmers WHERE id = ?').get(req.params.id);
    if (!farmer) return res.status(404).json({ success: false, error: 'Farmer not found' });
    const listings = db.prepare('SELECT * FROM livestock WHERE farmer_id = ? ORDER BY created_at DESC').all(req.params.id);
    res.json({ success: true, data: { ...farmer, listings } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create farmer
app.post('/api/farmers', (req, res) => {
  try {
    const { name, phone, location, region } = req.body;
    if (!name || !phone || !location || !region)
      return res.status(400).json({ success: false, error: 'All fields required' });

    const id = uuidv4();
    db.prepare('INSERT INTO farmers (id, name, phone, location, region) VALUES (?, ?, ?, ?, ?)').run(id, name, phone, location, region);
    const farmer = db.prepare('SELECT * FROM farmers WHERE id = ?').get(id);
    res.status(201).json({ success: true, data: farmer });
  } catch (err) {
    if (err.message.includes('UNIQUE')) return res.status(409).json({ success: false, error: 'Phone number already registered' });
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// LIVESTOCK ROUTES
// ─────────────────────────────────────────

// GET all livestock (with filters)
app.get('/api/livestock', (req, res) => {
  try {
    const { species, region, min_price, max_price, status = 'available' } = req.query;
    let query = `
      SELECT l.*, f.name as farmer_name, f.phone as farmer_phone, f.location as farmer_location
      FROM livestock l
      JOIN farmers f ON l.farmer_id = f.id
      WHERE l.status = ?
    `;
    const params = [status];

    if (species) { query += ' AND l.species = ?'; params.push(species); }
    if (region)  { query += ' AND l.region = ?'; params.push(region); }
    if (min_price) { query += ' AND l.price_ghs >= ?'; params.push(Number(min_price)); }
    if (max_price) { query += ' AND l.price_ghs <= ?'; params.push(Number(max_price)); }

    query += ' ORDER BY l.created_at DESC';

    const listings = db.prepare(query).all(...params);
    res.json({ success: true, data: listings, count: listings.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single livestock
app.get('/api/livestock/:id', (req, res) => {
  try {
    const item = db.prepare(`
      SELECT l.*, f.name as farmer_name, f.phone as farmer_phone, f.region as farmer_region, f.location as farmer_location
      FROM livestock l JOIN farmers f ON l.farmer_id = f.id
      WHERE l.id = ?
    `).get(req.params.id);
    if (!item) return res.status(404).json({ success: false, error: 'Listing not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create livestock listing
app.post('/api/livestock', (req, res) => {
  try {
    const { farmer_id, species, breed, age_months, weight_kg, price_ghs, quantity, description, location, region } = req.body;
    if (!farmer_id || !species || !age_months || !price_ghs || !location || !region)
      return res.status(400).json({ success: false, error: 'Required fields missing' });

    const id = uuidv4();
    db.prepare(`
      INSERT INTO livestock (id, farmer_id, species, breed, age_months, weight_kg, price_ghs, quantity, description, location, region)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, farmer_id, species, breed || null, age_months, weight_kg || null, price_ghs, quantity || 1, description || null, location, region);

    const item = db.prepare('SELECT * FROM livestock WHERE id = ?').get(id);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH update livestock status
app.patch('/api/livestock/:id', (req, res) => {
  try {
    const { status, price_ghs, quantity } = req.body;
    const updates = [];
    const params = [];
    if (status)    { updates.push('status = ?');    params.push(status); }
    if (price_ghs) { updates.push('price_ghs = ?'); params.push(price_ghs); }
    if (quantity)  { updates.push('quantity = ?');  params.push(quantity); }
    if (!updates.length) return res.status(400).json({ success: false, error: 'Nothing to update' });

    params.push(req.params.id);
    db.prepare(`UPDATE livestock SET ${updates.join(', ')} WHERE id = ?`).run(...params);
    const item = db.prepare('SELECT * FROM livestock WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE livestock listing
app.delete('/api/livestock/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM livestock WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Listing deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// INQUIRIES ROUTES
// ─────────────────────────────────────────

// POST submit inquiry
app.post('/api/inquiries', (req, res) => {
  try {
    const { livestock_id, buyer_name, buyer_phone, message } = req.body;
    if (!livestock_id || !buyer_name || !buyer_phone)
      return res.status(400).json({ success: false, error: 'Required fields missing' });

    const id = uuidv4();
    db.prepare('INSERT INTO inquiries (id, livestock_id, buyer_name, buyer_phone, message) VALUES (?, ?, ?, ?, ?)').run(id, livestock_id, buyer_name, buyer_phone, message || null);
    res.status(201).json({ success: true, data: { id }, message: 'Inquiry sent successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET inquiries for a livestock listing
app.get('/api/inquiries/livestock/:id', (req, res) => {
  try {
    const inquiries = db.prepare('SELECT * FROM inquiries WHERE livestock_id = ? ORDER BY created_at DESC').all(req.params.id);
    res.json({ success: true, data: inquiries });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// MARKET PRICES ROUTE
// ─────────────────────────────────────────

app.get('/api/market-prices', (req, res) => {
  try {
    const prices = db.prepare('SELECT * FROM market_prices ORDER BY recorded_at DESC').all();
    res.json({ success: true, data: prices });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// STATS / DASHBOARD
// ─────────────────────────────────────────

app.get('/api/stats', (req, res) => {
  try {
    const totalListings  = db.prepare("SELECT COUNT(*) as c FROM livestock WHERE status='available'").get().c;
    const totalFarmers   = db.prepare('SELECT COUNT(*) as c FROM farmers').get().c;
    const totalSold      = db.prepare("SELECT COUNT(*) as c FROM livestock WHERE status='sold'").get().c;
    const pendingInquiries = db.prepare("SELECT COUNT(*) as c FROM inquiries WHERE status='pending'").get().c;
    const bySpecies      = db.prepare("SELECT species, COUNT(*) as count FROM livestock WHERE status='available' GROUP BY species").all();
    const byRegion       = db.prepare("SELECT region, COUNT(*) as count FROM livestock WHERE status='available' GROUP BY region").all();

    res.json({ success: true, data: { totalListings, totalFarmers, totalSold, pendingInquiries, bySpecies, byRegion } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.listen(PORT, () => console.log(`🐄 Livestock API running on http://localhost:${PORT}`));