const express = require('express');
const { body, validationResult } = require('express-validator');
const Template = require('../models/Template');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all templates
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      language = 'fr',
      isActive,
      search 
    } = req.query;

    const userId = req.user._id;
    const query = { userId };

    // Apply filters
    if (category) query.category = category;
    if (language) query.language = language;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const templates = await Template.find(query)
      .sort({ priority: -1, updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Template.countDocuments(query);

    res.json({
      templates,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des templates:', error);
    res.status(500).json({
      message: 'Erreur interne du serveur'
    });
  }
});

// Get specific template
router.get('/:templateId', authenticateToken, async (req, res) => {
  try {
    const { templateId } = req.params;
    const userId = req.user._id;

    const template = await Template.findOne({ _id: templateId, userId });

    if (!template) {
      return res.status(404).json({
        message: 'Template non trouvé'
      });
    }

    res.json({ template });

  } catch (error) {
    console.error('Erreur lors de la récupération du template:', error);
    res.status(500).json({
      message: 'Erreur interne du serveur'
    });
  }
});

// Create new template
router.post('/', authenticateToken, [
  body('name')
    .notEmpty()
    .withMessage('Le nom du template est requis')
    .isLength({ max: 100 })
    .withMessage('Le nom ne peut pas dépasser 100 caractères'),
  body('content')
    .notEmpty()
    .withMessage('Le contenu du template est requis')
    .isLength({ max: 2000 })
    .withMessage('Le contenu ne peut pas dépasser 2000 caractères'),
  body('category')
    .isIn(['greeting', 'lead-capture', 'product-info', 'pricing', 'support', 'appointment', 'follow-up', 'closing', 'emergency', 'custom'])
    .withMessage('Catégorie invalide'),
  body('language')
    .optional()
    .isIn(['fr', 'en'])
    .withMessage('Langue invalide'),
  body('priority')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('La priorité doit être entre 1 et 10')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const userId = req.user._id;
    const templateData = {
      ...req.body,
      userId,
      language: req.body.language || 'fr'
    };

    // Check for duplicate name
    const existingTemplate = await Template.findOne({
      userId,
      name: templateData.name
    });

    if (existingTemplate) {
      return res.status(409).json({
        message: 'Un template avec ce nom existe déjà'
      });
    }

    const template = new Template(templateData);
    await template.save();

    res.status(201).json({
      message: 'Template créé avec succès',
      template
    });

  } catch (error) {
    console.error('Erreur lors de la création du template:', error);
    res.status(500).json({
      message: 'Erreur interne du serveur'
    });
  }
});

