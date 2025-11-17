# Phase 9: Email + Password Authentication System

## Overview

Implementing a traditional email + password authentication system with one-time OTP verification during signup only.

## Changes Required

### 1. Database Schema ✅ DONE

**File:** `prisma/schema.prisma`

**Changes:**
- Remove `otp_code` and `otp_expires` from AdminUser
- Add `password_hash` field

```prisma
model AdminUser {
  id            String    @id @default(uuid())
  gym_id        String
  gym           Gym       @relation(fields: [gym_id], references: [id])
  email         String    @unique
  password_hash String    // NEW
  role          Role      @default(owner)
  created_at    DateTime  @default(now())

  @@index([gym_id])
}
```

### 2. Signup Flow Changes

**File:** `app/(auth)/signup/page.tsx`

**Step 1 Changes - Add Password Fields:**
- Add `password` field
- Add `confirm_password` field
- Validate password strength (min 8 chars)
- Validate passwords match

**Step 2 - Send OTP (unchanged)**

**Step 3 - Verify OTP & Create Account:**
- Send password along with other data
- Hash password in backend
- Store hash in database

### 3. Register Finalize API

**File:** `app/api/auth/register-finalize/route.ts`

**Changes:**
- Accept `password` in request body
- Hash password with bcrypt (rounds: 12)
- Store `password_hash` in AdminUser
- Remove OTP-related code

### 4. New Login API

**File:** `app/api/auth/login/route.ts` (CREATE NEW)

**Logic:**
```typescript
1. Receive email + password
2. Find AdminUser by email
3. Compare password with bcrypt
4. If valid:
   - Sign JWT token
   - Set session cookie
   - Return success
5. If invalid:
   - Return error
```

### 5. Login Page Rewrite

**File:** `app/(auth)/login/page.tsx`

**New UI:**
- Email input
- Password input
- Login button
- "Forgot password?" link
- Link to signup

**Remove:**
- OTP flow
- Dev bypass button
- All OTP-related code

### 6. Remove/Disable OTP Login

**Files to Delete/Disable:**
- `app/api/auth/send-otp/route.ts` - Delete or disable
- `app/api/auth/verify-otp/route.ts` - Delete or disable
- `app/api/auth/dev-login/route.ts` - Delete or disable

### 7. Dependencies

**Add to package.json:**
```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6"
  }
}
```

## Implementation Order

1. ✅ Update Prisma schema
2. ⏳ Install bcryptjs
3. ⏳ Create login API endpoint
4. ⏳ Update register-finalize API
5. ⏳ Update signup page (add password fields)
6. ⏳ Rewrite login page
7. ⏳ Delete OTP login routes
8. ⏳ Run database migration
9. ⏳ Test complete flow

## Security Requirements

- ✅ bcrypt with 12 rounds
- ✅ Password min length: 8 characters
- ✅ HttpOnly cookies
- ✅ JWT expires in 7 days
- ✅ Email validation
- ✅ Duplicate email check

## User Flows

### Signup Flow

```
1. User fills form (including password)
2. System sends OTP to email
3. User enters OTP
4. System verifies OTP
5. System hashes password
6. System creates gym + admin user
7. User logged in automatically
```

### Login Flow

```
1. User enters email + password
2. System validates credentials
3. System creates session
4. User redirected to dashboard
```

### No More OTP on Login!

- OTP only used once during signup
- Login is always email + password
- Faster, more familiar UX

## Files to Modify

- [x] `prisma/schema.prisma`
- [ ] `package.json`
- [ ] `app/(auth)/signup/page.tsx`
- [ ] `app/(auth)/login/page.tsx`
- [ ] `app/api/auth/login/route.ts` (create)
- [ ] `app/api/auth/register-finalize/route.ts`
- [ ] Delete: `app/api/auth/send-otp/route.ts`
- [ ] Delete: `app/api/auth/verify-otp/route.ts`
- [ ] Delete: `app/api/auth/dev-login/route.ts`

## Testing Checklist

### Signup
- [ ] Can enter password
- [ ] Password validation works
- [ ] Passwords must match
- [ ] OTP sent successfully
- [ ] OTP verification works
- [ ] Account created with password hash
- [ ] Auto-login after signup

### Login
- [ ] Can enter email + password
- [ ] Correct credentials work
- [ ] Wrong password rejected
- [ ] Non-existent email rejected
- [ ] Session created
- [ ] Redirected to dashboard

### Security
- [ ] Password stored as hash only
- [ ] bcrypt comparison works
- [ ] Session cookie is HttpOnly
- [ ] JWT expires correctly

## Status

**Current Phase:** Planning Complete
**Next Step:** Install bcryptjs and implement

