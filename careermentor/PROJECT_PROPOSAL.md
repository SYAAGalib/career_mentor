# CareerMentor — Project Proposal

**Document type:** Project proposal  
**Project:** CareerMentor (Flutter + Firebase)  
**Date:** February 18, 2026  
**Prepared for:** ______________________________  
**Prepared by:** ______________________________  
**Version:** 2.0

---

## Executive Summary

CareerMentor is a mobile-first career guidance app that helps users move from uncertainty to a clear, actionable path. The product centers on an “endless canvas” experience where each step of a user’s journey is visible and navigable, with a predictable flow from onboarding to guidance.

This proposal defines the purpose, scope, and delivery plan for a first production-ready version, followed by a clear 5-week roadmap that prioritizes setup, UI, registration, and full software completion.

---

## Problem Statement

Most career-planning tools are either too generic or too complex. Users need a calm, structured experience that provides clarity without overwhelming them. CareerMentor addresses this by presenting a guided journey in a visual, easy-to-understand format.

---

## Solution Overview

CareerMentor provides:

- A predictable onboarding funnel (Splash → Agreement → Auth → Canvas)
- A simple “Start Here” node and clear next steps
- A stage-based flow that can expand safely over time
- Clean UI, low cognitive load, and strong user trust

---

## Project Objectives

1. Deliver a stable, user-ready application.
2. Build a modern, professional UI and onboarding experience.
3. Provide a complete registration and authentication flow.
4. Ship the full software within 5 weeks.

---

## Target Users

- Students and early-career professionals
- Individuals seeking structured career guidance
- Users who prefer minimal, visual, step-by-step interfaces

---

## Proposed Tech Stack

- **Frontend:** Flutter
- **Routing:** `go_router`
- **State management:** Riverpod
- **Backend services:** Firebase Authentication + Firestore
- **Analytics/Crash reporting:** Firebase Analytics + Crashlytics
- **Local storage:** `shared_preferences`

---

## Scope (Initial Release)

**In scope:**

- App initialization and environment setup
- Complete UI system and navigation
- Registration, login, logout, and reset password
- Endless canvas with initial stage nodes
- Basic user data persistence

**Out of scope (for this 5-week phase):**

- AI roadmap generation
- Payments and monetization
- Complex multi-device syncing

---

## 5-Week Roadmap (New)

### Week 1 — Environment & Foundation

- Setup Flutter + Firebase environment
- Configure project structure and core dependencies
- Establish app routing and state management baseline
- Verify build pipelines (Android release + debug)

### Week 2 — UI & UX Buildout

- Design system (colors, typography, spacing, components)
- Implement onboarding UI (Splash, Agreement, Auth screens)
- Build canvas UI shell and navigation scaffolding

### Week 3 — Registration & Authentication

- Implement Firebase Auth (register/login/logout/reset)
- Add input validation and error messaging
- Connect auth flow to routing and onboarding

### Week 4 — Core Feature Completion

- Implement endless canvas interactions
- Add initial stage nodes and minimal journey flow
- Persist onboarding data locally

### Week 5 — Finalization & Release Readiness

- QA testing and bug fixes
- Performance optimization and crash checks
- Final review, polish, and release build output

---

## Deliverables

- Fully functional CareerMentor mobile app
- Stable onboarding and registration flow
- Modern UI and structured journey experience
- Release-ready Android build

---

## Success Criteria

- Users can install, register, and reach the canvas without errors
- UI is consistent, modern, and easy to navigate
- Core journey flow is stable and repeatable
- App builds successfully for Android release

---

