# 🚀 Complete FarmConnect Setup Guide

## ✅ What's Already Working

Your application is now fully configured with:
- ✅ **Real-time MongoDB integration** with proper error handling
- ✅ **Database models** for Users, Products, Orders, and OTPs
- ✅ **Enhanced OTP system** with database storage and fallback
- ✅ **User registration** for farmers and customers
- ✅ **JWT authentication** with proper token management
- ✅ **Comprehensive error handling** and logging
- ✅ **Frontend integration** with proper role-based authentication

## 🔧 Final Setup Steps

### 1. Install MongoDB (Required)

**Windows:**
```bash
# Download and install MongoDB Community Server
# https://www.mongodb.com/try/download/community
# Or use Chocolatey:
choco install mongodb
```

**Start MongoDB:**
```bash
# Windows (if installed as service)
net start MongoDB

# Or manually:
mongod --dbpath C:\data\db
```

### 2. Fix Gmail SMTP (Critical for OTP)

**Step 1: Enable 2-Step Verification**
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable "2-Step Verification"

**Step 2: Generate App Password**
1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" and generate password
3. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

**Step 3: Update Server Configuration**
Edit `server/index.js` line 26:
```javascript
process.env.SMTP_PASS = 'your-actual-16-character-app-password'; // Remove spaces
```

**Step 4: Restart Server**
```bash
cd server
node index.js
```

### 3. Test the Complete System

**Test Gmail Configuration:**
```bash
curl http://localhost:3001/api/health/gmail
```

**Test OTP Sending:**
```bash
curl -X POST http://localhost:3001/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@gmail.com","role":"customer"}'
```

## 🎯 How to Use the Application

### For Customers:
1. Click "Customer" → "Login with Email"
2. Enter email → Receive OTP in inbox
3. Enter OTP → Access marketplace

### For Farmers:
1. Click "Farmer" → "Login with Email"
2. If not registered: System will prompt to register
3. Enter name → Account created
4. Login again → Receive OTP → Access farmer dashboard

## 🔍 Troubleshooting

### MongoDB Connection Issues:
```bash
# Check if MongoDB is running
netstat -an | findstr 27017

# Start MongoDB service
net start MongoDB
```

### Gmail Authentication Issues:
- Ensure 2-Step Verification is enabled
- Use App Password (not regular password)
- Remove spaces from App Password
- Check Gmail account security settings

### Server Issues:
```bash
# Check server logs
cd server
node index.js

# Test health endpoints
curl http://localhost:3001/api/health
curl http://localhost:3001/api/health/db
```

## 📱 Frontend Development

**Start Frontend:**
```bash
npm run dev
```

**Start Full Stack:**
```bash
npm run dev:full
```

## 🗄️ Database Schema

**Users Collection:**
- `email` (unique, indexed)
- `name`, `role`, `phone`
- `createdAt`, `updatedAt`

**OTPs Collection:**
- `email`, `code`, `role`, `name`
- `expiresAt` (TTL index)
- Auto-deletes expired OTPs

**Products Collection:**
- `title`, `description`, `price`, `quantity`
- `category`, `farmerId`, `imageUrl`

**Orders Collection:**
- `customerId`, `products[]`, `total`
- `status` (pending, confirmed, shipped, delivered)

## 🚀 Production Deployment

**Environment Variables:**
```bash
MONGODB_URI=mongodb://your-production-db
JWT_SECRET=your-secure-secret
SMTP_USER=your-production-email
SMTP_PASS=your-app-password
```

**Security Checklist:**
- ✅ Use strong JWT secret
- ✅ Enable MongoDB authentication
- ✅ Use HTTPS in production
- ✅ Set up proper CORS origins
- ✅ Implement rate limiting

## 📞 Support

If you encounter issues:
1. Check server logs for detailed error messages
2. Verify MongoDB is running
3. Test Gmail SMTP configuration
4. Ensure all environment variables are set

Your application is now ready for real-time operation! 🎉
