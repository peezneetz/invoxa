# Invoxa

A full-stack invoice management web app for freelancers and small businesses.

## Live Demo

- Frontend: https://invoxa-eta.vercel.app
- API: https://invoxa-3sfx.onrender.com/api/health

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

- Frontend: React, React Router, Tailwind CSS, Lucide Icons
- Backend: Node.js, Express.js
- Database: PostgreSQL
- Auth: JWT + bcrypt
- Validation: express-validator
- Deployment: Vercel and Render

## Getting Started

git clone https://github.com/Carter254g/invoxa.git
cd invoxa
cd server && npm install && npm run migrate
cd ../client && npm install && npm run dev

## API Endpoints

POST   /api/auth/register
POST   /api/auth/login
GET    /api/clients
POST   /api/clients
GET    /api/invoices
POST   /api/invoices
PATCH  /api/invoices/:id/status
DELETE /api/invoices/:id

## Roadmap

- PDF export for invoices
- Email delivery via Nodemailer
- Recurring invoices
- Payment integration with M-Pesa

## Author

Carter - Self-taught full-stack developer based in Nairobi, Kenya.
Building web apps, automation tools and dApps.
GitHub: https://github.com/Carter254g

## License

MIT
