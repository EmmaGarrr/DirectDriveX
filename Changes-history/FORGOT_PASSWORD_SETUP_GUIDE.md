# Forgot Password Setup Guide

**Quick Setup Instructions for DirectDriveX Password Reset Feature**

## 🚀 Quick Start (5 Minutes)

### 1. Install Dependencies
```bash
cd backend
pip install aiosmtplib==0.4.4 email-validator==2.1.0
```

### 2. Configure Environment
```bash
# Copy development template
cp env.dev.template .env

# Edit .env file with your settings
nano .env
```

**Required Settings:**
```bash
# Email Configuration (Gmail Example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_USE_TLS=True
FROM_EMAIL=your_email@gmail.com
FROM_NAME=DirectDrive System

# Password Reset Settings
PASSWORD_RESET_TOKEN_EXPIRE_MINUTES=30
FRONTEND_URL=http://localhost:4200

# Security
JWT_SECRET_KEY=your_secure_secret_key_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

### 3. Setup Database
```bash
cd backend
python create_password_reset_indexes.py
```

### 4. Test Email Configuration
```bash
python test_email.py
```

### 5. Test API Endpoints
```bash
python test_password_reset_api.py
```

### 6. Start Backend
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 📧 Gmail App Password Setup

If using Gmail for sending emails:

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate App Password:**
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Use the generated password** in your `.env` file

## 🔧 Production Deployment

### 1. Update Production Environment
```bash
# Edit production template
nano env.prod.template

# Set production values:
FRONTEND_URL=https://yourdomain.com
SMTP_HOST=smtp.gmail.com  # or your SMTP provider
SMTP_USERNAME=your_production_email@gmail.com
SMTP_PASSWORD=your_production_app_password
```

### 2. Deploy Backend
```bash
# Your existing deployment process
docker-compose up -d
```

### 3. Verify Installation
```bash
# Test production endpoints
curl -X POST "https://yourdomain.com/api/v1/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## 🧪 Testing Checklist

### Email Testing
- [ ] Email configuration works
- [ ] Reset emails are sent
- [ ] Email links are correct
- [ ] Email content is readable

### API Testing
- [ ] Forgot password endpoint responds
- [ ] Rate limiting works (5 attempts/hour)
- [ ] Invalid tokens are rejected
- [ ] Valid tokens work correctly

### Frontend Testing
- [ ] Forgot password page loads
- [ ] Email submission works
- [ ] Reset password page loads with token
- [ ] Password reset completes successfully

## 🚨 Common Issues & Solutions

### Issue: "SMTP not configured"
**Solution:** Check your `.env` file has all SMTP settings

### Issue: "Email not sending"
**Solution:** 
- Verify Gmail app password is correct
- Check if 2FA is enabled on Gmail
- Test with `python test_email.py`

### Issue: "Token validation failing"
**Solution:** Run `python create_password_reset_indexes.py`

### Issue: "Rate limiting too strict"
**Solution:** Adjust limits in `routes_auth.py` (currently 5/hour)

### Issue: "Frontend can't connect"
**Solution:** Check `FRONTEND_URL` in `.env` matches your frontend URL

## 📊 Monitoring

### Check Logs
```bash
# Backend logs
tail -f logs/app.log

# Email sending logs
grep "Password reset email" logs/app.log
```

### Database Monitoring
```bash
# Check password reset tokens
mongo directdrive --eval "db.password_reset_tokens.find().pretty()"

# Clean expired tokens
mongo directdrive --eval "db.password_reset_tokens.deleteMany({expires_at: {\$lt: new Date()}})"
```

## 🔒 Security Checklist

- [ ] JWT secret key is secure and unique
- [ ] SMTP credentials are secure
- [ ] Rate limiting is enabled
- [ ] Tokens expire after 30 minutes
- [ ] HTTPS is enabled in production
- [ ] No sensitive data in logs

## 📞 Support

If you encounter issues:

1. **Check the logs:** `tail -f logs/app.log`
2. **Run tests:** `python test_email.py` and `python test_password_reset_api.py`
3. **Verify configuration:** Check all `.env` settings
4. **Check database:** Ensure indexes are created

## ✅ Success Indicators

You'll know it's working when:

1. ✅ `python test_email.py` sends a test email
2. ✅ `python test_password_reset_api.py` passes all tests
3. ✅ Frontend forgot password page submits successfully
4. ✅ Reset emails are received with working links
5. ✅ Password reset completes without errors

**🎉 Congratulations! Your forgot password feature is now fully functional!**
