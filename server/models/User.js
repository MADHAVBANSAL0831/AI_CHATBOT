const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Le nom d\'utilisateur est requis'],
    unique: true,
    trim: true,
    minlength: [3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères'],
    maxlength: [30, 'Le nom d\'utilisateur ne peut pas dépasser 30 caractères']
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Veuillez entrer un email valide']
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères']
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  accounts: [{
    platform: {
      type: String,
      required: true,
      enum: ['whatsapp', 'telegram', 'messenger', 'instagram', 'custom']
    },
    accountId: {
      type: String,
      required: true
    },
    accountName: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    credentials: {
      type: mongoose.Schema.Types.Mixed, // Encrypted credentials
      required: false
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  settings: {
    language: {
      type: String,
      default: 'fr',
      enum: ['fr', 'en']
    },
    autoReplyEnabled: {
      type: Boolean,
      default: true
    },
    responseDelay: {
      type: Number,
      default: 1000, // milliseconds
      min: 0,
      max: 30000
    },
    workingHours: {
      enabled: {
        type: Boolean,
        default: false
      },
      start: {
        type: String,
        default: '09:00'
      },
      end: {
        type: String,
        default: '18:00'
      },
      timezone: {
        type: String,
        default: 'Europe/Paris'
      }
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      browser: {
        type: Boolean,
        default: true
      },
      leadCapture: {
        type: Boolean,
        default: true
      }
    }
  }
}, {
  timestamps: true
});

// Index for better performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ 'accounts.platform': 1, 'accounts.accountId': 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Get active accounts
userSchema.methods.getActiveAccounts = function() {
  return this.accounts.filter(account => account.isActive);
};

// Add account method
userSchema.methods.addAccount = function(accountData) {
  this.accounts.push(accountData);
  return this.save();
};

// Remove account method
userSchema.methods.removeAccount = function(accountId) {
  this.accounts = this.accounts.filter(account => account._id.toString() !== accountId);
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
