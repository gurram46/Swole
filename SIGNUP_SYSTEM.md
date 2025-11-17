# Swole Gym Signup System Documentation

## Overview

The Swole Gym signup system is a secure, multi-step registration flow that allows gym owners to create their gym accounts with email verification via OTP (One-Time Password).

## Features

✅ **3-Step Registration Flow**
- Step 1: Gym Information (name, slug, location)
- Step 2: Owner Details (name, email, phone)
- Step 3: Email Verification (6-digit OTP)

✅ **Security Features**
- SHA256 hashed OTP storage
- Timing-safe OTP comparison
- 10-minute OTP expiry
- Duplicate email prevention
- Duplicate slug prevention
- Auto-cleanup of expired OTPs

✅ **User Experience**
- Real-time slug availability checking
- Auto-slug generation from gym name
- Form validation with helpful error messages
- Progress indicator
- Responsive design
- Auto-login after successful registration

✅ **15-Day Free Trial**
- Automatically activated on signup
- No credit card required
- Full feature access

## Architecture

### Database Models

#### SignupOTP
```prisma
model SignupOTP {
  id          String   @id @default(uuid())
  email       String   @unique
  otp_code    String   // SHA256 hashed
  otp_expires DateTime // 10 minutes from creation
  verified    Boolean  @default(false)
  created_at  DateTime @default(now())

  @@index([email])
  @@index([otp_expires])
}
```

### API Routes

#### 1. `/api/gym/check-slug` (POST)
Checks if a gym slug is available.

**Request:**
```json
{
  "slug": "my-gym"
}
```

**Response:**
```json
{
  "available": true
}
```

**Validation:**
- Slug must match regex: `^[a-z0-9]+(?:-[a-z0-9]+)*$`
- Lowercase letters, numbers, and hyphens only

---

#### 2. `/api/auth/send-signup-otp` (POST)
Generates and sends a 6-digit OTP to the user's email.

