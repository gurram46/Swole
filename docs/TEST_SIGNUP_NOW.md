# 🧪 Test Signup Flow NOW

## Quick Test Steps

### 1. **Refresh Your Browser**
The Toaster component has been added. Refresh the page at `/signup`.

### 2. **Fill Step 1 (Gym Info)**
```
Gym Name: Test Gym
Gym Slug: test-gym (auto-generated)
City: Mumbai
State: Maharashtra
```
Click "Check" to verify slug → Should show green checkmark
Click "Next"

### 3. **Fill Step 2 (Owner Details)**
```
Full Name: Test Owner
Email: your-real-email@gmail.com (use your real email!)
Phone: 9876543210
Password: password123
Confirm Password: password123
```
Click "Send OTP"

### 4. **Check Your Email**
- Look for email from "Swole Gym <noreply@quantumworks.services>"
- Subject: "🔐 Your Swole Gym Verification Code"
- Copy the 6-digit code

### 5. **Enter OTP (Step 3)**
- Paste the 6-digit code
- Click "Verify & Create Gym"
- Should see success message
- Should redirect to `/dashboard/onboarding`

---

## 🐛 If Something Goes Wrong

### **No Toast Messages Appear:**
```bash
# Hard refresh the page
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

### **"Send OTP" Button Does Nothing:**
1. Open browser console (F12)
2. Click "Send OTP"
3. Check for errors
4. Share the error message

### **OTP Email Not Received:**
1. Check spam folder
2. Wait 1-2 minutes
3. Try "Resend" button (wait 30 seconds)
4. Check Resend dashboard for delivery status

### **OTP Verification Fails:**
- Make sure you're entering the correct 6-digit code
- Check if OTP expired (10 minutes)
- Try resending OTP

### **Registration Fails:**
- Check if email is already registered
- Check if slug is already taken
- Try a different email/slug

---

## 🎯 What Should Happen

### **Success Flow:**
1. ✅ Step 1 → Slug checked → Green checkmark
2. ✅ Step 2 → "Send OTP" → Toast: "OTP Sent"
3. ✅ Email received within 30 seconds
4. ✅ Step 3 → Enter OTP → Toast: "Success!"
5. ✅ Redirect to `/dashboard/onboarding`
6. ✅ Can log in with email + password

### **Visual Feedback:**
- Toast notifications appear in bottom-right corner
- Loading spinners on buttons
- Progress indicator shows current step
- Resend button shows countdown

---

## 📝 Test Different Scenarios

### **Test 1: Happy Path** ✅
- Complete signup normally
- Should work end-to-end

### **Test 2: Duplicate Email** ✅
- Try signing up with same email twice
- Should show error: "Email already registered"

### **Test 3: Invalid OTP** ✅
- Enter wrong OTP code
- Should show error: "Invalid OTP"

### **Test 4: Resend OTP** ✅
- Click "Resend" immediately
- Should show countdown: "Resend in 30s"
- Wait 30 seconds
- Click "Resend" again
- Should send new OTP

### **Test 5: Password Validation** ✅
- Try password < 8 characters
- Should show error: "Password must be at least 8 characters"
- Try mismatched passwords
- Should show error: "Passwords don't match"

---

## 🚨 Common Issues & Fixes

### **Issue: Toaster not showing**
**Fix:** Hard refresh browser (Ctrl+Shift+R)

### **Issue: Button not responding**
**Fix:** Check browser console for errors

### **Issue: OTP not received**
**Fix:** 
1. Check spam folder
2. Verify Resend API key in `.env`
3. Check Resend dashboard for delivery logs

### **Issue: "Prisma client not generated"**
**Fix:**
```bash
npx prisma generate
```

### **Issue: Database connection error**
**Fix:** Check `DATABASE_URL` in `.env`

---

## ✅ Success Criteria

You'll know it's working when:
1. ✅ Toast messages appear for all actions
2. ✅ OTP email arrives within 30 seconds
3. ✅ OTP verification succeeds
4. ✅ Account is created in database
5. ✅ Redirected to onboarding page
6. ✅ Can log in with email + password

---

## 🎉 After Successful Test

Once signup works:
1. Check database for new gym record
2. Check database for new admin user
3. Try logging in with the credentials
4. Verify session cookie is set
5. Access dashboard

---

**Ready to test? Refresh your browser and try it now!** 🚀
