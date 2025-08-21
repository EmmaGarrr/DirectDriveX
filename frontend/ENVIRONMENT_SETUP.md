# Frontend Environment Setup

## Overview
This document explains how environment configuration works in the DirectDriveX frontend application.

## Environment Files

### Template Files (Committed to Git)
- `src/environments/environment.template.ts` - Development environment template
- `src/environments/environment.prod.template.ts` - Production environment template

### Generated Files (Not Committed to Git)
- `src/environments/environment.ts` - Development environment (generated from template)
- `src/environments/environment.prod.ts` - Production environment (generated from template)

## Build Process

### Local Development
1. Run `npm run prepare-env` to generate environment files from templates
2. Run `npm start` to start the development server

### Production Build
1. The build process automatically runs `npm run prepare-env` before building
2. This ensures the correct environment files are available during the build

### Vercel Deployment
- Vercel automatically runs `npm run build` which includes environment preparation
- No additional configuration needed

## Environment Variables

### Development Environment
- API URL: `http://localhost:5000`
- WebSocket URL: `ws://localhost:5000/ws_api`
- Frontend URL: `http://localhost:4200`

### Production Environment
- API URL: `https://api.mfcnextgen.com`
- WebSocket URL: `wss://api.mfcnextgen.com/ws_api`
- Frontend URL: `https://mfcnextgen.com`

## Google OAuth Configuration
Both environments use the same Google OAuth Client ID but different redirect URIs:
- Development: `http://localhost:4200/auth/google/callback`
- Production: `https://mfcnextgen.com/auth/google/callback`

## Troubleshooting

### Build Fails with "environment.prod.ts not found"
This error occurs when the environment preparation script hasn't run. Solutions:
1. Run `npm run prepare-env` manually
2. Ensure template files exist in `src/environments/`
3. Check that the `scripts/prepare-env.js` file exists

### Environment Values Not Updating
If you need to change environment values:
1. Update the appropriate template file (`environment.template.ts` or `environment.prod.template.ts`)
2. Run `npm run prepare-env` to regenerate the environment files
3. Restart your development server or rebuild

## Security Notes
- Environment files are in `.gitignore` to prevent committing sensitive data
- Template files contain the actual values but are considered safe to commit
- For enhanced security, consider using Vercel environment variables in the future
