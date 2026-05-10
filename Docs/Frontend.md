# Traveloop — Frontend Specification
> Stack: **Next.js 14 (App Router)** · **Tailwind CSS** · **shadcn/ui** · **Zustand** · **React Query** · **EmailJS** · **JWT (in-memory)**
> Hand this file to the `frontend-design` skill to generate production UI.

---

## 1. TECH STACK

| Concern | Library / Tool |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Global State | Zustand |
| Server State / Caching | TanStack React Query v5 |
| HTTP Client | Axios (with interceptors) |
| Auth | JWT access token (Zustand memory) + HttpOnly refresh cookie |
| OTP / Email | EmailJS (`@emailjs/browser`) |
| Charts | Recharts |
| PDF Export | jsPDF + jspdf-autotable |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| Date Picker | react-day-picker |
| Form Validation | react-hook-form + zod |
| Hosting | Vercel |
| API Base URL | `process.env.NEXT_PUBLIC_API_URL` → `http://localhost:8000/api/v1` |

---

## 2. ENVIRONMENT VARIABLES (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_OTP_TEMPLATE_ID=your_otp_template_id
NEXT_PUBLIC_EMAILJS_CONFIRM_TEMPLATE_ID=your_confirm_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
```

---

## 3. FOLDER STRUCTURE

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── (main)/
│   │   ├── layout.tsx                    ← Shell: Sidebar + Navbar
│   │   ├── dashboard/page.tsx            ← Screen 3
│   │   ├── trips/
│   │   │   ├── page.tsx                  ← Screen 6: My Trips
│   │   │   ├── new/page.tsx              ← Screen 4: Create Trip
│   │   │   └── [tripId]/
│   │   │       ├── page.tsx              ← Screen 9: Itinerary View
│   │   │       ├── builder/page.tsx      ← Screen 5: Builder
│   │   │       ├── invoice/page.tsx      ← Screen 14: Invoice
│   │   │       ├── checklist/page.tsx    ← Screen 11: Packing
│   │   │       └── notes/page.tsx        ← Screen 13: Notes/Journal
│   │   ├── search/
│   │   │   ├── cities/page.tsx           ← Screen 8A
│   │   │   └── activities/page.tsx       ← Screen 8B
│   │   ├── community/page.tsx            ← Screen 10
│   │   ├── profile/page.tsx              ← Screen 7
│   │   └── admin/page.tsx                ← Screen 12 (role-gated)
│   └── share/
│       └── [shareToken]/page.tsx         ← Public shared view (no auth needed)
├── components/
│   ├── ui/                               ← shadcn/ui primitives
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   └── MobileNav.tsx
│   ├── auth/
│   │   ├── OtpInput.tsx
│   │   └── OtpVerifyModal.tsx
│   ├── trips/
│   │   ├── TripCard.tsx
│   │   ├── TripForm.tsx
│   │   └── TripStatusBadge.tsx
│   ├── itinerary/
│   │   ├── SectionCard.tsx
│   │   ├── ActivityBlock.tsx
│   │   └── DayTimeline.tsx
│   ├── budget/
│   │   ├── BudgetPieChart.tsx
│   │   ├── BudgetBarChart.tsx
│   │   ├── CostBreakdownTable.tsx
│   │   └── InvoiceTable.tsx
│   ├── search/
│   │   ├── CityCard.tsx
│   │   └── ActivityCard.tsx
│   ├── checklist/
│   │   └── ChecklistItem.tsx
│   ├── community/
│   │   └── CommunityTripCard.tsx
│   └── admin/
│       ├── UserTable.tsx
│       ├── TrendChart.tsx
│       └── PopularCitiesTable.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useOtp.ts
│   ├── useTrips.ts
│   ├── useItinerary.ts
│   └── useBudget.ts
├── lib/
│   ├── api.ts              ← Axios instance + JWT interceptors
│   ├── emailjs.ts          ← EmailJS helpers
│   └── utils.ts
├── store/
│   └── authStore.ts        ← Zustand: { user, accessToken, setAuth, clearAuth }
└── types/
    └── index.ts
```

---

## 4. AUTH FLOW (JWT + OTP via EmailJS)

### 4A. Registration with Email OTP

