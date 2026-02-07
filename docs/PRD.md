# Technical Product Requirements Document (PRD)

## Church Attendance Tracking System

**Version:** 1.0
**Date:** February 7, 2026
**Status:** Draft

---

## 1. Overview

### 1.1 Purpose

The Church Attendance Tracking System is a web-based application designed to digitize and streamline the process of tracking member attendance at church events. It replaces manual, paper-based attendance registers with a centralized digital solution that provides real-time visibility into attendance patterns across zones, events, and member demographics.

### 1.2 Problem Statement

Churches currently rely on paper-based attendance sheets, which are:

- Prone to data loss and human error
- Difficult to aggregate and analyze across zones
- Time-consuming to compile for reporting
- Not scalable as the congregation grows

### 1.3 Goals

- Provide a simple, fast interface for recording attendance at church events
- Support guest/visitor registration during attendance taking
- Enable zone-based organizational structure for member management
- Deliver attendance reports and analytics to church leadership
- Support role-based access to ensure appropriate data visibility

---

## 2. Tech Stack

### 2.1 Project Structure

The project is a monorepo with two root directories:

```
church-attendance-system/
├── backend/        — Database schema, migrations, Supabase config
├── frontend/       — Next.js web application
└── docs/           — Project documentation
```

### 2.2 Technologies

| Layer         | Technology                        | Directory   |
| ------------- | --------------------------------- | ----------- |
| Frontend      | Next.js (App Router), React, TypeScript | `frontend/` |
| Styling       | Tailwind CSS, shadcn/ui          | `frontend/` |
| Backend/DB    | Drizzle ORM, Supabase (PostgreSQL) | `backend/` |
| Auth          | Supabase Auth                    | Both        |
| Hosting       | Vercel                           | `frontend/` |
| Migrations    | Drizzle Kit                      | `backend/` |

---

## 3. User Roles & Permissions

### 3.1 Roles

| Role              | Description                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| **Admin**         | Full system access. Can manage users, zones, events, and view all reports.                       |
| **Secretariat**   | Operational role. Can take attendance for any zone, register new members and guests.              |
| **Zonal Leader**  | Zone-scoped role. Can manage members and view reports within their assigned zone only.            |
| **Member**        | No system access. Exists as a data record for attendance tracking purposes only.                 |

### 3.2 Permissions Matrix

| Action                          | Admin | Secretariat | Zonal Leader       | Member |
| ------------------------------- | :---: | :---------: | :----------------: | :----: |
| Login to system                 |  Yes  |     Yes     |  Yes               |   No   |
| View dashboard & reports        |  Yes  |     Yes     |  Own zone only     |   No   |
| Create / edit events            |  Yes  |      No     |   No               |   No   |
| Take attendance                 |  Yes  |  Yes (any zone) |  Own zone only |   No   |
| Register new members            |  Yes  |     Yes     |  Own zone only     |   No   |
| Register guests/visitors        |  Yes  |     Yes     |  Own zone only     |   No   |
| Manage zones                    |  Yes  |      No     |   No               |   No   |
| Manage zone members             |  Yes  |      No     |  Own zone only     |   No   |
| Manage user accounts & roles    |  Yes  |      No     |   No               |   No   |
| Export attendance data          |  Yes  |     Yes     |  Own zone only     |   No   |
| View member profiles            |  Yes  |     Yes     |  Own zone only     |   No   |

---

## 4. Data Models

### 4.1 User

Represents a church member or administrator in the system.

| Column              | Type          | Constraints                        | Notes                                |
| ------------------- | ------------- | ---------------------------------- | ------------------------------------ |
| `id`                | UUID          | PK, auto-generated                 | Supabase Auth UID                    |
| `email`             | VARCHAR(255)  | NULLABLE, UNIQUE                   | Login identifier                     |
| `phone_number`      | VARCHAR(20)   | NOT NULL                           |                                      |
| `first_name`        | VARCHAR(100)  | NOT NULL                           |                                      |
| `last_name`         | VARCHAR(100)  | NOT NULL                           |                                      |
| `address`           | TEXT          | NULLABLE                           |                                      |
| `date_of_birth`     | DATE          | NULLABLE                           | Not required                         |
| `next_of_kin`       | VARCHAR(255)  | NULLABLE                           | Emergency contact                    |
| `role`              | ENUM          | NOT NULL, DEFAULT 'member'         | `admin`, `secretariat`, `zonal_leader`, `member` |
| `zone_id`           | UUID          | FK → zones.id, NULLABLE            | Zone assignment                      |
| `zone_identifier`   | VARCHAR(50)   | UNIQUE                             | Unique member ID within zone (e.g., EGB023) |
| `status`            | ENUM          | NOT NULL, DEFAULT 'active'         | `active`, `inactive`                 |
| `created_at`        | TIMESTAMPTZ   | NOT NULL, DEFAULT NOW()            |                                      |
| `updated_at`        | TIMESTAMPTZ   | NOT NULL, DEFAULT NOW()            |                                      |

