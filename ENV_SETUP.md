# 🔐 Environment Variables Setup Guide

Complete guide to configure all environment variables for Swole Gym Management SaaS.

## 📋 Required Environment Variables

### 1. DATABASE_URL

**Purpose**: PostgreSQL database connection string

**Provider**: Neon (neon.tech)

**Format**:
```
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
```

**How to Get**:
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Go to "Connection Details"
4. Copy the "Connection string"
5. Select "Pooled connection" for better performance

**Example**:
```
DATABASE_URL="postgresql://swole_user:abc123xyz@ep-cool-sun-123456.us-east-2.aws.neon.tech/swole_db?sslmode=require"
```

**Security Notes**:
- Never commit this to Git
- Use different databases for dev/staging/production
- Enable connection pooling in Neon

---

### 2. JWT_SECRET

**Purpose**: Secret key for signing JWT tokens

**Format**:
```
JWT_SECRET="your-super-secret-random-string-minimum-32-characters"
```

**How to Generate**:

**Option 1 - Node.js**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option 2 - OpenSSL**:
```bash
openssl rand -hex 32
```

**Option 3 - Online** (not recommended for production):
- [randomkeygen.com](https://randomkeygen.com)

**Example**:
```
JWT_SECRET="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6"
```

**Security Notes**:
- Must be at least 32 characters
- Use different secrets for dev/staging/production
- Rotate every 90 days
- Never share or commit to Git

---

### 3. RESEND_API_KEY

**Purpose**: API key for sending emails via Resend

**Provider**: Resend (resend.com)

**Format**:
```
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

**How to Get**:
1. Sign up at [resend.com](https://resend.com)
2. Verify your email
3. Go to "API Keys" in dashboard
4. Click "Create API Key"
5. Name it (e.g., "Swole Production")
6. Copy the key (starts with `re_`)

**Example**:
```
RESEND_API_KEY="re_AbCdEfGh_1234567890IjKlMnOpQrStUvWxYz"
```

**Email Configuration**:
- Default sender: `contact@quantumworks.services`
- To use your own domain:
  1. Add domain in Resend dashboard
  2. Add DNS records to your domain
  3. Wait for verification
  4. Update sender email in code

**Security Notes**:
- Keep secret and never commit
- Use different keys for dev/production
- Monitor usage in Resend dashboard

---

### 4. NEXT_PUBLIC_APP_URL

**Purpose**: Base URL of your application (used for API calls)

**Format**:
```
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

**Values by Environment**:

**Development**:
```
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Staging**:
```
NEXT_PUBLIC_APP_URL="https://swole-staging.vercel.app"
```

**Production**:
```
NEXT_PUBLIC_APP_URL="https://swole.yourdomain.com"
```

**Important Notes**:
- Must include protocol (`http://` or `https://`)
- No trailing slash
- This is a public variable (exposed to browser)
- Update after deploying to Vercel

---

## 📁 Environment Files

### Local Development (.env)

Create `.env` in project root:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/swole_dev?sslmode=require"

# JWT Secret (development only)
JWT_SECRET="dev-secret-key-change-in-production-min-32-chars"

# Resend API (use test key for development)
RESEND_API_KEY="re_test_key_for_development"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Vercel Production

Add in Vercel Dashboard → Settings → Environment Variables:

```
DATABASE_URL=postgresql://...
JWT_SECRET=production-secret-key-very-long-and-random
RESEND_API_KEY=re_production_key
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

**Scope**: Production, Preview, Development (select all)

---

## 🔒 Security Best Practices

### 1. Never Commit Secrets

Add to `.gitignore`:
```
.env
.env.local
.env.production
.env.development
```

### 2. Use Different Values Per Environment

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| DATABASE_URL | Dev DB | Staging DB | Prod DB |
| JWT_SECRET | Dev secret | Staging secret | Prod secret |
| RESEND_API_KEY | Test key | Test key | Prod key |

### 3. Rotate Secrets Regularly

- JWT_SECRET: Every 90 days
- RESEND_API_KEY: Every 180 days
- DATABASE_URL password: Every 180 days

### 4. Limit Access

- Only share with team members who need them
- Use Vercel's team features for access control
- Never post in Slack/Discord/public channels

### 5. Monitor Usage

- Check Resend dashboard for email usage
- Monitor Neon for database connections
- Review Vercel logs for suspicious activity

---

## 🧪 Testing Environment Variables

### Verify All Variables Are Set

Create `scripts/check-env.js`:

```javascript
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'RESEND_API_KEY',
  'NEXT_PUBLIC_APP_URL',
];

