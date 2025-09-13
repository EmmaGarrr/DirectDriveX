# Adding New Google Drive Accounts to DirectDriveX

This guide explains how to add new Google Drive accounts to the DirectDriveX storage system. Follow these steps carefully to ensure proper integration.

## Overview

DirectDriveX uses a pool of Google Drive accounts for load balancing and redundancy. Each account needs proper configuration in both Google Cloud Console and the DirectDriveX system.

## Prerequisites

Before adding a new account, you need:

1. **Google Cloud Console Project** with Google Drive API enabled
2. **OAuth 2.0 Credentials** (Client ID, Client Secret, Refresh Token)
3. **Google Drive Folder ID** where files will be stored
4. **Backend server access** and **MongoDB database access**

## Step 1: Google Cloud Console Setup

### 1.1 Enable Google Drive API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to **APIs & Services → Library**
4. Search for **"Google Drive API"**
5. Click **Enable** and wait for activation

### 1.2 Create OAuth 2.0 Credentials
1. Go to **APIs & Services → Credentials**
2. Click **+ CREATE CREDENTIALS → OAuth client ID**
3. Select **"Desktop application"** as application type
4. Give it a descriptive name (e.g., "DirectDriveX Account 5")
5. Click **Create**
6. **Important:** Copy the **Client ID** and **Client Secret** immediately

### 1.3 Generate Refresh Token
Run this Python script to generate the refresh token:

```python
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ['https://www.googleapis.com/auth/drive']

def get_refresh_token(client_id, client_secret):
    flow = InstalledAppFlow.from_client_config(
        {
            "installed": {
                "client_id": client_id,
                "client_secret": client_secret,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                "redirect_uris": ["http://localhost"]
            }
        },
        SCOPES
    )

    creds = flow.run_local_server(port=0)
    return creds.refresh_token

# Replace with your actual client_id and client_secret
refresh_token = get_refresh_token("YOUR_CLIENT_ID", "YOUR_CLIENT_SECRET")
print(f"Refresh Token: {refresh_token}")
```

### 1.4 Get Google Drive Folder ID
1. Go to Google Drive
2. Create a new folder for DirectDriveX uploads
3. Open the folder
4. Copy the folder ID from the URL:
   - URL format: `https://drive.google.com/drive/folders/{FOLDER_ID}`
   - Example: `1AbCdEfGhIjKlMnOpQrStUvWxYz1234567890`

## Step 2: Environment Configuration

### 2.1 Update .env File
Add the new account credentials to your `.env` file:

```bash
# For account_5 (next available account number)
GDRIVE_ACCOUNT_5_CLIENT_ID=your_client_id_here
GDRIVE_ACCOUNT_5_CLIENT_SECRET=your_client_secret_here
GDRIVE_ACCOUNT_5_REFRESH_TOKEN=your_refresh_token_here
GDRIVE_ACCOUNT_5_FOLDER_ID=your_folder_id_here
```

**Note:** Use the next available account number (account_5, account_6, etc.)

### 2.2 Account Numbering Convention
- First account: `GDRIVE_ACCOUNT_1_*`
- Second account: `GDRIVE_ACCOUNT_2_*`
- Third account: `GDRIVE_ACCOUNT_3_*`
- And so on...

## Step 3: Database Migration

### 3.1 Migrate Account to Database
Run the migration command to add the new account to MongoDB:

**For Local Development:**
```bash
cd backend
python -c "from app.services.google_drive_account_service import GoogleDriveAccountService; import asyncio; asyncio.run(GoogleDriveAccountService.migrate_env_accounts_to_db(force=True))"
```

**For Production:**
```bash
cd backend
python3 -c 'from app.services.google_drive_account_service import GoogleDriveAccountService; import asyncio; asyncio.run(GoogleDriveAccountService.migrate_env_accounts_to_db(force=True))'
```

### 3.2 Verify Migration
Check that the account was added successfully:

```bash
# Connect to MongoDB
mongosh

# Check google_drive_accounts collection
use directdrivex
db.google_drive_accounts.find().pretty()
```

You should see your new account in the list with `is_active: true`.

## Step 4: Set as Active Account (Optional)

If you want the new account to be the primary active account:

### 4.1 Update Current Account Index
Edit `backend/app/services/google_drive_service.py`:

```python
# Line 59 - change current_account_index to your desired account's position
self.current_account_index = 4  # For account_5 (0-based index)
```

### 4.2 Deactivate Previous Accounts (Optional)
If you want to deactivate other accounts, use the admin API:

```bash
# Deactivate account_1
curl -X POST http://localhost:5000/api/v1/admin/storage/google-drive/accounts/account_1/toggle

# Deactivate account_4
curl -X POST http://localhost:5000/api/v1/admin/storage/google-drive/accounts/account_4/toggle
```

## Step 5: Test the New Account

### 5.1 Restart Backend Server
```bash
# Stop the current server (Ctrl+C)
# Start it again
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload
```

### 5.2 Verify Startup Message
Look for this message in the logs:
```
[GDRIVE_POOL] Initialized with X accounts. Active account: account_5
```

### 5.3 Test Upload
Use the frontend admin panel or API to test a file upload with the new account.

## Step 6: Monitor Account Health

### 6.1 Check Account Status
Use the admin panel to monitor:
- Storage usage
- Health status
- File count

### 6.2 Check Logs
Monitor server logs for any API errors:
```
Error updating quota for account account_5: [error message]
```

## Troubleshooting

### Common Issues

1. **"Google Drive API has not been used"**
   - Fix: Enable Google Drive API in Google Cloud Console
   - Wait 5-10 minutes for API activation to propagate

2. **"403 Forbidden" errors**
   - Check OAuth credentials are correct
   - Verify refresh token is valid
   - Ensure account has proper permissions

3. **"Account not found in pool"**
   - Run migration command again
   - Check .env file for typos
   - Verify MongoDB connection

4. **"Invalid folder ID"**
   - Double-check folder ID format
   - Ensure folder exists in Google Drive
   - Verify account has access to the folder

### API Error Messages and Solutions

| Error Message | Solution |
|---------------|----------|
| `accessNotConfigured` | Enable Google Drive API in Google Cloud Console |
| `invalid_grant` | Generate new refresh token |
| `insufficientPermissions` | Check folder access permissions |
| `dailyLimitExceeded` | Wait 24 hours or increase quota |

## Best Practices

1. **Account Rotation:** Don't keep the same account active for too long
2. **Monitoring:** Regularly check account health and storage usage
3. **Backup:** Always have multiple active accounts for redundancy
4. **Security:** Keep OAuth credentials secure, never commit to git
5. **Testing:** Always test new accounts before using in production

## Account Management Commands

### View All Accounts
```bash
# MongoDB
mongosh directdrivex
db.google_drive_accounts.find({}, {account_id: 1, is_active: 1, health_status: 1})
```

### Toggle Account Status
```bash
# Using admin API
curl -X POST http://localhost:5000/api/v1/admin/storage/google-drive/accounts/{account_id}/toggle
```

### Reload Account Pool
```bash
# This happens automatically on startup, but you can force reload:
cd backend
python -c "from app.services.google_drive_service import gdrive_pool_manager; import asyncio; asyncio.run(gdrive_pool_manager.reload_from_db())"
```

## Support

If you encounter issues:
1. Check the logs for specific error messages
2. Verify all credentials are correct
3. Ensure Google Drive API is enabled
4. Contact the development team for assistance

---

**Remember:** Always test new accounts in development before deploying to production!