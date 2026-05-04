const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const Joi = require('joi');
const morgan = require('morgan');
const compression = require('compression');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://unpkg.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
      connectSrc: ["'self'"]
    }
  }
}));

app.use(compression());
app.use(cors({
  origin: ['http://localhost:8000', 'file://', 'http://127.0.0.1:8000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});

app.use('/api/', limiter);

// In-memory storage (for demo purposes)
const messages = [];
const analytics = {
  visits: 0,
  downloads: {
    resume: 0,
    portfolio: 0,
    code: 0,
    guides: 0
  },
  lastUpdated: new Date()
};

// Validation schemas
const contactSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name must not exceed 50 characters'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address',
    'string.empty': 'Email is required'
  }),
  subject: Joi.string().min(5).max(100).required().messages({
    'string.empty': 'Subject is required',
    'string.min': 'Subject must be at least 5 characters',
    'string.max': 'Subject must not exceed 100 characters'
  }),
  message: Joi.string().min(10).max(500).required().messages({
    'string.empty': 'Message is required',
    'string.min': 'Message must be at least 10 characters',
    'string.max': 'Message must not exceed 500 characters'
  })
});

// Email transporter configuration
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// Get analytics data
app.get('/api/analytics', (req, res) => {
  analytics.visits++;
  analytics.lastUpdated = new Date();
  
  res.json({
    success: true,
    data: analytics
  });
});

// Track downloads
app.post('/api/download/:type', (req, res) => {
  const { type } = req.params;
  const validTypes = ['resume', 'portfolio', 'code', 'guides'];
  
  if (!validTypes.includes(type)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid download type'
    });
  }
  
  analytics.downloads[type]++;
  analytics.lastUpdated = new Date();
  
  res.json({
    success: true,
    message: `${type} download tracked successfully`,
    downloadCount: analytics.downloads[type]
  });
});

// Get all messages (admin endpoint)
app.get('/api/messages', (req, res) => {
  res.json({
    success: true,
    data: messages,
    count: messages.length
  });
});

// Submit contact form
app.post('/api/contact', [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('subject').trim().isLength({ min: 5, max: 100 }).withMessage('Subject must be 5-100 characters'),
  body('message').trim().isLength({ min: 10, max: 500 }).withMessage('Message must be 10-500 characters')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, subject, message } = req.body;

    // Additional validation using Joi
    const { error } = contactSchema.validate({ name, email, subject, message });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Create message object
    const messageData = {
      id: Date.now(),
      name,
      email,
      subject,
      message,
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      status: 'unread'
    };

    // Store message
    messages.push(messageData);

    // Send email notification
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'srinuabothula14@gmail.com',
        subject: `New Contact Form Message: ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0ef; border-bottom: 2px solid #0ef; padding-bottom: 10px;">
              New Contact Form Submission
            </h2>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Subject:</strong> ${subject}</p>
              <p><strong>Message:</strong></p>
              <div style="background: white; padding: 15px; border-left: 4px solid #0ef; margin: 10px 0;">
                ${message.replace(/\n/g, '<br>')}
              </div>
              <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>IP Address:</strong> ${req.ip}</p>
            </div>
            <p style="color: #666; font-size: 12px;">
              This message was sent from your portfolio website contact form.
            </p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('Email notification sent successfully');
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Continue even if email fails
    }

    // Send auto-reply to user
    try {
      const autoReplyOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Thank you for contacting me - Abothula Srinu',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0ef;">Thank you for reaching out!</h2>
            <p>Dear ${name},</p>
            <p>Thank you for contacting me through my portfolio website. I have received your message and will get back to you as soon as possible.</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Your message:</strong></p>
              <div style="background: white; padding: 15px; border-left: 4px solid #0ef; margin: 10px 0;">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>
            <p>Best regards,<br><strong>Abothula Srinu</strong></p>
            <p style="color: #666; font-size: 12px;">
              This is an automated response. Please do not reply to this email.
            </p>
          </div>
        `
      };

      await transporter.sendMail(autoReplyOptions);
      console.log('Auto-reply sent successfully');
    } catch (autoReplyError) {
      console.error('Failed to send auto-reply:', autoReplyError);
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully! I will get back to you soon.',
      data: {
        id: messageData.id,
        timestamp: messageData.timestamp
      }
    });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
});

// Mark message as read
app.patch('/api/messages/:id/read', (req, res) => {
  const { id } = req.params;
  const message = messages.find(msg => msg.id == id);
  
  if (!message) {
    return res.status(404).json({
      success: false,
      message: 'Message not found'
    });
  }
  
  message.status = 'read';
  message.readAt = new Date().toISOString();
  
  res.json({
    success: true,
    message: 'Message marked as read',
    data: message
  });
});

// Delete message
app.delete('/api/messages/:id', (req, res) => {
  const { id } = req.params;
  const index = messages.findIndex(msg => msg.id == id);
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: 'Message not found'
    });
  }
  
  const deletedMessage = messages.splice(index, 1)[0];
  
  res.json({
    success: true,
    message: 'Message deleted successfully',
    data: deletedMessage
  });
});

// Get portfolio statistics
app.get('/api/stats', (req, res) => {
  const stats = {
    messages: {
      total: messages.length,
      unread: messages.filter(msg => msg.status === 'unread').length,
      read: messages.filter(msg => msg.status === 'read').length
    },
    analytics,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '1.0.0'
  };
  
  res.json({
    success: true,
    data: stats
  });
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
});

module.exports = app;
