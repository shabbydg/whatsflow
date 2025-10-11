/**
 * Create Admin User Script
 * Generates an admin user with a properly hashed password
 */

import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../src/config/database.js';

const DEFAULT_ADMIN = {
  email: 'admin@whatsflow.ai',
  password: 'Admin@123',
  fullName: 'System Administrator',
  role: 'super_admin',
};

async function createAdmin() {
  try {
    console.log('Creating admin user...');

    // Check if admin already exists
    const existing: any = await query('SELECT id FROM admin_users WHERE email = ?', [
      DEFAULT_ADMIN.email,
    ]);

    if (Array.isArray(existing) && existing.length > 0) {
      console.log('❌ Admin user already exists with email:', DEFAULT_ADMIN.email);
      console.log('If you need to reset the password, delete the user first or use a different email.');
      process.exit(1);
    }

    // Generate password hash
    const passwordHash = await bcrypt.hash(DEFAULT_ADMIN.password, 10);
    const adminId = uuidv4();

    // Create admin user
    await query(
      `INSERT INTO admin_users (id, email, password_hash, full_name, role, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [adminId, DEFAULT_ADMIN.email, passwordHash, DEFAULT_ADMIN.fullName, DEFAULT_ADMIN.role, true]
    );

    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('='.repeat(60));
    console.log('📧 Email:', DEFAULT_ADMIN.email);
    console.log('🔑 Password:', DEFAULT_ADMIN.password);
    console.log('👤 Role:', DEFAULT_ADMIN.role);
    console.log('='.repeat(60));
    console.log('');
    console.log('⚠️  IMPORTANT: Change this password immediately after first login!');
    console.log('');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
}

createAdmin();

