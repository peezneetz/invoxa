# Invoxa 🧾

> A full-stack invoice management web app for freelancers and small businesses.

![Status](https://img.shields.io/badge/status-in%20progress-yellow)
![Stack](https://img.shields.io/badge/stack-React%20%7C%20Node.js%20%7C%20PostgreSQL-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## What is Invoxa?

Invoxa is a business web application that lets freelancers and small business owners create, send, and track invoices. Built with a clean React frontend and a Node.js/PostgreSQL backend.

## Features (Planned)

- [ ] User authentication (register, login, JWT sessions)
- [ ] Create and manage clients
- [ ] Generate professional invoices with line items
- [ ] Export invoices as PDF
- [ ] Track invoice status — Draft, Sent, Paid, Overdue
- [ ] Dashboard with revenue stats and outstanding balances
- [ ] Email invoices directly to clients
- [ ] Multi-currency support (KES, USD, EUR)

## Tech Stack

- Frontend: React, React Router, Tailwind CSS
- Backend: Node.js, Express.js
- Database: PostgreSQL
- Auth: JWT + bcrypt
- Deployment: Vercel (client) + Railway (server)

## Project Structure
cat > docs/SETUP.md << 'EOF'
# Local Setup Guide

## Prerequisites

- Node.js v18 or higher
- PostgreSQL v14 or higher
- Git

## 1. Clone the Repository

```bash
git clone https://github.com/Carter254g/invoxa.git
cd invoxa
```

## 2. Set Up the Database

```sql
CREATE DATABASE invoxa_db;
CREATE USER invoxa_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE invoxa_db TO invoxa_user;
```

## 3. Configure Environment Variables

```bash
cd server
cp .env.example .env
```

## 4. Install Dependencies

```bash
cd server && npm install
cd ../client && npm install
```

## 5. Run the App

Terminal 1 — Backend:
```bash
cd server && npm run dev
```

Terminal 2 — Frontend:
```bash
cd client && npm run dev
```
