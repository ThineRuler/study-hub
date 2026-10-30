require('node:dns').setServers(['8.8.8.8', '1.1.1.1']); // works around the SRV DNS error
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/users', require('./routes/users'));

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const status = err.name === 'ValidationError' || err.name === 'CastError' ? 400 : 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: err.message || 'Server error' });
});

const port = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 })
  .then(async () => {
    await Promise.all(Object.values(mongoose.models).map((model) => model.init()));
    console.log('Connected to MongoDB, database:', mongoose.connection.name);
    app.listen(port, () => {
      console.log(`Server listening on ${port}`);
    });
  })
  .catch((err) => {
    console.error('Connection failed:', err.message);
    process.exit(1);
  });
