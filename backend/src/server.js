const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const routes = require('./routes');
require('dotenv').config();

// Read API key from file
try {
  const apiKeyPath = path.join(__dirname, 'api.key');
  const apiKey = fs.readFileSync(apiKeyPath, 'utf8').trim();
  process.env.ANTHROPIC_API_KEY = apiKey;
  console.log('API key loaded from file');
} catch (error) {
  console.error('Error loading API key from file:', error.message);
  console.warn('Will attempt to use API key from environment variables');
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});