# CompciStudy

A free study site for high school computer science: Intro to Python, Web Development, AP CS Principles, AP CS A, Cybersecurity, and Data Structures & Algorithms.

**Live site:** https://griffter-dev.github.io/compcistudy/

- Bite-sized lessons with quizzes, runnable examples and a glossary
- Coding exercises that run and check your code in the browser
- AP CSA aligned to the 2025–26 framework (topics 1.1–4.17), with timed practice exams and FRQ practice
- Arcade games, optional boss battles, duels and weekly events
- Squads with live leaderboards, assignments and a gradebook (needs Firebase, see `SETUP.md`)

## Files
- `index.html`: the whole app (built from `source/`)
- `firebase-config.js`: paste your Firebase settings here to turn on squads
- `firestore.rules`: security rules to paste into Firebase
- `SETUP.md`: step-by-step setup guide
- `source/`: lesson content (`source/content/*.md`) and app code. Run `npm install && npm run build` inside `source/` to rebuild.
