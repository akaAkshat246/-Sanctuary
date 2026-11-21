# ✦ SANCTUARY — Private Refuge

> **"Your quiet heart is your sanctuary. Guard it gently."**  
> *Private · Beautiful · Offline-First · Yours*

Sanctuary is a personal digital refuge designed for private memory storage, rich journaling, mindful reminders, and moments of calm. Engineered from the ground up without third-party cloud synchronization, tracking beacons, or advertisements, all data remains strictly on-device.

---

## 🌟 Highlights & Key Features

- **🛡️ 100% Local-First & Sovereign**: No external database dependencies, no tracking, zero advertisements. All data stays on your device.
- **💾 10–15 GB Native Storage**: Powered by `@capacitor-community/sqlite` and native `@capacitor/filesystem` (no 5MB `localStorage` limitations).
- **🐱 Animated Mochi Cat Companion**: Interactive SVG kawaii companions who keep watch over your sanctuary, purr with tactile haptic feedback, and rotate through calming moods.
- **📜 Curated Literary Wisdom**: 30 Franz Kafka and Fyodor Dostoevsky reflections, styled in classic *Cormorant Garamond* and *Playfair Display* typography.
- **✒️ Writing Space (Journal)**: Debounced search, abstract mood weather selectors, auto-saving drafts (every 30s), tag categorization, and Gemini AI poetic muse.
- **📁 Universal Memory Vault**: Supports photos, family videos, audio recordings, and documents with integrated previewers.
- **⏰ Mindful Reminders**: Priority color-coding (High = Rose, Medium = Gold, Low = Teal), overdue detection, and real-time pending badges.
- **🧭 Chronological Journey**: Month-by-month timeline grouping your reflections with mood color indicators.
- **📱 Android Native APK + PWA**: Ready for phone installation via the compiled APK ([Sanctuary-debug.apk](./Sanctuary-debug.apk)) and installable as a Progressive Web App (PWA).

---

## 🎨 UI Design Tokens

| Token | Hex / Style | Description |
|---|---|---|
| **Deep Teal** | `#1a4a4a` | Primary app bars, buttons, brand accent |
| **Teal Light** | `#2a6a6a` | Secondary gradient & hover states |
| **Warm Ivory** | `#f7f5f2` | Canvas background in Light Mode |
| **Dark Teal** | `#0c1818` | Canvas background in Dark Mode |
| **Gold** | `#c9a84c` | Highlight accents, stars, timestamps |
| **Typography** | `Playfair Display` + `Josefin Sans` | Editorial headings & geometric legible body |

---

## 🚀 Quick Start Guide

### 1. Requirements
- **Node.js**: v18+ (tested on v24.15)
- **Java**: JDK 17 (Adoptium / HotSpot)
- **Android SDK**: API 33+ (API 34/35/36 supported)

### 2. Development Server
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Web & PWA Build
```bash
npm run build
```

### 4. Android Build & APK Generation
```bash
# Sync web bundle into native Android shell
npx cap sync

# Compile the Debug APK
cd android
.\gradlew.bat assembleDebug
```
The compiled APK will be generated at:
`d:\SAN\android\app\build\outputs\apk\debug\app-debug.apk` (and root `Sanctuary-debug.apk`).

---

## 📋 21-Day Roadmap Milestones Tracker

| # | Milestone | Phase | Status |
|:---:|---|:---:|:---:|
| 1 | Web App Polish & Layout (Days 1–7) | Phase 1 | ✅ Completed |
| 2 | Centered Liquid Glass Bottom Navigation (Day 2) | Phase 1 | ✅ Completed |
| 3 | Home Screen, Clock, Quotes, Cat Companions (Day 3) | Phase 1 | ✅ Completed |
| 4 | Writing Space & Journal CRUD (Day 4) | Phase 1 | ✅ Completed |
| 5 | Memory Vault & Reminders CRUD (Day 5) | Phase 1 | ✅ Completed |
| 6 | Journey Timeline & Sanctuary Tags (Day 6) | Phase 1 | ✅ Completed |
| 7 | Settings, Backups & Privacy Manifesto (Day 7) | Phase 1 | ✅ Completed |
| 8 | Capacitor Setup & Android Project (Days 8–10) | Phase 2 | ✅ Completed |
| 9 | Native SQLite Database Schema (Days 11–12) | Phase 3 | ✅ Completed |
| 10 | Filesystem Vault Storage (Day 13) | Phase 3 | ✅ Completed |
| 11 | Preferences & Automated Migration (Day 14) | Phase 3 | ✅ Completed |
| 12 | Testing & Zero-Error Code Quality (Days 15–17) | Phase 4 | ✅ Completed |
| 13 | Android Debug APK Built & Verified (Days 18–19) | Phase 5 | ✅ Completed |
| 14 | PWA Service Worker & Install Prompt (Day 20) | Phase 6 | ✅ Completed |
| 15 | Animated SVG Mochi Cat & Final Polish (Day 21) | Phase 7 | ✅ Completed |

---

*Architected & developed with reverence for quiet thought by Akshat Vats.*
