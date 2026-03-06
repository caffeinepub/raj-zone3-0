# Raj_zone3.0 – Two Truths & A Lie Academic Challenge

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Splash screen (3 seconds, app name, tagline, founder credit, loading animation) → auto-redirects to Login
- Login/Sign Up screen with email/phone + password fields, forgot password, language selector (English/Hindi/Bengali)
- Home Dashboard with player profile summary (name, score, rank), main action buttons, bottom navigation
- Category Selection screen with 8 academic subject cards (History, Political Science, Chemistry, Physics, Biology, Mathematics, General Knowledge, Logical Reasoning)
- Difficulty Selection screen (Easy, Moderate, Hard) with Timer Mode toggle
- Game Play screen: "Two Truths & A Lie" format, 3 statements (A/B/C), select the lie, submit, timer bar, score & streak display
- Result Screen: shows correct/wrong, explanation of the answer, next/share/home buttons
- Leaderboard screen with rank/player/score table, Daily/Weekly/All Time filters
- Profile screen with stats (total score, highest streak), achievement badges (Beginner, Scholar, Master Mind), edit profile & logout
- Weekly Tournament feature:
  - Registration form: name + mobile number
  - Entry fee notice: ₹10 to UPI 9387785126@inhdfc
  - 10 questions, 30 seconds per question
  - After registration confirmation, player can start tournament
- Backend data: question bank with category, difficulty, statements (two truths + one lie), and explanations
- User accounts with score, streak, rank tracking
- Leaderboard data aggregated by daily/weekly/all-time
- Tournament registration records and tournament game sessions

### Modify
- Nothing (new project)

### Remove
- Nothing (new project)

## Implementation Plan
1. Backend (Motoko):
   - User type: id, name, phone/email, passwordHash, totalScore, highestStreak, level, badges
   - Question type: id, category, difficulty, statements [3], lieIndex, explanation
   - GameSession type: userId, category, difficulty, score, streak, completedAt
   - TournamentRegistration type: name, mobile, paid, registeredAt
   - TournamentSession type: registrationId, score, completedAt
   - Leaderboard queries: top players by daily/weekly/all-time
   - CRUD: register user, login, submit answer, get questions by category+difficulty, get leaderboard, register for tournament, submit tournament answers
   - Seed question bank with sample questions across all 8 categories

2. Frontend (React/TypeScript):
   - Router with views: Splash → Login/SignUp → Home → Categories → Difficulty → Game → Result → Leaderboard → Profile → Tournament
   - Splash: animated logo, 3-second timer, auto-navigate
   - Auth: login/signup forms, language selector state (EN/HI/BN)
   - Home: player card, 5 main action buttons, bottom nav bar
   - Categories: 8 subject cards in a responsive grid
   - Difficulty: 3 option cards + timer toggle
   - Gameplay: 3-statement layout, selection highlight, 30s countdown timer, score/streak top bar, submit button
   - Result: answer reveal with explanation card, action buttons
   - Leaderboard: table with rank/player/score, filter tabs
   - Profile: stats display, badge chips, edit modal, logout
   - Tournament: registration form (name + mobile), UPI payment instructions (₹10 to 9387785126@inhdfc), confirmation step, then tournament gameplay (10 questions, 30s each)
