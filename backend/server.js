// ============================================
// PlateShare - Express.js REST API Server
// ============================================

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = require('./db');

const app = express();
const PORT = process.env.SERVER_PORT || 5000;

// ---- Middleware ----
app.use(cors());
app.use(express.json());

// ---- Logging middleware ----
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ============================================
// AUTH ROUTES
// ============================================

// POST /api/login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    const user = rows[0];

    if (!user.is_active) {
      return res.status(403).json({ success: false, error: 'Account is inactive' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: 'Invalid password' });
    }

    // Don't send password hash to frontend
    const { password_hash, ...safeUser } = user;
    // Map fields for frontend compatibility
    const frontendUser = {
      ...safeUser,
      is_approved: !!safeUser.is_approved,
      is_active: !!safeUser.is_active,
    };

    res.json({ success: true, user: frontendUser });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/users (register)
app.post('/api/users', async (req, res) => {
  try {
    const { full_name, email, password, phone, role, org_name, city } = req.body;
    if (!full_name || !email || !password || !role || !org_name) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Check if email exists
    const [existing] = await pool.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const [result] = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, phone, role, org_name, city, is_approved, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [full_name, email, password_hash, phone || null, role, org_name, city || null, 1, 1]
    );

    const [newUserRows] = await pool.query('SELECT * FROM users WHERE user_id = ?', [result.insertId]);
    const { password_hash: _, ...safeUser } = newUserRows[0];
    const frontendUser = {
      ...safeUser,
      is_approved: !!safeUser.is_approved,
      is_active: !!safeUser.is_active,
    };

    res.status(201).json({ success: true, user: frontendUser });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// ============================================
// FOOD LISTING ROUTES
// ============================================

// GET /api/foods
app.get('/api/foods', async (req, res) => {
  try {
    const { city, food_type, search } = req.query;
    let query = `
      SELECT f.*, u.full_name AS donor_name, u.org_name AS donor_org
      FROM food_listings f
      JOIN users u ON f.donor_id = u.user_id
      WHERE 1=1
    `;
    const params = [];

    if (city && city !== 'all') {
      query += ' AND LOWER(f.city) = LOWER(?)';
      params.push(city);
    }
    if (food_type && food_type !== 'all') {
      query += ' AND LOWER(f.food_type) = LOWER(?)';
      params.push(food_type);
    }
    if (search) {
      query += ' AND (LOWER(f.title) LIKE LOWER(?) OR LOWER(f.description) LIKE LOWER(?) OR LOWER(f.pickup_address) LIKE LOWER(?))';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    query += ' ORDER BY f.created_at DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Get foods error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/foods
app.post('/api/foods', async (req, res) => {
  try {
    const { title, description, quantity, food_type, pickup_address, city, expiry_time, donor_id } = req.body;

    if (!title || !quantity || !food_type || !pickup_address || !city || !expiry_time || !donor_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Convert ISO datetime to MySQL format
    const formattedExpiry = new Date(expiry_time)
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    const [result] = await pool.query(
      `INSERT INTO food_listings 
      (title, description, quantity, food_type, pickup_address, city, expiry_time, donor_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'available')`,
      [title, description || '', quantity, food_type, pickup_address, city, formattedExpiry, donor_id]
    );

    const [newRows] = await pool.query(
      'SELECT * FROM food_listings WHERE food_id = ?',
      [result.insertId]
    );

    res.status(201).json(newRows[0]);

  } catch (err) {
    console.error('Create food error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/foods/:id
app.put('/api/foods/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    if (Object.keys(fields).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Build dynamic update query
    const allowedFields = ['title', 'description', 'quantity', 'food_type', 'pickup_address', 'city', 'expiry_time', 'status'];
    const updates = [];
    const params = [];

    for (const [key, value] of Object.entries(fields)) {
  if (allowedFields.includes(key)) {

    let newValue = value;

    // Fix MySQL datetime format
    if (key === "expiry_time" && value) {
      newValue = new Date(value)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
    }

    updates.push(`${key} = ?`);
    params.push(newValue);
  }
}

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    params.push(id);
    await pool.query(`UPDATE food_listings SET ${updates.join(', ')} WHERE food_id = ?`, params);

    const [updatedRows] = await pool.query('SELECT * FROM food_listings WHERE food_id = ?', [id]);
    if (updatedRows.length === 0) {
      return res.status(404).json({ error: 'Food listing not found' });
    }

    res.json(updatedRows[0]);
  } catch (err) {
    console.error('Update food error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/foods/:id
app.delete('/api/foods/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM food_listings WHERE food_id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Food listing not found' });
    }
    res.json({ success: true, message: 'Food listing deleted' });
  } catch (err) {
    console.error('Delete food error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/users/:id/listings
app.get('/api/users/:id/listings', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM food_listings WHERE donor_id = ? ORDER BY created_at DESC',
      [id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Get user listings error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// CLAIMS ROUTES
// ============================================

// POST /api/claims (claim food)
app.post('/api/claims', async (req, res) => {
  try {
    const { food_id, recipient_id } = req.body;
    if (!food_id || !recipient_id) {
      return res.status(400).json({ error: 'food_id and recipient_id are required' });
    }

    // Check food is available
    const [foodRows] = await pool.query('SELECT * FROM food_listings WHERE food_id = ? AND status = "available"', [food_id]);
    if (foodRows.length === 0) {
      return res.status(400).json({ error: 'Food is not available' });
    }

    // Update food status to requested
    await pool.query('UPDATE food_listings SET status = "requested" WHERE food_id = ?', [food_id]);

    // Create claim
    const [result] = await pool.query(
      'INSERT INTO claims (food_id, recipient_id, status) VALUES (?, ?, "reserved")',
      [food_id, recipient_id]
    );

    const [claimRows] = await pool.query('SELECT * FROM claims WHERE claim_id = ?', [result.insertId]);
    res.status(201).json(claimRows[0]);
  } catch (err) {
    console.error('Claim food error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/users/:id/claims
app.get('/api/users/:id/claims', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT c.*, f.title, f.description, f.quantity, f.food_type, f.pickup_address, f.city,
              f.expiry_time, f.donor_id, f.status AS food_status, f.created_at AS food_created_at,
              u.full_name AS donor_name, u.org_name AS donor_org
       FROM claims c
       JOIN food_listings f ON c.food_id = f.food_id
       JOIN users u ON f.donor_id = u.user_id
       WHERE c.recipient_id = ?
       ORDER BY c.claimed_at DESC`,
      [id]
    );

    // Reshape to match frontend expected structure
    const claims = rows.map(row => ({
      claim_id: row.claim_id,
      food_id: row.food_id,
      recipient_id: parseInt(id),
      status: row.status,
      claimed_at: row.claimed_at,
      food: {
        food_id: row.food_id,
        title: row.title,
        description: row.description,
        quantity: row.quantity,
        food_type: row.food_type,
        pickup_address: row.pickup_address,
        city: row.city,
        expiry_time: row.expiry_time,
        donor_id: row.donor_id,
        status: row.food_status,
        created_at: row.food_created_at,
      },
      donor_name: row.donor_org || row.donor_name,
    }));

    res.json(claims);
  } catch (err) {
    console.error('Get user claims error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/claims/:id/collect (mark as collected)
app.put('/api/claims/:id/collect', async (req, res) => {
  try {
    const { id } = req.params;

    // Get the claim
    const [claimRows] = await pool.query('SELECT * FROM claims WHERE claim_id = ?', [id]);
    if (claimRows.length === 0) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    const claim = claimRows[0];
    if (claim.status === 'collected') {
      return res.json(claim);
    }

    // Update claim status
    await pool.query('UPDATE claims SET status = "collected" WHERE claim_id = ?', [id]);

    // Update food status to completed
    await pool.query('UPDATE food_listings SET status = "completed" WHERE food_id = ?', [claim.food_id]);

    const [updatedClaim] = await pool.query('SELECT * FROM claims WHERE claim_id = ?', [id]);
    res.json(updatedClaim[0]);
  } catch (err) {
    console.error('Collect claim error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// ADMIN ROUTES
// ============================================

// GET /api/admin/users
app.get('/api/admin/users', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT user_id, full_name, email, phone, role, org_name, address, city, latitude, longitude, is_approved, is_active, profile_pic, created_at, updated_at FROM users ORDER BY created_at ASC'
    );
    const users = rows.map(u => ({
      ...u,
      is_approved: !!u.is_approved,
      is_active: !!u.is_active,
    }));
    res.json(users);
  } catch (err) {
    console.error('Get all users error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/admin/users/:id/toggle-active
app.put('/api/admin/users/:id/toggle-active', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM users WHERE user_id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newStatus = rows[0].is_active ? 0 : 1;
    await pool.query('UPDATE users SET is_active = ? WHERE user_id = ?', [newStatus, id]);

    const [updated] = await pool.query(
      'SELECT user_id, full_name, email, phone, role, org_name, address, city, latitude, longitude, is_approved, is_active, profile_pic, created_at, updated_at FROM users WHERE user_id = ?',
      [id]
    );
    const user = { ...updated[0], is_approved: !!updated[0].is_approved, is_active: !!updated[0].is_active };
    res.json(user);
  } catch (err) {
    console.error('Toggle user active error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/admin/users/:id/approve
app.put('/api/admin/users/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE users SET is_approved = 1 WHERE user_id = ?', [id]);

    const [updated] = await pool.query(
      'SELECT user_id, full_name, email, phone, role, org_name, address, city, latitude, longitude, is_approved, is_active, profile_pic, created_at, updated_at FROM users WHERE user_id = ?',
      [id]
    );
    if (updated.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = { ...updated[0], is_approved: !!updated[0].is_approved, is_active: !!updated[0].is_active };
    res.json(user);
  } catch (err) {
    console.error('Approve user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/pending
app.get('/api/admin/pending', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT user_id, full_name, email, phone, role, org_name, address, city, is_approved, is_active, created_at, updated_at FROM users WHERE is_approved = 0 ORDER BY created_at ASC'
    );
    const users = rows.map(u => ({
      ...u,
      is_approved: !!u.is_approved,
      is_active: !!u.is_active,
    }));
    res.json(users);
  } catch (err) {
    console.error('Get pending users error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/stats
app.get('/api/admin/stats', async (req, res) => {
  try {
    const [[donors]] = await pool.query('SELECT COUNT(*) AS count FROM users WHERE role = "donor" AND is_approved = 1');
    const [[ngos]] = await pool.query('SELECT COUNT(*) AS count FROM users WHERE role = "recipient" AND is_approved = 1');
    const [[pending]] = await pool.query('SELECT COUNT(*) AS count FROM users WHERE is_approved = 0');
    const [[active]] = await pool.query('SELECT COUNT(*) AS count FROM food_listings WHERE status = "available"');
    const [[claimed]] = await pool.query('SELECT COUNT(*) AS count FROM food_listings WHERE status = "requested"');
    const [[rescued]] = await pool.query('SELECT COUNT(*) AS count FROM food_listings WHERE status = "completed"');

    res.json({
      totalDonors: donors.count,
      ngoPartners: ngos.count,
      pendingApprovals: pending.count,
      activeListings: active.count,
      currentlyClaimed: claimed.count,
      mealsRescued: rescued.count,
    });
  } catch (err) {
    console.error('Get admin stats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/donations
app.get('/api/admin/donations', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT f.food_id, f.title AS food_title, f.quantity, f.status, f.created_at,
              u.full_name AS donor_name, u.org_name AS donor_org,
              COALESCE(
                (SELECT u2.org_name FROM claims c JOIN users u2 ON c.recipient_id = u2.user_id WHERE c.food_id = f.food_id LIMIT 1),
                'Assigned NGO'
              ) AS recipient_name
       FROM food_listings f
       JOIN users u ON f.donor_id = u.user_id
       WHERE f.status IN ('requested', 'completed')
       ORDER BY f.created_at DESC`
    );

    const donations = rows.map((row, idx) => ({
      donation_id: idx + 1,
      food_id: row.food_id,
      food_title: row.food_title,
      donor_name: row.donor_org || row.donor_name,
      recipient_name: row.recipient_name,
      quantity: row.quantity,
      status: row.status,
      created_at: row.created_at,
    }));

    res.json(donations);
  } catch (err) {
    console.error('Get donations error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// STATS ROUTE (public hero page)
// ============================================
app.get('/api/stats', async (req, res) => {
  try {
    const [[donors]] = await pool.query('SELECT COUNT(*) AS count FROM users WHERE role = "donor"');
    const [[ngos]] = await pool.query('SELECT COUNT(*) AS count FROM users WHERE role = "recipient"');
    const [[rescued]] = await pool.query(
      'SELECT COALESCE(SUM(CAST(quantity AS UNSIGNED)), 0) AS total FROM food_listings WHERE status = "completed"'
    );

    res.json({
      meals: rescued.total || 0,
      donors: donors.count,
      ngos: ngos.count,
      wasted: '2.1M tons',
    });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/cities
app.get('/api/cities', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT DISTINCT city FROM food_listings WHERE city IS NOT NULL ORDER BY city');
    res.json(rows.map(r => r.city));
  } catch (err) {
    console.error('Get cities error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/food-types
app.get('/api/food-types', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT DISTINCT food_type FROM food_listings WHERE food_type IS NOT NULL ORDER BY food_type');
    res.json(rows.map(r => r.food_type));
  } catch (err) {
    console.error('Get food types error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// Health Check
// ============================================
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: 'error', database: 'disconnected', error: err.message });
  }
});

// ============================================
// Start Server
// ============================================
app.listen(PORT, () => {
  console.log(`\n🍽️  PlateShare API Server running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
