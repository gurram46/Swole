# 🔍 PRODUCTION EMAIL DELIVERY DEBUG REPORT

## BASED ON ACTUAL CODE ANALYSIS

---

## A) WHAT IS DEFINITELY CORRECT ✅

### 1. Resend Initialization Pattern
All 3 routes use the correct pattern:
```typescript
const resend = new Resend(process.env.RESEND_API_KEY);
```

**Location confirmed:**
- `app/api/auth/send-otp/route.ts` - Line 5
- `app/api/auth/send-signup-otp/route.ts` - Line 8  
- `app/api/reminders/run/route.ts` - Line 6

### 2. FROM Address (After Fix)
All routes now use:
```typescript
from: 'Swole Gym <noreply@send.quantumworks.services>'
// OR
from: 'Swole Auth <noreply@send.quantumworks.services>'
```

**This is correct** - matches Resend subdomain pattern.

### 3. Error Handling Structure
- `send-otp/route.ts` - HAS try/catch around resend.emails.send() ✅
- `send-signup-otp/route.ts` - NO try/catch around resend.emails.send() ❌
- `reminders/run/route.ts` - HAS try/catch around resend.emails.send() ✅

---

## B) WHAT IS POSSIBLY WRONG ⚠️

### 1. **CRITICAL: Missing Error Handling in send-signup-otp**

**File:** `app/api/auth/send-signup-otp/route.ts`

**Current code (Lines 60-67):**
```typescript
// Send OTP email
const emailHtml = generateSignupOtpEmail({ otp, email });

await resend.emails.send({
  from: 'Swole Gym <noreply@send.quantumworks.services>',
  to: email,
  subject: '🔐 Your Swole Gym Verification Code',
  html: emailHtml,
});
```

**Problem:**
- NO try/catch around resend.emails.send()
- If Resend API call fails, it throws an error
- Error is caught by outer catch block
- Returns generic "Failed to send OTP" message
- **HIDES THE ACTUAL ERROR** from logs

**What happens if RESEND_API_KEY is undefined:**
- Resend SDK will throw: `Error: Missing API key`
- Caught by outer catch
- Logged as: `Send signup OTP error: Error: Missing API key`
- User sees: "Failed to send OTP. Please try again."

### 2. **Environment Variable Loading in Vercel**

**FACT:** In Next.js API routes on Vercel:
- `process.env.RESEND_API_KEY` is loaded at **RUNTIME**
- NOT at build time
- Each serverless function invocation reads from environment

**What happens if env var is missing:**
```typescript
const resend = new Resend(undefined); // RESEND_API_KEY is undefined
// Resend SDK will initialize but fail on first API call
```

**Vercel behavior:**
- If env var is set in Development but NOT Production
- Production functions will have `process.env.RESEND_API_KEY === undefined`
- Resend SDK will throw error on `.send()` call
- Error: "Missing API key" or "Unauthorized"

### 3. **Module-Level Initialization**

All routes initialize Resend at module level:
```typescript
const resend = new Resend(process.env.RESEND_API_KEY);
```

**Vercel serverless behavior:**
- Module is loaded once per cold start
- If RESEND_API_KEY is undefined at cold start, it stays undefined
- **Requires redeployment** after adding env var
- Simply adding env var in dashboard is NOT enough

---

## C) WHAT IS 100% GUARANTEED TO BREAK EMAIL DELIVERY 🚨

### 1. **RESEND_API_KEY Not Set in Production**

**How to verify:**
```bash
# In Vercel Dashboard
Project → Settings → Environment Variables
# Check if RESEND_API_KEY exists for "Production" environment
```

**If missing:**
- Every email send will fail
- Error: "Missing API key" or "Unauthorized"
- HTTP 401 from Resend API

### 2. **Domain Not Verified in Resend**

**Current FROM address:** `noreply@send.quantumworks.services`

**Required in Resend Dashboard:**
- Domain `send.quantumworks.services` must be added
- Domain must show status: **VERIFIED** ✅
- All DNS records must be green checkmarks

**If domain is NOT verified:**
- Resend API will accept the request (200 OK)
- But email will NOT be delivered
- Resend will show status: "Bounced" or "Failed"
- Reason: "Domain not verified"

### 3. **DNS Records Missing or Incorrect**

**Required DNS records for `send.quantumworks.services`:**

```dns
# SPF Record
Type: TXT
Name: send.quantumworks.services
Value: v=spf1 include:_spf.resend.com ~all

# DKIM Record
Type: TXT  
Name: resend._domainkey.send.quantumworks.services
Value: [Long string provided by Resend]

# DMARC Record (Optional but recommended)
Type: TXT
Name: _dmarc.send.quantumworks.services
Value: v=DMARC1; p=none; rua=mailto:dmarc@quantumworks.services
```

**If DNS records are missing:**
- SPF check fails
- DKIM check fails
- Receiving servers reject email
- Email never reaches inbox

