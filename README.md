# Ayush Productivity OS

A serious personal productivity operating system built with Node.js, Express.js, EJS, MongoDB/Mongoose, REST APIs, vanilla JavaScript, Chart.js, and Lucide icons.

## Included modules

- Session-based authentication with bcrypt password hashing
- Dashboard for today, overdue work, goals, habits, upcoming tasks, and productivity score
- Task system with status, priority, due dates, due times, tags, categories, projects, goals, recurrence fields, subtasks architecture, reminders, and activity history
- Natural-language quick capture for phrases such as `Finish resume tomorrow at 7pm #career high`
- Duplicate-safe recurring occurrences for daily, weekday, weekly, biweekly, monthly, yearly, and custom weekday schedules
- Goals, projects, a dedicated milestones workspace, milestone-linked tasks, habits with streak calculations, notes, calendar, analytics, settings, search, command palette, and in-app notifications
- REST actions for task parsing, completion, duplication, snoozing, rescheduling, subtasks, notifications, and reminder synchronization
- MVC + service + repository structure
- Mongoose schemas and indexes for MongoDB
- Local in-memory fallback when MongoDB is unavailable, so the interface can be explored immediately
- Helmet, rate limiting, input validation, MongoDB sanitization, secure session configuration, centralized errors, and ownership checks

## Run locally

1. Install Node.js 18+.
2. Copy .env.example to .env and set SESSION_SECRET.
3. Run npm install.
4. Start with npm run dev.
5. Open http://localhost:3000.
6. Register an account, or run npm run seed and use the printed seed credentials.
7. Run `npm test` to execute the parser, recurrence, recurring-task, and reminder regression tests.

For full persistence, make sure MongoDB is running and keep MONGODB_URI configured. Without MongoDB, the app uses an in-memory development store and resets when the server restarts. Keep MONGO_SESSION=false for local fallback testing; set it to true only when MongoDB is available so sessions persist in MongoDB too.

## Architecture

src/config contains environment and database setup.
src/models contains Mongoose schemas.
src/repositories isolates persistence.
src/services contains business logic such as analytics, scoring, recurrence, quick capture parsing, reminders, and activity history.
src/controllers handles HTTP orchestration.
src/routes defines web and REST endpoints.
src/middleware includes authentication, centralized errors, and session-backed CSRF protection.
src/jobs contains the reminder scan job.
test contains regression tests for parsing, recurrence, recurring-task generation, and idempotent reminders.
views contains EJS pages and reusable partials.
public contains the visual system and browser-side interactions.

## Seed data

npm run seed creates a realistic productivity workspace with a career goal, portfolio project, tasks, and habits. The seed script uses SEED_EMAIL and SEED_PASSWORD from .env.

This is a production-oriented MVP foundation. Before deploying publicly, add a durable job queue for reminders, external object storage for attachments, email/password reset delivery, observability, CSRF token rotation policy, and a deployment-specific MongoDB session store policy. The included reminder scan is intentionally lightweight for local development.
