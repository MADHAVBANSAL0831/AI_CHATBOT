const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  contactName: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },
  contactEmail: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Veuillez entrer un email valide'],
    default: null
  },
  contactPhone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Veuillez entrer un numéro de téléphone valide'],
    default: null
  },
  platform: {
    type: String,
    required: true,
    enum: ['whatsapp', 'telegram', 'messenger', 'instagram', 'custom', 'web']
  },
  accountId: {
    type: String,
    required: true
  },
  contactId: {
    type: String,
    required: true
  },
  leadSource: {
    type: String,
    enum: ['auto-capture', 'manual', 'form-fill', 'keyword-trigger'],
    default: 'auto-capture'
  },
  leadScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'converted', 'lost', 'archived'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Les tags ne peuvent pas dépasser 50 caractères']
  }],
  notes: {
    type: String,
    maxlength: [2000, 'Les notes ne peuvent pas dépasser 2000 caractères'],
    default: ''
  },
  customFields: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  capturedData: {
    interests: [String],
    budget: {
      type: String,
      default: null
    },
    timeline: {
      type: String,
      default: null
    },
    company: {
      type: String,
      default: null
    },
    position: {
      type: String,
      default: null
    },
    location: {
      type: String,
      default: null
    }
  },
  followUpDate: {
    type: Date,
    default: null
  },
  lastContactDate: {
    type: Date,
    default: null
  },
  conversionDate: {
    type: Date,
    default: null
  },
  conversionValue: {
    type: Number,
    default: 0
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isNotified: {
    type: Boolean,
    default: false
  },
  notificationsSent: [{
    type: {
      type: String,
      enum: ['email', 'browser', 'webhook']
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['sent', 'failed', 'pending'],
      default: 'sent'
    }
  }],
  analytics: {
    messageCount: {
      type: Number,
      default: 0
    },
    sessionDuration: {
      type: Number,
      default: 0
    },
    responseTime: {
      type: Number,
      default: 0
    },
    engagementScore: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
leadSchema.index({ userId: 1, status: 1 });
leadSchema.index({ platform: 1, accountId: 1 });
leadSchema.index({ leadScore: -1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ followUpDate: 1 });
leadSchema.index({ contactEmail: 1 });
leadSchema.index({ contactPhone: 1 });

// Calculate lead score based on available data
leadSchema.methods.calculateLeadScore = function() {
  let score = 0;
  
  // Base score for being a lead
  score += 20;
  
  // Contact information completeness
  if (this.contactEmail) score += 25;
  if (this.contactPhone) score += 25;
  if (this.capturedData.company) score += 15;
  if (this.capturedData.position) score += 10;
  
  // Engagement metrics
  if (this.analytics.messageCount > 5) score += 10;
  if (this.analytics.sessionDuration > 300000) score += 10; // 5+ minutes
  
  // Interest indicators
  if (this.capturedData.interests && this.capturedData.interests.length > 0) score += 15;
  if (this.capturedData.budget) score += 20;
  if (this.capturedData.timeline) score += 15;
  
  // Recency bonus
  const daysSinceCreation = (Date.now() - this.createdAt) / (1000 * 60 * 60 * 24);
  if (daysSinceCreation < 1) score += 10;
  else if (daysSinceCreation < 7) score += 5;
  
  this.leadScore = Math.min(score, 100);
  return this.leadScore;
};

// Update status method
leadSchema.methods.updateStatus = function(newStatus, notes = '') {
  const oldStatus = this.status;
  this.status = newStatus;
  
  if (notes) {
    this.notes = this.notes ? `${this.notes}\n\n[${new Date().toISOString()}] Status changed from ${oldStatus} to ${newStatus}: ${notes}` : notes;
  }
  
  if (newStatus === 'converted') {
    this.conversionDate = new Date();
  }
  
  if (newStatus === 'contacted') {
    this.lastContactDate = new Date();
  }
  
  return this.save();
};

// Add notification record
leadSchema.methods.addNotification = function(type, status = 'sent') {
  this.notificationsSent.push({
    type,
    status,
    sentAt: new Date()
  });
  
  if (status === 'sent') {
    this.isNotified = true;
  }
  
  return this.save();
};

// Get contact summary
leadSchema.methods.getContactSummary = function() {
  return {
    name: this.contactName,
    email: this.contactEmail,
    phone: this.contactPhone,
    platform: this.platform,
    score: this.leadScore,
    status: this.status,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('Lead', leadSchema);
