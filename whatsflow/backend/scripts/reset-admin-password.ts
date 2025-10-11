/**
 * Reset Admin Password Script
 * Resets the password for an existing admin user
 */

import bcrypt from 'bcryptjs';
import { query } from '../src/config/database.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function resetPassword() {
  try {
    console.log('='.repeat(60));
    console.log('Admin Password Reset Tool');
    console.log('='.repeat(60));
    console.log('');

    const email = await question('Enter admin email (default: admin@whatsflow.ai): ');
    const adminEmail = email.trim() || 'admin@whatsflow.ai';

    // Check if admin exists
    const admins: any = await query('SELECT id, email, full_name FROM admin_users WHERE email = ?', [
      adminEmail,
    ]);

    if (!Array.isArray(admins) || admins.length === 0) {
      console.log('❌ Admin user not found with email:', adminEmail);
      rl.close();
      process.exit(1);
    }

    const admin = admins[0];
    console.log('');
    console.log('Found admin:');
    console.log('  Email:', admin.email);
    console.log('  Name:', admin.full_name);
    console.log('');

    const newPassword = await question('Enter new password (default: Admin@123): ');
    const password = newPassword.trim() || 'Admin@123';

    if (password.length < 6) {
      console.log('❌ Password must be at least 6 characters long');
      rl.close();
      process.exit(1);
    }

    // Generate password hash
    const passwordHash = await bcrypt.hash(password, 10);

    // Update password
    await query('UPDATE admin_users SET password_hash = ? WHERE id = ?', [passwordHash, admin.id]);

    console.log('');
    console.log('✅ Password reset successfully!');
    console.log('');
    console.log('='.repeat(60));
    console.log('📧 Email:', admin.email);
    console.log('🔑 New Password:', password);
    console.log('='.repeat(60));
    console.log('');

    rl.close();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error resetting password:', error.message);
    rl.close();
    process.exit(1);
  }
}

resetPassword();

