# Gmail SMTP Setup Guide

## Quick Setup (2 minutes)

### Step 1: Enable 2-Factor Authentication
1. Go to https://myaccount.google.com/security
2. Under "Signing in to Google", click "2-Step Verification"
3. Follow steps to enable it

### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" as the app
3. Select "Other (Custom name)" and type "Traveloop"
4. Click "Generate"
5. **Copy the 16-character password** (it looks like: `abcd efgh ijkl mnop`)

### Step 3: Configure Backend
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and fill in your Gmail details:
   ```env
   GMAIL_USER=your.email@gmail.com
   GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
   ```

### Step 4: Test Email
1. Restart the server
2. Call the send-otp endpoint:
   ```bash
   curl -X POST http://localhost:8000/api/v1/auth/send-otp \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","purpose":"register"}'
   ```
3. Check your email inbox!

## Troubleshooting

### "Less secure app access" error
- This is disabled by Google
- Use App Passwords instead (recommended method above)

### Emails going to spam
- Check spam/junk folder
- The emails have proper HTML formatting
- Mark as "Not spam" if found there

### 2FA not working
- Make sure you're generating an App Password, not using your regular password
- App Passwords only work with 2FA enabled

## Security Notes

- Never commit `.env` file with real credentials
- App Passwords are safer than using your main password
- Each app should have its own App Password
- You can revoke App Passwords anytime at: https://myaccount.google.com/apppasswords
