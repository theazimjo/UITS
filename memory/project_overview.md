---
name: project overview
description: UITS Student Management CRM - full-stack NestJS/React app for educational center
type: project
---

## UITS - Student Management CRM

**What it is:** Full-stack CRM for an Uzbek educational center managing students, groups, staff, attendance, payments, and expenses.

**Stack:** NestJS + TypeORM + PostgreSQL (backend) | React 19 + Vite + TailwindCSS (frontend) | JWT auth

**10 Backend Modules:** auth, users, students, staff, groups, payments, attendance, expenses, dashboard, activity-log

**Key Entities:** User, Student, Staff, Role, Group, Course, Field, Room, Enrollment, Attendance, Payment, Expense, ActivityLog

**Frontend Routes:** /login, /, /students, /staff, /groups, /groups/:id, /payments, /attendance, /finance, /settings

**Auth:** JWT via Passport.js. Default admin: admin/admin123. Token in Authorization: Bearer header.

**Database:** PostgreSQL 15, TypeORM ORM

**Ports:** Backend: 3000, Frontend: 5173 (proxies to backend)
