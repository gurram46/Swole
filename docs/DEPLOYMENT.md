# 🚀 Swole - Deployment Guide

Complete guide to deploy Swole Gym Management SaaS to production.

## 📋 Pre-Deployment Checklist

- [ ] Neon PostgreSQL database created
- [ ] Resend API account set up
- [ ] Domain name ready (optional)
- [ ] Vercel account created
- [ ] GitHub repository pushed

## 🗄️ Step 1: Set Up Neon Database

### 1.1 Create Neon Account

1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub
3. Create a new project

### 1.2 Get Database URL

1. In your Neon project dashboard
2. Go to "Connection Details"
3. Copy the connection string
4. Format: `postgresql://user:password@host/database?sslmode=require`

### 1.3 Initialize Database

```bash
# Set DATABASE_URL in .env
DATABASE_URL="your-neon-connection-string"

# Push schema to database
npx prisma db push

# Verify with Prisma Studio
npx prisma studio
```

## 📧 Step 2: Set Up Resend

### 2.1 Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for free account
3. Verify your email

### 2.2 Add Sending Domain

1. Go to "Domains" in Resend dashboard
2. Add your domain (e.g., `quantumworks.services`)
3. Add DNS records to your domain provider
4. Wait for verification (can take up to 48 hours)

**For testing**: Use the onboarding email provided by Resend

### 2.3 Generate API Key

1. Go to "API Keys" in Resend dashboard
2. Click "Create API Key"
3. Name it "Swole Production"
4. Copy the key (starts with `re_`)

## 🌐 Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

#### 3.1 Import Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select `gurram46/Swole`
4. Click "Import"

#### 3.2 Configure Project

**Framework Preset**: Next.js (auto-detected)

**Root Directory**: `./` (leave as default)

**Build Command**: `npm run build` (default)

**Output Directory**: `.next` (default)

#### 3.3 Add Environment Variables

Click "Environment Variables" and add:

```
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
RESEND_API_KEY=re_your_resend_api_key_here
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

**Important**: 
- Generate a strong JWT_SECRET (32+ random characters)
- Use your actual Neon DATABASE_URL
- Use your actual Resend API key
- NEXT_PUBLIC_APP_URL will be your Vercel URL

#### 3.4 Deploy

1. Click "Deploy"
2. Wait for build to complete (2-3 minutes)
3. Click "Visit" to see your live site

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: swole
# - Directory: ./
# - Override settings? No

# Add environment variables
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add RESEND_API_KEY
vercel env add NEXT_PUBLIC_APP_URL

# Deploy to production
vercel --prod
```

## ⚙️ Step 4: Configure Vercel Cron

### 4.1 Verify vercel.json

The `vercel.json` file should already exist with:

```json
{
  "crons": [
    {
      "path": "/api/reminders/run",
      "schedule": "0 7 * * *",
      "timezone": "Asia/Kolkata"
    }
  ]
}
```

### 4.2 Enable Cron (Pro Plan Required)

1. Go to your Vercel project settings
2. Navigate to "Cron Jobs"
3. Verify the cron job is listed
4. Status should show "Active"

**Note**: Vercel Cron requires a Pro plan ($20/month). For free tier, use manual reminders from the dashboard.

### 4.3 Test Cron Job

```bash
# Manually trigger the cron endpoint
curl -X POST https://your-project.vercel.app/api/reminders/run
```

## 🔒 Step 5: Security Configuration

### 5.1 Update CORS Settings

In `next.config.mjs`, ensure:

```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: process.env.NEXT_PUBLIC_APP_URL },
        ],
      },
    ];
  },
};
```

### 5.2 Secure Environment Variables

1. Never commit `.env` to Git
2. Use Vercel's environment variable encryption
3. Rotate JWT_SECRET periodically
4. Use different secrets for staging/production

### 5.3 Enable HTTPS

Vercel automatically provides HTTPS. Ensure:
- All API calls use HTTPS
- Cookies are set with `secure: true`
- Camera access works (requires HTTPS)

## 🌍 Step 6: Custom Domain (Optional)

### 6.1 Add Domain to Vercel

1. Go to Project Settings → Domains
2. Click "Add Domain"
3. Enter your domain (e.g., `swole.yourdomain.com`)
4. Click "Add"

### 6.2 Configure DNS

Add these records to your domain provider:

**For subdomain** (e.g., swole.yourdomain.com):
```
Type: CNAME
Name: swole
Value: cname.vercel-dns.com
```

**For root domain** (e.g., yourdomain.com):
```
Type: A
Name: @
Value: 76.76.21.21
```

### 6.3 Update Environment Variables

