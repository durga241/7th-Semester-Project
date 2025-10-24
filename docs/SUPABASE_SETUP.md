# Supabase Authentication Setup Guide

This guide will help you set up real-time email and phone authentication using Supabase.

## Step 1: Create a Supabase Project

1. Go to [Supabase](https://supabase.com)
2. Sign up or sign in to your account
3. Click "New project" 
4. Choose your organization and enter project details
5. Select a region close to your database
6. Set a strong database password
7. Click "Create new project"

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon key**: The public anon key

## Step 3: Configure Authentication

1. Go to **Authentication** > **Settings** in your Supabase dashboard
2. Configure the following:

### Email Authentication
- **Enable email confirmations**: Toggle ON
- **Enable email change confirmations**: Toggle ON
- **Site URL**: Add your frontend URL (e.g., `http://localhost:5173`)

### Phone Authentication
- **Enable phone confirmations**: Toggle ON
- **Confirmation SMS URL**: Add webhook URL if needed
- **Rate Limit**: Adjust based on your needs

### SMS Provider Setup
1. Go to **Authentication** > **Providers** > **Phone**
2. Toggle phone provider ON
3. Choose your SMS provider (Twilio recommended)
4. Configure Twilio credentials:
   - Account SID
   - Auth Token
   - Phone number

## Step 4: Configure Environment Variables

Create a `.env` file in the project root (next to `package.json`) with:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Notes:
- Do NOT hardcode credentials in source files. Only use env vars.
- With Vite, variables must be prefixed with `VITE_` to be exposed to the client.
- Never commit your real `.env`. Commit a `.env.example` instead.

## Step 5: Test Authentication

1. Start your development server: `npm run dev`
2. Test email sign-up/sign-in
3. Test phone authentication with real phone numbers
4. Check Supabase dashboard for authentication logs

## Features Available

### Real-time Authentication
- ✅ Email sign-up with confirmation
- ✅ Email sign-in
- ✅ Phone number authentication with OTP
- ✅ Secure session management
- ✅ Real-time auth state updates

### Additional Features
- Database integration for user profiles
- Row Level Security (RLS) policies
- Real-time subscriptions
- File storage capabilities

## Security Features

- Auto-generated JWT tokens
- Password hashing with bcrypt
- Rate limiting
- CSRF protection
- Session management

## Pricing

- **Free tier**: 50,000 monthly active users
- **Pro tier**: $25/month for additional features
- **Team tier**: $599/month for advanced enterprise features

## Support

If you encounter issues:
1. Check Supabase documentation
2. View authentication logs in dashboard
3. Verify phone provider configuration
4. Ensure proper environment variables

## Next Steps

After authentication works:
1. Set up user profiles table in database
2. Implement user roles and permissions
3. Add real-time data synchronization
4. Configure email templates
5. Set up monitoring and alerting