// Update template
router.put('/:templateId', authenticateToken, [
  body('name')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Le nom ne peut pas dépasser 100 caractères'),
  body('content')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Le contenu ne peut pas dépasser 2000 caractères'),
  body('category')
    .optional()
    .isIn(['greeting', 'lead-capture', 'product-info', 'pricing', 'support', 'appointment', 'follow-up', 'closing', 'emergency', 'custom'])
    .withMessage('Catégorie invalide'),
  body('priority')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('La priorité doit être entre 1 et 10')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const { templateId } = req.params;
    const userId = req.user._id;
    const updates = req.body;

    // Check for duplicate name if name is being updated
    if (updates.name) {
      const existingTemplate = await Template.findOne({
        userId,
        name: updates.name,
        _id: { $ne: templateId }
      });

      if (existingTemplate) {
        return res.status(409).json({
          message: 'Un template avec ce nom existe déjà'
        });
      }
    }

    const template = await Template.findOneAndUpdate(
      { _id: templateId, userId },
      updates,
      { new: true }
    );

    if (!template) {
      return res.status(404).json({
        message: 'Template non trouvé'
      });
    }

    res.json({
      message: 'Template mis à jour avec succès',
      template
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du template:', error);
    res.status(500).json({
      message: 'Erreur interne du serveur'
    });
  }
});

// Delete template
router.delete('/:templateId', authenticateToken, async (req, res) => {
  try {
    const { templateId } = req.params;
    const userId = req.user._id;

    const template = await Template.findOneAndDelete({ _id: templateId, userId });

    if (!template) {
      return res.status(404).json({
        message: 'Template non trouvé'
      });
    }

    res.json({
      message: 'Template supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du template:', error);
    res.status(500).json({
      message: 'Erreur interne du serveur'
    });
  }
});

// Clone template
router.post('/:templateId/clone', authenticateToken, [
  body('name')
    .notEmpty()
    .withMessage('Le nom du nouveau template est requis')
    .isLength({ max: 100 })
    .withMessage('Le nom ne peut pas dépasser 100 caractères')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const { templateId } = req.params;
    const { name } = req.body;
    const userId = req.user._id;

    const originalTemplate = await Template.findOne({ _id: templateId, userId });

    if (!originalTemplate) {
      return res.status(404).json({
        message: 'Template original non trouvé'
      });
    }

    // Check for duplicate name
    const existingTemplate = await Template.findOne({ userId, name });
    if (existingTemplate) {
      return res.status(409).json({
        message: 'Un template avec ce nom existe déjà'
      });
    }

    const clonedTemplate = await originalTemplate.clone(name, userId);

    res.status(201).json({
      message: 'Template cloné avec succès',
      template: clonedTemplate
    });

  } catch (error) {
    console.error('Erreur lors du clonage du template:', error);
    res.status(500).json({
      message: 'Erreur interne du serveur'
    });
  }
});

// Test template with sample data
router.post('/:templateId/test', authenticateToken, [
  body('variables')
    .optional()
    .isObject()
    .withMessage('Les variables doivent être un objet')
], async (req, res) => {
  try {
    const { templateId } = req.params;
    const { variables = {} } = req.body;
    const userId = req.user._id;

    const template = await Template.findOne({ _id: templateId, userId });

    if (!template) {
      return res.status(404).json({
        message: 'Template non trouvé'
      });
    }

    // Process template with provided variables
    const processedContent = template.processContent(variables);

    res.json({
      originalContent: template.content,
      processedContent,
      variables: template.variables,
      providedVariables: variables
    });

  } catch (error) {
    console.error('Erreur lors du test du template:', error);
    res.status(500).json({
      message: 'Erreur interne du serveur'
    });
  }
});

// Get template categories
router.get('/meta/categories', authenticateToken, async (req, res) => {
  try {
    const categories = [
      { value: 'greeting', label: 'Salutations', description: 'Messages de bienvenue et salutations' },
      { value: 'lead-capture', label: 'Capture de leads', description: 'Messages pour capturer des informations de contact' },
      { value: 'product-info', label: 'Information produit', description: 'Informations sur les produits et services' },
      { value: 'pricing', label: 'Tarification', description: 'Informations sur les prix et tarifs' },
      { value: 'support', label: 'Support client', description: 'Messages de support et assistance' },
      { value: 'appointment', label: 'Prise de rendez-vous', description: 'Messages pour planifier des rendez-vous' },
      { value: 'follow-up', label: 'Suivi', description: 'Messages de suivi et relance' },
      { value: 'closing', label: 'Clôture', description: 'Messages de fin de conversation' },
      { value: 'emergency', label: 'Urgence', description: 'Messages pour les situations urgentes' },
      { value: 'custom', label: 'Personnalisé', description: 'Templates personnalisés' }
    ];

    res.json({ categories });

  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    res.status(500).json({
      message: 'Erreur interne du serveur'
    });
  }
});

// Get template usage statistics
router.get('/:templateId/stats', authenticateToken, async (req, res) => {
  try {
    const { templateId } = req.params;
    const userId = req.user._id;

    const template = await Template.findOne({ _id: templateId, userId });

    if (!template) {
      return res.status(404).json({
        message: 'Template non trouvé'
      });
    }

    // Get usage statistics from conversations
    const usageStats = await require('../models/Conversation').aggregate([
      {
        $match: {
          userId,
          'messages.templateUsed': template._id
        }
      },
      {
        $unwind: '$messages'
      },
      {
        $match: {
          'messages.templateUsed': template._id
        }
      },
      {
        $group: {
          _id: null,
          totalUses: { $sum: 1 },
          averageProcessingTime: { $avg: '$messages.processingTime' },
          platforms: { $addToSet: '$platform' },
          lastUsed: { $max: '$messages.timestamp' }
        }
      }
    ]);

    const stats = usageStats[0] || {
      totalUses: 0,
      averageProcessingTime: 0,
      platforms: [],
      lastUsed: null
    };

    res.json({
      template: {
        id: template._id,
        name: template.name,
        category: template.category
      },
      usage: {
        ...template.usage,
        ...stats
      },
      analytics: template.analytics
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      message: 'Erreur interne du serveur'
    });
  }
});

// Bulk operations on templates
router.put('/bulk/update', authenticateToken, [
  body('templateIds').isArray().withMessage('templateIds doit être un tableau'),
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

    const { templateIds, updates } = req.body;
    const userId = req.user._id;

    const result = await Template.updateMany(
      { _id: { $in: templateIds }, userId },
      { $set: updates }
    );

    res.json({
      message: `${result.modifiedCount} templates mis à jour`,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour en lot:', error);
    res.status(500).json({
      message: 'Erreur interne du serveur'
    });
  }
});

module.exports = router;
