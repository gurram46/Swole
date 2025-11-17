# Phase 8 - Signup System Testing Guide

## Quick Test Checklist

### ✅ Pre-Testing Setup
- [x] Database schema updated with SignupOTP model
- [x] Prisma client generated
- [x] Dev server running on http://localhost:3001
- [x] Resend API key configured in .env
- [x] All API routes created

### 🧪 Test Scenarios

#### 1. Complete Signup Flow (Happy Path)

**Steps:**
1. Navigate to http://localhost:3001/signup
2. **Step 1 - Gym Information:**
   - Enter gym name: "Test Fitness Center"
   - Verify slug auto-generates: "test-fitness-center"
   - Click "Check" button
   - Verify green checkmark appears
   - Enter city: "Mumbai"
   - Enter state: "Maharashtra"
   - Click "Next"

3. **Step 2 - Owner Details:**
   - Enter name: "Test Owner"
   - Enter email: YOUR_EMAIL@example.com
   - Enter phone: "9876543210"
   - Click "Send OTP"

4. **Step 3 - Verify Email:**
   - Check your email inbox
   - Copy the 6-digit OTP
   - Enter OTP in the form
   - Click "Verify & Create Gym"

5. **Expected Result:**
   - Success toast appears
   - Redirected to /dashboard/onboarding
   - Welcome message shows gym name
   - Session cookie is set
   - Can access dashboard

#### 2. Slug Availability Check

**Test Case A: Available Slug**
- Enter gym name: "Unique Gym Name 12345"
- Click "Check"
- Expected: Green checkmark "Slug is available"

**Test Case B: Taken Slug**
- Enter gym name matching existing gym
- Click "Check"
- Expected: Red X "Slug is not available"

#### 3. Form Validation

**Test Invalid Email:**
- Step 2: Enter "invalid-email"
- Click "Send OTP"
- Expected: Error toast "Invalid email format"

**Test Invalid Phone:**
- Step 2: Enter "123" (less than 10 digits)
- Click "Send OTP"
- Expected: Error toast "Invalid phone number"

**Test Missing Fields:**
- Leave required fields empty
- Try to proceed
- Expected: Error toast "Missing Information"

#### 4. OTP Verification

**Test Invalid OTP:**
- Enter wrong 6-digit code
- Click "Verify & Create Gym"
- Expected: Error toast "Invalid OTP"

**Test Expired OTP:**
- Wait 11 minutes after receiving OTP
- Try to verify
- Expected: Error toast "OTP has expired"

**Test Resend OTP:**
- Click "Didn't receive code? Resend"
- Check email for new OTP
- Expected: New OTP received

#### 5. Duplicate Prevention

**Test Duplicate Email:**
- Complete signup with email A
- Start new signup with same email A
- Expected: Error "Email already registered"

**Test Duplicate Slug:**
- Complete signup with slug "test-gym"
- Start new signup with same slug
- Expected: Error "Slug is not available"

#### 6. Navigation

**Test Back Button:**
- Go to Step 2
- Click "Back"
- Expected: Returns to Step 1 with data preserved

**Test Progress Indicator:**
- Verify step numbers update correctly
- Verify completed steps show green checkmark
- Verify progress bar fills correctly

#### 7. Marketing Page CTAs

**Test Hero CTA:**
- Visit http://localhost:3001/
- Click "Start Free Trial"
- Expected: Redirects to /signup

**Test Pricing CTAs:**
- Scroll to pricing section
- Click any "Get Started" button
- Expected: Redirects to /signup

**Test "See How It Works":**
- Click "See How It Works" button
- Expected: Smooth scroll to How It Works section

#### 8. Onboarding Page

**After Successful Signup:**
- Verify welcome message shows owner name
- Verify gym name is displayed
- Verify trial days shows "15"
- Click "Add First Member"
- Expected: Redirects to /dashboard/members/add
- Click "Go to Dashboard"
- Expected: Redirects to /dashboard

### 🔍 Database Verification

After completing signup, check database:

