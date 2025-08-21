# Environment Setup Guide

## Overview
This project uses environment-specific configuration files that are not tracked in git for security reasons.

## Quick Setup

### For New Developers
1. Copy the template files to create your environment configuration:
   ```bash
   cp src/environments/environment.template.ts src/environments/environment.ts
   cp src/environments/environment.prod.template.ts src/environments/environment.prod.ts
   ```

2. Update the values in both files with your configuration (see details below)

### Development Environment Setup
1. Open `src/environments/environment.ts`
2. Update the following values:
   - `apiUrl`: Your backend API URL (default: `http://localhost:5000`)
   - `wsUrl`: Your WebSocket URL (default: `ws://localhost:5000/ws_api`)
   - `googleOAuth.clientId`: Your Google OAuth Client ID
   - `googleOAuth.redirectUri`: Your Google OAuth redirect URI

### Production Environment Setup
1. Open `src/environments/environment.prod.ts`
2. Update the following values:
   - `apiUrl`: Your production API URL
   - `wsUrl`: Your production WebSocket URL
   - `frontendUrl`: Your production frontend URL
   - `googleOAuth.clientId`: Your production Google OAuth Client ID
   - `googleOAuth.redirectUri`: Your production Google OAuth redirect URI

## Security Notes
- ✅ **Safe to expose**: Google OAuth Client ID, URLs, API endpoints
- ❌ **Never expose**: Google OAuth Client Secret, database credentials, API keys
- 🔒 **Environment files are gitignored** to prevent accidental commits

## Troubleshooting
- If you get "module not found" errors, ensure you've copied the template files
- If Google OAuth doesn't work, verify your Client ID and redirect URI
- If API calls fail, check your `apiUrl` configuration

## Deployment
For production deployment, ensure your CI/CD pipeline creates the appropriate environment files from templates or environment variables.