```
Step 1: User fills form → clicks "Send OTP"
Step 2: POST /api/v1/auth/send-otp { email, purpose: "register" }
        Backend generates 6-digit OTP, stores with 10-min TTL
Step 3: Frontend calls sendOtpEmail() via EmailJS (client-side)
Step 4: OTP modal appears — 6-digit input, 60s resend countdown
Step 5: User enters OTP → POST /api/v1/auth/verify-otp { email, otp, purpose: "register" }
Step 6: POST /api/v1/auth/register { ...allFormData }
        Response: { accessToken, user } + Set-Cookie: refreshToken (HttpOnly, 7d)
Step 7: sendWelcomeEmail() via EmailJS (welcome/confirmation)
Step 8: Store accessToken in Zustand → redirect /dashboard
```

### 4B. Login with JWT

```
Step 1: POST /api/v1/auth/login { email, password }
Step 2: Response: { accessToken (15min), user } + Set-Cookie: refreshToken (HttpOnly, 7d)
Step 3: Store accessToken in Zustand (NEVER localStorage)
Step 4: Axios interceptor attaches: Authorization: Bearer <accessToken>
Step 5: On 401 → auto-call POST /api/v1/auth/refresh (sends cookie automatically)
        → get new accessToken → retry original request transparently
Step 6: POST /api/v1/auth/logout → server clears cookie → Zustand cleared → /login
```

### 4C. Forgot Password with OTP

```
Step 1: Enter email → POST /api/v1/auth/send-otp { email, purpose: "reset" }
Step 2: sendOtpEmail() via EmailJS
Step 3: OTP verified → POST /api/v1/auth/verify-otp { email, otp, purpose: "reset" }
        → returns { resetToken (one-time, 15min) }
Step 4: POST /api/v1/auth/reset-password { resetToken, newPassword }
Step 5: sendWelcomeEmail() / password-changed confirmation via EmailJS
Step 6: Redirect → /login with success toast
```

### 4D. Route Guard (middleware.ts)

```typescript
// Protected: /dashboard, /trips/*, /search/*, /profile, /admin, /community
// Public:    /login, /register, /forgot-password, /share/[shareToken]
// Admin:     /admin → redirect non-admins to /dashboard
```

### 4E. Zustand Auth Store (store/authStore.ts)

```typescript
interface AuthState {
  user: User | null
  accessToken: string | null
  setAuth: (user: User, accessToken: string) => void
  clearAuth: () => void
  isAdmin: () => boolean
}
```

---

## 5. EMAILJS SETUP (lib/emailjs.ts)

```typescript
import emailjs from '@emailjs/browser'

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
const OTP_TMPL   = process.env.NEXT_PUBLIC_EMAILJS_OTP_TEMPLATE_ID!
const CONF_TMPL  = process.env.NEXT_PUBLIC_EMAILJS_CONFIRM_TEMPLATE_ID!

export async function sendOtpEmail(toEmail: string, otpCode: string, name: string) {
  return emailjs.send(SERVICE_ID, OTP_TMPL, {
    to_email: toEmail,
    to_name: name,
    otp_code: otpCode,
    expiry_minutes: 10,
  }, PUBLIC_KEY)
}

export async function sendWelcomeEmail(toEmail: string, name: string) {
  return emailjs.send(SERVICE_ID, CONF_TMPL, {
    to_email: toEmail,
    to_name: name,
    app_name: 'Traveloop',
  }, PUBLIC_KEY)
}
```

**EmailJS Template Variables:**

| Template | Variables |
|---|---|
| OTP | `{{to_name}}`, `{{to_email}}`, `{{otp_code}}`, `{{expiry_minutes}}` |
| Confirmation | `{{to_name}}`, `{{to_email}}`, `{{app_name}}` |

---

## 6. AXIOS INSTANCE (lib/api.ts)

```typescript
import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,   // sends HttpOnly cookie on every request
})

api.interceptors.request.use(config => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401 && !err.config._retry) {
      err.config._retry = true
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      )
      useAuthStore.getState().setAuth(data.data.user, data.data.accessToken)
      err.config.headers.Authorization = `Bearer ${data.data.accessToken}`
      return api(err.config)
    }
    return Promise.reject(err)
  }
)

export default api
```

---

## 7. FULL API CONTRACT (identical to backend.md)

