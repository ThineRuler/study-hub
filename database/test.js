// for connection testing only, not used in production
require('node:dns').setServers(['8.8.8.8', '1.1.1.1']); // works around the SRV DNS error
require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const mongoose = require('mongoose');

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
    console.log('Connected to MongoDB, database:', mongoose.connection.name);
  } catch (err) {
    console.error('Connection failed:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

main();

