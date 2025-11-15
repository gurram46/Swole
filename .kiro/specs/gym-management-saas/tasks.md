# Implementation Plan

- [ ] 1. Phase 1 — Project Setup + Marketing Site
  - Create Next.js 14 project with App Router, TypeScript, Tailwind CSS, and shadcn/ui
  - Build marketing pages (Hero, Features, How-it-works, Pricing, Footer)
  - Implement demo request form with backend API
  - _Requirements: FR-47, FR-48, FR-49, FR-50, FR-51, FR-52_

- [ ] 1.1 Project Setup
  - Initialize Next.js 14 project (App Router, TypeScript)
  - Install Tailwind CSS + configure globals
  - Install shadcn/ui and set up components
  - Install lucide-react icons
  - Setup project structure: /app with (marketing), (auth), (admin), /api, /lib, /components, /styles
  - Configure ESLint + Prettier
  - Add dark neon theme tokens (colors, shadows)
  - _Requirements: NFR-13, NFR-14_

- [ ] 1.2 Marketing Pages
  - Create (marketing)/layout.tsx
  - Build Hero section
  - Build Features section
  - Build How-it-works section
  - Build Pricing section
  - Build Footer
  - Build Demo Request form
  - Add scroll anchors + mobile responsiveness
  - _Requirements: FR-47, FR-48_

- [ ] 1.3 Demo Request Backend
  - Create /api/demo-request route
  - Add Zod validation for input
  - Integrate Resend API to email lead
  - Add rate limiting (basic memory-based)
  - Add success + error responses
  - _Requirements: FR-49, FR-50, FR-51, FR-52, NFR-7_

- [ ] 1.4 Deployment for Marketing Site
  - Push repo to GitHub
  - Deploy to Vercel
  - Connect MAIN_DOMAIN to Vercel
  - QA test mobile layout
  - _Requirements: NFR-1_

- [ ] 2. Phase 2 — Authentication System (Email OTP)
  - Implement email OTP login system
  - Create auth pages and backend routes
  - Set up JWT-based session management
  - Add middleware for route protection
  - _Requirements: FR-5, FR-6, FR-7, FR-8, FR-9, FR-10, NFR-5, NFR-6_

- [ ] 2.1 Auth Pages
  - Create (auth)/login/page.tsx
  - Create (auth)/otp/page.tsx
  - Add forms using shadcn components
  - Add client-side validation
  - _Requirements: FR-5, NFR-13_

- [ ] 2.2 Auth Backend
  - Create /api/auth/request-otp route
  - Create OTP generator utility
  - Store otp_code + otp_expires in AdminUser
  - Rate limit OTP requests
  - Send OTP email via Resend
  - Create /api/auth/verify-otp
  - Add OTP validation logic
  - On success → generate JWT with jose
  - Set JWT in httpOnly cookie
  - Mark OTP as consumed/invalidate
  - _Requirements: FR-6, FR-7, FR-8, FR-10, NFR-4, NFR-5, NFR-6, NFR-7_

- [ ] 2.3 Logout
  - Create /api/auth/logout endpoint
  - Clear cookie
  - Redirect to login
  - _Requirements: FR-9_

- [ ] 2.4 Middleware
  - Create /middleware.ts
  - Parse JWT from cookie
  - Verify JWT signature
  - Inject session into request
  - Protect (admin) and /api/(admin) routes only
  - Redirect unauthenticated requests to /login
  - _Requirements: FR-11, FR-12, FR-13_

- [ ] 3. Phase 3 — Admin Dashboard (Mobile First)
  - Create dashboard layout with navigation
  - Build dashboard page with key metrics
  - Connect to backend stats API
  - _Requirements: FR-45, FR-46, NFR-13_

- [ ] 3.1 Layout
  - Create (admin)/layout.tsx with top header
  - Add bottom nav bar (Dashboard, Members, Scanner, Attendance)
  - Add React Query provider
  - _Requirements: FR-46, NFR-13_

- [ ] 3.2 Dashboard Page
  - Create dashboard cards: Total Members, Active Members, Expiring Soon, Today's Check-ins
  - Create /api/stats/overview route
  - Connect UI to backend
  - _Requirements: FR-45_

- [ ] 4. Phase 4 — Member Management
  - Implement member CRUD operations
  - Add phone normalization
  - Generate QR codes for members
  - Build member list and detail pages
  - _Requirements: FR-14, FR-15, FR-16, FR-17, FR-18, FR-19, FR-20, FR-21, FR-22, FR-23, FR-24, FR-25_

- [ ] 4.1 Member List
  - Create (admin)/members/page.tsx
  - Create /api/members GET route
  - Add mobile-first list with badges
  - Filter for active / inactive / expiring
  - _Requirements: FR-23, FR-25, NFR-13_