```
NEXT_PUBLIC_APP_URL=https://swole.yourdomain.com
```

Redeploy after updating.

## 🧪 Step 7: Post-Deployment Testing

### 7.1 Test Authentication

1. Visit your deployed URL
2. Go to `/login`
3. Enter email and request OTP
4. Check email for OTP
5. Verify login works

### 7.2 Test Member Management

1. Add a test member
2. Generate QR code
3. Download QR code
4. Verify member appears in list

### 7.3 Test QR Scanner

1. Go to `/dashboard/scanner`
2. Allow camera access
3. Scan the test member's QR code
4. Verify check-in is recorded
5. Scan again to test check-out

### 7.4 Test Reminders

1. Go to `/dashboard/reminders`
2. Click "Send Reminder Now"
3. Check gym owner email
4. Verify reminder email received

### 7.5 Test Dashboard

1. Go to `/dashboard`
2. Verify all stats display correctly
3. Check member count
4. Check today's attendance

## 📊 Step 8: Monitoring & Analytics

### 8.1 Vercel Analytics

1. Go to Project Settings → Analytics
2. Enable Web Analytics
3. Monitor page views and performance

### 8.2 Error Tracking

1. Go to Project Settings → Integrations
2. Add Sentry (optional)
3. Configure error alerts

### 8.3 Database Monitoring

1. Go to Neon dashboard
2. Monitor query performance
3. Check connection pool usage
4. Set up alerts for high usage

## 🔄 Step 9: Continuous Deployment

### 9.1 Automatic Deployments

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Vercel automatically deploys
```

### 9.2 Preview Deployments

- Every pull request gets a preview URL
- Test changes before merging
- Share preview links with team

### 9.3 Rollback

If something breaks:

1. Go to Vercel dashboard
2. Click "Deployments"
3. Find last working deployment
4. Click "..." → "Promote to Production"

## 🐛 Troubleshooting

### Build Fails

**Error**: `Prisma Client not generated`

```bash
# Add to package.json scripts
"postinstall": "prisma generate"
```

**Error**: `Environment variable not found`

- Check all env vars are added in Vercel
- Ensure no typos in variable names
- Redeploy after adding variables

### Database Connection Issues

**Error**: `Can't reach database server`

- Verify DATABASE_URL is correct
- Check Neon database is running
- Ensure connection pooling is enabled

### Email Not Sending

**Error**: `Resend API error`

- Verify RESEND_API_KEY is correct
- Check domain is verified in Resend
- Ensure sender email matches verified domain

### Cron Not Running

- Verify Vercel Pro plan is active
- Check cron job is enabled in settings
- Test endpoint manually first
- Check Vercel logs for errors

## 📈 Performance Optimization

### 1. Enable Edge Functions

In `app/api/*/route.ts`:

```typescript
export const runtime = 'edge';
```

### 2. Enable ISR (Incremental Static Regeneration)

For dashboard pages:

```typescript
export const revalidate = 60; // Revalidate every 60 seconds
```

### 3. Optimize Images

Use Next.js Image component:

```typescript
import Image from 'next/image';
```

### 4. Database Connection Pooling

Already configured in Neon. Monitor usage in dashboard.

## 🔐 Security Best Practices

1. **Rotate Secrets**: Change JWT_SECRET every 90 days
2. **Monitor Logs**: Check Vercel logs daily
3. **Update Dependencies**: Run `npm audit` weekly
4. **Backup Database**: Enable Neon automatic backups
5. **Rate Limiting**: Monitor API usage
6. **HTTPS Only**: Never allow HTTP in production

## 📞 Support

### Vercel Support
- Docs: [vercel.com/docs](https://vercel.com/docs)
- Discord: [vercel.com/discord](https://vercel.com/discord)

### Neon Support
- Docs: [neon.tech/docs](https://neon.tech/docs)
- Discord: [neon.tech/discord](https://neon.tech/discord)

### Resend Support
- Docs: [resend.com/docs](https://resend.com/docs)
- Email: support@resend.com

## ✅ Deployment Checklist

- [ ] Neon database created and connected
- [ ] Resend API key configured
- [ ] Environment variables added to Vercel
- [ ] Project deployed successfully
- [ ] Custom domain configured (optional)
- [ ] Cron job enabled (Pro plan)
- [ ] Authentication tested
- [ ] Member management tested
- [ ] QR scanner tested
- [ ] Reminders tested
- [ ] Dashboard verified
- [ ] Error monitoring set up
- [ ] Backups enabled

---

🎉 **Congratulations!** Your Swole Gym Management SaaS is now live!