### Auth
```
POST   /api/v1/auth/send-otp           public    { email, purpose? }  → OTP generated
POST   /api/v1/auth/verify-otp         public    { email, otp, purpose? } → { verified, resetToken? }
POST   /api/v1/auth/register           public    FormData → { accessToken, user } + cookie
POST   /api/v1/auth/login              public    { email, password } → { accessToken, user } + cookie
POST   /api/v1/auth/logout             bearer    → clears cookie
POST   /api/v1/auth/refresh            cookie    → { accessToken, user }
POST   /api/v1/auth/reset-password     public    { resetToken, newPassword }
GET    /api/v1/auth/me                 bearer    → { user }
PATCH  /api/v1/auth/me                 bearer    FormData → { user }
DELETE /api/v1/auth/me                 bearer    → 204
```

### Trips
```
GET    /api/v1/trips                   bearer    List (status, page, limit, search, sort)
POST   /api/v1/trips                   bearer    Create trip
GET    /api/v1/trips/:id               bearer    Get trip + sections
PATCH  /api/v1/trips/:id               bearer    Update trip metadata
DELETE /api/v1/trips/:id               bearer    Delete trip (cascade all)
POST   /api/v1/trips/:id/share         bearer    { isPublic: bool } → { shareToken, shareUrl }
GET    /api/v1/trips/share/:token      public    Read-only shared trip
```

### Sections
```
GET    /api/v1/trips/:id/sections              bearer    List sections (ordered)
POST   /api/v1/trips/:id/sections              bearer    Add section
PATCH  /api/v1/trips/:id/sections/:sid         bearer    Update section
DELETE /api/v1/trips/:id/sections/:sid         bearer    Remove section
PATCH  /api/v1/trips/:id/sections/reorder      bearer    { orderedIds: string[] }
```

### Activities (within sections)
```
GET    /api/v1/trips/:id/sections/:sid/activities          bearer   List
POST   /api/v1/trips/:id/sections/:sid/activities          bearer   { activityId }
PATCH  /api/v1/trips/:id/sections/:sid/activities/:aid     bearer   Update
DELETE /api/v1/trips/:id/sections/:sid/activities/:aid     bearer   Remove
```

### Budget & Invoice
```
GET    /api/v1/trips/:id/budget                 bearer    Full breakdown + chart data
POST   /api/v1/trips/:id/budget/items           bearer    Add expense item
PATCH  /api/v1/trips/:id/budget/items/:bid      bearer    Update expense item
DELETE /api/v1/trips/:id/budget/items/:bid      bearer    Remove expense item
GET    /api/v1/trips/:id/invoice                bearer    Invoice data
PATCH  /api/v1/trips/:id/invoice/status         bearer    { status: "pending"|"paid" }
```

### Checklist
```
GET    /api/v1/trips/:id/checklist                    bearer    Full checklist + progress
POST   /api/v1/trips/:id/checklist/items              bearer    { label, category }
PATCH  /api/v1/trips/:id/checklist/items/:cid         bearer    { isPacked?, label?, category? }
DELETE /api/v1/trips/:id/checklist/items/:cid         bearer    Remove
DELETE /api/v1/trips/:id/checklist/reset              bearer    Reset all to unpacked
POST   /api/v1/trips/:id/checklist/share              bearer    → { shareUrl }
```

### Notes
```
GET    /api/v1/trips/:id/notes           bearer    List (sorted by date desc)
POST   /api/v1/trips/:id/notes           bearer    { title?, content, sectionId?, dayNumber? }
PATCH  /api/v1/trips/:id/notes/:nid      bearer    { title?, content }
DELETE /api/v1/trips/:id/notes/:nid      bearer    204
```

### Discovery
```
GET    /api/v1/cities                    bearer    Search (q, country, region, sort, page)
GET    /api/v1/cities/:id                bearer    City detail + top activities
GET    /api/v1/activities                bearer    Search (q, type, minCost, maxCost, duration)
GET    /api/v1/activities/:id            bearer    Activity detail
```

### Community
```
GET    /api/v1/community                 public    Feed (page, sort, search)
POST   /api/v1/community/:tripId/copy    bearer    → { newTripId }
```

### Users / Wishlist
```
GET    /api/v1/users/:id                 bearer    Profile
PATCH  /api/v1/users/:id                 bearer    Update profile
GET    /api/v1/users/:id/saved           bearer    Wishlist cities
POST   /api/v1/users/:id/saved           bearer    { cityId }
DELETE /api/v1/users/:id/saved/:cid      bearer    Remove
```

