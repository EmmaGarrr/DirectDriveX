// Template file for development environment configuration
// Copy this file to environment.ts and update with your actual values

export const environment = {
  production: false,
  // Backend API URL (update with your backend URL)
  apiUrl: 'http://localhost:5000',
  // WebSocket URL (update with your WebSocket URL)
  wsUrl: 'ws://localhost:5000/ws_api',
  // Google OAuth configuration
  googleOAuth: {
    // Replace with your Google OAuth Client ID
    clientId: '471697263631-k8un0og206itv9nrji334b7uk2hf8u37.apps.googleusercontent.com',
    // Replace with your redirect URI
    redirectUri: 'http://localhost:4200/auth/google/callback'
  }
};
