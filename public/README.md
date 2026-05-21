# Jacques Cogal Portfolio

A public portfolio built as a working product rather than a static profile page. It combines a responsive React frontend, an AI assistant dock, GitHub-backed project evidence, certification verification, and a private retrieval backend that keeps the content grounded in source material.

Live site: [https://jacquescogal.github.io](https://jacquescogal.github.io)

## What It Shows

- **Software engineering profile** with focused sections for experience, projects, certifications, resume, and contact.
- **Jacques AI assistant** that can answer portfolio questions, stream response progress, suggest follow-up prompts, and deep-link visitors into relevant sections.
- **Pinned GitHub project archive** generated from public pinned repositories, including short summaries, tags, source links, and rendered README content.
- **Certification section** loaded from backend-managed certification data with verification links and active/expired status calculated at request time.
- **Achievement layer** stored in browser local storage, rewarding meaningful exploration such as opening source links, reading project READMEs, checking credentials, and using the assistant.

## Frontend

The frontend is a Vite + React app styled with Tailwind CSS and shadcn/Radix primitives. The interface is designed around a compact professional portfolio shell:

- Mobile-responsive layout with a sticky desktop assistant dock and a mobile sheet version.
- Markdown rendering for chat messages and project README archives.
- Scroll-aware project README modal with heading navigation.
- Assistant links that can navigate to portfolio sections, switch experience tabs, select certifications, or open a specific project README heading.
- Sonner-powered achievement notifications.
- GitHub Pages deployment through `gh-pages`.

## Backend Companion

The public repository contains the frontend. The assistant and dynamic portfolio data are powered by a private FastAPI backend. At a high level, that service provides:

- **Server-Sent Events chat streaming** so the UI can show request stages such as message receipt, retrieval, and response generation.
- **Retrieval-augmented answers** over portfolio knowledge stored in ChromaDB.
- **Pinned GitHub repository sync** using the GitHub GraphQL API.
- **SQLite project manifest** for fetched repository URL, title, README content, README SHA, enrichment, tags, and sync metadata.
- **Hash-gated vector updates** so embeddings are only regenerated when source content or derived directory documents change.
- **Certification directory indexing** from CSV-managed certification data.

The backend intentionally owns the expensive and stateful work: syncing source material, enriching summaries, maintaining vector documents, and streaming assistant responses. The frontend consumes stable HTTP/SSE endpoints and keeps the user experience simple.

## Project Evidence Flow

1. The backend fetches public pinned repositories from the GitHub profile.
2. For each pinned repository, it reads the README case-insensitively where supported, rewrites relative image paths to raw GitHub asset URLs, and stores the rendered markdown source.
3. README content is chunked by markdown headings and written to ChromaDB with repository and heading metadata.
4. A transient project directory document is built from the pinned project manifest, then hash-gated before vector upsert.
5. The frontend renders the resulting project cards and README archive.
6. The assistant can cite a project using a structured link such as a project URL plus heading slug, letting the UI open the relevant README section directly.

## Assistant Interaction

The assistant dock is built around evidence-first navigation:

- It streams backend-driven progress stages before and during response generation.
- It renders markdown safely with GitHub-flavored markdown support.
- It supports structured portfolio links for profile, experience, projects, certifications, resume, contact, external profiles, and specific project README headings.
- It caches suggested prompts until a new assistant message arrives.
- It avoids storing non-serializable React content in Redux; chat state remains plain data.

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- shadcn/Radix UI components
- Redux Toolkit
- React Markdown + remark-gfm
- Sonner
- Vitest + Testing Library
- FastAPI backend companion
- SQLite, ChromaDB, GitHub GraphQL, OpenAI APIs

## Local Development

Install dependencies:

```bash
npm install
```

Run the frontend locally:

```bash
npm run start
```

The development build reads `.env.development`, which should point API URLs at the local backend.

Run tests:

```bash
npm test
```

Create a production build:

```bash
npm run build
```

Deploy to GitHub Pages:

```bash
npm run deploy
```

The deploy script runs the production Vite build first, so `.env.production` can point the frontend to the hosted backend.

## Notes

This repository is the public frontend for the portfolio experience. Some backend implementation details, credentials, source data, and deployment configuration are intentionally kept private, while the public app still exposes the important product behavior through the live site.
