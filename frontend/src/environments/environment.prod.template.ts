// Template file for production environment configuration
// Copy this file to environment.prod.ts and update with your actual values

export const environment = {
  production: true,
  // Production API URL
  apiUrl: 'https://api.mfcnextgen.com',
  // Production WebSocket URL
  wsUrl: 'wss://api.mfcnextgen.com/ws_api',
  // Production frontend URL
  frontendUrl: 'https://mfcnextgen.com',
  // Google OAuth configuration for production
  googleOAuth: {
    // Replace with your production Google OAuth Client ID
    clientId: '471697263631-k8un0og206itv9nrji334b7uk2hf8u37.apps.googleusercontent.com',
    // Replace with your production redirect URI
    redirectUri: 'https://mfcnextgen.com/auth/google/callback'
  }
};