### 4.2 Zone

Represents an organizational unit within the church (geographical or logical grouping).

| Column              | Type          | Constraints                        | Notes                                |
| ------------------- | ------------- | ---------------------------------- | ------------------------------------ |
| `id`                | UUID          | PK, auto-generated                 |                                      |
| `name`              | VARCHAR(100)  | NOT NULL, UNIQUE                   | e.g., "Egbeda", "Ikeja"             |
| `abbreviation`      | VARCHAR(10)   | NOT NULL, UNIQUE                   | Short code used in zone identifiers (e.g., EGB, IKJ) |
| `congregation`      | VARCHAR(255)  | NULLABLE                           | Denomination or congregation name    |
| `email`             | VARCHAR(255)  | NULLABLE                           | Zone contact email                   |
| `address`           | TEXT          | NULLABLE                           | Zone meeting address                 |
| `created_at`        | TIMESTAMPTZ   | NOT NULL, DEFAULT NOW()            |                                      |
| `updated_at`        | TIMESTAMPTZ   | NOT NULL, DEFAULT NOW()            |                                      |

### 4.3 Event

Represents a church event or service for which attendance is tracked.

| Column              | Type          | Constraints                        | Notes                                |
| ------------------- | ------------- | ---------------------------------- | ------------------------------------ |
| `id`                | UUID          | PK, auto-generated                 |                                      |
| `name`              | VARCHAR(255)  | NOT NULL                           | e.g., "Sunday Service", "Bible Study"|
| `category`          | ENUM          | NOT NULL                           | `church_service`, `seminar`, `lecture`, `other` |
| `weekday`           | INTEGER       | NULLABLE                           | 0 = Sunday, 6 = Saturday (for recurring) |
| `date`              | DATE          | NOT NULL                           | Specific date of the event           |
| `congregation`      | VARCHAR(255)  | NULLABLE                           | Associated congregation              |
| `created_at`        | TIMESTAMPTZ   | NOT NULL, DEFAULT NOW()            |                                      |
| `updated_at`        | TIMESTAMPTZ   | NOT NULL, DEFAULT NOW()            |                                      |

### 4.4 Attendance

Records an individual's attendance at a specific event.

| Column              | Type          | Constraints                        | Notes                                |
| ------------------- | ------------- | ---------------------------------- | ------------------------------------ |
| `id`                | UUID          | PK, auto-generated                 |                                      |
| `event_id`          | UUID          | FK → events.id, NOT NULL           |                                      |
| `user_id`           | UUID          | FK → users.id, NULLABLE           | NULL for guest attendance            |
| `guest_id`          | UUID          | FK → guests.id, NULLABLE          | NULL for member attendance           |
| `zone_id`           | UUID          | FK → zones.id, NOT NULL            | Zone where attendance was recorded   |
| `user_type`         | ENUM          | NOT NULL, DEFAULT 'in_person'      | `member`, `visiting_member` `guest`  |
| `timestamp`         | TIMESTAMPTZ   | NOT NULL, DEFAULT NOW()            | Time attendance was marked           |
| `recorded_by`       | UUID          | FK → users.id, NOT NULL            | User who recorded the attendance     |
| `created_at`        | TIMESTAMPTZ   | NOT NULL, DEFAULT NOW()            |                                      |

**Constraints:**
- UNIQUE(`event_id`, `user_id`) — a member can only be marked once per event
- CHECK: either `user_id` or `guest_id` must be set (not both NULL)

### 4.5 Guest

Represents a visitor or guest who is not a registered member.

| Column              | Type          | Constraints                        | Notes                                |
| ------------------- | ------------- | ---------------------------------- | ------------------------------------ |
| `id`                | UUID          | PK, auto-generated                 |                                      |
| `first_name`        | VARCHAR(100)  | NOT NULL                           |                                      |
| `last_name`         | VARCHAR(100)  | NOT NULL                           |                                      |
| `email`             | VARCHAR(255)  | NULLABLE                           |                                      |
| `phone_number`      | VARCHAR(20)   | NULLABLE                           |                                      |
| `congregation`      | VARCHAR(255)  | NULLABLE                           | Guest's home church                  |
| `address`           | TEXT          | NULLABLE                           |                                      |
| `created_at`        | TIMESTAMPTZ   | NOT NULL, DEFAULT NOW()            |                                      |

