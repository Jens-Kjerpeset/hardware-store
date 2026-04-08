# Hardware Store v2

A full-stack Next.js 16 e-commerce application demonstrating serverless architecture, edge computing, and complex state management.

**[🌐 View Live Demonstration](https://hardware-store-v2-demo.vercel.app)** *(Replace with actual URL if different)*

## Key Features

* **Dual-Mode Cart System (Zustand):** Supports transitioning between an unstructured cart and a constrained PC Builder mode.
* **Component Compatibility Logic:** Algorithmic validation for CPU sockets, memory types, form factors, and power supply constraints.
* **Serverless SQL (LibSQL/Turso):** Prisma configuration handling structured data and nested JSON attribute querying.
* **Edge Open Graph Generation (`next/og`):** Dynamic generation of shareable build images using the Vercel edge network.
* **Automated Testing:** Jest unit tests for pricing/compatibility engines and Playwright E2E suites for checkout workflows.
* **Automated Resets:** Scheduled GitHub Actions workflow for daily database state resets, securing the demonstration environment.

## Technology Stack

* **Framework:** Next.js 16 (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **State Management:** Zustand
* **Database:** Turso (LibSQL)
* **ORM:** Prisma
* **Testing:** Playwright (E2E), Jest (Unit)

## Architecture Directives
This repository prioritizes strict React Server Components (RSC) defaults, semantic variable naming, and the Single Responsibility Principle over inline utility classes or monolithic files.
