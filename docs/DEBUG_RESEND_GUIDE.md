# 🔍 Resend Debug Logging Guide

## What Was Added

Comprehensive debug logging to `/api/auth/send-signup-otp` to diagnose email delivery issues.

---

## Debug Information Logged

### Console Logs (Visible in Vercel)

```typescript
[RESEND DEBUG] API Key exists: true/false
[RESEND DEBUG] API Key length: 28
[RESEND DEBUG] API Key prefix: re_RG
[RESEND DEBUG] Attempting to send email to: user@example.com
[RESEND DEBUG] From address: Swole Gym <noreply@send.quantumworks.services>
[RESEND DEBUG] Send result: { data: { id: "..." }, error: null }
[RESEND DEBUG] Email ID: abc123...
[RESEND DEBUG] Error: null
```

### API Response (Visible in Browser/Postman)

**Success Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "debug": {
    "apiKeyExists": true,
    "apiKeyLength": 28,
    "apiKeyPrefix": "re_RG",
    "emailId": "abc123-def456-ghi789",
    "resendResult": {
      "data": {
        "id": "abc123-def456-ghi789"
      },
      "error": null
    },
    "timestamp": "2025-11-15T10:30:00.000Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Failed to send OTP email. Please try again.",
  "debug": {
    "apiKeyExists": false,
    "apiKeyLength": 0,
    "errorType": "Error",
    "errorMessage": "Missing API key",
    "timestamp": "2025-11-15T10:30:00.000Z"
  }
}
```

---

## How to Test

### Local Testing

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Trigger signup flow:**
   - Go to: http://localhost:3000/signup
   - Fill Steps 1 & 2
   - Click "Send OTP"

3. **Check console output:**
   - Look for `[RESEND DEBUG]` lines in terminal
   - Check API response in browser DevTools → Network tab

4. **Check API response:**
   - Open DevTools → Network
   - Find: `send-signup-otp` request
   - Click → Response tab
   - Look at `debug` object

### Production Testing (Vercel)

1. **Deploy to Vercel:**
   ```bash
   git add .
   git commit -m "Add Resend debug logging"
   git push
   ```

2. **Trigger signup flow:**
   - Go to: https://your-domain.com/signup
   - Fill Steps 1 & 2
   - Click "Send OTP"

3. **Check Vercel logs:**
   ```bash
   # Method 1: Vercel Dashboard
   1. Go to: https://vercel.com/[your-project]
   2. Click: Deployments → Latest
   3. Click: Functions tab
   4. Find: /api/auth/send-signup-otp
   5. Click: View logs
   6. Look for: [RESEND DEBUG] lines
   ```

4. **Check API response:**
   - Open browser DevTools → Network
   - Find: `send-signup-otp` request
   - Check `debug` object in response

---

## Interpreting Results

### Scenario 1: API Key Missing

**Console:**
```
[RESEND DEBUG] API Key exists: false
[RESEND DEBUG] API Key length: 0
[RESEND DEBUG] API Key prefix: NONE
```

**Response:**
```json
{
  "success": false,
  "debug": {
    "apiKeyExists": false,
    "apiKeyLength": 0,
    "errorMessage": "Missing API key"
  }
}
```

**Fix:**
1. Add `RESEND_API_KEY` to Vercel environment variables
2. Redeploy

---

### Scenario 2: API Key Invalid

**Console:**
```
[RESEND DEBUG] API Key exists: true
[RESEND DEBUG] API Key length: 28
[RESEND DEBUG] API Key prefix: re_XX
[RESEND DEBUG] Resend API error: Error: Unauthorized
```

**Response:**
```json
{
  "success": false,
  "debug": {
    "apiKeyExists": true,
    "apiKeyLength": 28,
    "errorMessage": "Unauthorized"
  }
}
```

**Fix:**
1. Verify API key in Resend dashboard
2. Update `RESEND_API_KEY` in Vercel
3. Redeploy

---

### Scenario 3: Domain Not Verified

**Console:**
```
[RESEND DEBUG] API Key exists: true
[RESEND DEBUG] Send result: {
  "data": { "id": "abc123" },
  "error": null
}
[RESEND DEBUG] Email ID: abc123
```

**Response:**
```json
{
  "success": true,
  "debug": {
    "apiKeyExists": true,
    "emailId": "abc123",
    "resendResult": {
      "data": { "id": "abc123" }
    }
  }
}
```

**But email doesn't arrive!**

**Check Resend Dashboard:**
1. Go to: https://resend.com/emails
2. Find email by ID: `abc123`
3. Check status:
   - "Bounced" → Domain not verified
   - "Failed" → Check error message

**Fix:**
1. Go to: https://resend.com/domains
2. Verify `send.quantumworks.services` is VERIFIED
3. Add missing DNS records if needed

---

### Scenario 4: Success

**Console:**
```
[RESEND DEBUG] API Key exists: true
[RESEND DEBUG] API Key length: 28
[RESEND DEBUG] API Key prefix: re_RG
[RESEND DEBUG] Attempting to send email to: user@example.com
[RESEND DEBUG] From address: Swole Gym <noreply@send.quantumworks.services>
[RESEND DEBUG] Send result: {
  "data": { "id": "abc123-def456" },
  "error": null
}
[RESEND DEBUG] Email ID: abc123-def456
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "debug": {
    "apiKeyExists": true,
    "apiKeyLength": 28,
    "emailId": "abc123-def456"
  }
}
```

**Email should arrive in inbox!**

---

## Using cURL for Testing

### Test Locally

```bash
curl -X POST http://localhost:3000/api/auth/send-signup-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Test Production

