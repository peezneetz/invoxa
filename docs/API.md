# API Reference

Base URL: http://localhost:5000/api

## Auth
POST /api/auth/register
POST /api/auth/login

## Clients
GET    /api/clients
POST   /api/clients
PUT    /api/clients/:id
DELETE /api/clients/:id

## Invoices
GET    /api/invoices
POST   /api/invoices
GET    /api/invoices/:id
PATCH  /api/invoices/:id/status
DELETE /api/invoices/:id

## Health
GET /api/health