### 4. **Using Root Domain Instead of Subdomain**

**WRONG:** `contact@quantumworks.services`
**CORRECT:** `noreply@send.quantumworks.services`

**Why this breaks:**
- DNS records are on `send.quantumworks.services`
- Email claims to be from `quantumworks.services`
- SPF/DKIM domain mismatch
- Email rejected by receiving servers

---

## D) EXACT FIX STEPS FOR EACH ISSUE

### Fix 1: Add Error Handling to send-signup-otp

**File:** `app/api/auth/send-signup-otp/route.ts`

**Replace lines 60-67 with:**
```typescript
// Send OTP email
const emailHtml = generateSignupOtpEmail({ otp, email });

try {
  await resend.emails.send({
    from: 'Swole Gym <noreply@send.quantumworks.services>',
    to: email,
    subject: '🔐 Your Swole Gym Verification Code',
    html: emailHtml,
  });
} catch (emailError) {
  console.error('Resend API error:', emailError);
  // Delete the OTP record since email failed
  await prisma.signupOTP.delete({
    where: { email },
  });
  return NextResponse.json(
    { success: false, error: 'Failed to send OTP email. Please try again.' },
    { status: 500 }
  );
}
```

### Fix 2: Verify RESEND_API_KEY in Production

**Step 1: Check Vercel Dashboard**
```bash
1. Go to: https://vercel.com/[your-project]
2. Click: Settings → Environment Variables
3. Find: RESEND_API_KEY
4. Verify: It's checked for "Production" environment
```

**Step 2: If missing, add it**
```bash
1. Click: Add New
2. Key: RESEND_API_KEY
3. Value: re_[your-key-here]
4. Environment: Production ✅
5. Click: Save
```

**Step 3: Redeploy**
```bash
# CRITICAL: Must redeploy after adding env var
1. Go to: Deployments tab
2. Click: Redeploy on latest deployment
3. OR: Push new commit to trigger deployment
```

### Fix 3: Add Logging to Verify Env Var

**Add to any route (e.g., send-signup-otp):**

```typescript
export async function POST(request: NextRequest) {
  // ADD THIS AT THE TOP
  console.log('[DEBUG] RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
  console.log('[DEBUG] RESEND_API_KEY length:', process.env.RESEND_API_KEY?.length || 0);
  
  try {
    // ... rest of code
```

**How to check logs in Vercel:**
```bash
1. Go to: Vercel Dashboard → Your Project
2. Click: Deployments → Latest deployment
3. Click: Functions tab
4. Find: /api/auth/send-signup-otp
5. Click: View logs
6. Look for: [DEBUG] lines
```

### Fix 4: Verify Resend Domain

**Step 1: Check Resend Dashboard**
```bash
1. Go to: https://resend.com/domains
2. Find: send.quantumworks.services
3. Verify status shows: VERIFIED ✅
4. Check all DNS records show: ✅ green checkmarks
```

**Step 2: If domain doesn't exist**
```bash
1. Click: Add Domain
2. Enter: send.quantumworks.services
3. Copy DNS records
4. Add to your DNS provider
5. Wait for verification (can take up to 48 hours)
```

**Step 3: Test DNS records**
```bash
# Check SPF
nslookup -type=TXT send.quantumworks.services

# Check DKIM  
nslookup -type=TXT resend._domainkey.send.quantumworks.services

# Should see Resend values in output
```

---

## E) FINAL CORRECTED RESEND INITIALIZATION

### Pattern 1: With Validation (Recommended)

```typescript
import { Resend } from 'resend';

// Validate API key exists
if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY environment variable is not set');
}

const resend = new Resend(process.env.RESEND_API_KEY);
```

### Pattern 2: With Logging (For Debugging)

```typescript
import { Resend } from 'resend';

console.log('[Resend] Initializing with API key:', !!process.env.RESEND_API_KEY);

const resend = new Resend(process.env.RESEND_API_KEY);
```

### Pattern 3: Current (Acceptable but Silent)

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
// Will fail silently if API key is undefined
```

---

## F) FINAL DNS CHECKLIST

### In Resend Dashboard (https://resend.com/domains)

- [ ] Domain `send.quantumworks.services` is added
- [ ] Domain status shows: **VERIFIED** ✅
- [ ] SPF record shows: ✅ green checkmark
- [ ] DKIM record shows: ✅ green checkmark
- [ ] DMARC record shows: ✅ green checkmark (optional)

### DNS Records to Verify

```dns
# 1. SPF Record
Host: send.quantumworks.services
Type: TXT
Value: v=spf1 include:_spf.resend.com ~all
Status: ✅

# 2. DKIM Record
Host: resend._domainkey.send.quantumworks.services
Type: TXT
Value: [Provided by Resend - starts with "p="]
Status: ✅

