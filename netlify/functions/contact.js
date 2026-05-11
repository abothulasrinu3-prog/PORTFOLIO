const nodemailer = require('nodemailer');
require('dotenv').config();

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  },
  body: JSON.stringify(body)
});

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return json(200, { success: true });
  }

  if (event.httpMethod !== 'POST') {
    return json(405, {
      success: false,
      message: 'Method not allowed.'
    });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (error) {
    return json(400, {
      success: false,
      message: 'Invalid request body.'
    });
  }

  const name = String(payload.name || '').trim();
  const email = String(payload.email || '').trim();
  const subject = String(payload.subject || '').trim();
  const message = String(payload.message || '').trim();
  const phone = String(payload.phone || '').trim();
  const company = String(payload.company || '').trim();
  const priority = String(payload.priority || '').trim();
  const projectType = String(payload.projectType || '').trim();

  if (!name || !email || !subject || !message) {
    return json(400, {
      success: false,
      message: 'Please fill in all required fields.'
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return json(400, {
      success: false,
      message: 'Please enter a valid email address.'
    });
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return json(500, {
      success: false,
      message: 'Email service is not configured.'
    });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const ownerEmail = process.env.CONTACT_TO || process.env.EMAIL_USER;
  const safe = {
    name: escapeHtml(name),
    email: escapeHtml(email),
    subject: escapeHtml(subject),
    message: escapeHtml(message).replace(/\n/g, '<br>'),
    phone: escapeHtml(phone),
    company: escapeHtml(company),
    priority: escapeHtml(priority),
    projectType: escapeHtml(projectType)
  };

  const optionalRows = [
    phone && ['Phone', safe.phone],
    company && ['Company', safe.company],
    priority && ['Priority', safe.priority],
    projectType && ['Project Type', safe.projectType]
  ]
    .filter(Boolean)
    .map(([label, value]) => `
      <tr>
        <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">${label}</td>
        <td style="padding: 12px; border: 1px solid #ddd;">${value}</td>
      </tr>
    `)
    .join('');

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: ownerEmail,
      replyTo: email,
      subject: `Portfolio Contact: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
          <h2 style="color: #00bcd4; border-bottom: 2px solid #00bcd4; padding-bottom: 10px;">New Contact Form Submission</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px; background: #fff;">
            <tr>
              <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; width: 30%;">Name</td>
              <td style="padding: 12px; border: 1px solid #ddd;">${safe.name}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Email</td>
              <td style="padding: 12px; border: 1px solid #ddd;"><a href="mailto:${safe.email}" style="color: #00bcd4;">${safe.email}</a></td>
            </tr>
            ${optionalRows}
            <tr>
              <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Subject</td>
              <td style="padding: 12px; border: 1px solid #ddd;">${safe.subject}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold;">Message</td>
              <td style="padding: 12px; border: 1px solid #ddd;">${safe.message}</td>
            </tr>
          </table>
          <p style="margin-top: 20px; color: #666; font-size: 12px;">Received on: ${new Date().toLocaleString()}</p>
        </div>
      `
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Thank you for contacting me!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
          <h2 style="color: #00bcd4;">Thank You for Reaching Out!</h2>
          <p>Dear ${safe.name},</p>
          <p>Thank you for contacting me through my portfolio website. I have received your message and will get back to you within 24-48 hours.</p>
          <div style="background: #fff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Your Message Summary:</h3>
            <p><strong>Subject:</strong> ${safe.subject}</p>
            <p><strong>Message:</strong><br>${safe.message}</p>
          </div>
          <p>Best regards,<br><strong>Abothula Srinu</strong><br>Frontend Developer & Web Designer</p>
        </div>
      `
    });

    return json(201, {
      success: true,
      message: 'Message sent successfully! You will receive a confirmation email shortly.',
      data: {
        id: Date.now(),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    return json(500, {
      success: false,
      message: 'Failed to send message. Please try again or contact directly via email.',
      error: error.message
    });
  }
};
