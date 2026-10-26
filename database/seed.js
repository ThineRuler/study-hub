// code for testing database models and seeding test data
// DEV ONLY: deletes all users and re-creates test accounts. Do not run against real data.

require('node:dns').setServers(['8.8.8.8', '1.1.1.1']);
require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to database:', mongoose.connection.name);

  await User.deleteMany({});  // clears old test users so you can re-run this remove after development testing

  const passwordHash = await bcrypt.hash('Password123!', 10);

  const users = await User.insertMany([
    { email: 'alice@test.com', passwordHash, displayName: 'Alice', isVerified: true },
    { email: 'bob@test.com',   passwordHash, displayName: 'Bob',   isVerified: true,
      settings: { theme: 'dark' } },
    { email: 'carol@test.com', passwordHash, displayName: 'Carol', isVerified: false }, // for testing the email-verification flow
  ]);

  console.log(`Inserted ${users.length} users`);
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});