### Admin
```
GET    /api/v1/admin/stats               admin     Summary numbers
GET    /api/v1/admin/users               admin     Paginated user list
PATCH  /api/v1/admin/users/:id           admin     { role? } or { isBanned? }
DELETE /api/v1/admin/users/:id           admin     Delete user
GET    /api/v1/admin/trips               admin     All trips
GET    /api/v1/admin/analytics           admin     Trends: cities, activities, users
```

### Standard Envelopes
```typescript
// List:   { data: T[], meta: { page, limit, total, totalPages, requestId } }
// Single: { data: T, meta: { requestId } }
// Error:  { error: { code, message, requestId, timestamp } }
// Params: page=1, limit=20, sort=created_at, order=desc, search=
```

---

## 8. ALL 14 SCREEN SPECS

### Screen 1 — Login
**Route:** `/login` | **Auth:** Public (redirect /dashboard if logged in)

**Components:** Logo, email field, password field (show/hide toggle), "Forgot Password?" link, Login button, "Sign up" link.

**Validation:** email format, password min 6. Inline field errors + toast on server error.

```typescript
POST /api/v1/auth/login { email, password }
→ 200: setAuth() + redirect /dashboard
→ 401: "Invalid email or password"
→ 429: "Too many attempts. Try again in Xs."
```

---

### Screen 2 — Registration (3 Steps)
**Route:** `/register` | **Auth:** Public

**Step 1 — Personal Info:**
- Profile photo upload (optional, JPG/PNG <2MB, preview shown)
- First Name (required), Last Name (required)
- Phone (optional), City (optional), Country (optional)
- Additional Info / Bio (optional textarea)

**Step 2 — Account + OTP Send:**
- Email (required, unique), Password (min 8, strength meter), Confirm Password
- "Send OTP" button → `POST /api/v1/auth/send-otp` + `sendOtpEmail()` via EmailJS

**Step 3 — OTP Verify:**
- 6-digit OTP input (auto-advance, paste-compatible)
- "OTP sent to [email]" label
- 60-second countdown, then "Resend OTP" appears
- Verify → `POST /api/v1/auth/verify-otp` → `POST /api/v1/auth/register` → `sendWelcomeEmail()` → /dashboard

---

### Screen 2B — Forgot Password
**Route:** `/forgot-password` | **Auth:** Public

Step 1: Email → OTP send (EmailJS + backend)
Step 2: OTP verify → resetToken
Step 3: New password + confirm → reset
Step 4: EmailJS password-changed confirmation → /login

---

### Screen 3 — Dashboard
**Route:** `/dashboard` | **Auth:** Protected

- `WelcomeBanner` with hero banner image + user first name
- `SearchBar` → /search/cities
- "Plan a Trip" primary CTA → /trips/new
- `TopRegionalSelections` — 6 popular city cards (image, name, country)
- `RecentTrips` — last 3 trips as TripCards
- `PreviousTripsSummary` — compact completed trips list
- `BudgetHighlights` widget

```typescript
GET /api/v1/auth/me
GET /api/v1/trips?limit=3&sort=updated_at
GET /api/v1/trips?status=completed&limit=5
GET /api/v1/cities?sort=popularity&limit=6
```

---

### Screen 4 — Create Trip
**Route:** `/trips/new` | **Auth:** Protected

**Fields:**
- Trip Name (required)
- Select a Place (required, typeahead from `/api/v1/cities`)
- Start Date + End Date (DatePicker pair, end ≥ start)
- Trip Description (optional textarea)
- Cover Photo (optional, image preview)
- Suggestions panel — activities for selected city

```typescript
GET /api/v1/cities?search=<q>           // typeahead
GET /api/v1/activities?cityId=<id>      // suggestions
POST /api/v1/trips (FormData)
→ 201: redirect /trips/[newTripId]/builder
```

---

### Screen 5 — Itinerary Builder
**Route:** `/trips/[tripId]/builder` | **Auth:** Protected (owner only)

**Full-width drag-and-drop section builder:**
- `TripHeader` — name + date range
- `SectionList` — @dnd-kit/sortable, drag-to-reorder
- Per `SectionCard`:
  - Section label ("Section 1:", "Section 2:"…)
  - Description textarea
  - Date Range picker
  - Budget input
  - Activities list (with remove per activity)
  - "Add Activity" → opens activity search drawer
  - Drag handle (left edge)
- "Add another Section" button at bottom
- `UnsavedBanner` — sticky warning if unsaved changes

