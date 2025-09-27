const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Le nom du template est requis'],
    trim: true,
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'La description ne peut pas dépasser 500 caractères'],
    default: ''
  },
  category: {
    type: String,
    required: true,
    enum: [
      'greeting',           // Salutations
      'lead-capture',       // Capture de leads
      'product-info',       // Information produit
      'pricing',           // Tarification
      'support',           // Support client
      'appointment',       // Prise de rendez-vous
      'follow-up',         // Suivi
      'closing',           // Clôture
      'emergency',         // Urgence
      'custom'             // Personnalisé
    ]
  },
  language: {
    type: String,
    default: 'fr',
    enum: ['fr', 'en']
  },
  content: {
    type: String,
    required: [true, 'Le contenu du template est requis'],
    maxlength: [2000, 'Le contenu ne peut pas dépasser 2000 caractères']
  },
  variables: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    defaultValue: {
      type: String,
      default: ''
    },
    required: {
      type: Boolean,
      default: false
    }
  }],
  triggers: [{
    type: {
      type: String,
      enum: ['keyword', 'intent', 'time-based', 'manual'],
      required: true
    },
    value: {
      type: String,
      required: true
    },
    caseSensitive: {
      type: Boolean,
      default: false
    },
    exactMatch: {
      type: Boolean,
      default: false
    }
  }],
  conditions: {
    platforms: [{
      type: String,
      enum: ['whatsapp', 'telegram', 'messenger', 'instagram', 'custom']
    }],
    timeRestrictions: {
      enabled: {
        type: Boolean,
        default: false
      },
      startTime: {
        type: String,
        default: '09:00'
      },
      endTime: {
        type: String,
        default: '18:00'
      },
      timezone: {
        type: String,
        default: 'Europe/Paris'
      },
      weekdays: [{
        type: Number,
        min: 0,
        max: 6 // 0 = Sunday, 6 = Saturday
      }]
    },
    userSegments: [{
      type: String,
      enum: ['new', 'returning', 'lead', 'customer', 'vip']
    }]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  usage: {
    totalUses: {
      type: Number,
      default: 0
    },
    lastUsed: {
      type: Date,
      default: null
    },
    successRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  analytics: {
    impressions: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    conversions: {
      type: Number,
      default: 0
    },
    averageResponseTime: {
      type: Number,
      default: 0
    }
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Les tags ne peuvent pas dépasser 50 caractères']
  }],
  isDefault: {
    type: Boolean,
    default: false
  },
  parentTemplate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better performance
templateSchema.index({ userId: 1, category: 1 });
templateSchema.index({ isActive: 1, priority: -1 });
templateSchema.index({ 'triggers.type': 1, 'triggers.value': 1 });
templateSchema.index({ language: 1 });
templateSchema.index({ tags: 1 });

// Process template content with variables
templateSchema.methods.processContent = function(variables = {}) {
  let processedContent = this.content;
  
  // Replace variables in the format {{variableName}}
  this.variables.forEach(variable => {
    const placeholder = `{{${variable.name}}}`;
    const value = variables[variable.name] || variable.defaultValue || '';
    processedContent = processedContent.replace(new RegExp(placeholder, 'g'), value);
  });
  
  // Replace common system variables
  const systemVariables = {
    '{{currentTime}}': new Date().toLocaleTimeString('fr-FR'),
    '{{currentDate}}': new Date().toLocaleDateString('fr-FR'),
    '{{currentDateTime}}': new Date().toLocaleString('fr-FR')
  };
  
  Object.entries(systemVariables).forEach(([placeholder, value]) => {
    processedContent = processedContent.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
  });
  
  return processedContent;
};

// Check if template matches trigger
templateSchema.methods.matchesTrigger = function(message, context = {}) {
  if (!this.isActive) return false;
  
  // Check platform restrictions
  if (this.conditions.platforms.length > 0 && context.platform) {
    if (!this.conditions.platforms.includes(context.platform)) return false;
  }
  
  // Check time restrictions
  if (this.conditions.timeRestrictions.enabled) {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const currentDay = now.getDay();
    
    if (this.conditions.timeRestrictions.weekdays.length > 0) {
      if (!this.conditions.timeRestrictions.weekdays.includes(currentDay)) return false;
    }
    
    if (currentTime < this.conditions.timeRestrictions.startTime || 
        currentTime > this.conditions.timeRestrictions.endTime) {
      return false;
    }
  }
  
  // Check triggers
  return this.triggers.some(trigger => {
    switch (trigger.type) {
      case 'keyword':
        const messageText = trigger.caseSensitive ? message : message.toLowerCase();
        const triggerValue = trigger.caseSensitive ? trigger.value : trigger.value.toLowerCase();
        
        if (trigger.exactMatch) {
          return messageText === triggerValue;
        } else {
          return messageText.includes(triggerValue);
        }
      
      case 'intent':
        // This would integrate with NLP service to detect intent
        return context.detectedIntent === trigger.value;
      
      case 'manual':
        return context.manualTrigger === trigger.value;
      
      default:
        return false;
    }
  });
};

// Update usage statistics
templateSchema.methods.recordUsage = function(success = true) {
  this.usage.totalUses += 1;
  this.usage.lastUsed = new Date();
  
  if (success) {
    this.analytics.conversions += 1;
  }
  
  // Calculate success rate
  this.usage.successRate = (this.analytics.conversions / this.usage.totalUses) * 100;
  
  return this.save();
};

// Clone template
templateSchema.methods.clone = function(newName, userId) {
  const clonedTemplate = new this.constructor({
    ...this.toObject(),
    _id: undefined,
    name: newName || `${this.name} (Copie)`,
    userId: userId || this.userId,
    parentTemplate: this._id,
    usage: {
      totalUses: 0,
      lastUsed: null,
      successRate: 0
    },
    analytics: {
      impressions: 0,
      clicks: 0,
      conversions: 0,
      averageResponseTime: 0
    },
    createdAt: undefined,
    updatedAt: undefined
  });
  
  return clonedTemplate.save();
};

module.exports = mongoose.model('Template', templateSchema);
