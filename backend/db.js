// ============================================
// PlateShare - MySQL Database Connection Pool
// ============================================

const mysql = require("mysql2/promise");

const pool = mysql.createPool(process.env.MYSQL_PUBLIC_URL);

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