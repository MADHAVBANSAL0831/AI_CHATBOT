const express = require('express');
const { body, validationResult } = require('express-validator');
const Lead = require('../models/Lead');
const Conversation = require('../models/Conversation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all leads
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      platform, 
      priority,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const userId = req.user._id;
    const query = { userId };

    // Apply filters
    if (status) query.status = status;
    if (platform) query.platform = platform;
    if (priority) query.priority = priority;
    
    if (search) {
      query.$or = [
        { contactName: { $regex: search, $options: 'i' } },
        { contactEmail: { $regex: search, $options: 'i' } },
        { contactPhone: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const leads = await Lead.find(query)
      .populate('conversationId', 'platform accountId contactId lastActivity')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Lead.countDocuments(query);

    // Calculate statistics
    const stats = await Lead.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalLeads: { $sum: 1 },
          newLeads: { $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] } },
          qualifiedLeads: { $sum: { $cond: [{ $eq: ['$status', 'qualified'] }, 1, 0] } },
          convertedLeads: { $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] } },
          averageScore: { $avg: '$leadScore' },
          totalValue: { $sum: '$conversionValue' }
        }
      }
    ]);

    res.json({
      leads,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      },
      statistics: stats[0] || {
        totalLeads: 0,
        newLeads: 0,
        qualifiedLeads: 0,
        convertedLeads: 0,
        averageScore: 0,
        totalValue: 0
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des leads:', error);
    res.status(500).json({
      message: 'Erreur interne du serveur'
    });
  }
});

// Get specific lead
router.get('/:leadId', authenticateToken, async (req, res) => {
  try {
    const { leadId } = req.params;
    const userId = req.user._id;

    const lead = await Lead.findOne({ _id: leadId, userId })
      .populate('conversationId')
      .populate('assignedTo', 'username email');

    if (!lead) {
      return res.status(404).json({
        message: 'Lead non trouvé'
      });
    }

    res.json({ lead });

  } catch (error) {
    console.error('Erreur lors de la récupération du lead:', error);
    res.status(500).json({
      message: 'Erreur interne du serveur'
    });
  }
});

// Update lead
router.put('/:leadId', authenticateToken, [
  body('status').optional().isIn(['new', 'contacted', 'qualified', 'converted', 'lost', 'archived']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('notes').optional().isLength({ max: 2000 }),
  body('tags').optional().isArray(),
  body('followUpDate').optional().isISO8601(),
  body('conversionValue').optional().isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const { leadId } = req.params;
    const userId = req.user._id;
    const updates = req.body;

    const lead = await Lead.findOne({ _id: leadId, userId });

    if (!lead) {
      return res.status(404).json({
        message: 'Lead non trouvé'
      });
    }

    // Handle status change
    if (updates.status && updates.status !== lead.status) {
      await lead.updateStatus(updates.status, updates.statusNote || '');
      delete updates.status;
      delete updates.statusNote;
    }

    // Update other fields
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        lead[key] = updates[key];
      }
    });

    // Recalculate lead score if relevant data changed
    if (updates.capturedData || updates.analytics) {
      lead.calculateLeadScore();
    }

    await lead.save();

    res.json({
      message: 'Lead mis à jour avec succès',
      lead
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du lead:', error);
    res.status(500).json({
      message: 'Erreur interne du serveur'
    });
  }
});