const missing = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missing.length > 0) {
  console.error('❌ Missing environment variables:');
  missing.forEach((varName) => console.error(`  - ${varName}`));
  process.exit(1);
}

console.log('✅ All environment variables are set!');
```

Run:
```bash
node scripts/check-env.js
```

### Test Database Connection

```bash
npx prisma db push
npx prisma studio
```

### Test Email Sending

```bash
# Send test email via API
curl -X POST http://localhost:3000/api/reminders/run?manual=1
```

---

## 🐛 Troubleshooting

### Error: "Environment variable not found"

**Solution**:
1. Check variable name spelling
2. Restart development server
3. Verify `.env` file location (must be in root)
4. Check for extra spaces or quotes

### Error: "Invalid DATABASE_URL"

**Solution**:
1. Verify connection string format
2. Check username/password are correct
3. Ensure `?sslmode=require` is included
4. Test connection in Neon dashboard

### Error: "JWT_SECRET must be at least 32 characters"

**Solution**:
1. Generate a longer secret
2. Use the Node.js command above
3. Ensure no spaces or special characters

### Error: "Resend API authentication failed"

**Solution**:
1. Verify API key starts with `re_`
2. Check key is not expired
3. Ensure no extra spaces
4. Generate new key if needed

### Error: "NEXT_PUBLIC_APP_URL is undefined"

**Solution**:
1. Ensure variable starts with `NEXT_PUBLIC_`
2. Restart development server
3. Check Vercel environment variables
4. Redeploy after adding

---

## 📝 Environment Variable Checklist

### Development Setup
- [ ] Created `.env` file in root
- [ ] Added DATABASE_URL (Neon dev database)
- [ ] Generated JWT_SECRET (32+ chars)
- [ ] Added RESEND_API_KEY (test key)
- [ ] Set NEXT_PUBLIC_APP_URL to localhost:3000
- [ ] Tested database connection
- [ ] Verified all variables load

### Production Setup
- [ ] Added DATABASE_URL to Vercel (prod database)
- [ ] Generated new JWT_SECRET for production
- [ ] Added RESEND_API_KEY to Vercel (prod key)
- [ ] Set NEXT_PUBLIC_APP_URL to production domain
- [ ] Verified all variables in Vercel dashboard
- [ ] Tested deployment
- [ ] Verified emails send correctly

### Security
- [ ] `.env` is in `.gitignore`
- [ ] Different secrets for dev/prod
- [ ] Secrets stored securely (password manager)
- [ ] Team members have limited access
- [ ] Monitoring enabled for all services

---

## 📞 Support

### Issues with Environment Variables

1. Check this guide first
2. Verify variable names match exactly
3. Restart server after changes
4. Check Vercel logs for errors

### Service-Specific Issues

- **Neon**: [neon.tech/docs](https://neon.tech/docs)
- **Resend**: [resend.com/docs](https://resend.com/docs)
- **Vercel**: [vercel.com/docs/environment-variables](https://vercel.com/docs/environment-variables)

---

## 🎯 Quick Reference

```env
# Copy this template to .env and fill in your values

# Database (from Neon)
DATABASE_URL="postgresql://..."

# JWT Secret (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET="your-32-char-secret"

# Email API (from Resend)
RESEND_API_KEY="re_..."

# App URL (your domain)
NEXT_PUBLIC_APP_URL="https://..."
```

---

✅ **All set!** Your environment variables are configured correctly.
