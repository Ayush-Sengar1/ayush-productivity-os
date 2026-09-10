require('dotenv').config();
module.exports = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || '',
  sessionSecret: process.env.SESSION_SECRET || 'development-only-change-me',
  isProduction: process.env.NODE_ENV === 'production',
  seedEmail: process.env.SEED_EMAIL || 'ayush@example.com',
  seedPassword: process.env.SEED_PASSWORD || 'change-me-123'
};
