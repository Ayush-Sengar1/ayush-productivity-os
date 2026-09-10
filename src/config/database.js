const mongoose = require('mongoose');
const env = require('./env');
const state = { connected: false, attempted: false };
async function connectDatabase() {
  state.attempted = true;
  if (!env.mongoUri) {
    console.warn('MongoDB URI not configured; using the in-memory development store.');
    return state;
  }
  try {
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 3500 });
    state.connected = true;
    console.log('MongoDB connected.');
  } catch (error) {
    console.warn('MongoDB unavailable; using the in-memory development store:', error.message);
  }
  return state;
}
module.exports = { state, connectDatabase };
