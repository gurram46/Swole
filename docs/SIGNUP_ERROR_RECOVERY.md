# Signup Error Recovery Guide

## Quick Reference for Common Issues

### ❌ Problem: "Email Already Registered" Error

**What happened:**
You tried to sign up with an email that's already in the system.

**Solutions:**
1. **Use Login Instead**
   - Click "Sign in" link at the bottom
   - Use the existing account

2. **Try Different Email**
   - Click "Start Over" button
   - Use a different email address

3. **Forgot You Had Account?**
   - Go to login page
   - Request password reset (if implemented)

---

### ❌ Problem: Entered Wrong Email

**What happened:**
You typed the wrong email and already clicked "Send OTP".

**Solutions:**
1. **Change Email (Recommended)**
   - On Step 3, click "Wrong email? Change it"
   - You'll go back to Step 2
   - Correct your email
   - Click "Send OTP" again

2. **Start Over**
   - Click "Start Over" button at bottom
   - Re-enter all information with correct email

---

### ❌ Problem: Didn't Receive OTP

**What happened:**
You're on Step 3 but no email arrived.

**Solutions:**
1. **Check Spam Folder**
   - Look in spam/junk folder
   - Mark as "Not Spam" if found

2. **Wait a Moment**
   - Emails can take 30-60 seconds
   - Check again after a minute

3. **Resend OTP**
   - Click "Didn't receive code? Resend"
   - Check email again

4. **Wrong Email?**
   - Click "Wrong email? Change it"
   - Verify email is correct
   - Send OTP again

---

### ❌ Problem: OTP Expired

**What happened:**
You waited more than 10 minutes to enter the OTP.

**Solutions:**
1. **Resend OTP**
   - Click "Didn't receive code? Resend"
   - New OTP will be sent
   - Enter within 10 minutes

---

### ❌ Problem: Invalid OTP

**What happened:**
The 6-digit code you entered is incorrect.

**Solutions:**
1. **Double Check Code**
   - Verify you copied all 6 digits
   - Check for typos
   - Try again

2. **Get New Code**
   - Click "Didn't receive code? Resend"
   - Use the new code

---

### ❌ Problem: Slug Already Taken

**What happened:**
The gym URL slug you want is already in use.

**Solutions:**
1. **Try Variations**
   - Add your city: `mygym-mumbai`
   - Add numbers: `mygym-2024`
   - Use full name: `my-fitness-center`

2. **Check Availability**
   - Click "Check" button after each change
   - Green checkmark = available
   - Red X = taken

---

### ❌ Problem: Want to Start Over

**What happened:**
You made mistakes and want to begin fresh.

**Solutions:**
1. **Use Start Over Button**
   - Visible on Steps 2 and 3
   - Click "Start Over" at bottom
   - All data will be cleared
   - Begin from Step 1

---

## Navigation Tips

### Going Back
- **Step 2 → Step 1:** Click "Back" button
  - Your gym info is preserved
  - You can edit and continue

- **Step 3 → Step 2:** Click "Back" button
  - Your owner info is preserved
  - OTP is cleared
  - You can edit email and resend

### Moving Forward
- **Step 1 → Step 2:** Click "Next"
  - Slug must be checked and available
  - All required fields must be filled

- **Step 2 → Step 3:** Click "Send OTP"
  - All fields must be valid
  - Email must not be registered
  - OTP will be sent

- **Step 3 → Complete:** Click "Verify & Create Gym"
  - Must enter correct 6-digit OTP
  - Creates your gym account
  - Logs you in automatically

---

## Visual Indicators

### Progress Bar
- **Gray Circle:** Not started
- **Purple Circle:** Current step
- **Green Circle with Checkmark:** Completed step
- **Green Line:** Completed connection

### Slug Checker
- **Green Checkmark:** ✓ Slug is available
- **Red X:** ✗ Slug is not available
- **Spinning Icon:** Checking...

### Buttons
- **Disabled (Gray):** Can't click yet
- **Enabled (Purple):** Ready to click
- **Loading (Spinning):** Processing...

---

## Keyboard Shortcuts

### Available Shortcuts
- **Tab:** Move to next field
- **Shift + Tab:** Move to previous field
- **Enter:** Submit current step (when valid)
- **Escape:** Close error messages

---

## Mobile Tips

### On Small Screens
- Scroll down to see all fields
- Use zoom if needed for small text
- Tap outside keyboard to dismiss
- Use "Done" on keyboard to proceed

---

## Time Limits

### OTP Expiry
- **Valid for:** 10 minutes
- **After expiry:** Must request new OTP
- **Tip:** Complete signup within 10 minutes

### Session
- **No time limit** on Steps 1 and 2
- Take your time filling the form
- Only OTP has time limit

---

## Support

### Still Having Issues?

1. **Check Browser**
   - Use modern browser (Chrome, Firefox, Safari, Edge)
   - Enable JavaScript
   - Allow cookies

2. **Clear Cache**
   - Clear browser cache
   - Try incognito/private mode
   - Refresh page

3. **Contact Support**
   - Email: contact@quantumworks.services
   - Include: Error message and step number
   - We'll help you complete signup

---

## Success Indicators

### You'll Know It Worked When:
1. ✅ Green success toast appears
2. ✅ "Welcome to Swole!" message shows
3. ✅ Redirected to onboarding page
4. ✅ Can see your gym dashboard

---

## Common Questions

**Q: Can I change my gym name later?**
A: Yes, in settings after signup.

**Q: Can I use the same email for multiple gyms?**
A: No, each email can only register one gym.

**Q: What if I close the browser during signup?**
A: You'll need to start over. Complete signup in one session.

**Q: Is my data saved if I go back?**
A: Yes, when using Back button. Not if you refresh page.

**Q: Can I skip the OTP verification?**
A: No, email verification is required for security.

---

**Last Updated:** November 15, 2025
**Version:** 1.0
