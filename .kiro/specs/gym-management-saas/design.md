# design.md
# Gym Management SaaS – System Design Document

## 1. Introduction
This document defines the system architecture, data flow, UI/UX layout, API structure, and component design for the Gym Management SaaS MVP. It is based on the requirements.md specification and provides developers with a clear understanding of how the system shall function internally.

---

# 2. System Architecture

## 2.1 High-Level Architecture Diagram

```
┌───────────────────────────────┐
│           User Device         │
│  (Gym Owner / Staff - Mobile) │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│         Next.js 14 App        │
│ (Pages, Routes, UI, Scanner)  │
└───────┬───────────────────────┘
        │
        ▼
┌───────────────────────────────┐
│      Next.js API Routes       │
│  (Auth, Members, Attendance)  │
└───────┬───────────────────────┘
        │
        ▼
┌───────────────────────────────┐
│            Prisma             │
│       (ORM Data Layer)        │
└───────┬───────────────────────┘
        │
        ▼
┌───────────────────────────────┐
│          Neon Postgres        │
│  (Multi-Tenant DB Storage)    │
└───────────────────────────────┘
```

---

# 3. Data Model

The system uses a **multi-tenant PostgreSQL schema**. All tenant isolation is done using `gym_id`.

### 3.1 Entities and Relationships

```
Gym (1) ─── (∞) AdminUser
Gym (1) ─── (∞) Member
Member (1) ─── (∞) Attendance
```

### 3.2 Updated Prisma Schema

```prisma
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
  phone            String        // stored as +91XXXXXXXXXX
  membership_start DateTime
  membership_end   DateTime
  qr_code          String        @unique   // UUID only, no prefix
  is_active        Boolean       @default(true)
  deleted_at       DateTime?     // soft delete
  created_at       DateTime      @default(now())

  attendance       Attendance[]

  @@index([gym_id])
  @@index([membership_end])
  @@index([qr_code])
  @@index([deleted_at])
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
```

### 3.3 Key Design Points
- Members do NOT have login accounts.
- Phone numbers normalized to +91XXXXXXXXXX format.
- QR codes store UUID in DB, but QR content includes GYMQR: prefix.
- Attendance sessions toggle: open session → check-out, no open session → check-in.
- Soft delete for members only (deleted_at field).
- OTP login uses temporary OTP table fields on AdminUser.

---

# 4. Authentication & Authorization Design

## 4.1 Gym Onboarding Flow

```
1. User visits /register
2. Fills form: gym name, owner name, owner email, owner phone
3. System creates Gym + AdminUser (role=owner) in transaction
4. System generates slug from gym name
5. System sends OTP to owner email
6. User verifies OTP
7. System issues JWT and logs user in
```

## 4.2 Authentication Flow (Email OTP)

```
1. User enters email at /login
2. API generates 6-digit OTP, stores otp_code + otp_expires (5 min)
3. Resend sends OTP email
4. User enters OTP
5. API verifies OTP
6. System issues JWT (jose)
7. JWT is stored in httpOnly, secure, SameSite=strict cookie
8. OTP is invalidated
```

### 4.3 JWT Payload

```json
{
  "admin_user_id": "...",
  "gym_id": "...",
  "email": "...",
  "role": "owner"
}
```

### 4.4 Authorization Rules

* Every protected route extracts JWT from cookie.
* Every DB query must be filtered by `gym_id`.
* Staff can scan QR and view dashboard.
* Owners can add members and edit membership.

---

# 5. Frontend Design (Next.js App Router)

The app uses a **folder-based routing structure** with three sections:

```
/app
  ├── (marketing)
  │     └── page.tsx
  ├── (auth)
  │     ├── register/page.tsx
  │     ├── login/page.tsx
  │     └── otp/page.tsx
  ├── (admin)
  │     ├── dashboard/page.tsx
  │     ├── members/page.tsx
  │     ├── members/add/page.tsx
  │     ├── members/[id]/page.tsx
  │     ├── scanner/page.tsx
  │     └── attendance/page.tsx
  └── api
```

### 5.1 UI Component System

* All UI uses **shadcn/ui**
* Icons via **lucide-react**
* Layout is fully **mobile-first**

### 5.2 Theming

