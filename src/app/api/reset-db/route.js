import { NextResponse } from 'next/server';
import { db } from '@/lib/database.js';

export async function POST() {
  try {
    console.log('Dropping existing tables...');
    
    // Drop tables in reverse order due to foreign key constraints
    await db.query('DROP TABLE IF EXISTS enrollments');
    await db.query('DROP TABLE IF EXISTS activities'); 
    await db.query('DROP TABLE IF EXISTS addresses');
    await db.query('DROP TABLE IF EXISTS ratings');
    await db.query('DROP TABLE IF EXISTS simple_ratings');
    await db.query('DROP TABLE IF EXISTS simple_comments');
    await db.query('DROP TABLE IF EXISTS meditations');
    await db.query('DROP TABLE IF EXISTS exercises');
    await db.query('DROP TABLE IF EXISTS techniques');
    await db.query('DROP TABLE IF EXISTS users');
    
    console.log('Tables dropped successfully!');
    
    // Create users table (needed for foreign key)
    await db.query(`
      CREATE TABLE users (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL
      )
    `);

    // Create resource tables with clean schema
    await db.query(`
      CREATE TABLE meditations (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        brief TEXT,
        description TEXT,
        src VARCHAR(500)
      )
    `);

    await db.query(`
      CREATE TABLE exercises (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        brief TEXT,
        description TEXT,
        src VARCHAR(500)
      )
    `);

    await db.query(`
      CREATE TABLE techniques (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        brief TEXT,
        description TEXT,
        src VARCHAR(500)
      )
    `);

    // Create ratings table
    await db.query(`
      CREATE TABLE ratings (
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
      CREATE TABLE simple_ratings (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        resource_id VARCHAR(36) NOT NULL
      )
    `);

    // Create simple comments table (no user tracking)
    await db.query(`
      CREATE TABLE simple_comments (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        comment TEXT NOT NULL,
        resource_id VARCHAR(36) NOT NULL
      )
    `);

    // Create activities table
    await db.query(`
      CREATE TABLE activities (
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
      CREATE TABLE enrollments (
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
      CREATE TABLE addresses (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        location VARCHAR(100) UNIQUE NOT NULL,
        address_line VARCHAR(255) NOT NULL,
        suburb VARCHAR(100) NOT NULL,
        state VARCHAR(50) NOT NULL,
        postcode VARCHAR(10) NOT NULL,
        country VARCHAR(100) NOT NULL DEFAULT 'Australia'
      )
    `);
    
    console.log('Clean database schema created successfully!');

    return NextResponse.json({
      message: 'Database reset successfully! Clean schema created.',
      status: 'success'
    });

  } catch (error) {
    console.error('Error resetting database:', error);
    return NextResponse.json(
      { error: 'Failed to reset database', details: error.message },
      { status: 500 }
    );
  }
}
