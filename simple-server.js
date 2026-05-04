const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the portfolio directory
app.use(express.static(path.join(__dirname)));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Portfolio backend is running!'
  });
});

// Contact form endpoint
app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body;
  
  console.log('New contact form submission:', {
    name,
    email,
    subject,
    message,
    timestamp: new Date().toISOString()
  });
  
  res.json({
    success: true,
    message: 'Message sent successfully! I will get back to you soon.'
  });
});

// Download tracking
app.post('/api/download/:type', (req, res) => {
  const { type } = req.params;
  console.log(`Download tracked: ${type}`);
  
  res.json({
    success: true,
    message: `${type} download tracked successfully`,
    downloadCount: Math.floor(Math.random() * 100) + 1
  });
});

// Analytics endpoint
app.get('/api/analytics', (req, res) => {
  res.json({
    success: true,
    data: {
      visits: Math.floor(Math.random() * 1000) + 100,
      downloads: {
        resume: Math.floor(Math.random() * 50) + 10,
        portfolio: Math.floor(Math.random() * 30) + 5,
        code: Math.floor(Math.random() * 20) + 3,
        guides: Math.floor(Math.random() * 25) + 7
      },
      lastUpdated: new Date()
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Portfolio server running on http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${path.join(__dirname)}`);
  console.log(`🌐 Frontend available at: http://localhost:${PORT}/dillu.html`);
});

module.exports = app;
