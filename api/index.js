const app = require('../server/src/app');
const connectDB = require('../server/src/config/db');

module.exports = async function handler(req, res) {
  const oidcToken = req.headers['x-vercel-oidc-token'];
  if (oidcToken) {
    process.env.VERCEL_OIDC_TOKEN = String(oidcToken);
  }

  try {
    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error('Database unavailable:', error.message);
    return res.status(503).json({ message: 'Database unavailable' });
  }
};