---

## 5. Features & Functional Requirements

### 5.1 Authentication & Authorization

| ID     | Requirement                                                                 | Priority |
| ------ | --------------------------------------------------------------------------- | -------- |
| AUTH-1 | Users authenticate via email and password using Supabase Auth               | P0       |
| AUTH-2 | Role-based access control enforced on all routes and API endpoints          | P0       |
| AUTH-3 | Protected routes redirect unauthenticated users to login                    | P0       |
| AUTH-4 | Admin can invite new users (secretariat, zonal leaders) via email           | P1       |
| AUTH-5 | Password reset flow via email                                               | P1       |

### 5.2 Account Management

| ID     | Requirement                                                                 | Priority |
| ------ | --------------------------------------------------------------------------- | -------- |
| ACC-1  | Admin can create, edit, and deactivate user accounts                        | P0       |
| ACC-2  | Admin can assign/change user roles (admin, secretariat, zonal leader, member) | P0     |
| ACC-3  | Admin can assign users to zones                                             | P0       |
| ACC-4  | System auto-generates unique zone identifiers for members                   | P0       |
| ACC-5  | Secretariat and zonal leaders can view and edit their own profile (limited fields) | P1 |
| ACC-6  | Member list with search and filter by zone, status, role                    | P0       |
| ACC-7  | Secretariat can register new members and assign them to zones               | P0       |
| ACC-8  | Zonal leader can register new members within their own zone only            | P0       |
| ACC-9  | Members do not have login credentials — they are data records only          | P0       |

### 5.3 Zone Management

| ID     | Requirement                                                                 | Priority |
| ------ | --------------------------------------------------------------------------- | -------- |
| ZON-1  | Admin can create, edit, and delete zones                                    | P0       |
| ZON-2  | Each zone has a name, optional congregation, email, and address             | P0       |
| ZON-3  | Dashboard shows member count per zone                                       | P1       |
| ZON-4  | Zone identifiers use zone abbreviation + sequential number (e.g., EGB023)  | P0       |
| ZON-5  | Zonal leader can view and manage members within their assigned zone         | P0       |
| ZON-6  | Zonal leader can view attendance reports for their zone                     | P1       |

### 5.4 Event Management

| ID     | Requirement                                                                 | Priority |
| ------ | --------------------------------------------------------------------------- | -------- |
| EVT-1  | Admin can create events with name, category, date, and weekday              | P0       |
| EVT-2  | Events are categorized as: Church Service, Seminar, Lecture, Other          | P0       |
| EVT-3  | Support for recurring events (e.g., every Sunday)                           | P2       |
| EVT-4  | Event list view with filtering by date range and category                   | P1       |

### 5.5 Attendance Taking

| ID     | Requirement                                                                 | Priority |
| ------ | --------------------------------------------------------------------------- | -------- |
| ATT-1  | Users select an active event, then mark members as present                  | P0       |
| ATT-2  | Zonal leaders can take attendance for their own zone only                   | P0       |
| ATT-3  | Admin and secretariat can take attendance for any zone                      | P0       |
| ATT-4  | Support for guest/visitor attendance with inline registration               | P0       |
| ATT-5  | Attendance is timestamped automatically                                     | P0       |
| ATT-6  | Prevent duplicate attendance records for the same member at the same event  | P0       |
| ATT-7  | Ability to undo/remove an attendance mark before event is closed            | P1       |
| ATT-8  | Attendance type: in-person or online                                        | P1       |

### 5.6 Reporting & Analytics

| ID     | Requirement                                                                 | Priority |
| ------ | --------------------------------------------------------------------------- | -------- |
| RPT-1  | Dashboard showing total attendance per event                                | P1       |
| RPT-2  | Attendance trends over time (weekly, monthly)                               | P2       |
| RPT-3  | Zone-level attendance breakdown                                             | P1       |
| RPT-4  | Export attendance data to CSV                                               | P2       |
| RPT-5  | Individual member attendance history                                        | P2       |

---

## 6. Pages & Navigation

### 6.1 Sitemap

```
/ (Root - redirects based on auth)
├── /login
├── /forgot-password
├── /dashboard
│   ├── Overview stats (total members, today's attendance, zones)
│   └── Quick actions (take attendance, register member)
├── /attendance
│   ├── /attendance/take          — Take attendance for an event
│   └── /attendance/history       — View past attendance records
├── /members
│   ├── /members                  — Member list (search, filter)
│   ├── /members/new              — Register new member
│   └── /members/[id]             — Member profile & attendance history
├── /zones
│   ├── /zones                    — Zone list
│   ├── /zones/new                — Create zone (admin)
│   └── /zones/[id]               — Zone detail & members
├── /events
│   ├── /events                   — Event list
│   ├── /events/new               — Create event (admin)
│   └── /events/[id]              — Event detail & attendance
└── /settings
    ├── /settings/profile         — User profile
    └── /settings/account         — Admin account management
```

