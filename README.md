# E-Kos (Indekos Ungu)

Boarding house (kos) management system with WhatsApp chatbot integration.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Bun |
| Frontend | Astro SSR + HTMX + DaisyUI 5 + Tailwind CSS 4 |
| Database | SQLite via Drizzle ORM |
| WhatsApp | Baileys (unofficial WhatsApp Web API) |
| PDF Reports | Puppeteer-core + Chromium |
| Payment Gateway | Duitku |
| Task Scheduler | Bun cron workers |
| Templates | Eta (WhatsApp messages) |
| Monorepo | Bun workspaces + pacwich |

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Astro Site  │────▶│   Database   │◀────│  Scheduler   │
│  (SSR+HTMX) │     │  (SQLite)    │     │  (3 workers) │
└──────┬──────┘     └──────┬───────┘     └──────────────┘
       │                   │
       ▼                   ▼
┌─────────────┐     ┌──────────────┐
│   Duitku     │     │  WhatsApp    │
│   Payment    │     │  Bot (Baileys)│
└─────────────┘     └──────────────┘
```

### Packages

| Package | Path | Purpose |
|---------|------|---------|
| `@indekos/site` | `site/` | Astro SSR frontend with HTMX interactivity |
| `@indekos/database` | `packages/database/` | Drizzle ORM schema, migrations, DB client |
| `@indekos/whatsapp-bot` | `packages/whatsapp-bot/` | WhatsApp chatbot with 7 commands |
| `@indekos/scheduler` | `packages/scheduler/` | Cron jobs: invoice generation, overdue check, reminders |
| `@indekos/utilities` | `packages/utilities/` | Shared utils: date formatting, logging, password hashing |

## Database Schema

10 tables: `users`, `tenants`, `rooms`, `leases`, `invoices`, `chatbot_messages`, `notifications`, `audit_logs`, `complaints`, `bot_auth`

See `packages/database/src/schema/` for full schema definitions.

## User Roles

| Role | Access |
|------|--------|
| `admin` | Account management only |
| `staff` | Rooms, tenants, complaints, transactions, notifications, logs |
| `owner` | Reports and logs only |
| `system` | Automated system actions (cron, bot) |

## Features

### Web Dashboard
- **Dashboard** — Stats overview, upcoming bills, recent complaints
- **Manage** — Accounts, rooms, tenants, complaints (CRUD + modals)
- **Reports** — Transactions, notifications with date filters
- **Logs** — Audit trail, chatbot conversation history
- **PDF Export** — 9 report types via Puppeteer (formal monochrome layout)
- **Invoice Pages** — Public digital receipt with payment link + PNG export

### WhatsApp Bot (7 commands)
| Command | Description |
|---------|-------------|
| `help` | Show available commands |
| `tagihan` | Check unpaid bills |
| `riwayat` | View payment history |
| `komplain [text]` | Submit complaint |
| `komplainku` | List recent complaints |
| `komplainku [id]` | View complaint detail |
| `info` | View tenant + room info |

Bot also polls every 30s to push: payment reminders, welcome messages, payment confirmations, complaint status updates.

### Scheduler (3 workers)
| Worker | Schedule (WITA) | Purpose |
|--------|----------------|---------|
| Invoice Generation | 08:00 daily | Create monthly rent invoices + Duitku payment links |
| Overdue Check | 00:00 daily | Mark unpaid invoices as overdue |
| Rent Reminder | 08:00 daily | Queue notifications for invoices due within 3 days |

### Payment Flow
1. Scheduler generates invoices with Duitku payment links
2. Tenant receives WhatsApp reminder with payment URL
3. Tenant pays via Duitku gateway
4. Duitku sends callback → system marks invoice as paid
5. Tenant receives WhatsApp payment confirmation

## Setup

### Prerequisites
- [Bun](https://bun.sh/) runtime
- Chromium browser (for PDF generation)
- Duitku sandbox account (for payment testing)

### Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Description | Example |
|----------|-------------|---------|
| `ADMIN_PASSWORD` | Default admin password | `admin` |
| `DATABASE_PATH` | SQLite database file path | `db.sqlite` |
| `CHROMIUM_PATH` | Path to Chromium binary | `/usr/bin/chromium` |
| `DUITKU_MERCHANT_CODE` | Duitku merchant code | (from sandbox) |
| `DUITKU_API_KEY` | Duitku API key | (from sandbox) |
| `DUITKU_BASE_URL` | Duitku API base URL | `https://api-sandbox.duitku.com` |
| `SITE_URL` | Site URL for callbacks | `http://localhost:4321` |

### Install & Run

```bash
# Install dependencies
bun install

# Setup database (push schema + seed)
bun run pretest

# Start development (all packages in parallel)
bun run dev
```

### WhatsApp Bot

```bash
# Login (scan QR code)
bun run wa:login

# Start bot
bun --cwd=packages/whatsapp-bot start

# Logout
bun run wa:logout
```

### Scheduler

```bash
# Trigger a worker manually
bun run scheduler:trigger overdue 2026-01-01
bun run scheduler:trigger invoice-generation 2026-01-01
bun run scheduler:trigger rent-reminder 2026-01-01
```

### Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start all packages in dev mode |
| `bun run build` | Build site for production |
| `bun run start` | Start all packages in production mode |
| `bun run check` | Typecheck all packages |
| `bun run test` | Run tests (creates test DB) |
| `bun run format` | Format code with Prettier |

## Project Structure

```
├── site/                          # Astro SSR frontend
│   └── src/
│       ├── layouts/               # Base, dashboard, report layouts
│       ├── pages/                 # Routes (file-based routing)
│       │   ├── api/duitku/        # Payment callback + redirect
│       │   ├── dashboard/         # Authenticated pages
│       │   │   ├── manage/        # CRUD: accounts, rooms, tenants, complaints
│       │   │   ├── report/        # Transaction + notification reports
│       │   │   └── log/           # Audit + chatbot logs
│       │   └── invoice/           # Public invoice view
│       ├── components/            # Reusable UI components
│       └── lib/                   # PDF generator, utilities
├── packages/
│   ├── database/                  # Drizzle schema + migrations
│   │   └── src/schema/            # Table definitions, relations, enums
│   ├── whatsapp-bot/              # Baileys WhatsApp bot
│   │   └── src/
│   │       ├── commands/          # 7 command handlers
│   │       ├── polls/             # Notification + complaint polling
│   │       └── templates/         # 17 Eta message templates
│   ├── scheduler/                 # Cron job workers
│   │   └── src/workers/           # 3 worker scripts
│   └── utilities/                 # Shared utilities
└── docs/                          # Documentation (Indonesian)
    ├── implementation.md          # System design document
    ├── report_plan.md             # PDF report implementation plan
    └── diagrams/                  # UML diagrams (PNG + PlantUML)
```

## Testing

```bash
# Run all tests
bun run test

# Run specific package tests
bun test --cwd=packages/whatsapp-bot
bun test --cwd=packages/scheduler
```

Tests use `bun:test` with transaction rollback for isolation.

## License

AGPL-3.0
