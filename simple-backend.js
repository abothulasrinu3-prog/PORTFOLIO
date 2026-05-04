const express = require('express');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(cors({
  origin: ['http://localhost:8000', 'file://', 'http://127.0.0.1:8000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Email Transporter Configuration
console.log('📧 Email User:', process.env.EMAIL_USER);
console.log('📧 Email Pass length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify email configuration
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Email configuration error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// Root route - serve the main portfolio page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dillu.html'));
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
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

// Download tracking
app.post('/api/download/:type', (req, res) => {
  const { type } = req.params;
  const validTypes = ['resume', 'portfolio', 'code', 'guides'];
  
  if (!validTypes.includes(type)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid download type'
    });
  }
  
  console.log(`Download tracked: ${type}`);
  
  res.json({
    success: true,
    message: `${type} download tracked successfully`,
    downloadCount: Math.floor(Math.random() * 100) + 1
  });
});

// Contact form submission with email sending
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message, phone, company, priority, projectType } = req.body;

  console.log('New contact form submission:', {
    name,
    email,
    subject,
    message,
    phone,
    company,
    priority,
    projectType,
    timestamp: new Date().toISOString()
  });

  try {
    // Email to you (portfolio owner)
    const mailToOwner = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `Portfolio Contact: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
          <h2 style="color: #00bcd4; border-bottom: 2px solid #00bcd4; padding-bottom: 10px;">New Contact Form Submission</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr style="background: #fff;">
              <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; width: 30%;">Name</td>
              <td style="padding: 12px; border: 1px solid #ddd;">${name}</td>
            </tr>
            <tr style="background: #f9f9f9;">
              <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Email</td>
              <td style="padding: 12px; border: 1px solid #ddd;"><a href="mailto:${email}" style="color: #00bcd4;">${email}</a></td>
            </tr>
            ${phone ? `<tr style="background: #fff;"><td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Phone</td><td style="padding: 12px; border: 1px solid #ddd;">${phone}</td></tr>` : ''}
            ${company ? `<tr style="background: #f9f9f9;"><td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Company</td><td style="padding: 12px; border: 1px solid #ddd;">${company}</td></tr>` : ''}
            ${priority ? `<tr style="background: #fff;"><td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Priority</td><td style="padding: 12px; border: 1px solid #ddd;">${priority}</td></tr>` : ''}
            ${projectType ? `<tr style="background: #f9f9f9;"><td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Project Type</td><td style="padding: 12px; border: 1px solid #ddd;">${projectType}</td></tr>` : ''}
            <tr style="background: #fff;">
              <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Subject</td>
              <td style="padding: 12px; border: 1px solid #ddd;">${subject}</td>
            </tr>
            <tr style="background: #f9f9f9;">
              <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Message</td>
              <td style="padding: 12px; border: 1px solid #ddd;">${message}</td>
            </tr>
          </table>
          <p style="margin-top: 20px; color: #666; font-size: 12px;">Received on: ${new Date().toLocaleString()}</p>
        </div>
      `
    };

    // Confirmation email to sender
    const mailToSender = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Thank you for contacting me!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
          <h2 style="color: #00bcd4;">Thank You for Reaching Out!</h2>
          <p>Dear ${name},</p>
          <p>Thank you for contacting me through my portfolio website. I have received your message and will get back to you within 24-48 hours.</p>
          <div style="background: #fff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Your Message Summary:</h3>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong> ${message}</p>
          </div>
          <p>Best regards,<br><strong>Abothula Srinu</strong><br>Frontend Developer & Web Designer</p>
        </div>
      `
    };

    // Send both emails
    await transporter.sendMail(mailToOwner);
    await transporter.sendMail(mailToSender);

    console.log('✅ Emails sent successfully');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully! You will receive a confirmation email shortly.',
      data: {
        id: Date.now(),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Error sending email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again or contact directly via email.',
      error: error.message
    });
  }
});

// Get all messages (admin endpoint)
app.get('/api/messages', (req, res) => {
  res.json({
    success: true,
    data: [],
    count: 0
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
      events: [],
      lastUpdated: new Date().toISOString()
    }
  });
});

// Get statistics
app.get('/api/stats', (req, res) => {
  const stats = {
    messages: {
      total: 0,
      unread: 0,
      read: 0
    },
    analytics: {
      visits: Math.floor(Math.random() * 1000) + 100,
      downloads: {
        resume: Math.floor(Math.random() * 50) + 10,
        portfolio: Math.floor(Math.random() * 30) + 5,
        code: Math.floor(Math.random() * 20) + 3,
        guides: Math.floor(Math.random() * 25) + 7
      }
    },
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '1.0.0'
  };
  
  res.json({
    success: true,
    data: stats
  });
});

// Error handling
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
  console.log(`\n✅ Server is ready! Your portfolio backend is running.`);
});

module.exports = app;
