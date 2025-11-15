# Swole - Gym Management SaaS MVP

Modern gym management platform for Indian gyms.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: lucide-react
- **Database**: Neon PostgreSQL (to be added)
- **ORM**: Prisma (to be added)
- **Email**: Resend API (to be added)
- **Auth**: JWT with jose (to be added)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in the required values (database, API keys, etc.)

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
swole/
├── app/
│   ├── (marketing)/        # Landing page
│   ├── (auth)/             # Login/OTP pages
│   ├── (admin)/            # Protected admin dashboard
│   ├── api/                # API routes
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
├── components/
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── env.ts              # Environment config
│   └── utils.ts            # Utility functions
└── public/                 # Static assets
```

## Development Phases

- [x] Phase 0: Project setup
- [ ] Phase 1: Marketing site
- [ ] Phase 2: Auth system (OTP)
- [ ] Phase 3: Admin dashboard
- [ ] Phase 4: Member management
- [ ] Phase 5: QR attendance
- [ ] Phase 6: Reminder system

## Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## License

Private - All Rights Reserved
