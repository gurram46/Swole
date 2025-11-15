# requirements.md
# Gym Management SaaS – Requirements Specification (EARS-Compliant)

## 1. Introduction
This document defines the functional and non-functional requirements for a multi-tenant Gym Management SaaS platform. The platform serves gym owners and staff; members do not have accounts. Attendance is recorded using QR codes scanned by gym staff. The system provides membership management, attendance tracking, expiration reminders, and a marketing site for lead generation.

---

## 2. Actors
### 2.1 Gym Owner (Primary User)
- Logs in using email OTP
- Manages members
- Views dashboard metrics
- Views attendance
- Uses QR scanner
- Receives membership expiration reminders

### 2.2 Gym Staff (Secondary User)
- Logs in using email OTP
- Performs check-in and check-out scans
- Views member and attendance info

### 2.3 Member (Non-user entity)
- Does not log in
- Receives QR code assigned by gym
- Gets scanned by gym staff on entry/exit

### 2.4 System Administrator (Internal)
- Has access to logs
- Manages platform settings (future scope)

### 2.5 Marketing Visitor
- Visits landing page
- Submits demo request

---

## 3. Functional Requirements

### 3.1 Gym Onboarding Requirements
**FR-1**: The system shall provide a self-registration form at /register.  
**FR-2**: The system shall create a Gym record and first AdminUser (owner) in a single transaction.  
**FR-3**: The system shall generate a unique slug for each gym based on gym name.  
**FR-4**: The system shall send OTP to owner's email after registration.

### 3.2 Authentication Requirements
**FR-5**: The system shall allow gym owners and staff to log in using email OTP.  
**FR-6**: The system shall send OTPs using Resend API.  
**FR-7**: The system shall expire OTPs after 5 minutes.  
**FR-8**: The system shall enforce rate limits when requesting OTP (max 5 per hour).  
**FR-9**: The system shall allow logout by deleting the session cookie.  
**FR-10**: The system shall store session as JWT in an httpOnly cookie.

### 3.3 Authorization Requirements
**FR-11**: The system shall restrict access to gym data using gym_id in the session.  
**FR-12**: The system shall deny access when a user attempts to access another gym's data.  
**FR-13**: The system shall enforce role-based access (owner, staff).

---

## 3.4 Member Management Requirements
**FR-14**: The system shall allow gym owners to add members with:
- Name  
- Phone  
- Membership start date  
- Membership end date  

**FR-15**: The system shall normalize phone numbers to +91XXXXXXXXXX format.  
**FR-16**: The system shall extract 10 consecutive digits from any phone input.  
**FR-17**: The system shall generate a permanent unique QR code (UUID) for each member.  
**FR-18**: The system shall encode QR content as GYMQR:<uuid> format.  
**FR-19**: The system shall store only the UUID (without prefix) in the database.  
**FR-20**: The system shall allow editing of membership dates.  
**FR-21**: The system shall allow marking a member as inactive.  
**FR-22**: The system shall support soft-delete of members (deleted_at timestamp).  
**FR-23**: The system shall exclude soft-deleted members from all queries by default.  
**FR-24**: The system shall prevent duplicate phone numbers per gym.  
**FR-25**: The system shall show members expiring within 7 days.

---

## 3.5 QR Attendance Requirements
**FR-26**: The system shall allow gym staff to scan QR codes using device camera.  
**FR-27**: The system shall strip GYMQR: prefix from scanned QR content.  
**FR-28**: When a QR code is scanned, the system shall identify the member by `qr_code` and `gym_id`.  
**FR-29**: If a matching member does not exist, the system shall reject the scan.  
**FR-30**: The system shall reject scans for soft-deleted members (deleted_at IS NOT NULL).  
**FR-31**: When a member with active membership scans:
- If no open session exists (check_out_time IS NULL) → check-out  
- Otherwise → check-in  

**FR-32**: The system shall prevent overlapping attendance sessions.  
**FR-33**: The system shall allow multiple check-in/check-out sessions per day.  
**FR-34**: The system shall store timestamps in UTC.

---

## 3.6 Attendance Reporting Requirements
**FR-35**: The system shall allow gym owners to view attendance list sorted by time.  
**FR-36**: The system shall show individual member attendance history.  
**FR-37**: The system shall filter attendance by date.  
**FR-38**: The system shall prevent editing attendance manually (MVP).

---

## 3.7 Reminder System Requirements
**FR-39**: The system shall identify members whose `membership_end` date is within 7 days.  
**FR-40**: The system shall send reminder emails ONLY to gym owner's email (owner_email).  
**FR-41**: The reminder email shall list all members expiring soon for that gym.  
**FR-42**: The reminder job shall run daily at 7 AM IST using Vercel Cron.  
**FR-43**: The system shall not send reminders for inactive or soft-deleted members.  
**FR-44**: The system shall ensure reminders are sent only once per day per gym.

---

## 3.8 Dashboard Requirements
**FR-45**: The system shall display:
- Total members (excluding soft-deleted)  
- Active members  
- Expiring soon (within 7 days)  
- Today's attendance  

**FR-46**: The system shall be fully mobile-first.

---

## 3.9 Marketing Site Requirements
**FR-47**: The system shall provide a landing page under the main domain.  
**FR-48**: The landing page shall display:
- Hero section  
- Feature overview  
- How-it-works  
- Pricing  
- Demo form  

**FR-49**: The system shall provide a demo request form.  
**FR-50**: The system shall send demo requests to a specified admin email via Resend.  
**FR-51**: The system shall log demo requests to console for MVP.  
**FR-52**: The system shall prevent demo request spam via rate limiting.

---

## 4. Non-Functional Requirements

### 4.1 Reliability
**NFR-1**: The system shall operate with 99% uptime via Vercel + Neon.  
**NFR-2**: The system shall recover gracefully from failed QR scans.

### 4.2 Performance
**NFR-3**: QR scan response time shall be < 500ms.  
**NFR-4**: OTP email sending shall occur within 2 seconds.

### 4.3 Security
**NFR-5**: The system shall store sessions only in httpOnly cookies.  
**NFR-6**: The system shall store hashed OTPs when possible.  
**NFR-7**: The system shall validate all inputs using Zod.  
**NFR-8**: The system shall store no PII inside QR codes.  
**NFR-9**: All secrets shall be stored in environment variables.  
**NFR-10**: The system shall sanitize all user inputs.

### 4.4 Scalability
**NFR-11**: The system shall support 50+ gyms on free Neon tier.  
**NFR-12**: The system shall allow separation into microservices in the future.

### 4.5 Usability
**NFR-13**: The admin app shall be optimized for mobile.  
**NFR-14**: The QR scanner shall automatically focus and retry on scan failure.

---

## 5. Constraints
- Deployed on Vercel  
- PostgreSQL on Neon  
- Serverless architecture  
- No native mobile app in MVP  
- No direct payment integration in MVP  

---

## 6. Out of Scope (MVP)
- Multiple staff roles with granular permissions  
- Automated WhatsApp reminders  
- Integrations with payment gateways  
- Member login portal  
- Exporting to Excel/CSV  
- Desktop kiosk attendance  
- Biometric scanners

---

## 7. Acceptance Criteria
The MVP is accepted when:
- A gym can self-register and onboard
- Members can be added with phone normalization
- QR codes work with GYMQR: prefix
- Attendance logs correctly with toggle behavior
- Membership expiry reminders work (sent to gym owner only)
- Dashboard works on mobile
- Landing page generates leads
