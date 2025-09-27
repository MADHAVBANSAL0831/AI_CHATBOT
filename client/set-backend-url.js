#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get command line arguments
const args = process.argv.slice(2);
const backendUrl = args[0];

if (!backendUrl) {
  console.log('Usage: node set-backend-url.js <backend-url>');
  console.log('Example: node set-backend-url.js https://abc123.ngrok.io');
  process.exit(1);
}

// Ensure URL doesn't end with slash
const cleanUrl = backendUrl.replace(/\/$/, '');

// Update .env file
const envPath = path.join(__dirname, '.env');
const envContent = `# React App Environment Variables
REACT_APP_API_URL=${cleanUrl}/api
REACT_APP_SERVER_URL=${cleanUrl}
REACT_APP_APP_NAME=Auto-Reply Chatbot
REACT_APP_VERSION=1.0.0
`;

fs.writeFileSync(envPath, envContent);
console.log(`✅ Backend URL updated to: ${cleanUrl}`);
console.log('🔄 Please restart your React development server for changes to take effect.');
console.log('   Stop the server (Ctrl+C) and run: npm start');
