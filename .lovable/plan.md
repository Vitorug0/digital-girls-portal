

## Portal Meninas Digitais UTFPR-CP

A complete activity management system for the Meninas Digitais UTFPR-CP university project, enabling workshop, mini-course, and lecture management with registration control.

### Design System
- **Fonts**: Sora (headings) + Inter (body) from Google Fonts
- **Colors**: Violet primary (#7C3AED), Pink accent (#EC4899), Cool Gray background (#F9FAFB)
- **Status badges**: Emerald (open), Amber (full), Rose (closed/cancelled)
- **Motion**: Subtle card hover lifts, 150ms transitions, toast notifications

### Pages & Layout

**Public Pages (top navigation)**
1. **Home** — Hero section presenting the project mission, featured upcoming activities
2. **Activities List** — 3-column responsive card grid with type filters (workshop/mini-course/lecture), status badges, and search
3. **Activity Detail** — Full info with registration button that adapts to state (register / registered / full / closed)

**Auth Pages**
4. **Login** — Email/password login
5. **Register** — Signup with name, email, password, user type selection (external/internal)

**User Area (authenticated)**
6. **My Registrations** — List of enrolled activities with status and cancel option
7. **Profile** — View/edit user info

**Admin Area (sidebar layout, internal users only)**
8. **Dashboard** — Stats row (total activities, total registrations, participants count) + most popular activities chart
9. **Activity Management** — Paginated table with CRUD, create/edit form in modal/page
10. **Registrations per Activity** — Participant table with attendance marking (present/absent), only enabled after activity start time

### Core Business Logic (frontend-ready, mock data initially)
- Vacancy auto-decrement on registration, auto-increment on cancellation
- No duplicate registrations per user per activity
- Block registration when: full, closed, cancelled, or past date
- Past activities auto-display as "closed"
- Attendance marking restricted to internal users, only after activity start
- Disabled buttons with clear tooltips when actions are blocked

### Data Structure (Supabase-ready)
- **profiles**: id, name, email, user_type (external/internal)
- **user_roles**: id, user_id, role (admin/user) — separate table for security
- **activities**: id, title, description, type, start_date, end_date, location, total_slots, available_slots, status, created_by
- **registrations**: id, activity_id, user_id, status (registered/confirmed/cancelled/present), created_at

### UX Details
- Loading skeletons on all data fetches
- Toast notifications for all actions (registration, cancellation, CRUD)
- Responsive: mobile-first cards, horizontally scrollable tables
- Filter chips for activity type
- Clear visual distinction for full/closed activities (grayed out, disabled CTA with tooltip)

### Implementation Approach
- Start with mock data and React context/state for all flows
- Component architecture ready for Supabase integration
- Protected routes for user and admin areas
- Role-based navigation (admin sidebar only visible to internal users)

