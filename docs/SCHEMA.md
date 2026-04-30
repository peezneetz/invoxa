# Database Schema

## Tables

### users
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  business_name VARCHAR(150),
  created_at    TIMESTAMP DEFAULT NOW()
);

### clients
CREATE TABLE clients (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150),
  phone      VARCHAR(30),
  address    TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

### invoices
CREATE TABLE invoices (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES users(id) ON DELETE CASCADE,
  client_id      UUID REFERENCES clients(id) ON DELETE SET NULL,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  status         VARCHAR(20) DEFAULT 'draft',
  issue_date     DATE DEFAULT CURRENT_DATE,
  due_date       DATE,
  currency       VARCHAR(10) DEFAULT 'KES',
  notes          TEXT,
  total          NUMERIC(12, 2) DEFAULT 0,
  created_at     TIMESTAMP DEFAULT NOW()
);

### invoice_items
CREATE TABLE invoice_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id  UUID REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity    NUMERIC(10, 2) NOT NULL,
  unit_price  NUMERIC(12, 2) NOT NULL
);
