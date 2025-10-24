# Gmail SMTP Setup for FarmConnect OTP

## Current Issue
The OTP is being generated and logged in the console, but emails are not being sent because Gmail SMTP is not configured.

## Quick Fix

### 1. Create Gmail App Password
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Navigate to **Security** → **2-Step Verification**
3. Enable 2-Step Verification if not already enabled
4. Go to **App passwords** (under 2-Step Verification)
5. Generate a new app password for "Mail"
6. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### 2. Configure Server Environment
Create a file `server/.env` with your Gmail credentials:

```env
# Server Configuration
PORT=3001
JWT_SECRET=farmconnect-jwt-secret-2024

# Gmail SMTP Configuration (REQUIRED for email OTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-actual@gmail.com
SMTP_PASS=your-16-character-app-password
SMTP_FROM=your-actual@gmail.com

# MongoDB Configuration (Optional)
MONGODB_URI=mongodb://127.0.0.1:27017/farmconnect
MONGO_TIMEOUT_MS=10000
```

### 3. Restart Server
```bash
cd server
node index.js
```

### 4. Test Configuration
Visit: `http://localhost:3001/api/health/gmail`

Should return:
```json
{
  "ok": true,
  "message": "Gmail SMTP configured correctly",
  "user": "your@gmail.com",
  "from": "your@gmail.com"
}
```

## What's Fixed

✅ **Enhanced Error Handling** - Clear error messages for missing configuration  
✅ **Gmail App Password Validation** - Prevents using placeholder values  
✅ **Fallback OTP Display** - Shows OTP in console if email fails  
✅ **Configuration Endpoint** - `/api/health/gmail` to test setup  
✅ **Proper Async/Await** - Ensures email delivery is attempted  

## Expected Behavior

**Before Setup:**
- OTP generated in console ✅
- Email not sent ❌
- Error: "SMTP_FROM is not configured"

**After Setup:**
- OTP generated in console ✅
- Email sent to user's inbox ✅
- Real-time delivery via Gmail SMTP ✅

## Troubleshooting

If emails still don't send:
1. Check Gmail App Password is correct (16 characters)
2. Ensure 2-Step Verification is enabled
3. Try the test endpoint: `curl http://localhost:3001/api/health/gmail`
4. Check server console for detailed error messages

The system will now send OTP emails in real-time once Gmail is properly configured!
