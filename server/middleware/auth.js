const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        message: 'Token d\'accès requis',
        error: 'NO_TOKEN'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Utilisateur non trouvé',
        error: 'USER_NOT_FOUND'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        message: 'Compte utilisateur désactivé',
        error: 'ACCOUNT_DISABLED'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Token invalide',
        error: 'INVALID_TOKEN'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expiré',
        error: 'TOKEN_EXPIRED'
      });
    }

    console.error('Erreur d\'authentification:', error);
    res.status(500).json({ 
      message: 'Erreur interne du serveur',
      error: 'INTERNAL_ERROR'
    });
  }
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Accès refusé. Privilèges administrateur requis.',
      error: 'ADMIN_REQUIRED'
    });
  }
  next();
};

// Check if user owns the resource or is admin
const requireOwnershipOrAdmin = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (req.user.role === 'admin' || req.user._id.toString() === resourceUserId) {
      next();
    } else {
      res.status(403).json({ 
        message: 'Accès refusé. Vous ne pouvez accéder qu\'à vos propres ressources.',
        error: 'OWNERSHIP_REQUIRED'
      });
    }
  };
};

// Rate limiting for sensitive operations
const sensitiveOperationLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();
  
  return (req, res, next) => {
    const key = `${req.ip}-${req.user ? req.user._id : 'anonymous'}`;
    const now = Date.now();
    
    if (!attempts.has(key)) {
      attempts.set(key, []);
    }
    
    const userAttempts = attempts.get(key);
    
    // Remove old attempts outside the window
    const validAttempts = userAttempts.filter(timestamp => now - timestamp < windowMs);
    attempts.set(key, validAttempts);
    
    if (validAttempts.length >= maxAttempts) {
      return res.status(429).json({
        message: 'Trop de tentatives. Veuillez réessayer plus tard.',
        error: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    validAttempts.push(now);
    attempts.set(key, validAttempts);
    
    next();
  };
};

// Validate account ownership
const validateAccountOwnership = async (req, res, next) => {
  try {
    const { accountId } = req.params;
    const user = req.user;
    
    const account = user.accounts.find(acc => acc._id.toString() === accountId);
    
    if (!account) {
      return res.status(404).json({
        message: 'Compte non trouvé ou accès non autorisé',
        error: 'ACCOUNT_NOT_FOUND'
      });
    }
    
    req.account = account;
    next();
  } catch (error) {
    console.error('Erreur de validation du compte:', error);
    res.status(500).json({
      message: 'Erreur interne du serveur',
      error: 'INTERNAL_ERROR'
    });
  }
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Refresh token validation
const validateRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({
        message: 'Token de rafraîchissement requis',
        error: 'NO_REFRESH_TOKEN'
      });
    }
    
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        message: 'Token de rafraîchissement invalide',
        error: 'INVALID_REFRESH_TOKEN'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      message: 'Token de rafraîchissement invalide',
      error: 'INVALID_REFRESH_TOKEN'
    });
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireOwnershipOrAdmin,
  sensitiveOperationLimit,
  validateAccountOwnership,
  generateToken,
  validateRefreshToken
};
