# 🚀 Guide de Démarrage - Auto-Reply Chatbot

Ce guide vous accompagne pour démarrer rapidement votre système de chatbot auto-réponse.

## ✅ Prérequis Vérifiés

- ✅ Node.js installé
- ✅ Structure du projet créée
- ✅ Dépendances installées
- ✅ Configuration de base prête

## 🔧 Configuration Requise

### 1. Base de Données MongoDB

**Option A: MongoDB Local**
```bash
# Installer MongoDB Community Edition
# Windows: https://www.mongodb.com/try/download/community
# Démarrer MongoDB
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Créer un compte sur https://www.mongodb.com/atlas
2. Créer un cluster gratuit
3. Obtenir la chaîne de connexion
4. Remplacer `MONGODB_URI` dans `.env`

### 2. Clé API Groq

1. Aller sur https://console.groq.com/
2. Créer un compte gratuit
3. Générer une clé API
4. Remplacer `GROQ_API_KEY` dans `.env`

```env
GROQ_API_KEY=gsk_your_actual_groq_api_key_here
```

### 3. Configuration Email (Optionnelle)

Pour les notifications par email, configurer dans `.env` :
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre-email@gmail.com
EMAIL_PASS=votre-mot-de-passe-application
```

## 🚀 Démarrage Rapide

### Méthode 1: Démarrage Complet (Recommandée)

```bash
# Dans le répertoire racine
npm run dev
```

Cette commande démarre automatiquement :
- Backend sur http://localhost:5000
- Frontend sur http://localhost:3000

### Méthode 2: Démarrage Séparé

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run client
```

## 🔍 Vérification du Fonctionnement

### 1. Tester le Backend
```bash
curl http://localhost:5000/api/health
```

Réponse attendue :
```json
{
  "status": "OK",
  "message": "Serveur de chatbot auto-réponse opérationnel",
  "timestamp": "2024-XX-XXTXX:XX:XX.XXXZ"
}
```

### 2. Tester le Frontend
- Ouvrir http://localhost:3000
- Vous devriez voir la page de connexion

## 👤 Premier Utilisateur

### 1. Créer un Compte Administrateur
1. Aller sur http://localhost:3000/register
2. Remplir le formulaire d'inscription
3. Le premier utilisateur sera automatiquement administrateur

### 2. Connexion
1. Utiliser vos identifiants pour vous connecter
2. Accéder au tableau de bord

## ⚙️ Configuration Initiale

### 1. Paramètres du Chatbot
1. Aller dans **Paramètres**
2. Configurer :
   - Langue : Français (par défaut)
   - Auto-réponse : Activée
   - Délai de réponse : 1000ms
   - Horaires de travail (optionnel)

### 2. Créer des Templates
1. Aller dans **Templates**
2. Créer votre premier template :
   ```
   Nom: Salutation
   Catégorie: greeting
   Contenu: Bonjour {{userName}} ! Comment puis-je vous aider aujourd'hui ?
   Déclencheurs: bonjour, salut, hello
   ```

### 3. Ajouter des Comptes (Simulation)
1. Aller dans **Paramètres** > **Comptes**
2. Ajouter un compte de test :
   - Plateforme: custom
   - Nom: Test Account
   - ID: test-001

## 🧪 Test du Système

### 1. Test d'Auto-Réponse
```bash
# Envoyer un message de test
curl -X POST http://localhost:5000/api/chat/message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "Bonjour",
    "platform": "custom",
    "accountId": "test-001",
    "contactId": "contact-001",
    "contactName": "Test User"
  }'
```

### 2. Vérifier les Logs
- Consulter la console du serveur
- Vérifier les réponses dans le tableau de bord

## 🔧 Dépannage

### Problème: Erreur de Connexion MongoDB
```
Solution: Vérifier que MongoDB est démarré
- Local: mongod
- Atlas: Vérifier la chaîne de connexion
```

### Problème: Erreur Groq API
```
Solution: Vérifier la clé API
- Clé valide et active
- Quota non dépassé
```

### Problème: Frontend ne se connecte pas au Backend
```
Solution: Vérifier les URLs
- Backend: http://localhost:5000
- Frontend: http://localhost:3000
- Variables d'environnement correctes
```

### Problème: Erreur CORS
```
Solution: Vérifier la configuration CORS
- CLIENT_URL dans .env backend
- REACT_APP_API_URL dans client/.env
```

## 📊 Fonctionnalités Disponibles

### ✅ Implémentées
- ✅ Authentification utilisateur
- ✅ Tableau de bord avec statistiques
- ✅ Système de templates
- ✅ Auto-réponse avec Groq API
- ✅ Capture de leads
- ✅ Notifications temps réel
- ✅ Interface responsive

### 🚧 En Développement
- 🚧 Intégration WhatsApp réelle
- 🚧 Analytics avancées
- 🚧 Export de données
- 🚧 Gestion multi-comptes complète

## 🆘 Support

### Logs Utiles
```bash
# Logs du serveur
tail -f server.log

# Logs MongoDB
tail -f /var/log/mongodb/mongod.log
```

### Commandes de Debug
```bash
# Vérifier les ports utilisés
netstat -an | findstr :5000
netstat -an | findstr :3000

# Tester la connectivité
ping localhost
curl -I http://localhost:5000/api/health
```

### Ressources
- Documentation MongoDB: https://docs.mongodb.com/
- Documentation Groq: https://console.groq.com/docs
- Documentation React: https://reactjs.org/docs
- Documentation Material-UI: https://mui.com/

## 🎉 Félicitations !

Votre système de chatbot auto-réponse est maintenant opérationnel !

**Prochaines étapes :**
1. Personnaliser vos templates
2. Configurer vos comptes de plateformes
3. Tester les réponses automatiques
4. Analyser les performances dans le tableau de bord

**Besoin d'aide ?**
- Consulter le README.md pour plus de détails
- Vérifier les logs en cas d'erreur
- Tester chaque composant individuellement
