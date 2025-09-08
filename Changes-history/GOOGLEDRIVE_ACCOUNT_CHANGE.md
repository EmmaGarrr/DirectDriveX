whenever you want to change google drive accounts or details check following commands :

For Local:

1. add Account details in .env
2. In the terminal run : cd backend
3. after that run : python -c "from app.services.google_drive_account_service import GoogleDriveAccountService; import asyncio; asyncio.run(GoogleDriveAccountService.migrate_env_accounts_to_db(force=True))"

For Live:

1. add Account details in .env
2. In the terminal run : cd backend
3. after that run : python3 -c 'from app.services.google_drive_account_service import GoogleDriveAccountService; import asyncio; asyncio.run(GoogleDriveAccountService.migrate_env_accounts_to_db(force=True))'


so, from now your following files will get your new account details:

1. .env file (your changes here)
   ↓
2. config.py (reads .env)
   ↓
3. google_drive_account_service.py (migrates to database)
   ↓
4. MongoDB (stores account details)
   ↓
5. google_drive_service.py (uses for API calls)
   ↓
6. Frontend admin panel (displays and manages)