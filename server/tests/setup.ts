import { expect } from 'vitest';
import Database from 'better-sqlite3';
import path from 'path';

// Setup test database with sample data
const setupTestDatabase = () => {
  try {
    // Use the same database file as the main app
    const dbPath = path.resolve(process.cwd(), '..', 'skavtech.db');
    const db = new Database(dbPath);

    // Insert test users
    const insertUser = db.prepare(`
      INSERT OR IGNORE INTO users (username, password, role, email, first_name, last_name, phone_number, country_code, city, account_type, newsletter, agree_to_marketing, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Admin user
    insertUser.run(
      'admin',
      '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj8X3uWWCJK', // 'admin123'
      'admin',
      'admin@skavtech.co.ke',
      'System',
      'Administrator',
      '+254700000000',
      '+254',
      'Nairobi',
      'business',
      0,
      0,
      new Date().toISOString()
    );

    // Test user
    insertUser.run(
      'testuser',
      '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj8X3uWWCJK', // 'admin123'
      'customer',
      'test@example.com',
      'Test',
      'User',
      '+254700123456',
      '+254',
      'Nairobi',
      'individual',
      1,
      0,
      new Date().toISOString()
    );

    // Insert test products
    const insertProduct = db.prepare(`
      INSERT OR IGNORE INTO products (name, brand, category, condition, price, original_price, description, specifications, warranty_years, stock_quantity, image_url, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertProduct.run(
      'Dell PowerEdge R750',
      'Dell',
      'servers',
      'refurbished',
      4299,
      6500,
      'Enterprise-grade server with dual Xeon processors and 64GB RAM',
      JSON.stringify({
        processor: 'Dual Intel Xeon',
        ram: '64GB',
        storage: '2TB SSD',
        ports: 'Multiple USB, Ethernet'
      }),
      2,
      5,
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3',
      1,
      new Date().toISOString()
    );

    insertProduct.run(
      'Lenovo ThinkPad T14',
      'Lenovo',
      'laptops',
      'new',
      1299,
      null,
      'Business laptop with Intel i7, 16GB RAM, and 512GB SSD',
      JSON.stringify({
        processor: 'Intel i7',
        ram: '16GB',
        storage: '512GB SSD',
        screen: '14-inch Full HD'
      }),
      3,
      12,
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3',
      1,
      new Date().toISOString()
    );

    insertProduct.run(
      'Apple MacBook Pro 14"',
      'Apple',
      'laptops',
      'new',
      1999,
      null,
      'Professional laptop with M2 chip, 16GB RAM, and 512GB SSD',
      JSON.stringify({
        processor: 'Apple M2',
        ram: '16GB',
        storage: '512GB SSD',
        screen: '14.2-inch Liquid Retina XDR'
      }),
      1,
      6,
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?ixlib=rb-4.0.3',
      1,
      new Date().toISOString()
    );

    // Insert test warranty
    const insertWarranty = db.prepare(`
      INSERT OR IGNORE INTO warranties (serial_number, product_id, purchase_date, expiry_date, coverage, invoice_number, customer_email, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertWarranty.run(
      'DL7420-CORP-001',
      1,
      new Date().toISOString(),
      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
      'Full coverage including parts and labor',
      'INV-2024-001',
      'test@example.com',
      1,
      new Date().toISOString()
    );

    // Insert test repair ticket
    const insertRepairTicket = db.prepare(`
      INSERT OR IGNORE INTO repair_tickets (ticket_id, serial_number, device_model, issue_description, status, assigned_technician, customer_info, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertRepairTicket.run(
      'RPR-2024-001',
      'DL7420-CORP-001',
      'Dell PowerEdge R750',
      'Server not booting properly',
      'received',
      null,
      JSON.stringify({
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '+254700123456'
      }),
      new Date().toISOString(),
      new Date().toISOString()
    );

    db.close();
    console.log('✅ Test database populated successfully');
  } catch (error) {
    console.warn('⚠️  Failed to setup test database:', error);
  }
};

// Run setup
setupTestDatabase();

// Extend expect with custom matchers if needed