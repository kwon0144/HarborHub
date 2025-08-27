import dotenv from 'dotenv';
import { testConnection, initializeTables } from './database.js';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function testDatabaseConnection() {
  console.log('🔍 Testing MySQL database connection...');
  
  try {
    const isConnected = await testConnection();
    
    if (isConnected) {
      console.log('✅ Database connection successful!');
      
      console.log('🔧 Initializing database tables...');
      const tablesInitialized = await initializeTables();
      
      if (tablesInitialized) {
        console.log('✅ Database tables initialized successfully!');
        console.log('🎉 MySQL database setup is complete!');
        console.log('\nNext steps:');
        console.log('1. Make sure your MySQL server is running');
        console.log('2. Update your .env.local file with correct database credentials');
        console.log('3. Run: npm run db:seed to populate the database with sample data');
      } else {
        console.log('❌ Failed to initialize database tables');
      }
    } else {
      console.log('❌ Database connection failed');
      console.log('\nTroubleshooting:');
      console.log('1. Make sure MySQL server is running');
      console.log('2. Check your database credentials in .env.local');
      console.log('3. Ensure the database "harbor_hub" exists');
    }
  } catch (error) {
    console.error('❌ Error testing database connection:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure MySQL server is running');
    console.log('2. Check your database credentials in .env.local');
    console.log('3. Ensure the database "harbor_hub" exists');
    console.log('4. Check if mysql2 package is installed: npm install mysql2');
  }
}

// Run the test
testDatabaseConnection();