```typescript
GET  /api/v1/trips/:id/sections
POST /api/v1/trips/:id/sections                    { label, description, startDate, endDate, budget, cityId? }
PATCH /api/v1/trips/:id/sections/:sid              { ...fields }
DELETE /api/v1/trips/:id/sections/:sid
PATCH /api/v1/trips/:id/sections/reorder           { orderedIds: string[] }
POST /api/v1/trips/:id/sections/:sid/activities    { activityId }
DELETE /api/v1/trips/:id/sections/:sid/activities/:aid
```

---

### Screen 6 — My Trips
**Route:** `/trips` | **Auth:** Protected

**3 tabs: Ongoing | Upcoming | Completed**

Per tab:
- SearchBar (filter by name) + FilterBar (Group by | Filter | Sort)
- `TripCard` list: name, overview snippet, date range, destination count, status badge, View button, kebab menu (Edit, Delete)
- Status derived from dates client-side
- Empty state with "Plan your first trip!" CTA

```typescript
GET /api/v1/trips?status=ongoing&page=1&limit=20&search=
GET /api/v1/trips?status=upcoming
GET /api/v1/trips?status=completed
DELETE /api/v1/trips/:id  // confirm dialog, optimistic remove
```

---

### Screen 7 — User Profile / Settings
**Route:** `/profile` | **Auth:** Protected

- `AvatarSection` — large avatar, click-to-upload
- `UserDetailsForm` — First Name, Last Name, Email (read-only), Phone, City, Country, Bio, Language Preference dropdown
- `SaveChangesButton`
- `SavedDestinationsList` — wishlist with Remove per city
- `DangerZone` — Delete Account (confirm modal)
- `LogoutButton`

```typescript
GET  /api/v1/auth/me
PATCH /api/v1/auth/me (FormData with optional avatar)
GET  /api/v1/users/:id/saved
DELETE /api/v1/users/:id/saved/:cityId
DELETE /api/v1/auth/me
POST /api/v1/auth/logout
```

---

### Screen 8A — City Search
**Route:** `/search/cities` | **Auth:** Protected

- SearchBar + FilterBar (country/region filter, sort: popularity / cost index / A–Z)
- `CityCard` grid: image, name, country, cost index badge, popularity score, "Add to Trip" button, heart (wishlist) icon
- "Add to Trip" → modal: select trip + section

```typescript
GET /api/v1/cities?search=&country=&sort=popularity&page=1
POST /api/v1/users/:id/saved { cityId }
POST /api/v1/trips/:id/sections/:sid/activities { activityId }
```

### Screen 8B — Activity Search
**Route:** `/search/activities` | **Auth:** Protected

- SearchBar + FilterBar (type, cost slider, duration)
- `ActivityCard` grid: thumbnail, name, snippet, cost, duration, type tag, "Add to Section" button
- Quick View drawer — full description, images, cost breakdown

```typescript
GET /api/v1/activities?search=&type=&maxCost=&duration=
POST /api/v1/trips/:id/sections/:sid/activities { activityId }
```

---

### Screen 9 — Itinerary View
**Route:** `/trips/[tripId]` | **Auth:** Protected (owner) / Public via share token

**View Modes (toggle):** Timeline | List | Calendar

- `TripCoverHeader` — cover image, trip name, destinations, date range, status badge
- **Timeline:** Day headers, ActivityBlocks (time + name + cost chip + type icon + physical tag), CityHeaders between sections
- **List:** flat list grouped by section
- **Calendar:** mini calendar, dots on trip days, click → see that day's activities
- `ExpenseWidget` sidebar — total estimated cost
- `ShareButton` → generates URL, copy to clipboard
- `EditButton` → /builder | `PrintButton` → jsPDF
- Public `/share/[token]`: read-only, "Copy This Trip" CTA instead of edit/share

```typescript
GET /api/v1/trips/:id
GET /api/v1/trips/:id/sections
GET /api/v1/trips/:id/budget       // expense widget
POST /api/v1/trips/:id/share       // { isPublic: true }
GET /api/v1/trips/share/:token     // no auth
```

---

### Screen 10 — Community
**Route:** `/community` | **Auth:** Public browse, bearer for copy

- SearchBar + FilterBar (sort: newest / most copied / destination)
- `CommunityTripCard` feed: cover photo, trip name, creator, destinations, duration, "View Itinerary" link, "Copy Trip" button
- CopyTripModal — confirm → clones trip → redirect /trips/[newTripId]

