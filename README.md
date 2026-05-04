# Portfolio Backend

A comprehensive backend system for the portfolio website with real-time contact form processing, analytics tracking, and email notifications.

## Features

- **Contact Form Processing** with validation and email notifications
- **Analytics Dashboard** tracking visits and downloads
- **Rate Limiting** for API protection
- **Email Notifications** with auto-reply functionality
- **Data Validation** using Joi and express-validator
- **Security Headers** with Helmet
- **CORS Support** for frontend integration
- **Compression** for better performance
- **Request Logging** with Morgan

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Gmail credentials:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

3. **Start the server:**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Contact Form
- `POST /api/contact` - Submit contact form
- `GET /api/messages` - Get all messages (admin)
- `PATCH /api/messages/:id/read` - Mark message as read
- `DELETE /api/messages/:id` - Delete message

### Analytics
- `GET /api/analytics` - Get analytics data
- `POST /api/download/:type` - Track downloads
- `GET /api/stats` - Get comprehensive statistics

## Email Setup

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for this application
3. Use the app password in the `EMAIL_PASS` environment variable

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Comprehensive validation for all inputs
- **CORS Protection**: Configured for specific origins
- **Security Headers**: Helmet.js for security headers
- **Input Sanitization**: Protection against XSS attacks

## Data Storage

Currently uses in-memory storage for demo purposes. For production, consider:
- MongoDB for persistent storage
- PostgreSQL for relational data
- Redis for caching

## Deployment

### Using PM2 (Recommended)
```bash
npm install -g pm2
pm2 start server.js --name "portfolio-backend"
pm2 startup
pm2 save
```

### Using Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## Monitoring

The server includes comprehensive logging and monitoring:
- Request logging with Morgan
- Performance metrics
- Error tracking
- Memory usage monitoring

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3001 |
| NODE_ENV | Environment mode | development |
| EMAIL_USER | Gmail address | Required |
| EMAIL_PASS | Gmail app password | Required |
| CORS_ORIGIN | Allowed frontend origin | http://localhost:8000 |

## API Response Format

All APIs return consistent JSON responses:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]
}
```

## Testing

```bash
# Run tests
npm test

# Test specific endpoint
curl -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","subject":"Test","message":"Hello!"}'
```

## License

MIT License - feel free to use this for your projects!