**Request:**
```json
{
  "email": "owner@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

**Process:**
1. Check if email already exists in AdminUser
2. Generate 6-digit OTP
3. Hash OTP with SHA256
4. Delete any existing OTP for this email
5. Create new OTP record with 10-minute expiry
6. Send OTP via Resend email service

**Error Cases:**
- 409: Email already registered
- 400: Invalid email format
- 500: Failed to send OTP

---

#### 3. `/api/auth/verify-signup-otp` (POST)
Verifies the OTP entered by the user.

**Request:**
```json
{
  "email": "owner@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "verified": true,
  "message": "OTP verified successfully"
}
```

**Process:**
1. Find OTP record by email
2. Check if OTP has expired
3. Hash provided OTP
4. Compare using timing-safe comparison
5. Mark OTP as verified

**Error Cases:**
- 404: No OTP found
- 410: OTP expired
- 400: Invalid OTP
- 400: Invalid format (must be 6 digits)

---

#### 4. `/api/auth/register-finalize` (POST)
Creates the gym and admin user after OTP verification.

**Request:**
```json
{
  "gym_name": "My Awesome Gym",
  "gym_slug": "my-awesome-gym",
  "gym_address": "123 Main St",
  "city": "Mumbai",
  "state": "Maharashtra",
  "owner_name": "John Doe",
  "owner_email": "owner@example.com",
  "owner_phone": "9876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Gym created successfully",
  "redirect": "/dashboard/onboarding",
  "gym": {
    "id": "uuid",
    "name": "My Awesome Gym",
    "slug": "my-awesome-gym"
  }
}
```

**Process (Transaction):**
1. Verify OTP was verified
2. Check OTP hasn't expired
3. Check slug is still available
4. Check email isn't already registered
5. Create Gym record
6. Create AdminUser record (role: owner)
7. Delete used OTP
8. Sign JWT token
9. Set session cookie (httpOnly, secure, 7 days)

**Error Cases:**
- 400: OTP not verified
- 410: Verification expired
- 409: Slug taken
- 409: Email already registered
- 400: Validation errors

---

#### 5. `/api/auth/register-cancel` (POST)
Cancels the signup process and deletes OTP.

**Request:**
```json
{
  "email": "owner@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Signup cancelled successfully"
}
```

## Frontend Flow

### `/signup` Page

**Step 1: Gym Information**
- Gym Name (required)
- Gym Slug (auto-generated, editable, required)
- Address (optional)
- City (required)
- State (required)

**Validation:**
- All required fields must be filled
- Slug must be checked for availability
- Slug format: lowercase, numbers, hyphens only

**Step 2: Owner Details**
- Full Name (required)
- Email Address (required)
- Phone Number (required, 10 digits)

**Validation:**
- Email must be valid format
- Phone must be exactly 10 digits
- All fields required

**Step 3: OTP Verification**
- 6-digit OTP input
- Resend OTP option
- Auto-submit on 6 digits entered

**Actions:**
1. Verify OTP
2. Create gym and admin
3. Auto-login
4. Redirect to onboarding

## Onboarding Page

After successful signup, users are redirected to `/dashboard/onboarding` which shows:

1. **Welcome Message** with gym name
2. **Setup Checklist:**
   - Add first member
   - Test QR scanner
   - Configure settings
3. **Quick Stats:**
   - Member count
   - Trial days remaining
   - Feature access
4. **CTA:** Go to Dashboard

## Email Template

The OTP email includes:
- Swole branding with gradient header
- Large, centered OTP code
- 10-minute expiry notice
- Security warning
- Support contact information

## Security Considerations

### OTP Security
- ✅ OTPs are hashed with SHA256 before storage
- ✅ Timing-safe comparison prevents timing attacks
- ✅ 10-minute expiry window
- ✅ One-time use (deleted after verification)
- ✅ No OTP reuse possible

### Session Security
- ✅ JWT signed with HS256
- ✅ HttpOnly cookies (not accessible via JavaScript)
- ✅ Secure flag in production
- ✅ SameSite: Lax
- ✅ 7-day expiry

### Input Validation
- ✅ Zod schema validation on all inputs
- ✅ Email format validation (RFC 5322)
- ✅ Phone number validation (10 digits)
- ✅ Slug format validation (regex)
- ✅ SQL injection prevention (Prisma)

### Rate Limiting
⚠️ **TODO:** Implement rate limiting on:
- OTP send endpoint (max 3 per hour per email)
- OTP verify endpoint (max 5 attempts per OTP)
- Slug check endpoint (max 20 per minute per IP)

## Testing

### Manual Testing Flow

1. **Visit `/signup`**
2. **Step 1:**
   - Enter gym name: "Test Gym"
   - Verify slug auto-generates: "test-gym"
   - Click "Check" to verify availability
   - Enter city and state
   - Click "Next"

3. **Step 2:**
   - Enter owner name
   - Enter valid email
   - Enter 10-digit phone
   - Click "Send OTP"

4. **Step 3:**
   - Check email for OTP
   - Enter 6-digit code
   - Click "Verify & Create Gym"
   - Should redirect to `/dashboard/onboarding`

5. **Verify:**
   - Check database for Gym record
   - Check database for AdminUser record
   - Verify session cookie is set
   - Verify OTP is deleted

### Edge Cases to Test

- [ ] Duplicate gym slug
- [ ] Duplicate email
- [ ] Expired OTP
- [ ] Invalid OTP
- [ ] Resend OTP
- [ ] Back button navigation
- [ ] Form validation errors
- [ ] Network errors
- [ ] Incomplete form submission

## Maintenance

### Cleanup Expired OTPs

Run periodically (e.g., daily cron job):

```typescript
import { cleanupExpiredOTPs } from '@/lib/cleanup-expired-otps';

await cleanupExpiredOTPs();
```

### Monitoring

Monitor these metrics:
- Signup completion rate
- OTP delivery success rate
- OTP verification success rate
- Average time to complete signup
- Abandoned signups by step

## Future Enhancements

- [ ] Add rate limiting
- [ ] Add CAPTCHA on OTP send
- [ ] Add phone number verification
- [ ] Add social login options
- [ ] Add referral code support
- [ ] Add analytics tracking
- [ ] Add A/B testing for signup flow
- [ ] Add progress save/resume
- [ ] Add multi-language support

## Troubleshooting

### OTP Not Received
1. Check spam folder
2. Verify Resend API key is set
3. Check Resend dashboard for delivery status
4. Verify email format is valid

### Slug Already Taken
1. Try different slug
2. Add numbers or location to make unique
3. Check if gym already exists in database

### Session Not Created
1. Check JWT secret is set
2. Verify cookie settings
3. Check browser allows cookies
4. Verify HTTPS in production

### Database Errors
1. Check Prisma connection
2. Verify schema is up to date
3. Run `npx prisma generate`
4. Check database credentials

## Support

For issues or questions:
- Email: contact@quantumworks.services
- Documentation: [Link to docs]
- GitHub Issues: [Link to repo]
