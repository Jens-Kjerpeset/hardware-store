# Hardware Store v2

A full-stack Next.js 16 e-commerce application demonstrating serverless architecture, edge computing, and complex state management.

## Key Features

* **Dual-Mode Cart System (Zustand):** Supports transitioning between an unstructured cart and a constrained PC Builder mode.
* **Component Compatibility Logic:** Algorithmic validation for CPU sockets, memory types, form factors, and power supply constraints.
* **Serverless SQL (LibSQL/Turso):** Prisma configuration handling structured data and nested JSON attribute querying.
* **Edge Open Graph Generation (`next/og`):** Dynamic generation of shareable build images using the Vercel edge network.
* **Automated Testing:** Jest unit tests for pricing/compatibility engines and Playwright E2E suites for checkout workflows.
* **Automated Resets:** Scheduled GitHub Actions workflow for daily database state resets.

## Technology Stack

* **Framework:** Next.js 16 (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **State Management:** Zustand
* **Database:** Turso (LibSQL)
* **ORM:** Prisma
* **Testing:** Playwright (E2E), Jest (Unit)

## Local Development

Ensure Node.js v20+ is installed and your `.env` contains the required `DATABASE_URL` and `TURSO_AUTH_TOKEN`.

```bash
# Install dependencies
npm install

# Generate Prisma Client & push schema
npx prisma generate
npx prisma db push

# Seed the database
npx tsx prisma/seed.ts

# Start the dev server
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Testing

```bash
# Run unit tests (Zustand logic & pricing arithmetic)
npm run test:unit

# Run end-to-end browser checkout verification
npm run test:e2e
```

## Architecture Directives
This repository prioritizes strict React Server Components (RSC) defaults, semantic variable naming, and the Single Responsibility Principle over inline utility classes or monolithic files.
