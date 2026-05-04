# 🗄️ MongoDB Setup Instructions

## Prerequisites

1. **Install MongoDB** on your system:
   - **Windows**: Download from https://www.mongodb.com/try/download/community
   - **Mac**: `brew install mongodb-community`
   - **Linux**: `sudo apt-get install mongodb`

2. **Start MongoDB Service**:
   - **Windows**: Start MongoDB service from Services
   - **Mac**: `brew services start mongodb/brew/mongodb-community`
   - **Linux**: `sudo systemctl start mongod`

## Quick Start

### Step 1: Start MongoDB
```bash
# On Windows
net start MongoDB

# On Mac/Linux
sudo systemctl start mongod
# or
mongod
```

### Step 2: Run Portfolio Backend
```bash
cd "C:\Users\DELL\Documents\New folder (2)\portfolio"
npm run mongodb
```

### Step 3: Access Your Portfolio
- Open: `http://localhost:3001/dillu.html`

## 🗄️ Database Features

### **Collections Created:**
1. **messages** - Contact form submissions
2. **analytics** - Visit and download tracking

### **Data Structure:**

#### Messages Collection:
```json
{
  "name": "John Doe",
  "email": "john@example.com", 
  "subject": "Project Inquiry",
  "message": "I'd like to discuss a project...",
  "timestamp": "2024-03-15T10:30:00Z",
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "status": "unread",
  "readAt": null
}
```

#### Analytics Collection:
```json
{
  "visits": 150,
  "downloads": {
    "resume": 25,
    "portfolio": 15,
    "code": 8,
    "guides": 12
  },
  "events": [
    {
      "eventName": "page_view",
      "data": {"page": "/home"},
      "timestamp": "2024-03-15T10:30:00Z",
      "userAgent": "Mozilla/5.0...",
      "sessionId": "session_1234567890",
      "ip": "192.168.1.1"
    }
  ],
  "lastUpdated": "2024-03-15T10:30:00Z"
}
```

## 📊 API Endpoints

### **Contact Management:**
- `POST /api/contact` - Submit contact form
- `GET /api/messages` - Get all messages
- `PATCH /api/messages/:id/read` - Mark as read
- `DELETE /api/messages/:id` - Delete message

### **Analytics:**
- `GET /api/analytics` - Get analytics data
- `POST /api/download/:type` - Track downloads
- `GET /api/stats` - Get comprehensive statistics

### **System:**
- `GET /api/health` - Health check with DB status

## 🔧 MongoDB Commands

### **Connect to MongoDB:**
```bash
mongo
# or
mongosh
```

### **View Collections:**
```javascript
use portfolio
show collections
```

### **Query Messages:**
```javascript
db.messages.find().sort({timestamp: -1})
```

### **Query Analytics:**
```javascript
db.analytics.findOne()
```

### **Count Messages:**
```javascript
db.messages.countDocuments()
```

## 🚀 Package Scripts

Add these to your package.json:

```json
{
  "scripts": {
    "start": "node mongodb-server.js",
    "dev": "nodemon mongodb-server.js",
    "mongodb": "node mongodb-server.js"
  }
}
```

## 📱 Features with MongoDB

### **✅ Persistent Storage:**
- Contact messages saved to database
- Analytics data persists across server restarts
- Real-time data tracking

### **✅ Advanced Queries:**
- Filter messages by status (read/unread)
- Sort by timestamp
- Aggregate statistics

### **✅ Data Management:**
- Mark messages as read
- Delete old messages
- Export data for analysis

### **✅ Performance:**
- Indexed fields for fast queries
- Efficient data retrieval
- Scalable architecture

## 🔍 Troubleshooting

### **MongoDB Connection Issues:**
```bash
# Check if MongoDB is running
net stat -ano | findstr :27017

# Start MongoDB service
net start MongoDB
```

### **Database Creation:**
```javascript
// MongoDB automatically creates the database
// when you first save data
use portfolio
```

### **Reset Database:**
```javascript
use portfolio
db.dropDatabase()
```

## 🌟 Benefits of MongoDB

1. **NoSQL Flexibility** - Easy schema changes
2. **Scalability** - Handle growing data
3. **Performance** - Fast queries with indexing
4. **Rich Queries** - Complex data operations
5. **JSON Documents** - Native JavaScript support

Your portfolio now has professional-grade data persistence! 🎉
