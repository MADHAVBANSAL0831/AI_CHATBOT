const express = require('express');
const { body, validationResult } = require('express-validator');
const Conversation = require('../models/Conversation');
const Lead = require('../models/Lead');
const Template = require('../models/Template');
const { authenticateToken, validateAccountOwnership } = require('../middleware/auth');
const groqService = require('../services/groqService');
const notificationService = require('../services/notificationService');

const router = express.Router();

// Public chat endpoint (no authentication required)
router.post('/public', [
  body('message')
    .notEmpty()
    .withMessage('Le message est requis')
    .isLength({ max: 2000 })
    .withMessage('Le message ne peut pas dépasser 2000 caractères'),
  body('platform')
    .isIn(['whatsapp', 'telegram', 'messenger', 'instagram', 'custom', 'web'])
    .withMessage('Plateforme invalide'),
  body('contactInfo')
    .optional()
    .isObject()
    .withMessage('Informations de contact invalides')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const { message, platform, contactInfo } = req.body;
    const startTime = Date.now();

    // For public chat, we'll use a default system user or create anonymous conversations
    const publicUserId = 'public-system-user';
    const contactId = `public-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const contactName = contactInfo?.name || 'Visiteur Anonyme';
    const contactPhone = contactInfo?.phone;
    const contactEmail = contactInfo?.email;

    console.log(`💬 Message public reçu: "${message}" de ${contactName}`);

    // Generate AI response using Groq
    const aiResponse = await groqService.generateFrenchResponse(message, {
      platform,
      contactName,
      previousMessages: [] // For public chat, we don't store history
    });

    console.log(`🤖 Réponse IA générée: "${aiResponse.response}"`);

    // For public chat, we can optionally save as a lead without requiring user authentication
    if (contactName && contactName !== 'Visiteur Anonyme') {
      try {
        // Create a simple lead record for public inquiries
        const leadData = {
          name: contactName,
          phone: contactPhone,
          email: contactEmail,
          platform: platform,
          source: 'public-chat',
          firstMessage: message,
          status: 'new',
          score: 5, // Default score for public leads
          tags: ['public-chat'],
          notes: `Message initial: ${message}`,
          lastActivity: new Date()
        };

        // You could save this to a public leads collection or handle differently
        console.log('📝 Lead potentiel capturé:', leadData);
      } catch (leadError) {
        console.error('Erreur lors de la capture du lead:', leadError);
        // Don't fail the chat if lead capture fails
      }
    }

    const responseTime = Date.now() - startTime;
    console.log(`⚡ Temps de réponse: ${responseTime}ms`);

    res.json({
      reply: aiResponse.response,
      responseTime,
      platform,
      timestamp: new Date().toISOString(),
      public: true,
      success: aiResponse.success
    });

  } catch (error) {
    console.error('Erreur dans le chat public:', error);
    res.status(500).json({
      message: 'Erreur interne du serveur',
      reply: 'Désolé, je rencontre des difficultés techniques. Veuillez réessayer dans un moment.',
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Send message and get auto-reply
router.post('/message', authenticateToken, [
  body('message')
    .notEmpty()
    .withMessage('Le message est requis')
    .isLength({ max: 2000 })
    .withMessage('Le message ne peut pas dépasser 2000 caractères'),
  body('platform')
    .isIn(['whatsapp', 'telegram', 'messenger', 'instagram', 'custom', 'web'])
    .withMessage('Plateforme invalide'),
  body('contactInfo')
    .optional()
    .isObject()
    .withMessage('Informations de contact invalides')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const { message, platform, contactInfo } = req.body;
    const userId = req.user._id || req.user.id || 'test-user-production';
    const startTime = Date.now();

    // Handle different input formats for backward compatibility
    const accountId = req.body.accountId || 'web-account';
    const contactId = req.body.contactId || `web-${userId}-${Date.now()}`;
    const contactName = contactInfo?.name || req.body.contactName || 'Utilisateur Web';
    const contactPhone = contactInfo?.phone || req.body.contactPhone;
    const contactEmail = contactInfo?.email || req.body.contactEmail;

    // Skip database operations for test user in production
    if (userId === 'test-user-production') {
      // Generate AI response directly without saving to database
      const aiResponse = await groqService.generateFrenchResponse(message, {
        platform: platform || 'web',
        contactName: contactName,
        language: 'fr'
      });

      const responseTime = Date.now() - startTime;
      console.log(`🤖 Réponse IA générée en ${responseTime}ms pour utilisateur test`);

      return res.json({
        message: 'Message traité avec succès',
        response: aiResponse,
        responseTime,
        conversationId: `test-conversation-${Date.now()}`,
        testMode: true
      });
    }

    // Find or create conversation for regular users
    let conversation = await Conversation.findOne({
      userId,
      platform,
      accountId,
      contactId
    });

    if (!conversation) {
      conversation = new Conversation({
        userId,
        platform,
        accountId,
        contactId,
        contactName: contactName || 'Utilisateur Anonyme',
        contactPhone,
        contactEmail,
        language: (req.user.settings && req.user.settings.language) || 'fr'
      });
    }

    // Add user message
    const userMessage = {
      sender: 'user',
      content: message,
      timestamp: new Date(),
      messageType: 'text'
    };

    conversation.messages.push(userMessage);

    // Extract contact information if available
    const extractedContact = groqService.extractContactInfo(message);
    if (extractedContact.email && !conversation.contactEmail) {
      conversation.contactEmail = extractedContact.email;
    }
    if (extractedContact.phone && !conversation.contactPhone) {
      conversation.contactPhone = extractedContact.phone;
    }
    if (extractedContact.name && conversation.contactName === 'Utilisateur Anonyme') {
      conversation.contactName = extractedContact.name;
    }

    await conversation.save();

    // Check if auto-reply is enabled
    if (!req.user.settings.autoReplyEnabled || !conversation.autoReplyEnabled) {
      return res.json({
        message: 'Message reçu',
        conversation: conversation._id,
        autoReply: false
      });
    }

    // Check working hours
    if (req.user.settings.workingHours.enabled) {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5);
      
      if (currentTime < req.user.settings.workingHours.start || 
          currentTime > req.user.settings.workingHours.end) {
        
        const afterHoursMessage = `Merci pour votre message ! Nos bureaux sont actuellement fermés. Nous sommes disponibles de ${req.user.settings.workingHours.start} à ${req.user.settings.workingHours.end}. Nous vous répondrons dès que possible.`;
        
        const botMessage = {
          sender: 'bot',
          content: afterHoursMessage,
          timestamp: new Date(),
          messageType: 'text',
          isAutoReply: true,
          processingTime: Date.now() - startTime
        };

        conversation.messages.push(botMessage);
        await conversation.save();

        // Emit real-time update
        req.io.to(`user-${userId}`).emit('new-message', {
          conversationId: conversation._id,
          message: botMessage
        });

        return res.json({
          message: 'Réponse automatique envoyée (hors horaires)',
          conversation: conversation._id,
          autoReply: true,
          response: afterHoursMessage,
          processingTime: Date.now() - startTime
        });
      }
    }

    // Check for template matches
    const templates = await Template.find({
      userId,
      isActive: true,
      $or: [
        { 'conditions.platforms': { $size: 0 } },
        { 'conditions.platforms': platform }
      ]
    }).sort({ priority: -1 });

    let selectedTemplate = null;
    const context = {
      platform,
      accountId,
      contactId,
      userName: conversation.contactName,
      messages: conversation.getRecentMessages(5)
    };

    for (const template of templates) {
      if (template.matchesTrigger(message, context)) {
        selectedTemplate = template;
        break;
      }
    }

    let botResponse;
    let templateUsed = null;

    if (selectedTemplate) {
      // Use template response
      const templateVariables = {
        userName: conversation.contactName,
        userEmail: conversation.contactEmail,
        userPhone: conversation.contactPhone,
        platform: platform,
        currentTime: new Date().toLocaleTimeString('fr-FR'),
        currentDate: new Date().toLocaleDateString('fr-FR')
      };

      botResponse = selectedTemplate.processContent(templateVariables);
      templateUsed = selectedTemplate._id;
      
      // Update template usage
      await selectedTemplate.recordUsage(true);
    } else {
      // Generate AI response using Groq
      const aiContext = {
        startTime,
        messages: conversation.getRecentMessages(5),
        userName: conversation.contactName,
        businessType: req.user.settings.businessType,
        leadCapture: !conversation.isLeadCaptured,
        platform
      };

      const aiResult = await groqService.generateFrenchResponse(message, aiContext);
      botResponse = aiResult.response;
    }

    // Add response delay if configured
    if (req.user.settings.responseDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, req.user.settings.responseDelay));
    }

    // Create bot message
    const botMessage = {
      sender: 'bot',
      content: botResponse,
      timestamp: new Date(),
      messageType: 'text',
      isAutoReply: true,
      templateUsed,
      processingTime: Date.now() - startTime
    };

    conversation.messages.push(botMessage);

    // Check for lead capture
    const hasContactInfo = conversation.contactEmail || conversation.contactPhone;
    if (hasContactInfo && !conversation.isLeadCaptured) {
      await conversation.markAsLead();
      
      // Create lead record
      const lead = new Lead({
        userId,
        conversationId: conversation._id,
        contactName: conversation.contactName,
        contactEmail: conversation.contactEmail,
        contactPhone: conversation.contactPhone,
        platform,
        accountId,
        contactId,
        leadSource: 'auto-capture',
        capturedData: {
          interests: [],
          budget: null,
          timeline: null
        },
        analytics: {
          messageCount: conversation.statistics.userMessages,
          sessionDuration: Date.now() - conversation.createdAt,
          responseTime: conversation.statistics.averageResponseTime,
          engagementScore: conversation.calculateLeadScore()
        }
      });

      await lead.save();

      // Send notification
      if (req.user.settings.notifications.leadCapture) {
        await notificationService.sendLeadNotification(req.user, lead);
      }

      // Emit lead capture event
      req.io.to(`user-${userId}`).emit('lead-captured', {
        leadId: lead._id,
        conversationId: conversation._id,
        contactName: lead.contactName,
        platform: lead.platform
      });
    }

    await conversation.save();

    // Emit real-time message update
    req.io.to(`user-${userId}`).emit('new-message', {
      conversationId: conversation._id,
      message: botMessage
    });

    res.json({
      message: 'Réponse automatique envoyée',
      conversation: conversation._id,
      autoReply: true,
      response: botResponse,
      templateUsed: templateUsed ? selectedTemplate.name : null,
      leadCaptured: hasContactInfo && !conversation.isLeadCaptured,
      processingTime: Date.now() - startTime
    });

  } catch (error) {
    console.error('Erreur lors du traitement du message:', error);
    res.status(500).json({
      message: 'Erreur interne du serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Une erreur est survenue'
    });
  }
});

// Get conversations
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, platform, status, search } = req.query;
    const userId = req.user._id;

    const query = { userId };
    
    if (platform) query.platform = platform;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { contactName: { $regex: search, $options: 'i' } },
        { contactEmail: { $regex: search, $options: 'i' } },
        { contactPhone: { $regex: search, $options: 'i' } }
      ];
    }

    const conversations = await Conversation.find(query)
      .sort({ lastActivity: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-messages'); // Exclude messages for list view

    const total = await Conversation.countDocuments(query);

    res.json({
      conversations,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des conversations:', error);
    res.status(500).json({
      message: 'Erreur interne du serveur'
    });
  }
});

// Get specific conversation with messages
router.get('/conversations/:conversationId', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId
    });

    if (!conversation) {
      return res.status(404).json({
        message: 'Conversation non trouvée'
      });
    }

    res.json({ conversation });

  } catch (error) {
    console.error('Erreur lors de la récupération de la conversation:', error);
    res.status(500).json({
      message: 'Erreur interne du serveur'
    });
  }
});

// Update conversation settings
router.put('/conversations/:conversationId', authenticateToken, [
  body('autoReplyEnabled').optional().isBoolean(),
  body('status').optional().isIn(['active', 'paused', 'closed', 'archived']),
  body('tags').optional().isArray(),
  body('notes').optional().isLength({ max: 1000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const { conversationId } = req.params;
    const userId = req.user._id;
    const updates = req.body;

    const conversation = await Conversation.findOneAndUpdate(
      { _id: conversationId, userId },
      updates,
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({
        message: 'Conversation non trouvée'
      });
    }

    res.json({
      message: 'Conversation mise à jour',
      conversation
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la conversation:', error);
    res.status(500).json({
      message: 'Erreur interne du serveur'
    });
  }
});

// Delete conversation
router.delete('/conversations/:conversationId', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findOneAndDelete({
      _id: conversationId,
      userId
    });

    if (!conversation) {
      return res.status(404).json({
        message: 'Conversation non trouvée'
      });
    }

    res.json({
      message: 'Conversation supprimée'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de la conversation:', error);
    res.status(500).json({
      message: 'Erreur interne du serveur'
    });
  }
});

module.exports = router;