* Dark Neon Gym Theme
* Accent colors: Purple (#a855f7), Blue (#3b82f6)

---

# 6. Page-Level Design

## 6.1 Registration Page (/register)

Inputs:
* Gym name
* Owner name
* Owner email
* Owner phone

On submit:
* Create Gym + AdminUser
* Send OTP
* Redirect to OTP verification

## 6.2 Dashboard Page

Displays:
* TOTAL Members (excluding soft-deleted)
* ACTIVE Members
* EXPIRING SOON (7 days)
* TODAY'S CHECK-INS

Design:
* Mobile card grid
* Simple icons
* CTA buttons at bottom

---

## 6.3 Member List Page

* Table/list optimized for phones
* Shows:
  * Name
  * Phone (+91XXXXXXXXXX format)
  * Expiration status (Colored badge)
  * QR button

---

## 6.4 Add Member Page

Inputs:
* name
* phone (auto-normalized to +91XXXXXXXXXX)
* membership_start
* membership_end

On save:
* Extract 10 digits from phone input
* Generate `qr_code` UUID
* Create member in DB

---

## 6.5 QR Display Page

Shows:
* Big QR in center (content: GYMQR:<uuid>)
* Member name
* Download image button
* "Share on WhatsApp" button (future)

---

## 6.6 Attendance Page

* Shows check-in/out logs
* Sorted by time descending
* Filter by date
* Excludes soft-deleted members

---

## 6.7 QR Scanner Page

Uses:
```
html5-qrcode
```

Flow:
1. Staff clicks "Open Scanner"
2. Camera starts
3. On scan success, strip GYMQR: prefix, send POST /api/attendance/scan
4. Display:
   * SUCCESS: "Check-in recorded"
   * SUCCESS: "Check-out recorded"
   * ERROR: "Membership expired"
   * ERROR: "Unknown QR code"
   * ERROR: "Member deleted"

---

# 7. API Design

All APIs live under `/app/api`.

## 7.1 Onboarding APIs

```
POST /api/onboarding/register
```

## 7.2 Auth APIs

```
POST /api/auth/request-otp
POST /api/auth/verify-otp
POST /api/auth/logout
```

## 7.3 Member APIs

```
GET  /api/members
POST /api/members
GET  /api/members/[id]
PATCH /api/members/[id]
DELETE /api/members/[id]  (soft delete - sets deleted_at)
```

## 7.4 Attendance APIs

```
POST /api/attendance/scan
GET  /api/attendance
GET  /api/attendance/member/[member_id]
```

## 7.5 Demo Request API

```
POST /api/demo-request
```

## 7.6 Reminder API

```
POST /api/reminders/daily  (triggered by Vercel Cron)
```

---

# 8. QR Handling Design

## 8.1 QR Generation

* A random UUID is generated as `qr_code`
* QR content includes prefix: `GYMQR:<uuid>`
* DB stores only the UUID (no prefix)
* QR is generated using `qrcode` library

Example:
* DB: `qr_code = "349d9c8e-ffcd-4c2a-beab-312399e2ba8f"`
* QR content: `GYMQR:349d9c8e-ffcd-4c2a-beab-312399e2ba8f`

## 8.2 QR Scan Validation Rules

When scanned:

1. Validate authenticated user
2. Strip `GYMQR:` prefix
3. Extract UUID
4. Find member where:
   ```
   gym_id = session.gym_id 
   AND qr_code = extracted_uuid
   AND deleted_at IS NULL
   ```
5. If none → reject
6. If membership expired → reject
7. Check for open session:
   ```sql
   SELECT * FROM Attendance 
   WHERE member_id = ? 
   AND check_out_time IS NULL
   ORDER BY check_in_time DESC
   LIMIT 1
   ```
8. If open session exists → check-out (set check_out_time)
9. Else → check-in (create new Attendance record)

---

# 9. Phone Number Normalization

## 9.1 Input Processing

Accept any format:
* 8123456789
* +918123456789
* 091812345678
* 81234 56789
* 812-345-6789

## 9.2 Normalization Logic

```typescript
function normalizePhone(input: string): string {
  // Extract only digits
  const digits = input.replace(/\D/g, '');
  
  // Get last 10 digits
  const last10 = digits.slice(-10);
  
  // Validate length
  if (last10.length !== 10) {
    throw new Error('Invalid phone number');
  }
  
  // Return with +91 prefix
  return `+91${last10}`;
}
```

---

# 10. Reminder System Design

Trigger:
* Daily at **7 AM IST** via Vercel Cron

Process:

1. Query members where:
   ```sql
   membership_end BETWEEN today AND today+7
   AND is_active = true
   AND deleted_at IS NULL
   ```
2. Group by gym_id
3. For each gym, send ONE email to owner_email with list of expiring members
4. Email template includes:
   * Gym name
   * List of members (name, phone, expiry date)
5. Log reminder sent
6. Prevent duplicate reminders on same day

---

# 11. Middleware & Security Design

## 11.1 Middleware

Located at `/middleware.ts`.

Responsibilities:
* Parse JWT from cookies
* Validate signature
* Inject session into request
* Redirect unauthenticated visitors to /login
* Apply only to routes under `/app/(admin)` and `/app/api/(admin)`

## 11.2 Security Measures

* httpOnly cookies for session
* SameSite=strict
* OTP expiry enforcement (5 minutes)
* Rate limiting per IP (memory-based for MVP, Upstash Redis later)
* Zod validation on all input
* No PII in QR code (only UUID)
* All timestamps stored in UTC
* Soft delete for members (deleted_at)
* Phone number normalization prevents duplicates

---

# 12. Deployment Architecture

### 12.1 Marketing Site
* Deployed at MAIN_DOMAIN on Vercel

### 12.2 Admin App
* Deployed at app.MAIN_DOMAIN on Vercel

### 12.3 Database
* Hosted on Neon PostgreSQL
* Prisma migration system used

### 12.4 Cron Jobs
* Vercel Scheduled Functions for reminders (7 AM IST daily)

---

# 13. Future Considerations (Post-MVP)

* Payment integration (Razorpay)
* WhatsApp reminders (WATI / Twilio)
* Branch-level access controls
* Desktop kiosk mode
* Member-facing attendance portal
* Export to Excel/CSV
* Multi-language support

---

# 14. Conclusion

This design document provides the structural, architectural, and interaction model required to build the Gym Management SaaS MVP. It defines the system behavior, flows, UI patterns, API endpoints, and security layers required for a stable, scalable, and mobile-first product with proper gym onboarding, phone normalization, QR prefix handling, soft deletes, and reminder system.
