You are the coding agent responsible for building a Gym Management SaaS MVP.

==========================
=   PROJECT OVERVIEW     =
==========================

We are building a multi-tenant Gym Management Platform for Indian gyms.

Two main parts:

1. Marketing/Landing Site  
   - Located at: MAIN_DOMAIN  
   - Purpose: Attract gyms, explain features, collect demo requests.

2. Gym Management Web App (Admin Dashboard)  
   - Located at: https://app.MAIN_DOMAIN  
   - Purpose: Gym owners and staff manage members, attendance, and renewals.

Important: 
- ONLY gym owners/staff are "users" of the system.
- Gym members are NOT app users. They are records in the database with a QR code.

==========================
=     TECH STACK         =
==========================

Frontend:
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- lucide-react icons
- React Query for client-side fetching
- Mobile-first UI

Backend:
- Next.js API Routes (App Router)
- Prisma ORM
- Neon PostgreSQL
- Resend (Email API) for sending OTPs and notifications
- jose for JWT-based session cookies

QR System:
- "qrcode" npm package to generate member QR codes
- "html5-qrcode" (or similar) to scan QR via device camera

Deployment:
- Vercel for both landing and app
- MAIN_DOMAIN → marketing site
- app.MAIN_DOMAIN → app

==========================
=  ARCHITECTURE RULES     =
==========================

- Single monorepo, no separate backend repo.
- /app → pages (landing + app).
- /app/api → backend endpoints.
- /lib/db.ts → Prisma client.
- /components → reusable UI components.
- Everything must be mobile-first.
- Avoid unnecessary abstractions and libraries.
- Build only what is required for the MVP.

==========================
=  DATABASE SCHEMA (PRISMA)
==========================

Use this schema:

model Gym {
  id           String        @id @default(uuid())
  name         String
  slug         String        @unique
  owner_name   String
  owner_email  String
  owner_phone  String
  created_at   DateTime      @default(now())

  admins       AdminUser[]
  members      Member[]
  attendance   Attendance[]
}

model AdminUser {
  id          String      @id @default(uuid())
  gym_id      String
  gym         Gym         @relation(fields: [gym_id], references: [id])
  email       String      @unique
  otp_code    String?
  otp_expires DateTime?
  role        Role        @default(owner)
  created_at  DateTime    @default(now())

  @@index([gym_id])
}

enum Role {
  owner
  staff
}

model Member {
  id               String        @id @default(uuid())
  gym_id           String
  gym              Gym           @relation(fields: [gym_id], references: [id])
  name             String
  phone            String
  membership_start DateTime
  membership_end   DateTime
  qr_code          String        @unique   // permanent random ID, NOT PII
  is_active        Boolean       @default(true)
  created_at       DateTime      @default(now())

  attendance       Attendance[]

  @@index([gym_id])
  @@index([membership_end])
  @@index([qr_code])
}

model Attendance {
  id             String      @id @default(uuid())
  gym_id         String
  gym            Gym         @relation(fields: [gym_id], references: [id])
  member_id      String
  member         Member      @relation(fields: [member_id], references: [id])
  check_in_time  DateTime    @default(now())
  check_out_time DateTime?
  created_at     DateTime    @default(now())

  @@index([gym_id])
  @@index([member_id])
  @@index([check_in_time])
}

==========================
=     AUTH SYSTEM         =
==========================

Users:
- Only gym owners and staff are authenticated users.
- Members do NOT log in.

Authentication:
- Email-based OTP login using Resend.
- Flow:
  1. Admin enters email.
  2. System generates otp_code and otp_expires (5 minutes).
  3. OTP is emailed via Resend.
  4. Admin submits OTP.
  5. If valid and not expired, create JWT.
  6. Store JWT in httpOnly, secure, SameSite=strict cookie.

JWT payload:
- admin_user_id
- gym_id
- email
- role

Session:
- Cookie expiry: 7 days.
- Logout clears cookie.

