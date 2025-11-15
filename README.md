# 💪 Swole - Gym Management SaaS

A modern, multi-tenant gym management platform built for Indian gyms. Manage members, track attendance with QR codes, and automate membership expiry reminders.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38B2AC)

## ✨ Features

- 🔐 **Email OTP Authentication** - Secure passwordless login
- 👥 **Member Management** - Add, edit, and track gym members
- 📱 **QR Code Attendance** - Scan QR codes for check-in/check-out
- 📊 **Dashboard Analytics** - Real-time stats and insights
- ⏰ **Automated Reminders** - Daily email alerts for expiring memberships
- 🏢 **Multi-Tenant** - Support multiple gyms with data isolation
- 📧 **Email Notifications** - Powered by Resend API
- 🌙 **Dark Mode** - Beautiful purple/blue theme

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Neon PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT with jose
- **Email**: Resend API
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: lucide-react
- **QR Codes**: html5-qrcode, qrcode.react
- **Forms**: react-hook-form + zod
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ and npm
- Neon PostgreSQL account
- Resend API account
- Git

## 🛠️ Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/gurram46/Swole.git
cd Swole
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# JWT Secret (generate a random 32+ character string)
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"

# Resend API (for emails)
RESEND_API_KEY="re_xxxxxxxxxxxxx"

# App URL (for development)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Set Up Database

```bash
# Push Prisma schema to database
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌐 Deployment to Vercel

### Option 1: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository: `gurram46/Swole`
4. Configure environment variables (see below)
5. Click "Deploy"

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

### Required Environment Variables on Vercel

Add these in your Vercel project settings:

```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
RESEND_API_KEY=re_...
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### Enable Vercel Cron (for automated reminders)

The `vercel.json` file is already configured. Vercel Cron will automatically:
- Run daily at 7:00 AM IST
- Send membership expiry reminder emails
- Requires Vercel Pro plan or higher

## 📁 Project Structure

```
swole/
├── app/
│   ├── (marketing)/              # Public landing page
│   │   └── page.tsx
│   ├── (auth)/                   # Authentication pages
│   │   └── login/
│   ├── (dashboard)/              # Protected dashboard
│   │   ├── dashboard/
│   │   │   ├── page.tsx         # Dashboard overview
│   │   │   ├── members/         # Member management
│   │   │   ├── attendance/      # Attendance logs
│   │   │   ├── scanner/         # QR scanner
│   │   │   ├── reminders/       # Reminder management
│   │   │   └── settings/        # Gym settings
│   │   └── layout.tsx
│   ├── api/                      # API routes
│   │   ├── auth/                # Authentication
│   │   ├── members/             # Member CRUD
│   │   ├── attendance/          # Attendance tracking
│   │   ├── reminders/           # Reminder system
│   │   └── dashboard/           # Dashboard stats
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── components/
│   ├── dashboard/               # Dashboard components
│   ├── landing/                 # Landing page components
│   └── ui/                      # shadcn/ui components
├── lib/
│   ├── auth.ts                  # JWT authentication
│   ├── db.ts                    # Prisma client
│   ├── emails/                  # Email templates
│   └── utils.ts                 # Utility functions
├── prisma/
│   └── schema.prisma            # Database schema
└── vercel.json                  # Vercel configuration
```

## 🗄️ Database Schema

### Models

- **Gym** - Gym information and settings
- **AdminUser** - Gym owners and staff
- **Member** - Gym members with QR codes
- **Attendance** - Check-in/check-out records
- **ReminderLog** - Reminder execution history

See `prisma/schema.prisma` for full schema.

## 🔑 Key Features Explained

### QR Code System

- Each member gets a unique QR code (UUID)
- QR format: `GYMQR:<uuid>`
- Database stores UUID only (no prefix)
- Scanner strips prefix before lookup

### Attendance Toggle Logic

- First scan = Check-in (creates new session)
- Second scan = Check-out (closes open session)
- Multiple sessions per day supported
- All timestamps stored in UTC

### Reminder System

- Runs daily at 7:00 AM IST via Vercel Cron
- Finds members expiring in next 3 days
- Groups by gym (multi-tenant safe)
- Sends HTML email to gym owner
- Manual trigger available in dashboard

### Multi-Tenant Isolation

- All queries filtered by `gym_id`
- JWT contains gym context
- Middleware enforces access control
- Complete data isolation per gym

## 📝 API Routes

### Authentication
- `POST /api/auth/send-otp` - Request OTP
- `POST /api/auth/dev-login` - Dev login (development only)

### Members
- `GET /api/members` - List members (with filters)
- `POST /api/members` - Create member
- `GET /api/members/[id]` - Get member details
- `PATCH /api/members/[id]` - Update member
- `DELETE /api/members/[id]` - Soft delete member
- `GET /api/members/[id]/attendance` - Member attendance history

### Attendance
- `POST /api/attendance/scan` - Process QR scan
- `GET /api/attendance` - List attendance records

### Reminders
- `POST /api/reminders/run` - Run reminder job (cron)
- `GET /api/reminders/status` - Get reminder status

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## 🧪 Development Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint

# Database
npx prisma db push       # Push schema changes
npx prisma generate      # Generate Prisma Client
npx prisma studio        # Open Prisma Studio

# Deployment
vercel                   # Deploy to Vercel
vercel --prod            # Deploy to production
```

## 🔒 Security Features

- JWT-based authentication
- httpOnly cookies
- CSRF protection
- Input validation with Zod
- SQL injection prevention (Prisma)
- Rate limiting on OTP requests
- Multi-tenant data isolation
- No PII in QR codes

## 📱 Mobile Support

- Fully responsive design
- Mobile-first approach
- Touch-optimized UI
- Camera access for QR scanning
- Progressive Web App ready

## 🎨 Customization

### Theme Colors

Edit `tailwind.config.ts` to customize colors:

```typescript
colors: {
  primary: '#a855f7',    // Purple
  secondary: '#3b82f6',  // Blue
}
```

### Email Templates

Edit `lib/emails/expiryReminder.ts` to customize email design.

## 🐛 Troubleshooting

### Prisma Client Issues

```bash
# Regenerate Prisma Client
npx prisma generate

# Reset database (⚠️ deletes all data)
npx prisma db push --force-reset
```

### Environment Variables Not Loading

- Ensure `.env` file is in root directory
- Restart development server after changes
- Check for typos in variable names

### QR Scanner Not Working

- Ensure HTTPS in production (required for camera access)
- Grant camera permissions in browser
- Test on mobile device for best results

## 📄 License

Private - All Rights Reserved

## 👥 Support

For issues and questions:
- GitHub Issues: [github.com/gurram46/Swole/issues](https://github.com/gurram46/Swole/issues)
- Email: contact@quantumworks.services

## 🚀 Roadmap

- [ ] WhatsApp reminders integration
- [ ] Payment gateway integration (Razorpay)
- [ ] Multi-branch support
- [ ] Staff role permissions
- [ ] Member self-service portal
- [ ] Export to Excel/CSV
- [ ] Desktop kiosk mode
- [ ] Mobile app (React Native)

---

Built with ❤️ for Indian gyms
