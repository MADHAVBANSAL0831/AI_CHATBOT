const express = require('express');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Lead = require('../models/Lead');
const Template = require('../models/Template');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const groqService = require('../services/groqService');
const notificationService = require('../services/notificationService');

const router = express.Router();

// Get dashboard overview statistics
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = '30' } = req.query; // days

    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - parseInt(period));

    // Check if MongoDB is connected
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      // MongoDB not connected - return demo data
      console.log('🧪 Mode test: Retour de données de démonstration pour le dashboard');

      return res.json({
        overview: {
          conversations: {
            total: 45,
            active: 12,
            growth: 8.5
          },
          leads: {
            total: 23,
            new: 7,
            conversionRate: 51.1
          },
          templates: {
            total: 8,
            active: 6
          }
        },
        platforms: [
          { _id: 'whatsapp', count: 18, activeCount: 5, totalMessages: 156, averageScore: 7.2 },
          { _id: 'telegram', count: 12, activeCount: 3, totalMessages: 89, averageScore: 6.8 },
          { _id: 'messenger', count: 10, activeCount: 2, totalMessages: 67, averageScore: 6.5 },
          { _id: 'web', count: 5, activeCount: 2, totalMessages: 34, averageScore: 8.1 }
        ],
        activity: [
          { _id: '2025-09-27', conversations: 8, newLeads: 3, messages: 45 },
          { _id: '2025-09-26', conversations: 6, newLeads: 2, messages: 32 },
          { _id: '2025-09-25', conversations: 12, newLeads: 5, messages: 67 },
          { _id: '2025-09-24', conversations: 4, newLeads: 1, messages: 23 },
          { _id: '2025-09-23', conversations: 9, newLeads: 4, messages: 51 }
        ],
        demo: true
      });
    }

    // Get basic statistics
    const [
      totalConversations,
      activeConversations,
      totalLeads,
      newLeads,
      totalTemplates,
      activeTemplates
    ] = await Promise.all([
      Conversation.countDocuments({ userId }),
      Conversation.countDocuments({ userId, status: 'active' }),
      Lead.countDocuments({ userId }),
      Lead.countDocuments({ userId, createdAt: { $gte: dateFrom } }),
      Template.countDocuments({ userId }),
      Template.countDocuments({ userId, isActive: true })
    ]);

    // Get conversation statistics by platform
    const platformStats = await Conversation.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$platform',
          count: { $sum: 1 },
          activeCount: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          totalMessages: { $sum: '$statistics.totalMessages' },
          averageScore: { $avg: '$leadScore' }
        }
      }
    ]);

    // Get recent activity (last 7 days)
    const recentActivity = await Conversation.aggregate([
      { 
        $match: { 
          userId, 
          lastActivity: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$lastActivity' } },
          conversations: { $sum: 1 },
          messages: { $sum: '$statistics.totalMessages' },
          newLeads: { $sum: { $cond: ['$isLeadCaptured', 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get lead conversion funnel
    const leadFunnel = await Lead.aggregate([
      { $match: { userId, createdAt: { $gte: dateFrom } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$conversionValue' }
        }
      }
    ]);

    // Get top performing templates
    const topTemplates = await Template.find({ userId, isActive: true })
      .sort({ 'usage.totalUses': -1 })
      .limit(5)
      .select('name category usage.totalUses usage.successRate');

    res.json({
      period: parseInt(period),
      overview: {
        conversations: {
          total: totalConversations,
          active: activeConversations,
          growth: 0 // Could calculate growth vs previous period
        },
        leads: {
          total: totalLeads,
          new: newLeads,
          conversionRate: totalConversations > 0 ? (totalLeads / totalConversations * 100).toFixed(1) : 0
        },
        templates: {
          total: totalTemplates,
          active: activeTemplates,
          usage: topTemplates.reduce((sum, t) => sum + t.usage.totalUses, 0)
        }
      },
      platforms: platformStats,
      activity: recentActivity,
      leadFunnel,
      topTemplates
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      message: 'Erreur interne du serveur'
    });
  }
});

// Get real-time activity feed
router.get('/activity', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 20, offset = 0 } = req.query;

    // Get recent conversations with latest messages
    const recentConversations = await Conversation.find({ userId })
      .sort({ lastActivity: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .select('contactName platform lastActivity messages')
      .lean();

    // Get recent leads
    const recentLeads = await Lead.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .select('contactName platform status createdAt leadScore')
      .lean();

    // Combine and sort by timestamp
    const activities = [
      ...recentConversations.map(conv => ({
        type: 'conversation',
        id: conv._id,
        title: `Nouvelle activité avec ${conv.contactName}`,
        description: `Conversation sur ${conv.platform}`,
        timestamp: conv.lastActivity,
        platform: conv.platform,
        data: conv
      })),
      ...recentLeads.map(lead => ({
        type: 'lead',
        id: lead._id,
        title: `Nouveau lead: ${lead.contactName}`,
        description: `Score: ${lead.leadScore}/100 - ${lead.platform}`,
        timestamp: lead.createdAt,
        platform: lead.platform,
        data: lead
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
     .slice(0, parseInt(limit));

    res.json({
      activities,
      hasMore: activities.length === parseInt(limit)
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'activité:', error);
    res.status(500).json({
      message: 'Erreur interne du serveur'
    });
  }
});

// Get performance metrics
router.get('/performance', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = '30' } = req.query;

    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - parseInt(period));

    // Response time analytics
    const responseTimeStats = await Conversation.aggregate([
      { $match: { userId, createdAt: { $gte: dateFrom } } },
      { $unwind: '$messages' },
      { $match: { 'messages.sender': 'bot', 'messages.processingTime': { $exists: true } } },
      {
        $group: {
          _id: null,
          averageResponseTime: { $avg: '$messages.processingTime' },
          minResponseTime: { $min: '$messages.processingTime' },
          maxResponseTime: { $max: '$messages.processingTime' },
          totalResponses: { $sum: 1 }
        }
      }
    ]);

    // Template performance
    const templatePerformance = await Template.find({ userId })
      .sort({ 'usage.successRate': -1 })
      .select('name category usage analytics')
      .limit(10);

    // Platform performance comparison
    const platformPerformance = await Conversation.aggregate([
      { $match: { userId, createdAt: { $gte: dateFrom } } },
      {
        $group: {
          _id: '$platform',
          totalConversations: { $sum: 1 },
          leadsGenerated: { $sum: { $cond: ['$isLeadCaptured', 1, 0] } },
          averageMessages: { $avg: '$statistics.totalMessages' },
          averageSessionDuration: { $avg: '$statistics.sessionDuration' }
        }
      },
      {
        $addFields: {
          conversionRate: { 
            $multiply: [
              { $divide: ['$leadsGenerated', '$totalConversations'] }, 
              100
            ] 
          }
        }
      }
    ]);

    // User engagement metrics
    const engagementMetrics = await Conversation.aggregate([
      { $match: { userId, createdAt: { $gte: dateFrom } } },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          averageSessionDuration: { $avg: '$statistics.sessionDuration' },
          averageMessagesPerSession: { $avg: '$statistics.totalMessages' },
          totalMessages: { $sum: '$statistics.totalMessages' },
          uniqueContacts: { $addToSet: '$contactId' }
        }
      },
      {
        $addFields: {
          uniqueContactsCount: { $size: '$uniqueContacts' }
        }
      }
    ]);

    res.json({
      period: parseInt(period),
      responseTime: responseTimeStats[0] || {
        averageResponseTime: 0,
        minResponseTime: 0,
        maxResponseTime: 0,
        totalResponses: 0
      },
      templates: templatePerformance,
      platforms: platformPerformance,
      engagement: engagementMetrics[0] || {
        totalSessions: 0,
        averageSessionDuration: 0,
        averageMessagesPerSession: 0,
        totalMessages: 0,
        uniqueContactsCount: 0
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des performances:', error);
    res.status(500).json({
      message: 'Erreur interne du serveur'
    });
  }
});

// Get system health status
router.get('/health', authenticateToken, async (req, res) => {
  try {
    // Check database connection
    const dbHealth = await User.findById(req.user._id).select('_id');
    
    // Check Groq API health
    const groqHealth = await groqService.checkHealth();
    
    // Check notification service health
    const notificationHealth = await notificationService.checkHealth();
    
    // Get system statistics
    const systemStats = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development'
    };

    // Check recent errors (you could implement error logging)
    const recentErrors = []; // Placeholder for error logging system

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealth ? { status: 'ok', message: 'Base de données connectée' } : { status: 'error', message: 'Erreur base de données' },
        groq: groqHealth,
        notifications: notificationHealth
      },
      system: systemStats,
      recentErrors
    });

  } catch (error) {
    console.error('Erreur lors de la vérification de santé:', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Export data for backup
router.get('/export', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { type = 'all' } = req.query;

    const exportData = {
      exportDate: new Date().toISOString(),
      userId: userId,
      data: {}
    };

    if (type === 'all' || type === 'conversations') {
      exportData.data.conversations = await Conversation.find({ userId }).lean();
    }

    if (type === 'all' || type === 'leads') {
      exportData.data.leads = await Lead.find({ userId }).lean();
    }

    if (type === 'all' || type === 'templates') {
      exportData.data.templates = await Template.find({ userId }).lean();
    }

    if (type === 'all' || type === 'user') {
      exportData.data.user = await User.findById(userId).select('-password').lean();
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="chatbot-export-${new Date().toISOString().split('T')[0]}.json"`);
    res.json(exportData);

  } catch (error) {
    console.error('Erreur lors de l\'export:', error);
    res.status(500).json({
      message: 'Erreur lors de l\'export'
    });
  }
});

// Admin routes (require admin role)
router.get('/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    // Get user statistics
    const userStats = await Promise.all(
      users.map(async (user) => {
        const [conversations, leads, templates] = await Promise.all([
          Conversation.countDocuments({ userId: user._id }),
          Lead.countDocuments({ userId: user._id }),
          Template.countDocuments({ userId: user._id })
        ]);

        return {
          ...user.toObject(),
          statistics: {
            conversations,
            leads,
            templates
          }
        };
      })
    );

    res.json({
      users: userStats,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({
      message: 'Erreur interne du serveur'
    });
  }
});

// Admin system statistics
router.get('/admin/system-stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalConversations,
      totalLeads,
      totalTemplates
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Conversation.countDocuments(),
      Lead.countDocuments(),
      Template.countDocuments()
    ]);

    // Get growth statistics (last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const [
      newUsersLast30,
      newUsersPrevious30,
      newConversationsLast30,
      newLeadsLast30
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } }),
      Conversation.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Lead.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
    ]);

    const userGrowth = newUsersPrevious30 > 0 
      ? ((newUsersLast30 - newUsersPrevious30) / newUsersPrevious30 * 100).toFixed(1)
      : 0;

    res.json({
      overview: {
        users: { total: totalUsers, active: activeUsers, growth: userGrowth },
        conversations: { total: totalConversations, last30Days: newConversationsLast30 },
        leads: { total: totalLeads, last30Days: newLeadsLast30 },
        templates: { total: totalTemplates }
      },
      growth: {
        users: { current: newUsersLast30, previous: newUsersPrevious30, rate: userGrowth }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques système:', error);
    res.status(500).json({
      message: 'Erreur interne du serveur'
    });
  }
});

module.exports = router;
