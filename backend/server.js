const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { pool, initDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper to run queries
const q = (text, params) => pool.query(text, params);

// Init DB then start server
initDB().then(() => {
  app.listen(PORT, () => console.log(`Livestock API running on port ${PORT}`));
}).catch(err => {
  console.error('DB init failed:', err);
  process.exit(1);
});

// FARMERS
app.get('/api/farmers', async (req, res) => {
  try {
    const { rows } = await q('SELECT * FROM farmers ORDER BY created_at DESC');
    res.json({ success: true, data: rows });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.get('/api/farmers/:id', async (req, res) => {
  try {
    const { rows } = await q('SELECT * FROM farmers WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ success: false, error: 'Farmer not found' });
    const listings = await q('SELECT * FROM livestock WHERE farmer_id = $1 ORDER BY created_at DESC', [req.params.id]);
    res.json({ success: true, data: { ...rows[0], listings: listings.rows } });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.post('/api/farmers', async (req, res) => {
  try {
    const { name, phone, location, region } = req.body;
    if (!name || !phone || !location || !region)
      return res.status(400).json({ success: false, error: 'All fields required' });
    const id = uuidv4();
    await q('INSERT INTO farmers (id, name, phone, location, region) VALUES ($1,$2,$3,$4,$5)', [id, name, phone, location, region]);
    const { rows } = await q('SELECT * FROM farmers WHERE id = $1', [id]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    if (err.message.includes('unique') || err.message.includes('duplicate'))
      return res.status(409).json({ success: false, error: 'Phone number already registered' });
    res.status(500).json({ success: false, error: err.message });
  }
});

// LIVESTOCK
app.get('/api/livestock', async (req, res) => {
  try {
    const { species, region, min_price, max_price, status = 'available' } = req.query;
    let query = `SELECT l.*, f.name as farmer_name, f.phone as farmer_phone, f.location as farmer_location
      FROM livestock l JOIN farmers f ON l.farmer_id = f.id WHERE l.status = $1`;
    const params = [status];
    let i = 2;
    if (species)   { query += ` AND l.species = $${i++}`;    params.push(species); }
    if (region)    { query += ` AND l.region = $${i++}`;     params.push(region); }
    if (min_price) { query += ` AND l.price_ghs >= $${i++}`; params.push(Number(min_price)); }
    if (max_price) { query += ` AND l.price_ghs <= $${i++}`; params.push(Number(max_price)); }
    query += ' ORDER BY l.created_at DESC';
    const { rows } = await q(query, params);
    res.json({ success: true, data: rows, count: rows.length });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.get('/api/livestock/:id', async (req, res) => {
  try {
    const { rows } = await q(`SELECT l.*, f.name as farmer_name, f.phone as farmer_phone, f.region as farmer_region, f.location as farmer_location
      FROM livestock l JOIN farmers f ON l.farmer_id = f.id WHERE l.id = $1`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ success: false, error: 'Listing not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.post('/api/livestock', async (req, res) => {
  try {
    const { farmer_id, species, breed, age_months, weight_kg, price_ghs, quantity, description, location, region } = req.body;
    if (!farmer_id || !species || !age_months || !price_ghs || !location || !region)
      return res.status(400).json({ success: false, error: 'Required fields missing' });
    const id = uuidv4();
    await q(`INSERT INTO livestock (id,farmer_id,species,breed,age_months,weight_kg,price_ghs,quantity,description,location,region)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [id, farmer_id, species, breed||null, age_months, weight_kg||null, price_ghs, quantity||1, description||null, location, region]);
    const { rows } = await q('SELECT * FROM livestock WHERE id = $1', [id]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.patch('/api/livestock/:id', async (req, res) => {
  try {
    const { status, price_ghs, quantity } = req.body;
    const updates = []; const params = []; let i = 1;
    if (status)    { updates.push(`status = $${i++}`);    params.push(status); }
    if (price_ghs) { updates.push(`price_ghs = $${i++}`); params.push(price_ghs); }
    if (quantity)  { updates.push(`quantity = $${i++}`);  params.push(quantity); }
    if (!updates.length) return res.status(400).json({ success: false, error: 'Nothing to update' });
    params.push(req.params.id);
    await q(`UPDATE livestock SET ${updates.join(', ')} WHERE id = $${i}`, params);
    const { rows } = await q('SELECT * FROM livestock WHERE id = $1', [req.params.id]);
    res.json({ success: true, data: rows[0] });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.delete('/api/livestock/:id', async (req, res) => {
  try {
    await q('DELETE FROM livestock WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Listing deleted' });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// INQUIRIES
app.post('/api/inquiries', async (req, res) => {
  try {
    const { livestock_id, buyer_name, buyer_phone, message } = req.body;
    if (!livestock_id || !buyer_name || !buyer_phone)
      return res.status(400).json({ success: false, error: 'Required fields missing' });
    const id = uuidv4();
    await q('INSERT INTO inquiries (id,livestock_id,buyer_name,buyer_phone,message) VALUES ($1,$2,$3,$4,$5)',
      [id, livestock_id, buyer_name, buyer_phone, message||null]);
    res.status(201).json({ success: true, data: { id }, message: 'Inquiry sent successfully' });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.get('/api/inquiries/livestock/:id', async (req, res) => {
  try {
    const { rows } = await q('SELECT * FROM inquiries WHERE livestock_id = $1 ORDER BY created_at DESC', [req.params.id]);
    res.json({ success: true, data: rows });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// MARKET PRICES
app.get('/api/market-prices', async (req, res) => {
  try {
    const { rows } = await q('SELECT * FROM market_prices ORDER BY recorded_at DESC');
    res.json({ success: true, data: rows });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// STATS
app.get('/api/stats', async (req, res) => {
  try {
    const [tl, tf, ts, pi, bs, br, hs, thr, tpr] = await Promise.all([
      q("SELECT COUNT(*) as c FROM livestock WHERE status='available'"),
      q('SELECT COUNT(*) as c FROM farmers'),
      q("SELECT COUNT(*) as c FROM livestock WHERE status='sold'"),
      q("SELECT COUNT(*) as c FROM inquiries WHERE status='pending'"),
      q("SELECT species, COUNT(*) as count FROM livestock WHERE status='available' GROUP BY species"),
      q("SELECT region, COUNT(*) as count FROM livestock WHERE status='available' GROUP BY region"),
      q('SELECT condition, COUNT(*) as count FROM health_records GROUP BY condition'),
      q('SELECT COUNT(*) as c FROM health_records'),
      q('SELECT COUNT(*) as c FROM productivity_records'),
    ]);
    res.json({ success: true, data: {
      totalListings: parseInt(tl.rows[0].c),
      totalFarmers: parseInt(tf.rows[0].c),
      totalSold: parseInt(ts.rows[0].c),
      pendingInquiries: parseInt(pi.rows[0].c),
      bySpecies: bs.rows,
      byRegion: br.rows,
      healthSummary: hs.rows,
      totalHealthRecords: parseInt(thr.rows[0].c),
      totalProductivityRecords: parseInt(tpr.rows[0].c),
    }});
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// HEALTH RECORDS
app.get('/api/health-records', async (req, res) => {
  try {
    const { condition } = req.query;
    let query = `SELECT h.*, l.species, l.breed, l.location, l.region, f.name as farmer_name
      FROM health_records h JOIN livestock l ON h.livestock_id = l.id JOIN farmers f ON l.farmer_id = f.id`;
    const params = [];
    if (condition) { query += ' WHERE h.condition = $1'; params.push(condition); }
    query += ' ORDER BY h.record_date DESC';
    const { rows } = await q(query, params);
    res.json({ success: true, data: rows });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.get('/api/health-records/:livestockId', async (req, res) => {
  try {
    const { rows } = await q(`SELECT h.*, l.species, l.breed FROM health_records h
      JOIN livestock l ON h.livestock_id = l.id WHERE h.livestock_id = $1 ORDER BY h.record_date DESC`, [req.params.livestockId]);
    res.json({ success: true, data: rows });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.post('/api/health-records', async (req, res) => {
  try {
    const { livestock_id, record_date, condition, treatment, veterinarian, notes } = req.body;
    if (!livestock_id || !record_date || !condition)
      return res.status(400).json({ success: false, error: 'livestock_id, record_date, and condition are required' });
    const id = uuidv4();
    await q('INSERT INTO health_records (id,livestock_id,record_date,condition,treatment,veterinarian,notes) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [id, livestock_id, record_date, condition, treatment||null, veterinarian||null, notes||null]);
    const { rows } = await q('SELECT * FROM health_records WHERE id = $1', [id]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.delete('/api/health-records/:id', async (req, res) => {
  try {
    await q('DELETE FROM health_records WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Health record deleted' });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// PRODUCTIVITY RECORDS
app.get('/api/productivity-records', async (req, res) => {
  try {
    const { rows } = await q(`SELECT p.*, l.species, l.breed, l.location, l.region, f.name as farmer_name
      FROM productivity_records p JOIN livestock l ON p.livestock_id = l.id JOIN farmers f ON l.farmer_id = f.id
      ORDER BY p.record_date DESC`);
    res.json({ success: true, data: rows });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.get('/api/productivity-records/:livestockId', async (req, res) => {
  try {
    const { rows } = await q(`SELECT p.*, l.species, l.breed FROM productivity_records p
      JOIN livestock l ON p.livestock_id = l.id WHERE p.livestock_id = $1 ORDER BY p.record_date DESC`, [req.params.livestockId]);
    res.json({ success: true, data: rows });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.post('/api/productivity-records', async (req, res) => {
  try {
    const { livestock_id, record_date, weight_kg, milk_yield_l, offspring_count, notes } = req.body;
    if (!livestock_id || !record_date)
      return res.status(400).json({ success: false, error: 'livestock_id and record_date are required' });
    const id = uuidv4();
    await q('INSERT INTO productivity_records (id,livestock_id,record_date,weight_kg,milk_yield_l,offspring_count,notes) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [id, livestock_id, record_date, weight_kg||null, milk_yield_l||null, offspring_count||0, notes||null]);
    const { rows } = await q('SELECT * FROM productivity_records WHERE id = $1', [id]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.delete('/api/productivity-records/:id', async (req, res) => {
  try {
    await q('DELETE FROM productivity_records WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Productivity record deleted' });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
