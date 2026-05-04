const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

// Import models
const Message = require('./models/Message');
const Analytics = require('./models/Analytics');
const connectDB = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: ['http://localhost:8000', 'file://', 'http://127.0.0.1:8000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname)));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Analytics endpoint
app.get('/api/analytics', async (req, res) => {
  try {
    const analytics = await Analytics.getAnalytics();
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
});

// Download tracking
app.post('/api/download/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const validTypes = ['resume', 'portfolio', 'code', 'guides'];
    
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid download type'
      });
    }
    
    await Analytics.trackDownload(type);
    const analytics = await Analytics.getAnalytics();
    
    console.log(`Download tracked: ${type}`);
    
    res.json({
      success: true,
      message: `${type} download tracked successfully`,
      downloadCount: analytics.downloads[type]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to track download',
      error: error.message
    });
  }
});

// Contact form submission
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }
    
    // Create new message
    const newMessage = new Message({
      name,
      email,
      subject,
      message,
      ip: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown'
    });
    
    await newMessage.save();
    
    console.log('New contact form submission:', {
      name,
      email,
      subject,
      timestamp: new Date().toISOString()
    });
    
    res.status(201).json({
      success: true,
      message: 'Message sent successfully! I will get back to you soon.',
      data: {
        id: newMessage._id,
        timestamp: newMessage.timestamp
      }
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
});

// Get all messages (admin endpoint)
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: -1 });
    res.json({
      success: true,
      data: messages,
      count: messages.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
});

// Mark message as read
app.patch('/api/messages/:id/read', async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { status: 'read', readAt: new Date() },
      { new: true }
    );
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Message marked as read',
      data: message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update message',
      error: error.message
    });
  }
});

// Delete message
app.delete('/api/messages/:id', async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Message deleted successfully',
      data: message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: error.message
    });
  }
});

// Get statistics
app.get('/api/stats', async (req, res) => {
  try {
    const [messageStats, analytics] = await Promise.all([
      Message.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            unread: { $sum: { $cond: [{ $eq: ['$status', 'unread'] }, 1, 0] } },
            read: { $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] } }
          }
        }
      ]),
      Analytics.getAnalytics()
    ]);
    
    const stats = {
      messages: messageStats[0] || { total: 0, unread: 0, read: 0 },
      analytics: analytics,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: '1.0.0'
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Portfolio backend server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📧 Contact endpoint: http://localhost:${PORT}/api/contact`);
  console.log(`📈 Analytics: http://localhost:${PORT}/api/analytics`);
  console.log(`🌐 Frontend: http://localhost:${PORT}/dillu.html`);
  console.log(`🗄️  MongoDB: Connected to portfolio database`);
  console.log(`\n✅ Server is ready! Your portfolio with MongoDB is running.`);
});

module.exports = app;
