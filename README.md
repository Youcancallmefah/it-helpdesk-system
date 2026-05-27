# 🖥️ IT Helpdesk System

A modern, responsive IT Helpdesk dashboard built as a **frontend portfolio project** — no frameworks, no build tools, just clean HTML, CSS, and JavaScript.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-6366f1?style=for-the-badge&logo=github)](https://youcancallmefah.github.io/it-helpdesk-system/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

---

## ✨ Features

| Feature | Description |
|---|---|
| 📊 **Live Dashboard** | Stat cards with animated counters, 3 chart types |
| 🎫 **Ticket Management** | Search, filter, sort, pagination, bulk select |
| 🔔 **Realtime Simulation** | Toast notifications + live activity feed every 8s |
| 🌙 **Dark Mode** | Full dark/light theme with localStorage persistence |
| 🎬 **GSAP Animations** | Page enter, 3D tilt, ripple effect, page transitions |
| 📋 **New Ticket Modal** | Form with real-time validation + success feedback |
| 👥 **API Integration** | Support team loaded from DummyJSON REST API |
| 💀 **Skeleton Loading** | Shimmer placeholders before data arrives |
| 📱 **Responsive Design** | Mobile-first, works on all screen sizes |

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Structure** | HTML5 (Semantic elements) |
| **Styling** | CSS3, CSS Variables, BEM, Flexbox, CSS Grid |
| **Logic** | Vanilla JavaScript (ES6+), jQuery |
| **Animations** | GSAP 3 (Timeline, ScrollTrigger) |
| **Charts** | Chart.js 4 |
| **UI Library** | Bootstrap 5 (layout grid) |
| **Icons** | Font Awesome 6 |
| **Scroll FX** | AOS (Animate on Scroll) |
| **Mock API** | DummyJSON, local JSON |

---

## 🗂️ Project Structure

```
it-helpdesk-system/
│
├── index.html               ← Dashboard page
├── tickets.html             ← Ticket management page
│
├── assets/
│   ├── css/
│   │   ├── themes.css       ← Design tokens (CSS variables)
│   │   ├── main.css         ← Global reset & base styles
│   │   ├── layout.css       ← Sidebar, topbar, grid layout
│   │   ├── components.css   ← All UI components (cards, table, modal…)
│   │   └── animations.css   ← @keyframes
│   │
│   ├── js/
│   │   ├── config.js        ← App constants (API URL, timeout…)
│   │   ├── api.js           ← Central fetch layer (AbortController)
│   │   ├── ui.js            ← Modal + form validation
│   │   ├── theme.js         ← Dark mode system
│   │   ├── animations.js    ← GSAP animation system
│   │   ├── charts.js        ← Chart.js charts (line, doughnut, bar)
│   │   ├── notifications.js ← Realtime simulation (setInterval)
│   │   ├── dashboard.js     ← Dashboard page logic
│   │   ├── tickets.js       ← Tickets page logic (state management)
│   │   └── app.js           ← App bootstrap (sidebar, AOS init)
│   │
│   ├── data/
│   │   └── mock-tickets.json ← 15 mock ticket records
│   │
│   └── img/
│       └── logo.svg
│
├── .prettierrc
└── .gitignore
```

---

## 🚀 Getting Started

No build tools or npm needed — just open and run.

```bash
# 1. Clone the repository
git clone https://github.com/Youcancallmefah/it-helpdesk-system.git

# 2. Open in browser
# Option A: Double-click index.html  (dashboard works fine)
# Option B: VS Code Live Server extension (recommended — needed for tickets page)
```

> **Note:** The tickets page uses `$.getJSON()` to load `mock-tickets.json`.
> This requires a local server. Use VS Code Live Server or any HTTP server.

---

## 📸 Pages

### Dashboard (`index.html`)
- Animated stat cards with counter + 3D tilt on hover
- Line chart (7D / 30D / 90D tabs), Doughnut chart, Bar chart
- Live activity feed — updates every 8 seconds
- Support team section loaded from DummyJSON API
- Toast notifications + slide-in notification panel

### Tickets (`tickets.html`)
- Table with 15 mock tickets from local JSON
- Real-time search with keyword highlight
- Filter by status and priority
- Sortable columns (click header)
- Bulk select with checkbox + pagination

---

## 💡 Key Concepts Practiced

- **CSS Variables** — Design token system, enables full theme switching in one attribute change
- **BEM Naming** — Scalable, collision-free CSS class naming convention
- **Module Pattern** — IIFE + revealing module for encapsulation (no global pollution)
- **Async/Await + Fetch** — Modern API calls with AbortController timeout handling
- **State Management** — Plain JS object pattern for tracking UI state
- **GSAP Timeline** — Sequenced, overlapping animations with `'-=0.3'` offset syntax
- **Skeleton Loading** — Shimmer placeholder pattern for better perceived performance
- **Debouncing** — Prevents excessive function calls on search input / window resize
- **Event Delegation** — Single `$(document).on()` listener handles dynamically created elements
- **localStorage** — Persists user theme preference across browser sessions

---

## 📁 Build History

| Commit | Feature |
|---|---|
| `7dd234f` | Initial setup — layout, sidebar, topbar, stat cards |
| `5b06605` | Chart.js — line, doughnut, bar charts, activity feed |
| `1f02775` | Tickets page — table, search, filter, sort, pagination |
| `c361905` | API integration — DummyJSON, skeleton loading, error state |
| `f742990` | Realtime simulation — toast system, notification panel |
| `39ce84a` | GSAP animations, dark mode, New Ticket modal, tooltips |

---

## 👤 Author

**Youcancallmefah**
[![GitHub](https://img.shields.io/badge/GitHub-Youcancallmefah-181717?style=flat&logo=github)](https://github.com/Youcancallmefah)

---

> Built step-by-step as a structured frontend learning project 🚀