```typescript
GET /api/v1/community?search=&sort=newest&page=1
POST /api/v1/community/:tripId/copy → { newTripId }
```

---

### Screen 11 — Packing Checklist
**Route:** `/trips/[tripId]/checklist` | **Auth:** Protected

- `TripContextHeader` — "Trip: Paris & Rome Adventure"
- `ProgressBar` — "Progress: 5/12 items packed"
- SearchBar + FilterBar
- `CategoryGroup` per category (Documents, Clothing, Electronics, Toiletries, Misc):
  - Category header with `x/y` count chip
  - `ChecklistItem` — checkbox, label, category badge, delete button
- Pre-seeded items (from Excalidraw): Passport, Flight Tickets, Travel Insurance, Hotel Confirmation, Casual Shirts, Trousers/Jeans, Walking Shoes, Light Jacket, Phone Charger, Power Adapter, Earphones
- `AddItemInput` — "+ add item to checklist" with category selector
- Bottom: "Reset all" | "Share Checklist" buttons

```typescript
GET  /api/v1/trips/:id/checklist
POST /api/v1/trips/:id/checklist/items        { label, category }
PATCH /api/v1/trips/:id/checklist/items/:cid  { isPacked?, label?, category? }
DELETE /api/v1/trips/:id/checklist/items/:cid
DELETE /api/v1/trips/:id/checklist/reset
POST /api/v1/trips/:id/checklist/share
```

---

### Screen 12 — Admin Panel
**Route:** `/admin` | **Auth:** Protected + role = admin

Sections (from Excalidraw):
- SearchBar + FilterBar
- **Manage Users** — `UserTable`: ID, name, email, role, trip count, joined date, actions (Edit role, Ban, Delete)
- **Popular Cities** — ranked list
- **Popular Activities** — ranked list
- **User Trends & Analytics** — Recharts LineChart (trips over time), EngagementChart, stat cards: Total Users, Total Trips, Trips This Month, Top City

```typescript
GET /api/v1/admin/stats
GET /api/v1/admin/users?page=1&search=
PATCH /api/v1/admin/users/:id  { role? } | { isBanned? }
DELETE /api/v1/admin/users/:id
GET /api/v1/admin/analytics
```

---

### Screen 13 — Trip Notes / Journal
**Route:** `/trips/[tripId]/notes` | **Auth:** Protected

- `TripContextHeader` — "Trip: Paris & Rome Adventure"
- Filter toggle: **All** | **by Day** | **by Stop**
- SearchBar + FilterBar + "＋ Add Note" button (top right)
- `NoteCard` per note: title, content, timestamp, stop/day badge, edit (inline), delete
- Example note (from Excalidraw): "Hotel check-in details - Rome stop / check in after 2pm, room 302, breakfast included (7–10am) / Day 3: June 14 2025"
- `NoteEditor` — textarea + Day/Stop selector, save on blur

```typescript
GET  /api/v1/trips/:id/notes
POST /api/v1/trips/:id/notes       { title?, content, sectionId?, dayNumber? }
PATCH /api/v1/trips/:id/notes/:nid { title?, content }
DELETE /api/v1/trips/:id/notes/:nid
```

---

### Screen 14 — Expense Invoice / Billing
**Route:** `/trips/[tripId]/invoice` | **Auth:** Protected

**Components (from Excalidraw):**
- "← back to My Trips" link
- `InvoiceMeta`: Trip name, dates + city count, created by, Invoice ID (INV-xyz-30290), generated date, Payment Status badge (pending/paid)
- `TravelerDetails` panel: James, Arjun, Jerry, Cristina
- `BudgetInsightsPanel`: Total Budget / Total Spent / Remaining (red if negative) + "View Full Budget" link
- `InvoiceTable`:
  - Columns: # | Category | Description | Qty/Details | Unit Cost | Amount
  - Row examples: Hotel — hotel booking paris — 3 nights — 3,000 — 9,000 | Travel — flight DEL→PAR — 1 — 12,000 — 12,000
  - Footer: Subtotal | Tax (5%) | Discount | **Grand Total**
- `ActionBar`: "Download Invoice" (jsPDF) | "Export as PDF" | "Mark as paid"

```typescript
GET  /api/v1/trips/:id/invoice
GET  /api/v1/trips/:id/budget/items        // line items
PATCH /api/v1/trips/:id/invoice/status     { status: "paid" | "pending" }
```

