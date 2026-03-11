// ============================================
// PlateShare - MySQL Database Connection Pool
// ============================================

const mysql = require("mysql2/promise");

const pool = process.env.MYSQL_PUBLIC_URL 
  ? mysql.createPool(process.env.MYSQL_PUBLIC_URL)
  : mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'plateshare_db',
      port: process.env.DB_PORT || 3306,
    });

// Test connection on startup
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ MySQL connected successfully to Railway");
    connection.release();
  } catch (err) {
    console.error("❌ MySQL connection failed:", err.message);
  }
}

testConnection();

module.exports = pool;