- [ ] 4.2 Add Member
  - Create (admin)/members/add/page.tsx
  - Create /api/members POST
  - Add Zod validation (name, phone, dates)
  - Generate qr_code UUID
  - Save new member
  - _Requirements: FR-14, FR-15, FR-16, FR-17, FR-24, NFR-7, NFR-8_

- [ ] 4.3 Member Detail Page
  - Create (admin)/members/[id]/page.tsx
  - Create /api/members/[id] GET
  - Create /api/members/[id] PATCH (update membership)
  - Create /api/members/[id] DELETE (soft delete)
  - _Requirements: FR-20, FR-21, FR-22_

- [x] 4.4 QR Display



  - Generate QR using qrcode package
  - Render QR in full-screen mode
  - Add download button
  - Add share (future)
  - _Requirements: FR-17, FR-18, FR-19, NFR-8_

- [ ] 5. Phase 5 — QR Attendance System
  - Build QR scanner page
  - Implement attendance scan API with toggle logic
  - Create attendance listing page



  - _Requirements: FR-26, FR-27, FR-28, FR-29, FR-30, FR-31, FR-32, FR-33, FR-34, FR-35, FR-36, FR-37, FR-38_

- [ ] 5.1 Scanner Page
  - Create (admin)/scanner/page.tsx
  - Integrate html5-qrcode
  - Add auto-retry behavior
  - Add feedback UI (success/error)


  - _Requirements: FR-26, NFR-3, NFR-14_

- [ ] 5.2 Attendance API
  - Create /api/attendance/scan POST
  - Validate QR format
  - Find member by gym_id + qr_code
  - Reject if inactive or expired
  - Detect active session: check_out_time IS NULL
  - If active session exists → check-out


  - Else → check-in
  - Store timestamps in UTC
  - _Requirements: FR-27, FR-28, FR-29, FR-30, FR-31, FR-32, FR-33, FR-34, NFR-2, NFR-3_

- [ ] 5.3 Attendance Listing
  - Create (admin)/attendance/page.tsx
  - Create /api/attendance GET
  - Add filters by date


  - Add member detail attendance page
  - _Requirements: FR-35, FR-36, FR-37, FR-38_

- [ ] 6. Phase 6 — Reminder System
  - Implement daily reminder logic


  - Set up Vercel Cron job
  - Send expiration emails to gym owners
  - _Requirements: FR-39, FR-40, FR-41, FR-42, FR-43, FR-44_

- [ ] 6.1 Backend Logic
  - Create /api/reminders/daily POST
  - Query members where: is_active = true, deleted_at IS NULL, membership_end BETWEEN today AND today+7
  - Send email to gym owner using Resend
  - Log reminders sent
  - _Requirements: FR-39, FR-40, FR-41, FR-43, FR-44_

- [ ] 6.2 Cron Setup
  - Add Vercel Scheduled Function
  - Trigger /api/reminders/daily at 7 AM IST
  - Test locally using manual POST
  - _Requirements: FR-42_

- [ ] 7. Phase 7 — Security Hardening
  - Add comprehensive input validation
  - Implement rate limiting
  - Secure environment variables
  - Ensure session security
  - _Requirements: NFR-5, NFR-6, NFR-7, NFR-8, NFR-9, NFR-10_

- [ ] 7.1 Input Validation
  - Add Zod schemas for all API routes
  - Sanitize all incoming data
  - _Requirements: NFR-7, NFR-10_

- [ ] 7.2 Rate Limiting
  - Add memory-based limiter for: OTP send, Demo request, QR scan (optional)
  - Prepare Upstash Redis upgrade path
  - _Requirements: FR-8, FR-52_

- [ ] 7.3 Secrets
  - Move all keys to .env
  - Add .env.example
  - _Requirements: NFR-9_

- [ ] 7.4 Session Security
  - Ensure cookies use: httpOnly, secure, sameSite=strict
  - _Requirements: NFR-5_

- [ ] 8. Phase 8 — Final Deployment & QA
  - Deploy to production
  - Run comprehensive testing
  - Verify stability and performance
  - _Requirements: NFR-1, NFR-3, NFR-4_

- [ ] 8.1 Admin App Deployment
  - Deploy updated app to Vercel under app.domain.com
  - _Requirements: NFR-1_

- [ ] 8.2 Testing
  - Test login flow
  - Test adding members
  - Test QR view + scan
  - Test attendance
  - Test expiration alerts
  - Device testing on Android/iOS
  - _Requirements: NFR-13, NFR-14_

- [ ] 8.3 Stability
  - Add logging to all API routes
  - Verify Prisma schema migrations
  - Verify DB indexes exist
  - _Requirements: NFR-1, NFR-11_
