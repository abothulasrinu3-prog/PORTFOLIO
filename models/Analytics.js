const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  visits: {
    type: Number,
    default: 0
  },
  downloads: {
    resume: { type: Number, default: 0 },
    portfolio: { type: Number, default: 0 },
    code: { type: Number, default: 0 },
    guides: { type: Number, default: 0 }
  },
  events: [{
    eventName: String,
    data: mongoose.Schema.Types.Mixed,
    timestamp: { type: Date, default: Date.now },
    userAgent: String,
    sessionId: String,
    ip: String
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Static method to get or create analytics
analyticsSchema.statics.getAnalytics = async function() {
  let analytics = await this.findOne();
  if (!analytics) {
    analytics = await this.create({});
  }
  return analytics;
};

// Static method to track event
analyticsSchema.statics.trackEvent = async function(eventName, data = {}, userAgent = '', sessionId = '', ip = '') {
  await this.getAnalytics();
  return this.updateOne(
    {},
    {
      $push: {
        events: {
          eventName,
          data,
          timestamp: new Date(),
          userAgent,
          sessionId,
          ip
        }
      },
      $inc: { visits: 1 },
      $set: { lastUpdated: new Date() }
    },
    { upsert: true }
  );
};

// Static method to track download
analyticsSchema.statics.trackDownload = async function(type) {
  const validTypes = ['resume', 'portfolio', 'code', 'guides'];
  if (!validTypes.includes(type)) {
    throw new Error('Invalid download type');
  }
  
  return this.updateOne(
    {},
    {
      $inc: { [`downloads.${type}`]: 1 },
      $set: { lastUpdated: new Date() }
    },
    { upsert: true }
  );
};

module.exports = mongoose.model('Analytics', analyticsSchema);