```sql
-- Check Gym was created
SELECT * FROM "Gym" WHERE slug = 'test-fitness-center';

-- Check AdminUser was created
SELECT * FROM "AdminUser" WHERE email = 'your@email.com';

-- Check OTP was deleted
SELECT * FROM "SignupOTP" WHERE email = 'your@email.com';
-- Should return 0 rows
```

### 📧 Email Verification

Check the OTP email for:
- [x] Swole branding visible
- [x] OTP code clearly displayed
- [x] Expiry notice (10 minutes)
- [x] Security warning present
- [x] Support contact info
- [x] Recipient email shown in footer

### 🔒 Security Checks

**Session Cookie:**
- Open browser DevTools > Application > Cookies
- Find `swole_session` cookie
- Verify:
  - HttpOnly: true
  - Secure: true (in production)
  - SameSite: Lax
  - Expires: ~7 days from now

**OTP Storage:**
- Check database SignupOTP table
- Verify otp_code is hashed (not plain text)
- Verify otp_expires is set correctly

### 🐛 Known Issues

1. **Prisma Client Generation Warning:**
   - Windows file lock on query_engine-windows.dll.node
   - Does not affect functionality
   - Can be ignored

2. **Port 3000 in Use:**
   - Dev server uses port 3001 instead
   - Update URLs accordingly

### 📊 Success Criteria

- [ ] Can complete full signup flow
- [ ] OTP email received within 30 seconds
- [ ] OTP verification works correctly
- [ ] Gym and AdminUser created in database
- [ ] Auto-login works after signup
- [ ] Redirected to onboarding page
- [ ] Can access dashboard after signup
- [ ] All form validations work
- [ ] Slug checking works
- [ ] Duplicate prevention works
- [ ] Marketing CTAs link to signup
- [ ] Session persists across page refreshes

### 🚀 Production Checklist

Before deploying to production:

- [ ] Set strong AUTH_SECRET in environment
- [ ] Verify Resend API key is production key
- [ ] Enable HTTPS
- [ ] Test on mobile devices
- [ ] Add rate limiting to OTP endpoints
- [ ] Set up OTP cleanup cron job
- [ ] Configure error monitoring (Sentry, etc.)
- [ ] Test email deliverability
- [ ] Verify cookie settings for production domain
- [ ] Add analytics tracking
- [ ] Test with real email addresses
- [ ] Verify database backups are configured

### 📝 Test Results Template

```
Date: ___________
Tester: ___________

| Test Case | Status | Notes |
|-----------|--------|-------|
| Complete Signup Flow | ⬜ Pass ⬜ Fail | |
| Slug Availability | ⬜ Pass ⬜ Fail | |
| Form Validation | ⬜ Pass ⬜ Fail | |
| OTP Verification | ⬜ Pass ⬜ Fail | |
| Duplicate Prevention | ⬜ Pass ⬜ Fail | |
| Navigation | ⬜ Pass ⬜ Fail | |
| Marketing CTAs | ⬜ Pass ⬜ Fail | |
| Onboarding Page | ⬜ Pass ⬜ Fail | |
| Email Delivery | ⬜ Pass ⬜ Fail | |
| Security Checks | ⬜ Pass ⬜ Fail | |

Overall Result: ⬜ Pass ⬜ Fail

Issues Found:
1. 
2. 
3. 
```

## Quick Start Testing

```bash
# 1. Ensure dev server is running
npm run dev

# 2. Open browser
http://localhost:3001/signup

# 3. Use test data
Gym Name: Test Gym [Your Name]
Email: [Your Real Email]
Phone: 9876543210
City: Mumbai
State: Maharashtra

# 4. Check email for OTP
# 5. Complete signup
# 6. Verify you can access dashboard
```

## Troubleshooting

**OTP Not Received:**
```bash
# Check Resend API key
echo $RESEND_API_KEY

# Check server logs
# Look for "Send signup OTP error"
```

**Database Errors:**
```bash
# Regenerate Prisma client
npx prisma generate

# Push schema changes
npx prisma db push

# Check database connection
npx prisma studio
```

**Session Not Working:**
```bash
# Check AUTH_SECRET is set
echo $AUTH_SECRET

# Clear browser cookies
# Try in incognito mode
```
