# 🛡️ Women Safety App

> **Freedom-first, on-demand safety — no surveillance, no restriction**

A mobile safety application built with **React Native** (frontend) and **Java Spring Boot** (backend), designed around a core philosophy: safety without surveillance. No default tracking, no continuous sharing — the user is always in control of when, with whom, and for how long their data is shared.

---

## 🎯 Vision

Most women's safety apps in the market follow one of two models:

1. **Continuous monitoring** — visibility for family/partners (e.g. Life360)
2. **Reactive-only** — a simple panic button that only helps after something has already happened

This app takes a different approach:

- **Empowerment, not surveillance** — a confidence tool, not a monitoring tool
- **Everything on-demand** — no tracking or sharing is active by default
- **User always in control** — the user alone decides when, with whom, and for how long data is shared
- **Goal** — let a woman go anywhere, anytime, without fear and without needing anyone's permission

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Mobile App (Frontend) | React Native | Natural extension of ReactJS knowledge — one codebase for Android + iOS |
| Backend | Java + Spring Boot | REST APIs, authentication, business logic — high demand in the fresher job market |
| Database | PostgreSQL or MongoDB | Stores user data, alert history, and contacts |
| Real-time features | Firebase (Cloud Messaging, Realtime DB) | Fast integration for push notifications and live SOS alerts |
| Maps & Location | Google Maps API | Safe route suggestions, live location, confidence zones |
| SMS / Emergency Alerts | Twilio | Sends SMS to emergency contacts when SOS is triggered |

---

## 🚀 Core Features

### MVP (Phase 2)
- **SOS / Panic Button** — one tap shares location with emergency contacts and police
- **On-demand Location Sharing** — trip-specific, auto-expiring, user-chosen contacts
- **Fake Call Feature** — a discreet way out of an uncomfortable situation
- **Emergency Contacts List** — quick-add family/friends
- **Silent Audio/Video Recording** — background-triggered evidence capture
- **Safe Route Suggestion** — safer, well-lit routes via Google Maps API

### Freedom-First Differentiators (Phase 3)
- **"Walk With Me" Mode** — user-activated/deactivated, no mandatory check-ins
- **Confidence Zones** — community-verified safe, well-lit, populated spots (positive framing)
- **Silent Alert** — triggers discreetly without alerting a potential attacker
- **Shake / Volume-Button Trigger** — for when reaching for the phone is risky
- **Voice-Activated SOS** — triggered by saying "help"
- **No default family/partner dashboard** — everything is opt-in and revocable at any time
- **Auto-delete location history** unless the user explicitly chooses to save it

---

## 🗺️ Product Roadmap

1. **Phase 1 — Planning & Research**: define target users, lock the core problem statement (on-demand safety, not monitoring)
2. **Phase 2 — Core Features (MVP)**: SOS, on-demand location sharing, fake call, contacts, silent recording, safe routes
3. **Phase 3 — Freedom-First Differentiators**: Walk With Me, Confidence Zones, silent/voice/shake triggers, opt-in only sharing
4. **Phase 4 — Build**: React Native frontend, Spring Boot REST APIs, PostgreSQL/MongoDB schema, Google Maps/Firebase/Twilio integrations
5. **Phase 5 — Testing & Compliance**: offline/low-battery edge cases, end-to-end encryption, battery optimization, privacy audit
6. **Phase 6 — Launch & Growth**: pilot launch in a city/college, feedback loop, partnerships with NGOs, police departments, and colleges

---

## 📦 Project Structure (suggested)

```
women-safety-app/
├── mobile/              # React Native app
│   ├── src/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── navigation/
│   │   └── services/
│   └── ...
├── backend/             # Java Spring Boot app
│   ├── src/main/java/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── models/
│   └── ...
└── README.md
```

---

## ⚙️ Getting Started

### Backend (Spring Boot)
```bash
cd backend
./mvnw spring-boot:run
```

### Frontend (React Native)
```bash
cd mobile
npm install
npx expo start
```

> Configure your environment variables (Google Maps API key, Firebase config, Twilio credentials, database connection string) in a `.env` file before running.

---

## 🔒 Privacy & Security Principles

- No feature shares or stores data without explicit user action
- Location sharing always auto-expires unless the user chooses otherwise
- No default dashboards or visibility for third parties
- End-to-end encryption for sensitive location data
- Regular privacy audits to ensure no feature silently behaves like monitoring

---

## 📄 License

_Add your chosen license here (e.g. MIT, Apache 2.0)._

---

## 🙌 Contributing

Contributions, feedback, and partnership interest (NGOs, colleges, police departments) are welcome. Please open an issue or submit a pull request.
