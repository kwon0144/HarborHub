import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Database configuration function
function getDbConfig() {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'harbor_hub',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };
}

// Create connection pool
let pool;

function createPool() {
  try {
    const dbConfig = getDbConfig();
    console.log('🔧 Database config:', { 
      host: dbConfig.host, 
      port: dbConfig.port, 
      user: dbConfig.user, 
      database: dbConfig.database,
      hasPassword: !!dbConfig.password 
    });
    
    pool = mysql.createPool(dbConfig);
    console.log('✅ MySQL connection pool created successfully');
  } catch (error) {
    console.error('❌ Error creating MySQL connection pool:', error);
  }
}

// Database connection functions
export const db = {
  // Execute a query
  async query(sql, params = []) {
    try {
      // Ensure pool is created
      if (!pool) {
        createPool();
      }
      const [results] = await pool.execute(sql, params);
      return results;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },

  // Execute multiple queries in a transaction
  async transaction(queries) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const results = [];
      for (const { sql, params } of queries) {
        const [result] = await connection.execute(sql, params);
        results.push(result);
      }
      
      await connection.commit();
      return results;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // Get a single record
  async findOne(sql, params = []) {
    const results = await this.query(sql, params);
    return results[0] || null;
  },

  // Get multiple records
  async findMany(sql, params = []) {
    return await this.query(sql, params);
  },

  // Insert a record and return the inserted ID
  async insert(sql, params = []) {
    const result = await this.query(sql, params);
    return result.insertId;
  },

  // Update records and return affected rows count
  async update(sql, params = []) {
    const result = await this.query(sql, params);
    return result.affectedRows;
  },

  // Delete records and return affected rows count
  async delete(sql, params = []) {
    const result = await this.query(sql, params);
    return result.affectedRows;
  }
};

// Test database connection
export async function testConnection() {
  try {
    // Create pool if it doesn't exist
    if (!pool) {
      createPool();
    }
    
    await pool.execute('SELECT 1');
    console.log('✅ Database connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  }
}

// Initialize database tables
export async function initializeTables() {
  try {
    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL
      )
    `);

    // Create meditations table
    await db.query(`
      CREATE TABLE IF NOT EXISTS meditations (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        brief TEXT,
        description TEXT,
        src VARCHAR(500)
      )
    `);

    // Create exercises table
    await db.query(`
      CREATE TABLE IF NOT EXISTS exercises (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        brief TEXT,
        description TEXT,
        src VARCHAR(500)
      )
    `);

    // Create techniques table
    await db.query(`
      CREATE TABLE IF NOT EXISTS techniques (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        brief TEXT,
        description TEXT,
        src VARCHAR(500)
      )
    `);

    // Create ratings table
    await db.query(`
      CREATE TABLE IF NOT EXISTS ratings (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        user_id VARCHAR(36) NOT NULL,
        resource_id VARCHAR(36) NOT NULL,
        resource_type ENUM('MEDITATION', 'EXERCISE', 'TECHNIQUE') NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_resource (user_id, resource_id, resource_type)
      )
    `);

    // Create simple ratings table (no user tracking)
    await db.query(`
      CREATE TABLE IF NOT EXISTS simple_ratings (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        resource_id VARCHAR(36) NOT NULL
      )
    `);

    // Create simple comments table (no user tracking)
    await db.query(`
      CREATE TABLE IF NOT EXISTS simple_comments (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        comment TEXT NOT NULL,
        resource_id VARCHAR(36) NOT NULL
      )
    `);

    // Create activities table
    await db.query(`
      CREATE TABLE IF NOT EXISTS activities (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        time VARCHAR(50) NOT NULL,
        location VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL,
        availability INT NOT NULL DEFAULT 0,
        description TEXT,
        num_of_enrollments INT NOT NULL DEFAULT 0
      )
    `);

    // Create enrollments table
    await db.query(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        activity_code VARCHAR(50) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone_number VARCHAR(20) NOT NULL,
        UNIQUE KEY unique_enrollment (activity_code, email),
        INDEX idx_activity_code (activity_code),
        INDEX idx_email (email),
        FOREIGN KEY (activity_code) REFERENCES activities(code) ON DELETE CASCADE
      )
    `);

    // Create addresses table
    await db.query(`
      CREATE TABLE IF NOT EXISTS addresses (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        location VARCHAR(100) UNIQUE NOT NULL,
        address_line VARCHAR(255) NOT NULL,
        suburb VARCHAR(100) NOT NULL,
        state VARCHAR(50) NOT NULL,
        postcode VARCHAR(10) NOT NULL,
        country VARCHAR(100) NOT NULL DEFAULT 'Australia'
      )
    `);

    console.log('✅ Database tables initialized successfully (users, meditations, exercises, techniques, ratings, simple_ratings, simple_comments, activities, enrollments, addresses)');
    return true;
  } catch (error) {
    console.error('❌ Error initializing database tables:', error);
    return false;
  }
}

export default db;
