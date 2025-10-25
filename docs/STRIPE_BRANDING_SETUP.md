# Stripe Branding Setup Guide

## How to Add Your Logo to Stripe Checkout (Left Side of Page)

Stripe doesn't support logo branding through the API parameters. Instead, you need to configure it in your **Stripe Dashboard**. The logo will appear on the **left side** of the checkout page, next to your business name.

### Steps:

1. **Login to Stripe Dashboard**
   - Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
   - Login with your Stripe account
   - Make sure you're in **Test Mode** (toggle in top-right)

2. **Navigate to Branding Settings**
   - Click on **Settings** in the left sidebar
   - Select **Branding** from the settings menu

3. **Upload Your Logo**
   - Click **Upload logo** button
   - Upload your `logo.png` from the `public/` folder
   - Recommended size: 512x512 pixels (square)
   - Supported formats: PNG, JPEG

4. **Set Brand Colors** (Optional)
   - Primary color: `#22c55e` (green)
   - Accent color: `#16a34a` (dark green)

5. **Configure Icon** (Optional)
   - Upload a smaller icon version (128x128 pixels)
   - This appears in the browser tab

6. **Save Changes**
   - Click **Save** at the bottom of the page
   - Your logo will now appear on all Stripe Checkout pages

### Note for Test Mode

- Configure branding separately for **Test Mode** and **Live Mode**
- Switch between modes using the toggle in the Stripe Dashboard
- Test mode branding will show a "TEST MODE" watermark

### Verification

After setup, create a test checkout session and verify:
- Logo appears at the top of the checkout page
- Brand colors are applied correctly
- Icon shows in the browser tab

### Current Configuration

Your logo is located at:
- Path: `D:/7th Semester Project/public/logo.png`
- URL when server running: `http://localhost:5173/logo.png`

You can use this URL as reference when uploading to Stripe Dashboard.