==========================
=    AUTHORIZATION        =
==========================

- All protected API routes must:
  - Read session from cookie.
  - Reject if not authenticated (401).
  - Use gym_id from session in all queries.

- Enforce multi-tenant isolation:
  - Every query/filter MUST include: gym_id = session.gym_id
  - AdminUser cannot access other gym's data.
  - Member and Attendance queries are always scoped by gym_id.

==========================
=     QR & MEMBERSHIP     =
==========================

Members are NOT app users. They are records.

QR behavior:
- Each member has a permanent qr_code string (random/UUID).
- QR content is JUST this qr_code, not PII.
- QR never encodes name/phone/email.
- QR itself does NOT "expire".

Membership duration:
- Controlled by membership_start and membership_end.
- Gym owner sets these when adding a member.
- On QR scan, backend checks:
  - member exists for that gym
  - member.is_active == true
  - membership_end >= today

If any check fails:
- Attendance is NOT recorded.
- Response indicates expired/inactive member.

==========================
=   SECURITY RULES        =
==========================

Authentication security:
- OTP:
  - 6-digit numeric code.
  - Expires in 5 minutes.
  - Store hashed if feasible (or at least short-lived).
- Rate limit OTP send:
  - e.g. max 5 per hour per email/IP.
- On OTP verify:
  - Invalidate the OTP after successful login.

JWT & cookie security:
- Use strong secret for JWT signing.
- Store JWT in httpOnly, secure cookie.
- SameSite=strict.
- No token in localStorage.

API security:
- All POST/PUT/PATCH/DELETE routes validate input using Zod or similar.
- Sanitize and validate all body parameters.
- Return proper 4xx/5xx codes.

QR & attendance security:
- On scan:
  - Verify session (only authenticated staff can scan).
  - Look up member by qr_code AND gym_id.
  - Reject if membership expired or is_active == false.
  - Prevent multiple active check-ins for same member on the same day.

Rate limiting (MVP-level):
- Add basic rate limiting on:
  - /api/auth/request-otp
  - /api/demo-request
  - /api/attendance/scan

Secrets management:
- Database URL, JWT secret, Resend API key must be in environment variables only.
- Never hardcode secrets.

Logging:
- Log:
  - OTP send attempts (success/fail).
  - Login attempts (success/fail).
  - Attendance scan errors (e.g., invalid QR, expired membership).

==========================
=   MVP FEATURE PHASES    =
==========================

PHASE 1 — Landing / Marketing Page
- Dark neon gym theme
- Hero section
- Features section
- How-it-works section
- Pricing section
- Demo request form
- /api/demo-request endpoint
- For MVP: demo requests are emailed via Resend.

PHASE 2 — Auth System
- Email (Gmail) OTP login for gym admins
- OTP generation endpoint
- OTP verification endpoint
- Session cookie setup
- Login/logout UI

PHASE 3 — Admin Dashboard (Mobile-first)
- Dashboard overview (total members, active members, expiring soon)
- Member list view
- Add member form (including membership_start and membership_end)
- QR generation for each member
- View QR (for printing/WhatsApp)
- Filter by active/inactive and expiring soon

PHASE 4 — QR-based Attendance
- QR scan page using device camera
- Check-in / check-out logic
- List attendance by day
- Show per-member attendance history

PHASE 5 — Reminder System
- Cron-like API route to be triggered manually or via external scheduler
- Check members whose membership_end is near expiry (e.g., 7 days)
- Send email reminders (to gym owner or member) via Resend
- WhatsApp integration can be added later (not in MVP).

==========================
=   WHAT TO BUILD FIRST   =
==========================

Start with PHASE 1 — Landing / Marketing Page:
- Project setup (Next.js 14, TS, Tailwind, shadcn)
- Layout and global styles
- Landing sections (Hero, Features, How-it-works, Pricing)
- DemoForm component
- /api/demo-request endpoint that validates input and sends an email via Resend.

Do NOT build later phases until explicitly requested.