**jsPDF export:**
```typescript
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

function exportInvoicePDF(invoice: Invoice) {
  const doc = new jsPDF()
  doc.text(`Invoice: ${invoice.invoiceId}`, 14, 20)
  doc.text(`Trip: ${invoice.tripName}`, 14, 30)
  autoTable(doc, {
    head: [['#', 'Category', 'Description', 'Qty', 'Unit Cost', 'Amount']],
    body: invoice.items.map((item, i) =>
      [i + 1, item.category, item.description, item.qty, item.unitCost, item.amount]
    ),
    foot: [['', '', '', '', 'Grand Total', `$${invoice.grandTotal}`]],
  })
  doc.save(`${invoice.tripName}-invoice.pdf`)
}
```

---

## 9. TYPESCRIPT TYPES (types/index.ts)

```typescript
interface User {
  id: string; email: string; firstName: string; lastName: string
  phone?: string; city?: string; country?: string; bio?: string
  avatarUrl?: string; language: string; role: 'user' | 'admin'
  isBanned: boolean; createdAt: string
}

interface Trip {
  id: string; userId: string; name: string; description?: string
  startDate: string; endDate: string; coverImageUrl?: string
  shareToken?: string; isPublic: boolean
  status: 'ongoing' | 'upcoming' | 'completed'
  sections: Section[]; createdAt: string; updatedAt: string
}

interface Section {
  id: string; tripId: string; label: string; description?: string
  cityId?: string; startDate: string; endDate: string
  budget: number; order: number; activities: Activity[]
}

interface Activity {
  id: string; name: string; description?: string
  type: 'sightseeing' | 'food' | 'adventure' | 'culture' | 'wellness' | 'transport' | 'accommodation'
  cost: number; duration?: string; imageUrl?: string
}

interface ChecklistItem {
  id: string; tripId: string; label: string
  category: 'documents' | 'clothing' | 'electronics' | 'toiletries' | 'misc'
  isPacked: boolean; createdAt: string
}

interface Note {
  id: string; tripId: string; sectionId?: string; dayNumber?: number
  title?: string; content: string; createdAt: string; updatedAt: string
}

interface BudgetItem {
  id: string; tripId: string
  category: 'hotel' | 'travel' | 'food' | 'activity' | 'misc'
  description: string; qty: number; unitCost: number; amount: number
}

interface Invoice {
  invoiceId: string; tripId: string; tripName: string; dateRange: string
  createdBy: string; travelers: string[]; generatedDate: string
  status: 'pending' | 'paid'
  totalBudget: number; totalSpent: number; remaining: number
  items: BudgetItem[]; subtotal: number; tax: number; discount: number; grandTotal: number
}

interface City {
  id: string; name: string; country: string; region: string
  costIndex: number; popularityScore: number; imageUrl?: string; description?: string
}
```

---

## 10. REACT QUERY KEY CONVENTIONS

```typescript
['trips']                          // list
['trips', tripId]                  // single trip
['trips', tripId, 'sections']      // sections
['trips', tripId, 'checklist']     // checklist
['trips', tripId, 'notes']         // notes
['trips', tripId, 'invoice']       // invoice
['trips', tripId, 'budget']        // budget
['cities', { search, country }]    // city search
['activities', { search, type }]   // activity search
['community', { page, sort }]      // community feed
['admin', 'stats']                 // admin stats
['admin', 'analytics']             // admin analytics
```

---

## 11. DECISION LOG

| ID | Decision | Rationale |
|---|---|---|
| D001 | JWT in Zustand memory | Prevents XSS; never localStorage; refresh via HttpOnly cookie |
| D002 | EmailJS for OTP/confirmation | Zero backend SMTP setup; client-side; free tier covers hackathon |
| D003 | React Query for server state | Auto-caching, refetch, optimistic updates without boilerplate |
| D004 | @dnd-kit for drag-reorder | Accessible, React 18 compatible, actively maintained |
| D005 | jsPDF for invoice export | Fully client-side, no server dependency for PDF generation |
| D006 | Recharts | Native React, composable, Tailwind-friendly |
| D007 | App Router + Server Components | SEO on public pages (/share, /community); Client Components for interactive builder |
| D008 | 3-step registration | Reduces cognitive load; OTP before heavy data collection |
| D009 | shadcn/ui | Copy-paste components, full Tailwind control, no external CSS conflicts |