### 6.2 Key User Flows

#### Taking Attendance (Primary Flow)

1. User logs in
2. Navigates to **Take Attendance** (or clicks quick action on dashboard)
3. Selects the event (auto-suggests today's events)
4. System displays member list filtered by user's zone
5. User checks off members who are present
6. User can click **"Register Guest"** to add a visitor inline
7. Attendance is saved in real-time (optimistic UI)
8. Confirmation shown on completion

#### Registering a New Member

1. Admin or Member navigates to **Members → New**
2. Fills in required fields (name, email, phone)
3. Selects zone assignment
4. System auto-generates zone identifier
5. Member is created and available for attendance tracking

---

## 7. Non-Functional Requirements

| Category        | Requirement                                                              |
| --------------- | ------------------------------------------------------------------------ |
| Performance     | Pages load in < 2 seconds on 3G connections                             |
| Responsiveness  | Fully responsive — optimized for mobile (primary attendance device)      |
| Accessibility   | WCAG 2.1 AA compliance                                                   |
| Data Integrity  | Prevent duplicate attendance entries at the database level               |
| Security        | Row-Level Security (RLS) policies on all Supabase tables                 |
| Availability    | 99.5% uptime target                                                      |
| Browser Support | Chrome, Safari, Edge (latest 2 versions)                                 |
| Offline         | Graceful degradation — queue attendance entries when offline (P2)        |

---

## 8. Database Migration Strategy

Migrations are managed via **Drizzle Kit** and follow this workflow:

1. Define/modify schema in Drizzle schema files (`src/db/schema/`)
2. Run `npm run db:generate` to generate migration SQL and update snapshots
3. Run `npm run db:migrate` to apply migrations to Supabase
4. Migration SQL files include duplicate-existence checks to ensure idempotency
5. **Never manually create or edit migration SQL files**

---

## 9. Project Milestones

| Phase   | Scope                                                        | Target     |
| ------- | ------------------------------------------------------------ | ---------- |
| Phase 1 | Project setup, auth, user/zone CRUD, database schema         | Week 1-2   |
| Phase 2 | Event management, attendance taking (core flow)              | Week 3-4   |
| Phase 3 | Dashboard, reporting, guest registration                     | Week 5-6   |
| Phase 4 | Polish, mobile optimization, CSV export, testing             | Week 7-8   |

---

## 10. Open Questions

| #  | Question                                                                           | Status |
| -- | ---------------------------------------------------------------------------------- | ------ |
| 1  | Should the system support multiple congregations/churches in a single deployment?  | Open   |
| 2  | ~~What is the exact format for zone identifiers?~~ Resolved: `{abbreviation}{seq}` e.g., EGB023 | Resolved |
| 3  | Are there any specific reporting requirements from church leadership?              | Open   |
| 4  | Should online attendance be tracked via a separate self-check-in flow?             | Open   |
| 5  | Is there a need for attendance approval workflows?                                 | Open   |
| 6  | Should the system send notifications (email/SMS) for events?                       | Open   |

---

## Appendix A: Zone Identifier Format

Zone identifiers are composed of the **zone abbreviation** followed by a **zero-padded sequential number**:

```
Format:  {ABBREVIATION}{SEQ}
Example: EGB023
```

| Component      | Description                                              | Example   |
| -------------- | -------------------------------------------------------- | --------- |
| Abbreviation   | Uppercase short code derived from the zone name (set when zone is created) | `EGB` (Egbeda) |
| Seq            | Zero-padded sequential number, auto-incremented per zone | `023` (23rd member) |

**Examples:**

| Zone Name | Abbreviation | 1st Member | 15th Member | 100th Member |
| --------- | ------------ | ---------- | ----------- | ------------ |
| Egbeda    | EGB          | EGB001     | EGB015      | EGB100       |
| Ikeja     | IKJ          | IKJ001     | IKJ015      | IKJ100       |
| Surulere  | SRL          | SRL001     | SRL015      | SRL100       |

**Rules:**
- The abbreviation is set by the admin when creating a zone and must be unique across all zones
- The sequential number auto-increments based on the highest existing number in that zone
- Zone identifiers are immutable once assigned — they do not change if a member moves zones (a new identifier is issued in the new zone)
- This ensures every member has a globally unique, human-readable identifier
