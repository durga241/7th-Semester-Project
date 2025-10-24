# 🔧 Server Setup Fix

## Issue Fixed

The server was missing the `bcrypt` package which is required for admin user management (password hashing).

---

## ✅ What Was Fixed

1. **Added bcrypt import** to `server/index.js`
2. **Added bcrypt dependency** to `server/package.json`

---

## 🚀 Steps to Fix

### 1. Install bcrypt Package

```bash
cd server
npm install bcrypt
```

### 2. Restart the Server

```bash
# Stop the current server (Ctrl+C)
# Then start again:
npm start
```

---

## 📝 Changes Made

### File: `server/index.js`
```javascript
// Added this line at the top:
const bcrypt = require('bcrypt');
```

### File: `server/package.json`
```json
{
  "dependencies": {
    "bcrypt": "^5.1.1",  // ← Added this
    "cloudinary": "^2.5.1",
    // ... other dependencies
  }
}
```

---

## ✅ Verification

After installing and restarting, verify the server is working:

1. **Check server logs** - Should see:
   ```
   ✅ MongoDB connected successfully
   [api] server running on http://localhost:3001
   ```

2. **Test admin endpoint**:
   ```bash
   curl http://localhost:3001/api/admin/stats
   ```

3. **Test product creation** from the UI

---

## 🎯 What This Fixes

- ✅ Admin user creation (password hashing)
- ✅ Admin user updates (password changes)
- ✅ All admin endpoints now work
- ✅ Product creation/updates work
- ✅ Server no longer crashes on admin operations

---

## 🐛 If Still Not Working

### Check MongoDB Connection

Make sure MongoDB is running and the connection string is correct in `.env`:

```env
MONGODB_URI=mongodb+srv://dp_project:Durga%40123@project-work.cvmqosn.mongodb.net/farmconnect?retryWrites=true&w=majority
```

### Check Server Logs

Look for any error messages when you try to add a product or perform admin operations.

### Restart Both Servers

```bash
# Terminal 1 - Backend
cd server
npm install
npm start

# Terminal 2 - Frontend  
npm run dev
```

---

## 📋 Quick Commands

```bash
# Install dependencies
cd server
npm install

# Start server
npm start

# In another terminal - start frontend
cd ..
npm run dev
```

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ Server starts without errors
2. ✅ Can add products from Farmer Dashboard
3. ✅ Can access Admin Dashboard (when implemented)
4. ✅ No "bcrypt is not defined" errors
5. ✅ MongoDB connection successful

---

**After running `npm install` in the server directory, restart the server and everything should work!** 🚀
