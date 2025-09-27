# 🤖 Auto-Reply Chatbot - Système de Chatbot Français Intelligent

Un système de chatbot auto-réponse professionnel avec capture de leads, développé avec la stack MERN et intégration Groq API.

## 🌟 Fonctionnalités Principales

### ✨ Chatbot Intelligent
- **Réponses uniquement en français** - Chatbot configuré pour répondre exclusivement en français
- **Intégration Groq API** - Utilise l'API Groq pour des réponses naturelles et intelligentes
- **Réponses instantanées** - Système d'auto-réponse en temps réel
- **Templates personnalisables** - Système de templates pour différents types de réponses

### 📊 Capture de Leads
- **Capture automatique** - Extraction automatique des informations de contact
- **Système de scoring** - Attribution de scores aux leads selon leur engagement
- **Notifications en temps réel** - Alertes instantanées lors de la capture de nouveaux leads
- **Export des données** - Export CSV des leads capturés

### 🔧 Gestion Multi-Comptes
- **Support multi-plateformes** - WhatsApp, Telegram, Messenger, Instagram, Custom
- **Gestion sécurisée** - Isolation des sessions et commutation entre comptes
- **Comptes multiples** - Gestion de plusieurs comptes par utilisateur

### 📈 Tableau de Bord Administrateur
- **Analytics en temps réel** - Statistiques détaillées des conversations et leads
- **Gestion des conversations** - Vue d'ensemble et gestion des conversations actives
- **Logs détaillés** - Historique complet des interactions
- **Paramètres avancés** - Configuration fine du comportement du chatbot

### 🔒 Sécurité et Confidentialité
- **Chiffrement des données** - Protection des informations sensibles
- **Authentification sécurisée** - JWT avec refresh tokens
- **Respect de la vie privée** - Conformité aux réglementations de protection des données
- **Rate limiting** - Protection contre les abus

## 🛠️ Stack Technique

### Backend
- **Node.js** avec Express.js
- **MongoDB** avec Mongoose
- **Socket.IO** pour les communications temps réel
- **JWT** pour l'authentification
- **Groq API** pour l'intelligence artificielle
- **Nodemailer** pour les notifications email

### Frontend
- **React 18** avec TypeScript
- **Material-UI (MUI)** pour l'interface utilisateur
- **React Router** pour la navigation
- **React Hook Form** pour la gestion des formulaires
- **Recharts** pour les graphiques et analytics
- **Socket.IO Client** pour les mises à jour temps réel

### Sécurité
- **Helmet.js** pour la sécurité HTTP
- **bcryptjs** pour le hachage des mots de passe
- **express-rate-limit** pour la limitation de taux
- **express-validator** pour la validation des données

## 🚀 Installation et Configuration

### Prérequis
- Node.js (version 16 ou supérieure)
- MongoDB (local ou cloud)
- Clé API Groq
- Configuration email (optionnelle pour les notifications)

### Installation

1. **Cloner le repository**
```bash
git clone <repository-url>
cd auto-reply-chatbot
```

2. **Installer les dépendances backend**
```bash
npm install
```

3. **Installer les dépendances frontend**
```bash
cd client
npm install
cd ..
```

4. **Configuration de l'environnement**
```bash
cp .env.example .env
```

Éditer le fichier `.env` avec vos configurations :
```env
# Configuration serveur
PORT=5000
NODE_ENV=development

# Base de données
MONGODB_URI=mongodb://localhost:27017/auto-reply-chatbot

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Groq API
GROQ_API_KEY=your-groq-api-key-here
GROQ_MODEL=mixtral-8x7b-32768

# Email (optionnel)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend
CLIENT_URL=http://localhost:3000
```

### Démarrage

1. **Démarrer MongoDB** (si local)
```bash
mongod
```

2. **Démarrer le serveur de développement**
```bash
npm run dev
```

Cela démarre :
- Backend sur http://localhost:5000
- Frontend sur http://localhost:3000

## 📱 Utilisation

### Premier Démarrage

1. **Créer un compte administrateur**
   - Aller sur http://localhost:3000/register
   - Créer le premier compte (sera automatiquement admin)

2. **Configurer les paramètres**
   - Accéder aux paramètres depuis le tableau de bord
   - Configurer les horaires de travail
   - Activer/désactiver l'auto-réponse

3. **Créer des templates**
   - Aller dans la section Templates
   - Créer des templates pour différents scénarios
   - Configurer les déclencheurs (mots-clés, intentions)

4. **Ajouter des comptes**
   - Configurer les comptes de plateformes (WhatsApp, Telegram, etc.)
   - Tester les connexions

### Fonctionnalités Principales

#### 🤖 Auto-Réponse
- Le système répond automatiquement aux messages entrants
- Utilise l'IA Groq pour des réponses naturelles en français
- Applique les templates selon les déclencheurs configurés

#### 📊 Capture de Leads
- Détection automatique des informations de contact
- Attribution de scores selon l'engagement
- Notifications instantanées des nouveaux leads

#### 📈 Analytics
- Statistiques en temps réel
- Taux de conversion
- Performance par plateforme
- Historique des conversations

## 🔧 Configuration Avancée

### Templates de Réponse
Les templates supportent des variables dynamiques :
- `{{userName}}` - Nom de l'utilisateur
- `{{currentTime}}` - Heure actuelle
- `{{currentDate}}` - Date actuelle
- Variables personnalisées

### Déclencheurs
- **Mots-clés** - Réponse basée sur des mots spécifiques
- **Intentions** - Détection d'intention via IA
- **Horaires** - Réponses selon les heures de travail
- **Plateformes** - Réponses spécifiques par plateforme

### Notifications
- **Email** - Notifications par email des nouveaux leads
- **Temps réel** - Notifications dans l'interface web
- **Webhooks** - Intégration avec des services externes

## 🧪 Tests

```bash
# Tests backend
npm test

# Tests frontend
cd client
npm test
```

## 📦 Déploiement

### Production

1. **Build du frontend**
```bash
cd client
npm run build
cd ..
```

2. **Variables d'environnement de production**
```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
GROQ_API_KEY=your-production-groq-key
```

3. **Démarrage en production**
```bash
npm start
```

### Docker (optionnel)
```bash
docker-compose up -d
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Consulter la documentation
- Contacter l'équipe de développement

## 🔄 Roadmap

- [ ] Intégration WhatsApp Business API
- [ ] Support multilingue étendu
- [ ] Analytics avancées avec IA
- [ ] Intégration CRM
- [ ] API publique pour développeurs
- [ ] Application mobile

---

**Développé avec ❤️ pour automatiser vos conversations et capturer plus de leads !**
