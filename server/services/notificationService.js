const nodemailer = require('nodemailer');

class NotificationService {
  constructor() {
    this.emailTransporter = null;
    this.initializeEmailService();
  }

  // Initialize email service
  async initializeEmailService() {
    try {
      if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        this.emailTransporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST,
          port: parseInt(process.env.EMAIL_PORT) || 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        // Verify connection
        await this.emailTransporter.verify();
        console.log('✅ Service email configuré avec succès');
      } else {
        console.warn('⚠️ Configuration email incomplète. Les notifications par email ne fonctionneront pas.');
      }
    } catch (error) {
      console.error('❌ Erreur de configuration email:', error.message);
    }
  }

  // Send lead capture notification
  async sendLeadNotification(user, lead) {
    try {
      const notifications = [];

      // Email notification
      if (user.settings.notifications.email && this.emailTransporter) {
        const emailResult = await this.sendLeadEmailNotification(user, lead);
        notifications.push(emailResult);
      }

      // Browser notification (handled by frontend)
      if (user.settings.notifications.browser) {
        notifications.push({
          type: 'browser',
          status: 'sent',
          message: 'Notification navigateur programmée'
        });
      }

      // Record notifications in lead
      for (const notification of notifications) {
        if (notification.status === 'sent') {
          await lead.addNotification(notification.type, 'sent');
        }
      }

      return {
        success: true,
        notifications: notifications.length,
        details: notifications
      };

    } catch (error) {
      console.error('Erreur lors de l\'envoi des notifications:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Send email notification for lead capture
  async sendLeadEmailNotification(user, lead) {
    try {
      if (!this.emailTransporter) {
        throw new Error('Service email non configuré');
      }

      const subject = `🎯 Nouveau lead capturé - ${lead.contactName}`;
      const htmlContent = this.generateLeadEmailTemplate(user, lead);

      const mailOptions = {
        from: `"Chatbot Auto-Reply" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: subject,
        html: htmlContent
      };

      const result = await this.emailTransporter.sendMail(mailOptions);

      return {
        type: 'email',
        status: 'sent',
        messageId: result.messageId,
        message: 'Email envoyé avec succès'
      };

    } catch (error) {
      console.error('Erreur envoi email:', error);
      return {
        type: 'email',
        status: 'failed',
        error: error.message
      };
    }
  }

  // Generate HTML template for lead notification email
  generateLeadEmailTemplate(user, lead) {
    const platformEmojis = {
      whatsapp: '📱',
      telegram: '✈️',
      messenger: '💬',
      instagram: '📷',
      custom: '🤖'
    };

    const platformEmoji = platformEmojis[lead.platform] || '💬';

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nouveau Lead Capturé</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .lead-info { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #667eea; }
            .contact-details { display: flex; flex-wrap: wrap; gap: 10px; margin: 10px 0; }
            .contact-item { background: #e8f2ff; padding: 8px 12px; border-radius: 4px; font-size: 14px; }
            .stats { display: flex; justify-content: space-between; margin: 15px 0; }
            .stat { text-align: center; }
            .stat-value { font-size: 24px; font-weight: bold; color: #667eea; }
            .stat-label { font-size: 12px; color: #666; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎯 Nouveau Lead Capturé !</h1>
                <p>Un nouveau prospect a été identifié sur votre chatbot</p>
            </div>
            
            <div class="content">
                <div class="lead-info">
                    <h2>${platformEmoji} ${lead.contactName}</h2>
                    <p><strong>Plateforme:</strong> ${lead.platform.charAt(0).toUpperCase() + lead.platform.slice(1)}</p>
                    <p><strong>Score de lead:</strong> ${lead.leadScore}/100</p>
                    <p><strong>Capturé le:</strong> ${lead.createdAt.toLocaleDateString('fr-FR')} à ${lead.createdAt.toLocaleTimeString('fr-FR')}</p>
                    
                    <div class="contact-details">
                        ${lead.contactEmail ? `<div class="contact-item">📧 ${lead.contactEmail}</div>` : ''}
                        ${lead.contactPhone ? `<div class="contact-item">📞 ${lead.contactPhone}</div>` : ''}
                    </div>
                </div>

                <div class="stats">
                    <div class="stat">
                        <div class="stat-value">${lead.analytics.messageCount}</div>
                        <div class="stat-label">Messages</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${Math.round(lead.analytics.sessionDuration / 60000)}</div>
                        <div class="stat-label">Minutes</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${lead.leadScore}</div>
                        <div class="stat-label">Score</div>
                    </div>
                </div>

                ${lead.notes ? `<div class="lead-info"><strong>Notes:</strong><br>${lead.notes}</div>` : ''}

                <div style="text-align: center; margin: 20px 0;">
                    <a href="${process.env.CLIENT_URL}/dashboard/leads/${lead._id}" class="button">
                        Voir le Lead Complet
                    </a>
                </div>
            </div>

            <div class="footer">
                <p>Chatbot Auto-Reply - Notification automatique</p>
                <p>Pour désactiver ces notifications, modifiez vos paramètres dans le tableau de bord.</p>
            </div>
        </div>
    </body>
    </html>`;
  }

  // Send conversation summary notification
  async sendConversationSummary(user, conversations) {
    try {
      if (!user.settings.notifications.email || !this.emailTransporter) {
        return { success: false, message: 'Email non configuré' };
      }

      const subject = `📊 Résumé quotidien de vos conversations`;
      const htmlContent = this.generateConversationSummaryTemplate(user, conversations);

      const mailOptions = {
        from: `"Chatbot Auto-Reply" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: subject,
        html: htmlContent
      };

      await this.emailTransporter.sendMail(mailOptions);

      return {
        success: true,
        message: 'Résumé envoyé par email'
      };

    } catch (error) {
      console.error('Erreur envoi résumé:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate conversation summary email template
  generateConversationSummaryTemplate(user, conversations) {
    const totalConversations = conversations.length;
    const activeConversations = conversations.filter(c => c.status === 'active').length;
    const newLeads = conversations.filter(c => c.isLeadCaptured).length;
    const totalMessages = conversations.reduce((sum, c) => sum + c.statistics.totalMessages, 0);

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Résumé des Conversations</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #667eea; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
            .stat-card { background: white; padding: 15px; border-radius: 6px; text-align: center; }
            .stat-number { font-size: 28px; font-weight: bold; color: #667eea; }
            .stat-label { font-size: 14px; color: #666; margin-top: 5px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📊 Résumé Quotidien</h1>
                <p>Voici un aperçu de l'activité de votre chatbot</p>
            </div>
            
            <div class="content">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">${totalConversations}</div>
                        <div class="stat-label">Conversations Totales</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${activeConversations}</div>
                        <div class="stat-label">Conversations Actives</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${newLeads}</div>
                        <div class="stat-label">Nouveaux Leads</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${totalMessages}</div>
                        <div class="stat-label">Messages Échangés</div>
                    </div>
                </div>

                <div style="text-align: center; margin: 20px 0;">
                    <a href="${process.env.CLIENT_URL}/dashboard" 
                       style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                        Voir le Tableau de Bord
                    </a>
                </div>
            </div>
        </div>
    </body>
    </html>`;
  }

  // Send system alert notification
  async sendSystemAlert(user, alertType, message, details = {}) {
    try {
      if (!user.settings.notifications.email || !this.emailTransporter) {
        return { success: false, message: 'Email non configuré' };
      }

      const alertEmojis = {
        error: '🚨',
        warning: '⚠️',
        info: 'ℹ️',
        success: '✅'
      };

      const subject = `${alertEmojis[alertType] || '🔔'} Alerte Système - ${message}`;
      
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: ${alertType === 'error' ? '#ff4757' : alertType === 'warning' ? '#ffa502' : '#667eea'}; color: white; padding: 20px; border-radius: 8px;">
            <h1>${alertEmojis[alertType] || '🔔'} Alerte Système</h1>
            <p>${message}</p>
          </div>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px;">
            <p><strong>Détails:</strong></p>
            <pre style="background: white; padding: 10px; border-radius: 4px; overflow-x: auto;">${JSON.stringify(details, null, 2)}</pre>
            <p><strong>Heure:</strong> ${new Date().toLocaleString('fr-FR')}</p>
          </div>
        </div>`;

      const mailOptions = {
        from: `"Chatbot Auto-Reply" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: subject,
        html: htmlContent
      };

      await this.emailTransporter.sendMail(mailOptions);

      return {
        success: true,
        message: 'Alerte envoyée par email'
      };

    } catch (error) {
      console.error('Erreur envoi alerte:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Check service health
  async checkHealth() {
    try {
      if (!this.emailTransporter) {
        return { status: 'warning', message: 'Service email non configuré' };
      }

      await this.emailTransporter.verify();
      return { status: 'ok', message: 'Service de notification opérationnel' };
    } catch (error) {
      return { status: 'error', message: `Erreur service email: ${error.message}` };
    }
  }
}

module.exports = new NotificationService();
