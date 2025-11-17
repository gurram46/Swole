# 🚀 Quick Start - Swole Gym Signup System

## Test the Signup Flow Right Now!

### 1. Open Your Browser
```
http://localhost:3001/signup
```

### 2. Fill Out Step 1 (Gym Info)
```
Gym Name: Test Fitness Center
Slug: (auto-generated) test-fitness-center
City: Mumbai
State: Maharashtra
```
Click "Check" to verify slug, then "Next"

### 3. Fill Out Step 2 (Owner Info)
```
Name: Your Name
Email: your-real-email@example.com
Phone: 9876543210
```
Click "Send OTP"

### 4. Check Your Email
- Look for email from "Swole Gym"
- Copy the 6-digit code
- Enter it in Step 3
- Click "Verify & Create Gym"

### 5. You're In! 🎉
- You'll be redirected to the onboarding page
- Your gym is created
- You're automatically logged in
- 15-day free trial is active

## Quick Links

- **Signup Page:** http://localhost:3001/signup
- **Login Page:** http://localhost:3001/login
- **Dashboard:** http://localhost:3001/dashboard
- **Marketing:** http://localhost:3001/

## API Endpoints

```bash
# Check slug availability
POST http://localhost:3001/api/gym/check-slug
Body: { "slug": "my-gym" }

# Send OTP
POST http://localhost:3001/api/auth/send-signup-otp
Body: { "email": "test@example.com" }

# Verify OTP
POST http://localhost:3001/api/auth/verify-signup-otp
Body: { "email": "test@example.com", "otp": "123456" }

# Finalize registration
POST http://localhost:3001/api/auth/register-finalize
Body: { gym_name, gym_slug, city, state, owner_name, owner_email, owner_phone }
```

## Environment Variables Required

```env
DATABASE_URL=your_postgres_url
RESEND_API_KEY=your_resend_key
AUTH_SECRET=your_secret_key
```

## Common Issues

**OTP not received?**
- Check spam folder
- Verify RESEND_API_KEY is set
- Check server logs

**Slug already taken?**
- Try a different gym name
- Add numbers or location

**Can't login after signup?**
- Check browser cookies are enabled
- Try incognito mode
- Clear cookies and try again

## Documentation

- **Full Docs:** `SIGNUP_SYSTEM.md`
- **Testing Guide:** `PHASE_8_TESTING.md`
- **Implementation:** `PHASE_8_COMPLETE.md`

## Need Help?

1. Check the troubleshooting section in `PHASE_8_TESTING.md`
2. Review error messages in browser console
3. Check server logs in terminal
4. Email: contact@quantumworks.services

---

**That's it! Start testing now!** 🎯