# 3. DMARC Record (Optional)
Host: _dmarc.send.quantumworks.services
Type: TXT
Value: v=DMARC1; p=none; rua=mailto:dmarc@quantumworks.services
Status: ✅
```

### Test Commands

```bash
# Test SPF
dig TXT send.quantumworks.services +short

# Test DKIM
dig TXT resend._domainkey.send.quantumworks.services +short

# Test DMARC
dig TXT _dmarc.send.quantumworks.services +short
```

---

## G) PRODUCTION DEBUGGING WORKFLOW

### Step 1: Verify Environment Variable

```bash
# Add logging to route
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'SET' : 'MISSING');

# Deploy and check logs
# If MISSING → Add env var in Vercel → Redeploy
```

### Step 2: Test Email Send

```bash
# Trigger email send (e.g., signup flow)
# Check Vercel function logs for errors
# Look for: "Missing API key" or "Unauthorized"
```

### Step 3: Check Resend Dashboard

```bash
# Go to: https://resend.com/emails
# Find your test email
# Check status:
#   - Delivered ✅ → Email sent successfully
#   - Bounced ❌ → Check domain verification
#   - Failed ❌ → Check error message
```

### Step 4: Verify DNS

```bash
# If emails show "Bounced" or "Failed"
# Check Resend domain status
# Verify all DNS records are green
# Wait 24-48 hours for DNS propagation if just added
```

### Step 5: Test Deliverability

```bash
# Send test email to: https://www.mail-tester.com
# Get deliverability score
# Should be 10/10
# If lower, check SPF/DKIM/DMARC alignment
```

---

## H) COMMON ERROR SIGNATURES

### Error 1: Missing API Key

**Log output:**
```
Send signup OTP error: Error: Missing API key
```

**Fix:** Add RESEND_API_KEY to Vercel environment variables

### Error 2: Unauthorized

**Log output:**
```
Resend API error: Error: Unauthorized
```

**Fix:** Verify API key is correct in Vercel dashboard

### Error 3: Domain Not Verified

**Resend Dashboard shows:**
```
Status: Bounced
Reason: Domain not verified
```

**Fix:** Verify domain in Resend dashboard, add DNS records

### Error 4: SPF/DKIM Failure

**Email headers show:**
```
SPF: FAIL
DKIM: FAIL
```

**Fix:** Verify DNS records are correct and propagated

---

## I) IMMEDIATE ACTION CHECKLIST

### Right Now:

1. **Check Vercel Environment Variables**
   - [ ] RESEND_API_KEY exists
   - [ ] Set for Production environment
   - [ ] Value starts with `re_`

2. **Check Resend Domain**
   - [ ] `send.quantumworks.services` is added
   - [ ] Status shows VERIFIED
   - [ ] All DNS records green

3. **Add Error Logging**
   - [ ] Add console.log for API key check
   - [ ] Deploy to production
   - [ ] Check logs

4. **Test Email Send**
   - [ ] Trigger signup flow
   - [ ] Check Vercel logs
   - [ ] Check Resend dashboard
   - [ ] Verify email arrives

### If Emails Still Don't Arrive:

1. **Check Resend Logs**
   - Go to: https://resend.com/emails
   - Find test email
   - Check status and error message

2. **Verify DNS Propagation**
   - Use: https://dnschecker.org
   - Check SPF and DKIM records
   - Verify propagation globally

3. **Test with Mail-Tester**
   - Send to: test@mail-tester.com
   - Check deliverability score
   - Review SPF/DKIM/DMARC results

---

## J) NEXT.JS + VERCEL FACTS

### Environment Variables

**FACT 1:** API routes load env vars at **RUNTIME**, not build time
**FACT 2:** Adding env var requires **REDEPLOYMENT** to take effect
**FACT 3:** Env vars are per-environment (Development, Preview, Production)

### Serverless Functions

**FACT 1:** Each function is a separate container
**FACT 2:** Cold starts reload modules and env vars
**FACT 3:** Warm starts reuse existing module instances

### Logging

**FACT 1:** `console.log()` appears in Vercel function logs
**FACT 2:** Logs are available in: Deployments → Functions → View logs
**FACT 3:** Logs persist for 24 hours

---

## K) RESEND API FACTS

### API Key

**FACT 1:** API key format: `re_[random_string]`
**FACT 2:** Invalid key returns: HTTP 401 Unauthorized
**FACT 3:** Missing key throws: `Error: Missing API key`

### Domain Verification

**FACT 1:** Unverified domains cannot send emails
**FACT 2:** Verification requires DNS records
**FACT 3:** DNS propagation can take 24-48 hours

### Email Sending

**FACT 1:** `resend.emails.send()` returns Promise
**FACT 2:** Success returns: `{ data: { id: string } }`
**FACT 3:** Failure throws Error with message

---

**Last Updated:** November 15, 2025
**Status:** 🔍 Debugging Guide
**Priority:** P0 - Production Issue