// Delete lead
router.delete('/:leadId', authenticateToken, async (req, res) => {
  try {
    const { leadId } = req.params;
    const userId = req.user._id;

    const lead = await Lead.findOneAndDelete({ _id: leadId, userId });

    if (!lead) {
      return res.status(404).json({
        message: 'Lead non trouvé'
      });
    }

    res.json({
      message: 'Lead supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du lead:', error);
    res.status(500).json({
      message: 'Erreur interne du serveur'
    });
  }
});

// Export leads to CSV
router.get('/export/csv', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, platform, dateFrom, dateTo } = req.query;

    const query = { userId };
    if (status) query.status = status;
    if (platform) query.platform = platform;
    
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const leads = await Lead.find(query)
      .populate('conversationId', 'platform accountId')
      .sort({ createdAt: -1 });

    // Generate CSV content
    const csvHeaders = [
      'Nom',
      'Email',
      'Téléphone',
      'Plateforme',
      'Statut',
      'Priorité',
      'Score',
      'Date de création',
      'Dernière activité',
      'Valeur de conversion',
      'Notes'
    ];

    const csvRows = leads.map(lead => [
      lead.contactName || '',
      lead.contactEmail || '',
      lead.contactPhone || '',
      lead.platform || '',
      lead.status || '',
      lead.priority || '',
      lead.leadScore || 0,
      lead.createdAt ? lead.createdAt.toLocaleDateString('fr-FR') : '',
      lead.lastContactDate ? lead.lastContactDate.toLocaleDateString('fr-FR') : '',
      lead.conversionValue || 0,
      (lead.notes || '').replace(/"/g, '""') // Escape quotes for CSV
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="leads-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvContent);

  } catch (error) {
    console.error('Erreur lors de l\'export CSV:', error);
    res.status(500).json({
      message: 'Erreur lors de l\'export'
    });
  }
});

// Get lead analytics
router.get('/analytics/overview', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = '30' } = req.query; // days

    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - parseInt(period));

    // Lead conversion funnel
    const funnelData = await Lead.aggregate([
      { $match: { userId, createdAt: { $gte: dateFrom } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          averageScore: { $avg: '$leadScore' },
          totalValue: { $sum: '$conversionValue' }
        }
      }
    ]);

    // Platform performance
    const platformData = await Lead.aggregate([
      { $match: { userId, createdAt: { $gte: dateFrom } } },
      {
        $group: {
          _id: '$platform',
          count: { $sum: 1 },
          converted: { $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] } },
          averageScore: { $avg: '$leadScore' }
        }
      },
      {
        $addFields: {
          conversionRate: { $multiply: [{ $divide: ['$converted', '$count'] }, 100] }
        }
      }
    ]);

    // Daily lead capture trend
    const trendData = await Lead.aggregate([
      { $match: { userId, createdAt: { $gte: dateFrom } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          converted: { $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Lead score distribution
    const scoreDistribution = await Lead.aggregate([
      { $match: { userId, createdAt: { $gte: dateFrom } } },
      {
        $bucket: {
          groupBy: '$leadScore',
          boundaries: [0, 20, 40, 60, 80, 100],
          default: 'other',
          output: {
            count: { $sum: 1 },
            averageValue: { $avg: '$conversionValue' }
          }
        }
      }
    ]);

    res.json({
      period: parseInt(period),
      funnel: funnelData,
      platforms: platformData,
      trend: trendData,
      scoreDistribution
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des analytics:', error);
    res.status(500).json({
      message: 'Erreur interne du serveur'
    });
  }
});

// Bulk update leads
router.put('/bulk/update', authenticateToken, [
  body('leadIds').isArray().withMessage('leadIds doit être un tableau'),
  body('updates').isObject().withMessage('updates doit être un objet')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const { leadIds, updates } = req.body;
    const userId = req.user._id;

    const result = await Lead.updateMany(
      { _id: { $in: leadIds }, userId },
      { $set: updates }
    );

    res.json({
      message: `${result.modifiedCount} leads mis à jour`,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour en lot:', error);
    res.status(500).json({
      message: 'Erreur interne du serveur'
    });
  }
});

// Assign leads to user
router.put('/assign', authenticateToken, [
  body('leadIds').isArray().withMessage('leadIds doit être un tableau'),
  body('assignedTo').optional().isMongoId().withMessage('assignedTo doit être un ID valide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const { leadIds, assignedTo } = req.body;
    const userId = req.user._id;

    const result = await Lead.updateMany(
      { _id: { $in: leadIds }, userId },
      { $set: { assignedTo: assignedTo || null } }
    );

    res.json({
      message: `${result.modifiedCount} leads assignés`,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Erreur lors de l\'assignation:', error);
    res.status(500).json({
      message: 'Erreur interne du serveur'
    });
  }
});

module.exports = router;
