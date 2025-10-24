# 🚀 Enable Auto-Login for Development

## Quick Setup (One-Time)

To skip login and go directly to Farmer Dashboard on every refresh:

### Method 1: Browser Console (Easiest)

1. Open your browser at `http://localhost:5173`
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Paste this command and press Enter:

```javascript
localStorage.setItem('dev_auto_login', 'farmer')
```

5. **Refresh the page** (F5 or Ctrl+R)
6. ✅ You'll automatically be logged in as Farmer!

---

### Method 2: Disable Auto-Login

If you want to go back to normal login:

```javascript
localStorage.removeItem('dev_auto_login')
```

Then refresh the page.

---

## 🎯 What This Does

- Automatically logs you in as a Farmer in **development mode only**
- Takes you directly to the Farmer Dashboard
- No need to enter email or OTP
- Works across page refreshes
- **Disabled in production builds** (safe!)

---

## 📝 Quick Reference

### Enable Auto-Login as Farmer:
```javascript
localStorage.setItem('dev_auto_login', 'farmer')
```

### Enable Auto-Login as Customer:
```javascript
localStorage.setItem('dev_auto_login', 'customer')
```

### Disable Auto-Login:
```javascript
localStorage.removeItem('dev_auto_login')
```

### Check Current Setting:
```javascript
localStorage.getItem('dev_auto_login')
```

---

## ⚡ Even Faster Method

Create a bookmark with this JavaScript code:

```javascript
javascript:(function(){localStorage.setItem('dev_auto_login','farmer');location.reload();})()
```

Click the bookmark anytime to enable auto-login and refresh!

---

## 🔒 Security Note

This feature:
- ✅ Only works in **development mode** (`npm run dev`)
- ✅ Automatically **disabled in production builds**
- ✅ Uses localStorage (client-side only)
- ✅ No security risk for production deployment

---

## 🎉 You're Done!

After running the command once, you'll automatically go to Farmer Dashboard on every refresh! No more login hassle during development.
