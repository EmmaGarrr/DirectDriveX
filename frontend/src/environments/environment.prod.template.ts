// Template file for production environment configuration
// Copy this file to environment.prod.ts and update with your actual values

export const environment = {
  production: true,
  // Production API URL
  apiUrl: 'https://your-production-api.com',
  // Production WebSocket URL
  wsUrl: 'wss://your-production-api.com/ws_api',
  // Production frontend URL
  frontendUrl: 'https://your-production-frontend.com',
  // Google OAuth configuration for production
  googleOAuth: {
    // Replace with your production Google OAuth Client ID
    clientId: 'YOUR_PRODUCTION_GOOGLE_OAUTH_CLIENT_ID_HERE',
    // Replace with your production redirect URI
    redirectUri: 'https://your-production-frontend.com/auth/google/callback'
  }
};
