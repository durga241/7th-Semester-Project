# 🔧 FIX: Missing Gmail Credentials

## ❌ **Current Error**
```
[FORGOT PASSWORD] ❌ Email send failed: Missing credentials for "PLAIN"
```

**This means:** Your `server/.env` file is missing Gmail credentials!

---

## ✅ **SOLUTION: Add Gmail Credentials**

### Step 1: Get Gmail App Password

#### A. Enable 2-Step Verification
1. Go to: https://myaccount.google.com/security
2. Find **"2-Step Verification"**
3. Click **"Get Started"** and follow instructions
4. **Important:** You MUST enable this first!

#### B. Generate App Password
1. After enabling 2-Step Verification, go to: https://myaccount.google.com/apppasswords
2. **OR** Search "App Passwords" in Google Account settings
3. Click **"Select app"** → Choose **"Mail"**
4. Click **"Select device"** → Choose **"Other (Custom name)"**
5. Type: **"FarmConnect"**
6. Click **"Generate"**
7. **Copy the 16-digit password** (format: xxxx xxxx xxxx xxxx)
8. **Remove spaces** → Final format: `xxxxxxxxxxxxxxxx`

---

### Step 2: Edit `server/.env` File

#### Option A: Manual Edit
1. Open: `d:\7th Semester Project\server\.env`
2. Add these lines (or update if they exist):

```env
# Gmail SMTP Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your16digitpassword
```

**Example:**
```env
GMAIL_USER=durgaprasad12024@gmail.com
GMAIL_APP_PASSWORD=abcdEFGH1234ijkl
```

**⚠️ IMPORTANT:**
- Remove ALL spaces from the app password
- Use your ACTUAL Gmail address
- Use the 16-digit app password (NOT your regular Gmail password!)

---

#### Option B: Create New `.env` File

If `server/.env` doesn't exist, create it:

1. Go to: `d:\7th Semester Project\server\`
2. Create new file: `.env`
3. Copy and paste this template:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://durgaprasad:KKjMJCOtMQzmOsZy@cluster0.w6t3j.mongodb.net/farmconnect

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Gmail SMTP Configuration (REQUIRED FOR PASSWORD RESET)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your16digitpassword

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=ddcywpver
CLOUDINARY_API_KEY=992418647867432
CLOUDINARY_API_SECRET=xZ_9EDNHBhLxR4VHB7HMmBFVZfU

# Stripe Configuration
STRIPE_SECRET_KEY=your-stripe-secret-key

# Client Base URL (for email links)
CLIENT_BASE_URL=http://localhost:5173

# OTP Settings
OTP_TTL_SECONDS=300

# Server Port
PORT=3001
```

4. **Replace these:**
   - `your-email@gmail.com` → Your Gmail address
   - `your16digitpassword` → Your 16-digit app password (no spaces!)

5. **Save the file**

---

### Step 3: Restart Backend

After updating `.env`:

```bash
cd d:\7th Semester Project\server
node index.js
```

**Or use batch file:**
```bash
RESTART_SERVERS.bat
```

---

## 🧪 **Test Again**

1. **Backend console should show:**
   ```
   Server started on port 3001
   MongoDB connected successfully
   ```

2. **Click "Send Reset Link"**

3. **Backend should now show:**
   ```
   [FORGOT PASSWORD] Request for: durgaprasad12024@gmail.com
   [FORGOT PASSWORD] Token generated for: durgaprasad12024@gmail.com
   [FORGOT PASSWORD] ✅ Email sent successfully to: durgaprasad12024@gmail.com
   ```

4. **Check your Gmail inbox!** 📧

---

## 🔍 **Troubleshooting**

### Error: "Invalid login: 535-5.7.8 Username and Password not accepted"
**Fix:** 
- Make sure 2-Step Verification is enabled
- Generate a NEW app password
- Copy it WITHOUT spaces

### Error: Still "Missing credentials"
**Check:**
1. File name is `.env` (with the dot!)
2. File is in `server/` folder (not root!)
3. No spaces in the password
4. No quotes around values (just plain text)

### Error: "getaddrinfo ENOTFOUND smtp.gmail.com"
**Fix:** Check your internet connection

---

## 📋 **Quick Checklist**

- [ ] 2-Step Verification enabled on Gmail
- [ ] App Password generated (16 digits)
- [ ] `.env` file exists in `server/` folder
- [ ] `GMAIL_USER` set to your Gmail
- [ ] `GMAIL_APP_PASSWORD` set (no spaces!)
- [ ] Backend restarted
- [ ] Test email sent successfully

---

## 📧 **Email Format**

When it works, users will receive:

**Subject:** Password Reset - FarmConnect

**Content:**
```
Hi [Name],

We received a request to reset your password. 
Click the button below to create a new password:

[Reset Password Button]

Or copy this link:
http://localhost:5173/reset-password/[token]

This link will expire in 30 minutes.
```

---

## 🚀 **After Setup**

Once configured correctly:
1. Token is generated ✅
2. Email is sent ✅
3. User receives reset link ✅
4. User can reset password ✅
5. User can login with new password ✅

**No more "Missing credentials" error!** 🎉
