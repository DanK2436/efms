#!/usr/bin/env node
/**
 * Generate a bcrypt hash for an admin password.
 * Usage: node scripts/hash-password.js "your-password"
 * Then UPDATE users SET password = '<hash>' WHERE email = '...';
 */
const bcrypt = require('bcryptjs');

const password = process.argv[2];
if (!password || password.length < 8) {
  console.error('Usage: node scripts/hash-password.js "<password min 8 chars>"');
  process.exit(1);
}

bcrypt.hash(password, 12).then((hash) => {
  console.log(hash);
  console.log('\nSQL example:');
  console.log(`UPDATE users SET password = '${hash}' WHERE email = 'admin@example.com';`);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
