# CivicFix — Smart Community Complaint Portal

**CivicFix** is a modern, responsive, frontend-only civic-tech Single-Page Web Application (SPA) designed to empower citizens to report, track, and monitor local community grievances (such as sanitation, water supply, road potholes, electricity faults, broken streetlights, garbage overflow, drainage blockages, and public safety hazards) with municipal-grade transparency and real-time lifecycle tracking.

---

## 🌟 Key Highlights & Design Standards

- **Frontend-Only Architecture**: Built strictly with semantic **HTML5**, modern **CSS3**, and **Vanilla JavaScript (ES6+)**. No Node.js backend, no external databases, no Firebase, and zero heavy third-party runtime dependencies.
- **Persistent Data Layer**: Full CRUD persistence across page refreshes powered by a clean, robust browser `LocalStorage` engine (`civicfix_complaints`).
- **Modern Civic-Tech UI/UX**: Designed to look and feel like an enterprise civic SaaS portal (deep blue/indigo `#1e3a8a`, teal `#0d9488`, clean neutral surfaces, crisp typography, subtle elevation shadows, and smooth micro-interactions).
- **Responsive Layout**: Engineered for desktop, laptop, tablet, and mobile screens (hamburger navigation drawer, touch-friendly inputs, responsive tables, and grid cards).
- **Zero Console Errors**: Verified with automated browser tests across all application routes, workflows, and viewports.

---

## 🏛️ Application Structure & Views

The portal is designed as a single-page application with hash-based routing:

1. **Home / Landing (`#landing`)**:
   - Hero section with live grievance workflow visual preview.
   - Live municipal statistics bar (*Total Complaints, Resolved Issues, In Progress, Pending Review*) dynamically calculated from LocalStorage.
   - Structured 4-stage explanation of the redressal workflow: *Report &rarr; Verification &rarr; Resolution &rarr; Community Improved*.
   - Supported issue category grid with one-click reporting.
   - Dynamic *Recent Community Complaints* ledger with live status pills and detail view triggers.
   - Public trust & transparency banner with municipal SLA metrics.

2. **Report an Issue (`#report`)**:
   - Comprehensive grievance submission form with clear section groupings.
   - Real-time inline field validation (Full Name, Email, 10-digit Indian Mobile format, Locality/Ward, Issue Title, Description).
   - Live character counter with minimum (20) and maximum (800) character thresholds.
   - Urgency & Priority selector cards (*Low, Medium, High, Critical*).
   - Photographic evidence upload zone with drag-and-drop support, base64 image preview, and 4 one-click sample civic photos for rapid testing (*Pothole, Streetlight, Garbage, Water Leak*).
   - Automatic `CF-YYYY-XXXXX` tracking ID generation and persistence to LocalStorage.
   - Submission success modal with instant clipboard copy and direct tracking CTA.

3. **Track Complaints (`#track`)**:
   - Search input for Complaint IDs with quick-test sample pills.
   - Interactive 5-stage grievance lifecycle timeline (*Submitted &rarr; Under Review &rarr; Assigned &rarr; In Progress &rarr; Resolved* or *Rejected*).
   - Dynamic stage states (*Completed [green checkmark], Current [pulsing active highlight], Upcoming [muted]*).
   - Timestamped official activity log detailing each department action, inspector note, and acting officer.
   - Printable status receipt (`window.print` optimized) and shareable tracking link generator.

4. **Citizen Dashboard (`#dashboard`)**:
   - Dynamic time-of-day citizen greeting (*Morning, Afternoon, Evening*).
   - Summary grievance status cards.
   - Live multi-parameter filtering toolbar:
     - Full-text search (ID, title, location, category, citizen name)
     - Category filter
     - Status filter (*Submitted, Under Review, Assigned, In Progress, Resolved, Rejected*)
     - Priority filter (*Critical, High, Medium, Low*)
     - Sorting (*Newest First, Oldest First, Priority High to Low, Priority Low to High*)
     - View mode toggle (*Modern Table View vs. Responsive Cards Grid View*)
   - Quick action buttons (*View Details modal, Track Status, Delete record*).

5. **Admin Operations Console & Analytics (`#admin`)**:
   - Authority operations console for municipal monitoring.
   - 6 KPI metric counters (*Total Reports, New/Pending, Under Review, In Active Repair, Closed/Resolved, Resolution Rate %*).
   - Pure CSS/SVG lightweight reactive charts:
     - **Category Workload Chart**: Horizontal progress distribution per department.
     - **Status Donut Chart**: Interactive SVG segmented donut chart with legend and percentages.
     - **Priority Distribution Bar**: Color-coded severity breakdown.
     - **Intake vs. Resolution Velocity**: 7-day multi-bar activity trend.
   - Queue management table with **inline status changer**:
     - Changing any status immediately updates LocalStorage.
     - Automatically appends a timestamped audit event to the grievance's official history.
     - Live-refreshes all charts, dashboard KPI counters, and landing page metrics.
   - Data export options: **Export as CSV** and **Export as JSON**.
   - **Reset Demo Data** tool to restore default sample issues at any time.

6. **How It Works & Transparency (`#about`)**:
   - Service Level Agreements (SLAs) for critical vs. standard repairs.
   - Department directory and routing overview.
   - Expandable FAQ accordion addressing common citizen questions.

---

## 📁 Project File Structure

```
int 42d/
│
├── index.html              # Semantic HTML5 Single Page Application shell
├── README.md               # Project documentation and architectural overview
│
├── css/
│   └── style.css           # Complete design system, CSS variables, components, & responsive styles
│
└── js/
    ├── storage.js          # LocalStorage CRUD, demo dataset seeding, stats engine, CSV/JSON export
    ├── validation.js       # Client-side validation rules, inline error feedback, & char counter
    ├── ui.js               # Modal manager, toast notification system, SVG charts, & status timeline
    └── app.js              # Application orchestrator, SPA routing, filters, search, & event handling
```

---

## 🚀 How to Run the Project

No build step, package manager, or server installation is required:

1. Double-click [`index.html`](file:///c:/Users/Dell/Desktop/int%2042d/index.html) to open directly in any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari).
2. Alternatively, serve using Python's built-in lightweight local server:
   ```bash
   python -m http.server 8000
   ```
   and navigate to `http://localhost:8000`.

---

## 🧪 Automated Test Verification

The application was validated using Playwright automated browser tests:
- **Functional Testing**: Navigation, complaint submission, LocalStorage persistence, tracking timeline rendering, filter queries, table/grid toggles, inline admin status updates, and record deletion.
- **Mobile Responsiveness**: Zero horizontal overflow verified across 375px & 390px mobile viewports; mobile navigation drawer verified.
- **Console Health**: Verified **0 console errors**, **0 warnings**, and **0 unhandled exceptions**.
