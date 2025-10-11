/**
 * Toggle Test Account Script
 * Enables or disables test account mode for a user
 * 
 * Usage:
 *   npm run test-account:enable user@example.com "Internal testing"
 *   npm run test-account:disable user@example.com
 *   npm run test-account:list
 */

import { query } from '../src/config/database.js';
import { v4 as uuidv4 } from 'uuid';

const args = process.argv.slice(2);
const command = args[0];
const email = args[1];
const notes = args[2];

async function enableTestAccount(email: string, notes?: string) {
  try {
    // Find user
    const users: any = await query('SELECT id, email, is_test_account FROM users WHERE email = ?', [email]);
    
    if (!Array.isArray(users) || users.length === 0) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    const user = users[0];

    if (user.is_test_account) {
      console.log(`⚠️  User ${email} is already a test account`);
      process.exit(0);
    }

    // Enable test account
    await query(
      'UPDATE users SET is_test_account = true, test_account_notes = ? WHERE id = ?',
      [notes || 'Test account', user.id]
    );

    // Log action
    await query(
      `INSERT INTO test_accounts_log (id, user_id, action, performed_by, notes)
       VALUES (?, ?, 'enabled', 'CLI', ?)`,
      [uuidv4(), user.id, notes || 'Test account enabled']
    );

    console.log(`✅ Test account enabled for: ${email}`);
    if (notes) {
      console.log(`   Notes: ${notes}`);
    }
    console.log(`   Benefits:`);
    console.log(`   - No trial expiration`);
    console.log(`   - Unlimited messages`);
    console.log(`   - Unlimited AI messages`);
    console.log(`   - All features unlocked`);
    console.log(`   - No payment required`);

  } catch (error) {
    console.error('Error enabling test account:', error);
    process.exit(1);
  }
}

async function disableTestAccount(email: string) {
  try {
    // Find user
    const users: any = await query('SELECT id, email, is_test_account FROM users WHERE email = ?', [email]);
    
    if (!Array.isArray(users) || users.length === 0) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    const user = users[0];

    if (!user.is_test_account) {
      console.log(`⚠️  User ${email} is not a test account`);
      process.exit(0);
    }

    // Disable test account
    await query(
      'UPDATE users SET is_test_account = false, test_account_notes = NULL WHERE id = ?',
      [user.id]
    );

    // Log action
    await query(
      `INSERT INTO test_accounts_log (id, user_id, action, performed_by, notes)
       VALUES (?, ?, 'disabled', 'CLI', 'Test account disabled')`,
      [uuidv4(), user.id]
    );

    console.log(`✅ Test account disabled for: ${email}`);
    console.log(`   User will now be subject to normal billing rules`);

  } catch (error) {
    console.error('Error disabling test account:', error);
    process.exit(1);
  }
}

async function listTestAccounts() {
  try {
    const testAccounts: any = await query(`
      SELECT 
        u.id,
        u.email,
        u.full_name,
        u.test_account_notes,
        u.created_at,
        COUNT(DISTINCT m.id) as message_count,
        MAX(m.created_at) as last_activity
      FROM users u
      LEFT JOIN messages m ON u.id = m.user_id
      WHERE u.is_test_account = true
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);

    if (!Array.isArray(testAccounts) || testAccounts.length === 0) {
      console.log('No test accounts found');
      process.exit(0);
    }

    console.log(`\n📋 Test Accounts (${testAccounts.length}):\n`);
    console.log('─'.repeat(80));

    for (const account of testAccounts) {
      console.log(`\n✅ ${account.email}`);
      console.log(`   Name: ${account.full_name}`);
      console.log(`   Notes: ${account.test_account_notes || 'None'}`);
      console.log(`   Messages: ${account.message_count || 0}`);
      console.log(`   Last Activity: ${account.last_activity ? new Date(account.last_activity).toLocaleString() : 'Never'}`);
      console.log(`   Created: ${new Date(account.created_at).toLocaleDateString()}`);
    }

    console.log('\n' + '─'.repeat(80));

  } catch (error) {
    console.error('Error listing test accounts:', error);
    process.exit(1);
  }
}

async function showUsage() {
  console.log(`
Test Account Management

Usage:
  npm run test-account:enable <email> [notes]   Enable test account
  npm run test-account:disable <email>          Disable test account
  npm run test-account:list                     List all test accounts

Examples:
  npm run test-account:enable test@example.com "Internal testing"
  npm run test-account:disable test@example.com
  npm run test-account:list

Benefits of Test Accounts:
  ✓ No trial expiration (stays active forever)
  ✓ Unlimited messages
  ✓ Unlimited AI messages
  ✓ All features unlocked
  ✓ No payment required
  ✓ Bypasses all usage limits
  `);
}

async function main() {
  if (!command) {
    showUsage();
    process.exit(0);
  }

  switch (command) {
    case 'enable':
      if (!email) {
        console.error('❌ Email required');
        showUsage();
        process.exit(1);
      }
      await enableTestAccount(email, notes);
      break;

    case 'disable':
      if (!email) {
        console.error('❌ Email required');
        showUsage();
        process.exit(1);
      }
      await disableTestAccount(email);
      break;

    case 'list':
      await listTestAccounts();
      break;

    default:
      console.error(`❌ Unknown command: ${command}`);
      showUsage();
      process.exit(1);
  }

  process.exit(0);
}

main();