```bash
curl -X POST https://your-domain.com/api/auth/send-signup-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Pretty Print Response

```bash
curl -X POST https://your-domain.com/api/auth/send-signup-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}' \
  | jq '.'
```

---

## Checking Vercel Logs (Detailed)

### Method 1: Vercel Dashboard

1. Go to: https://vercel.com/[your-username]/[your-project]
2. Click: **Deployments** tab
3. Click: Latest deployment
4. Click: **Functions** tab
5. Find: `/api/auth/send-signup-otp`
6. Click: **View logs**
7. Look for: `[RESEND DEBUG]` lines

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# View logs
vercel logs [deployment-url]

# Filter for debug logs
vercel logs [deployment-url] | grep "RESEND DEBUG"
```

### Method 3: Real-time Logs

```bash
# Stream logs in real-time
vercel logs --follow

# In another terminal, trigger the API
curl -X POST https://your-domain.com/api/auth/send-signup-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

---

## What to Look For

### ✅ Good Signs

- `API Key exists: true`
- `API Key length: 28` (or similar)
- `API Key prefix: re_` (starts with "re_")
- `Email ID: [some-uuid]` (email was accepted by Resend)
- `Error: null`

### ❌ Bad Signs

- `API Key exists: false` → Env var not set
- `API Key length: 0` → Env var empty
- `API Key prefix: NONE` → Env var missing
- `errorMessage: "Missing API key"` → Add env var
- `errorMessage: "Unauthorized"` → Invalid API key
- `Email ID: undefined` → Email not sent

---

## Troubleshooting Checklist

### If `apiKeyExists: false`

- [ ] Check Vercel Dashboard → Settings → Environment Variables
- [ ] Verify `RESEND_API_KEY` is set for Production
- [ ] Redeploy after adding env var

### If `apiKeyExists: true` but `errorMessage: "Unauthorized"`

- [ ] Check Resend Dashboard → API Keys
- [ ] Verify API key is correct
- [ ] Copy-paste key carefully (no extra spaces)
- [ ] Update in Vercel and redeploy

### If `emailId` exists but email doesn't arrive

- [ ] Check Resend Dashboard → Emails
- [ ] Find email by ID
- [ ] Check status (Delivered/Bounced/Failed)
- [ ] If Bounced: Check domain verification
- [ ] If Failed: Check error message

### If domain issues

- [ ] Go to: https://resend.com/domains
- [ ] Verify `send.quantumworks.services` shows VERIFIED
- [ ] Check all DNS records are green
- [ ] Wait 24-48 hours for DNS propagation

---

## Removing Debug Logging (Production)

Once you've diagnosed the issue, you can remove or reduce debug logging:

### Option 1: Remove Completely

Remove all `console.log('[RESEND DEBUG]` lines and the `debug` object from responses.

### Option 2: Keep Minimal Logging

Keep only:
```typescript
console.log('[RESEND] Email sent:', result.data?.id);
```

### Option 3: Environment-Based Logging

```typescript
const isDev = process.env.NODE_ENV === 'development';

if (isDev) {
  console.log('[RESEND DEBUG] API Key exists:', !!process.env.RESEND_API_KEY);
  // ... other debug logs
}
```

---

## Quick Reference

### Check API Key in Vercel
```
Vercel Dashboard → Settings → Environment Variables → RESEND_API_KEY
```

### Check Domain in Resend
```
https://resend.com/domains → send.quantumworks.services → VERIFIED ✅
```

### Check Email Status in Resend
```
https://resend.com/emails → Search by email ID → Check status
```

### View Vercel Logs
```
Vercel Dashboard → Deployments → Latest → Functions → View logs
```

---

**Status:** 🔍 Debug Mode Active
**Remove Before:** Production launch (optional)
**Purpose:** Diagnose email delivery issues
