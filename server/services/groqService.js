const axios = require('axios');

class GroqService {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY;
    this.model = process.env.GROQ_MODEL || 'mixtral-8x7b-32768';
    this.baseURL = 'https://api.groq.com/openai/v1';
    
    if (!this.apiKey) {
      console.warn('⚠️ GROQ_API_KEY non configurée. Le service de chat ne fonctionnera pas.');
    }
  }

  // Generate French response using Groq API
  async generateFrenchResponse(userMessage, context = {}) {
    try {
      if (!this.apiKey) {
        throw new Error('Clé API Groq non configurée');
      }

      const systemPrompt = this.buildSystemPrompt(context);
      const conversationHistory = this.buildConversationHistory(context.messages || []);

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            ...conversationHistory,
            { role: 'user', content: userMessage }
          ],
          max_tokens: 500,
          temperature: 0.7,
          top_p: 0.9,
          frequency_penalty: 0.1,
          presence_penalty: 0.1,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 seconds timeout
        }
      );

      const aiResponse = response.data.choices[0]?.message?.content;
      
      if (!aiResponse) {
        throw new Error('Réponse vide de l\'API Groq');
      }

      // Ensure response is in French and professional
      const processedResponse = this.postProcessResponse(aiResponse, context);

      return {
        success: true,
        response: processedResponse,
        usage: response.data.usage,
        model: this.model,
        processingTime: Date.now() - (context.startTime || Date.now())
      };

    } catch (error) {
      console.error('Erreur Groq API:', error.message);
      if (error.response) {
        console.error('Groq API Response Status:', error.response.status);
        console.error('Groq API Response Data:', error.response.data);
      }
      
      // Return fallback response in French
      return {
        success: false,
        response: this.getFallbackResponse(context),
        error: error.message,
        processingTime: Date.now() - (context.startTime || Date.now())
      };
    }
  }

  // Build system prompt for French chatbot
  buildSystemPrompt(context = {}) {
    const basePrompt = `Tu es un assistant virtuel professionnel et amical qui répond UNIQUEMENT en français. 

RÈGLES IMPORTANTES:
- Réponds TOUJOURS en français, même si l'utilisateur écrit dans une autre langue
- Sois poli, professionnel et serviable
- Garde un ton conversationnel et naturel
- Si tu ne comprends pas, demande poliment des clarifications
- Évite les réponses trop longues (maximum 2-3 phrases)
- Utilise un langage accessible et évite le jargon technique
- Sois empathique et à l'écoute des besoins de l'utilisateur`;

    // Add context-specific instructions
    if (context.businessType) {
      return `${basePrompt}

CONTEXTE MÉTIER: Tu représentes une entreprise de type "${context.businessType}".
Adapte tes réponses en conséquence tout en restant professionnel.`;
    }

    if (context.leadCapture) {
      return `${basePrompt}

OBJECTIF: Aide à capturer des informations de contact de manière naturelle.
Si approprié, demande poliment le nom, email ou téléphone de l'utilisateur.
Ne sois pas insistant - fais-le de manière conversationnelle.`;
    }

    if (context.supportMode) {
      return `${basePrompt}

MODE SUPPORT: Tu aides à résoudre des problèmes ou questions.
Sois patient, pose des questions clarifiantes si nécessaire.
Propose des solutions concrètes et pratiques.`;
    }

    return basePrompt;
  }

  // Build conversation history for context
  buildConversationHistory(messages = []) {
    return messages
      .slice(-10) // Keep last 10 messages for context
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));
  }

  // Post-process the AI response
  postProcessResponse(response, context = {}) {
    let processed = response.trim();

    // Ensure French language patterns
    processed = this.ensureFrenchResponse(processed);

    // Add personalization if available
    if (context.userName) {
      processed = processed.replace(/\b(bonjour|salut|bonsoir)\b/gi, `$1 ${context.userName}`);
    }

    // Ensure professional tone
    processed = this.ensureProfessionalTone(processed);

    return processed;
  }

  // Ensure response is in French
  ensureFrenchResponse(text) {
    // Basic checks and corrections for common English phrases
    const corrections = {
      'Hello': 'Bonjour',
      'Hi': 'Salut',
      'Thank you': 'Merci',
      'You\'re welcome': 'De rien',
      'Sorry': 'Désolé',
      'Please': 'S\'il vous plaît',
      'Yes': 'Oui',
      'No': 'Non'
    };

    let corrected = text;
    Object.entries(corrections).forEach(([en, fr]) => {
      corrected = corrected.replace(new RegExp(`\\b${en}\\b`, 'gi'), fr);
    });

    return corrected;
  }

  // Ensure professional tone
  ensureProfessionalTone(text) {
    // Replace overly casual expressions with more professional ones
    const professionalReplacements = {
      'salut': 'bonjour',
      'coucou': 'bonjour',
      'ouais': 'oui',
      'ok': 'd\'accord',
      'super': 'parfait',
      'cool': 'très bien'
    };

    let professional = text;
    Object.entries(professionalReplacements).forEach(([casual, formal]) => {
      professional = professional.replace(new RegExp(`\\b${casual}\\b`, 'gi'), formal);
    });

    return professional;
  }

  // Get fallback response when API fails
  getFallbackResponse(context = {}) {
    const fallbackResponses = [
      "Je vous remercie pour votre message. Un de nos conseillers vous répondra dans les plus brefs délais.",
      "Merci de nous avoir contactés. Nous avons bien reçu votre demande et vous répondrons rapidement.",
      "Bonjour ! Je suis temporairement indisponible, mais votre message est important pour nous. Nous vous recontacterons bientôt.",
      "Merci pour votre intérêt. Un membre de notre équipe prendra contact avec vous prochainement.",
      "Nous avons bien reçu votre message. Notre équipe vous répondra dans les meilleurs délais."
    ];

    // Select response based on context or randomly
    if (context.businessType === 'support') {
      return "Merci de nous avoir contactés pour votre demande de support. Un technicien vous répondra rapidement.";
    }

    if (context.leadCapture) {
      return "Merci pour votre intérêt ! Pourriez-vous me laisser votre email pour que nous puissions vous recontacter ?";
    }

    // Random fallback
    const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
    return fallbackResponses[randomIndex];
  }

  // Detect user intent (basic implementation)
  async detectIntent(message) {
    const intents = {
      greeting: ['bonjour', 'salut', 'hello', 'hi', 'bonsoir', 'bonne journée'],
      question: ['?', 'comment', 'pourquoi', 'quand', 'où', 'qui', 'quoi'],
      request: ['je veux', 'j\'aimerais', 'pouvez-vous', 'pourriez-vous'],
      complaint: ['problème', 'erreur', 'bug', 'ne marche pas', 'dysfonctionnement'],
      compliment: ['merci', 'parfait', 'excellent', 'super', 'génial'],
      goodbye: ['au revoir', 'à bientôt', 'bye', 'salut', 'bonne journée']
    };

    const messageLower = message.toLowerCase();
    
    for (const [intent, keywords] of Object.entries(intents)) {
      if (keywords.some(keyword => messageLower.includes(keyword))) {
        return intent;
      }
    }

    return 'general';
  }

  // Extract contact information from message
  extractContactInfo(message) {
    const contactInfo = {};

    // Email regex
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = message.match(emailRegex);
    if (emails && emails.length > 0) {
      contactInfo.email = emails[0];
    }

    // Phone regex (French format)
    const phoneRegex = /(?:(?:\+33|0)[1-9](?:[0-9]{8})|(?:\+33|0)[1-9](?:\s[0-9]{2}){4})/g;
    const phones = message.match(phoneRegex);
    if (phones && phones.length > 0) {
      contactInfo.phone = phones[0];
    }

    // Name extraction (basic - looks for "je suis" or "mon nom est")
    const nameRegex = /(?:je suis|mon nom est|je m'appelle)\s+([a-zA-ZÀ-ÿ\s]+)/i;
    const nameMatch = message.match(nameRegex);
    if (nameMatch && nameMatch[1]) {
      contactInfo.name = nameMatch[1].trim();
    }

    return contactInfo;
  }

  // Check API health
  async checkHealth() {
    try {
      if (!this.apiKey) {
        return { status: 'error', message: 'Clé API non configurée' };
      }

      const response = await axios.get(`${this.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        timeout: 10000
      });

      return { 
        status: 'ok', 
        message: 'Service Groq opérationnel',
        models: response.data.data?.length || 0
      };
    } catch (error) {
      return { 
        status: 'error', 
        message: `Erreur API Groq: ${error.message}` 
      };
    }
  }
}

module.exports = new GroqService();
