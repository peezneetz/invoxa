# Invoxa 🧾

> A full-stack invoice management web app for freelancers and small businesses.

![Status](https://img.shields.io/badge/status-live-brightgreen)
![Stack](https://img.shields.io/badge/stack-React%20%7C%20Node.js%20%7C%20PostgreSQL-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## What is Invoxa?

Invoxa is a business web application that lets freelancers and small business owners create, send, and track invoices. Built with a clean React frontend and a Node.js/PostgreSQL backend, it covers the full workflow from client management to payment tracking.

Built by Carter — self-taught full-stack developer based in Nairobi, Kenya.

## Features

- User authentication with JWT sessions
- Create and manage clients
- Generate professional invoices with line items and auto totals
- Track invoice status: Draft, Sent, Paid, Overdue
- Dashboard with revenue stats and outstanding balances
- Multi-currency support: KES, USD, EUR, GBP
- Filter invoices by status
- Fully responsive UI

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, React Router, Tailwind CSS, Lucide Icons |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Auth | JWT + bcrypt |
| Validation | express-validator |
| Deployment | Vercel (client) + Railway (server) |

## Project Structure

cat > .gitignore << 'EOF'
node_modules/
.env
dist/
build/
.DS_Store
*.log
.vite/
