const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
    enum: ['user', 'bot']
  },
  content: {
    type: String,
    required: true,
    maxlength: [2000, 'Le message ne peut pas dépasser 2000 caractères']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'audio', 'video'],
    default: 'text'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isAutoReply: {
    type: Boolean,
    default: false
  },
  templateUsed: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    default: null
  },
  processingTime: {
    type: Number, // milliseconds
    default: null
  }
});

const conversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  accountId: {
    type: String,
    required: true
  },
  platform: {
    type: String,
    required: true,
    enum: ['whatsapp', 'telegram', 'messenger', 'instagram', 'custom', 'web']
  },
  contactId: {
    type: String,
    required: true
  },
  contactName: {
    type: String,
    default: 'Utilisateur Anonyme'
  },
  contactPhone: {
    type: String,
    default: null
  },
  contactEmail: {
    type: String,
    default: null
  },
  messages: [messageSchema],
  status: {
    type: String,
    enum: ['active', 'paused', 'closed', 'archived'],
    default: 'active'
  },
  isLeadCaptured: {
    type: Boolean,
    default: false
  },
  leadScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    maxlength: [1000, 'Les notes ne peuvent pas dépasser 1000 caractères'],
    default: ''
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  autoReplyEnabled: {
    type: Boolean,
    default: true
  },
  language: {
    type: String,
    default: 'fr',
    enum: ['fr', 'en']
  },
  context: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  statistics: {
    totalMessages: {
      type: Number,
      default: 0
    },
    userMessages: {
      type: Number,
      default: 0
    },
    botMessages: {
      type: Number,
      default: 0
    },
    averageResponseTime: {
      type: Number,
      default: 0
    },
    sessionDuration: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
conversationSchema.index({ userId: 1, platform: 1, contactId: 1 });
conversationSchema.index({ lastActivity: -1 });
conversationSchema.index({ status: 1 });
conversationSchema.index({ isLeadCaptured: 1 });
conversationSchema.index({ platform: 1, accountId: 1 });

// Update last activity on message add
conversationSchema.pre('save', function(next) {
  if (this.isModified('messages')) {
    this.lastActivity = new Date();
    this.statistics.totalMessages = this.messages.length;
    this.statistics.userMessages = this.messages.filter(msg => msg.sender === 'user').length;
    this.statistics.botMessages = this.messages.filter(msg => msg.sender === 'bot').length;
  }
  next();
});

// Add message method
conversationSchema.methods.addMessage = function(messageData) {
  this.messages.push(messageData);
  this.lastActivity = new Date();
  return this.save();
};

// Get recent messages
conversationSchema.methods.getRecentMessages = function(limit = 10) {
  return this.messages.slice(-limit);
};

// Calculate lead score based on conversation activity
conversationSchema.methods.calculateLeadScore = function() {
  let score = 0;
  
  // Base score for having a conversation
  score += 10;
  
  // Score based on message count
  score += Math.min(this.statistics.userMessages * 5, 30);
  
  // Score for providing contact information
  if (this.contactPhone) score += 20;
  if (this.contactEmail) score += 20;
  
  // Score for conversation length
  if (this.statistics.sessionDuration > 300000) score += 10; // 5+ minutes
  
  // Score for recent activity
  const daysSinceLastActivity = (Date.now() - this.lastActivity) / (1000 * 60 * 60 * 24);
  if (daysSinceLastActivity < 1) score += 10;
  
  this.leadScore = Math.min(score, 100);
  return this.leadScore;
};

// Mark as lead captured
conversationSchema.methods.markAsLead = function() {
  this.isLeadCaptured = true;
  this.calculateLeadScore();
  return this.save();
};

module.exports = mongoose.model('Conversation', conversationSchema);
