# Hardware Store v2 💻

A performant, full-stack Next.js 16 e-commerce application demonstrating modern serverless architecture, edge computing, and complex state management.

## 🌟 Key Features

* **Dual-Mode Cart System (Zustand):** Seamlessly transition between buying "Loose Parts" and utilizing the strict "PC Builder" engine.
* **Algorithmic Compatibility Checks:** Instant, strict validation comparing CPU sockets, memory types, form factors, and power supply wattage constraints.
* **Serverless SQL (LibSQL/Turso):** Highly concurrent database schema powered by Prisma handling nested JSON specification attributes.
* **Edge Open Graph Generation (`next/og`):** Share your cart dynamically! Vercel's edge network instantly generates customized visual image tags of your current build parameters for social sharing.
* **Tested & Hardened:** Secured via Jest automated unit tests for business arithmetic and Playwright E2E suites for verifying the stripe checkout flows.
* **Secure Nightly Resets:** GitHub Actions automatically wipes and re-seeds the demonstration environment every night.

## 🚀 Tech Stack

* **Framework:** Next.js 16 (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **State Management:** Zustand
* **Database:** Turso (LibSQL)
* **ORM:** Prisma
* **Testing:** Playwright (E2E), Jest (Unit)
* **Hosting:** Vercel

## 🛠 Local Development

First, ensure you have the correct Node version installed (`v20` recommended) and your `.env` configured with your `DATABASE_URL` and `TURSO_AUTH_TOKEN`.

```bash
# Install dependencies
npm install

# Generate Prisma Client & push schema
npx prisma generate
npx prisma db push

# Seed the database with default Hardware
npx tsx prisma/seed.ts

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 🧪 Testing

To ensure the algorithmic boundaries and checkout pipelines remain secure:

```bash
# Run unit tests (Zustand compatibility math & pricing logic)
npm run test:unit

# Run full end-to-end browser checkout verification
npm run test:e2e
```

## 📜 Architecture Directives
This repository strictly abides by human-first readability standards (no god-objects, localized state mutations, semantic naming, and Next.js server component defaults).
