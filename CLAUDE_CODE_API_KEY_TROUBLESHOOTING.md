# Claude Code API Key Troubleshooting Guide

## 🚨 Problem: "Missing API key · Run /login" Error

### Symptoms
- Claude Code shows: `Invalid API key · Please run /login`
- Terminal displays: `Missing API key · Run /login`
- Environment variables work temporarily but get lost on restart

---

## 🔍 Root Cause Analysis

### Why This Happens
1. **Temporary Environment Variables**: PowerShell `$env:` variables are session-only
2. **Missing Persistent Configuration**: Environment variables not set at system level
3. **Invalid/Expired API Key**: API key may be expired or incorrect
4. **Configuration File Issues**: `settings.json` may be corrupted or missing

---

## ✅ Complete Solution Steps

### Step 1: Verify Current Configuration
```powershell
# Check if environment variables are set
echo $env:ANTHROPIC_AUTH_TOKEN
echo $env:ANTHROPIC_BASE_URL

# Check settings.json file
Get-Content "$env:USERPROFILE\.claude\settings.json"
```

### Step 2: Get Fresh API Key
1. Visit: https://z.ai/manage-apikey/apikey-list
2. Login to your Z.AI account
3. Generate new API key or copy existing one
4. Ensure key is active and not expired

### Step 3: Set Environment Variables (Immediate Fix)
```powershell
# Set environment variables for current session
$env:ANTHROPIC_AUTH_TOKEN = "YOUR_API_KEY_HERE"
$env:ANTHROPIC_BASE_URL = "https://api.z.ai/api/anthropic"
$env:ANTHROPIC_MODEL = "glm-4.5"
$env:API_TIMEOUT_MS = "3000000"

# Verify they are set
echo "Token: $env:ANTHROPIC_AUTH_TOKEN"
echo "URL: $env:ANTHROPIC_BASE_URL"
```

### Step 4: Set Permanent Environment Variables
```powershell
# Set permanent user-level environment variables
[Environment]::SetEnvironmentVariable("ANTHROPIC_AUTH_TOKEN", "YOUR_API_KEY_HERE", "User")
[Environment]::SetEnvironmentVariable("ANTHROPIC_BASE_URL", "https://api.z.ai/api/anthropic", "User")
[Environment]::SetEnvironmentVariable("ANTHROPIC_MODEL", "glm-4.5", "User")
[Environment]::SetEnvironmentVariable("API_TIMEOUT_MS", "3000000", "User")
```

### Step 5: Update settings.json File
**Location**: `C:\Users\[USERNAME]\.claude\settings.json`

**Content**:
```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://api.z.ai/api/anthropic",
    "ANTHROPIC_AUTH_TOKEN": "YOUR_API_KEY_HERE",
    "ANTHROPIC_MODEL": "glm-4.5",
    "ANTHROPIC_SMALL_FAST_MODEL": "glm-4.5",
    "API_TIMEOUT_MS": 3000000
  }
}
```

### Step 6: Refresh Environment Variables
```powershell
# Reload environment variables from system
$env:ANTHROPIC_AUTH_TOKEN = [Environment]::GetEnvironmentVariable("ANTHROPIC_AUTH_TOKEN", "User")
$env:ANTHROPIC_BASE_URL = [Environment]::GetEnvironmentVariable("ANTHROPIC_BASE_URL", "User")
```

### Step 7: Test Claude Code
```powershell
# Test Claude Code version
claude --version

# Start Claude Code
claude
```

---

## 🚀 Quick Fix Commands (Copy & Paste)

### For Immediate Use (Current Session Only)
```powershell
$env:ANTHROPIC_AUTH_TOKEN = "2ba7696d21a04f8d8a753dfe66516781.342dmDRseHFSFBmZ"; $env:ANTHROPIC_BASE_URL = "https://api.z.ai/api/anthropic"; claude
```

### For Permanent Fix (All Sessions)
```powershell
[Environment]::SetEnvironmentVariable("ANTHROPIC_AUTH_TOKEN", "2ba7696d21a04f8d8a753dfe66516781.342dmDRseHFSFBmZ", "User"); [Environment]::SetEnvironmentVariable("ANTHROPIC_BASE_URL", "https://api.z.ai/api/anthropic", "User"); echo "Permanent environment variables set successfully"
```

---

## 🔧 Advanced Troubleshooting

### Check Claude Code Status
```powershell
# In Claude Code, type:
/status
```

### Verify API Key Validity
```powershell
# Test API connection
curl -H "Authorization: Bearer $env:ANTHROPIC_AUTH_TOKEN" -H "Content-Type: application/json" -d '{"model":"glm-4.5","messages":[{"role":"user","content":"test"}]}' https://api.z.ai/api/anthropic/v1/messages
```

### Reset Claude Code Configuration
```powershell
# Remove existing configuration
Remove-Item "$env:USERPROFILE\.claude" -Recurse -Force

# Recreate directory
New-Item -ItemType Directory -Path "$env:USERPROFILE\.claude" -Force

# Recreate settings.json with correct content
```

---

## 📋 Configuration Checklist

- [ ] API key is valid and active
- [ ] Environment variables are set in current session
- [ ] Permanent environment variables are configured
- [ ] settings.json file exists and is properly formatted
- [ ] Claude Code version is up to date
- [ ] Network connection is stable
- [ ] Z.AI service is accessible

---

## 🆘 Emergency Recovery

### If Nothing Works
1. **Restart PowerShell/Command Prompt**
2. **Run the quick fix command**
3. **Check Windows Environment Variables**:
   - Press `Win + R`
   - Type `sysdm.cpl`
   - Go to "Advanced" tab
   - Click "Environment Variables"
   - Verify `ANTHROPIC_AUTH_TOKEN` and `ANTHROPIC_BASE_URL` are set

### Alternative: Use Setup Script
```powershell
# Run the setup script
.\setup_glm_integration.ps1 -ApiKey "YOUR_API_KEY_HERE"
```

---

## 📞 Support Resources

- **Z.AI API Documentation**: https://docs.z.ai/scenario-example/develop-tools/claude
- **API Key Management**: https://z.ai/manage-apikey/apikey-list
- **Claude Code GitHub**: https://github.com/anthropics/claude-code

---

## 📝 Notes

- **API Key Format**: Should be a long string of characters and numbers
- **Base URL**: Always use `https://api.z.ai/api/anthropic` for Z.AI
- **Model**: Use `glm-4.5` for best performance
- **Timeout**: 3000000ms (50 minutes) for large operations

---

## 🔄 Maintenance

### Regular Checks
- Verify API key is still valid (monthly)
- Check for Claude Code updates
- Monitor Z.AI service status
- Backup settings.json file

### When to Update
- API key expires
- Claude Code version changes
- Z.AI service updates
- System environment changes

---

*Last Updated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")*
*Problem Solved: Claude Code API Key Recognition*
