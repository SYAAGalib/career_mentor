# Milestone 1 — Week 1: Environment & Foundation

## Purpose
Establish the development environment and core project foundation so the team can build quickly and consistently in the following weeks.

This milestone aligns with the **Week 1** roadmap in the project proposal.

---

## What “Done” Means (Acceptance Criteria)
- Flutter + Firebase environment is configured and working.
- Project structure is organized and ready for feature development.
- Core dependencies are installed and verified.
- App routing and state management baseline are wired.
- Android debug and release builds succeed locally.

---

## Scope (Build in Week 1)

### 1) Environment Setup
- Install and verify Flutter SDK, Android SDK, and required tools.
- Configure Firebase project and add the correct configuration files.
- Ensure all build variants run without errors.

### 2) Project Structure
- Create a clean feature-based folder structure.
- Set up `lib/app`, `lib/core`, and `lib/features` foundations.
- Add base theme, typography, and color tokens.

### 3) Routing & State Foundation
- Configure `go_router` with placeholder routes:
  - `/splash`
  - `/agreement`
  - `/auth`
  - `/app`
- Add Riverpod setup and a top-level provider scope.

### 4) Build Verification
- Android debug build runs successfully.
- Android release build completes successfully.

---

## Out of Scope (Not Week 1)
- UI buildout for onboarding screens
- Registration and authentication flow
- Canvas interactions and stage nodes
- Data persistence
- Analytics and crash reporting

---

## Deliverables
- Clean project structure with baseline configuration
- Working build pipeline (debug + release)
- Routing and state foundations ready for Week 2

---

## Week 1 Checklist
1. Verify Flutter + Android toolchain
2. Configure Firebase project and add config files
3. Set up routing and placeholders
4. Add Riverpod provider scope
5. Confirm Android builds (debug + release)
