# Ajaia Docs — AI-Native Collaborative Document Editor

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15_App_Router-black.svg)](https://nextjs.org/)
[![TipTap](https://img.shields.io/badge/Editor-TipTap_ProseMirror-blueviolet.svg)](https://tiptap.dev/)
[![SQLite](https://img.shields.io/badge/Database-SQLite_Prisma-green.svg)](https://www.prisma.io/)
[![Vitest](https://img.shields.io/badge/Tests-Vitest-yellow.svg)](https://vitest.dev/)

> **A lightweight, high-performance collaborative document editor inspired by Google Docs.** Built for **Ajaia LLC**'s Full Stack Product Engineer evaluation by candidate **Tooba Baqai** (`toobabaqai1@gmail.com`).

---

## 🌟 Overview & Core Capabilities

Ajaia Docs delivers a focused, production-grade product slice of a modern document workspace:

1. **Rich-Text Document Creation & Editing (Google Docs UX)**:
   - Headings (H1, H2, H3, Normal Text), Bold, Italic, Underline, Strikethrough, Colors, Highlights.
   - Text Alignment (Left, Center, Right, Justify), Lists (Bulleted, Numbered, Checklist).
   - Code blocks, Blockquotes, Dividers, Links, and Image insertion.
   - Inline Title Renaming with autofocus & debounce auto-save.
   - Debounced Cloud Autosave (800ms) with visual status pill (`"Saved to cloud"`, `"Saving..."`, `"View only"`).
   - Live Word, Character, and Reading Time metrics.

2. **Universal File Ingestion & Export**:
   - **Import**: Drag-and-drop ingestion of `.docx` (Microsoft Word via `mammoth`), `.md` (Markdown), `.txt` (Plain Text), and `.html`.
   - Ingest as a brand new document or insert directly into an active draft.
   - **Export**: Instant export to Markdown (`.md`), HTML (`.html`), Plain text (`.txt`), and Print / Save to PDF.

3. **Granular Access Control & Sharing Model (RBAC)**:
   - **Document Owner**: Full permissions (edit, rename, delete, manage sharing, toggle link permissions).
   - **Collaborator (Editor)**: Can edit content and rename, but cannot delete or alter access rights.
   - **Collaborator (Viewer)**: Strict read-only enforcement (toolbar disabled, canvas locked, warning banner).
   - Share modal with email invitation, role elevation/demotion, access revocation, and public link toggling.
   - Clear dashboard separation: **All Documents**, **Created by Me**, and **Shared with Me**.

4. **Frictionless Simulated Persona Switcher**:
   - Built-in multi-user switcher in the top navigation allows reviewers to instantly switch between pre-seeded personas (**Tooba Baqai**, **Alex Rivera**, **Jordan Lee**, **Sam Taylor**) or log in as any custom email without setting up OAuth keys or email servers.

5. **Persistence & Version Snapshots**:
   - Relational SQLite database with Prisma ORM (`User`, `Document`, `DocumentShare`, `DocumentRevision`, `Attachment`).
   - Version history modal to browse past snapshots, create named versions, and restore earlier revisions with automatic safety backups.

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher

### Installation Steps

```bash
# 1. Navigate to the project root
cd ajaia-docs

# 2. Install dependencies
npm install

# 3. Initialize & seed the SQLite database with test users & sample docs
npx prisma generate
npx prisma db push
npm run db:seed

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Testing Suite

We use **Vitest** and **React Testing Library** for automated unit and integration tests:

```bash
# Run all automated tests
npm test
```

### Test Coverage Highlights
- **Access Control & Permissions**: Validates `resolveUserRole`, `canUserEdit`, `canUserManage`, and `canUserView` across Owner, Editor, Viewer, and unauthenticated public states.
- **File Parsing & Ingestion**: Validates Markdown AST conversion, plaintext escaping, HTML-to-Markdown serialization, and whitespace normalization.

---

## 👥 Seeded Reviewer Accounts

Use the **Persona Switcher** in the top-right navbar to test sharing and access boundaries:

| Name | Email | Default Role in Sample Docs | Notes |
| :--- | :--- | :--- | :--- |
| **Tooba Baqai** | `toobabaqai1@gmail.com` | Primary Owner / Candidate | Owns Architecture Spec, Editor on Roadmap |
| **Alex Rivera** | `alex@ajaia.io` | Engineering Lead | Owns Q3 Roadmap, Editor on Architecture Spec |
| **Jordan Lee** | `jordan@ajaia.io` | Product Designer | Owns Design Guidelines, Viewer on Architecture Spec |
| **Sam Taylor** | `sam@ajaia.io` | QA / Security Reviewer | Test user for custom invite scenarios |

---

## 🚢 Deployment Guide

This application is built with standard Next.js App Router and can be deployed in minutes to:

### Option A: Vercel (Recommended)
1. Push repository to GitHub.
2. Import repository into [Vercel](https://vercel.com).
3. Set Build Command to: `prisma generate && next build`
4. Deploy! (For persistent serverless SQLite, connect Turso or PostgreSQL with zero schema changes).

### Option B: Docker / Node Server
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📂 Project Structure

```
ajaia-docs/
├── prisma/
│   ├── schema.prisma            # SQLite database schema (Users, Documents, Shares, Revisions)
│   └── seed.ts                  # Comprehensive database seeder
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── documents/       # Document CRUD, Revisions, Share, & File Ingestion APIs
│   │   │   ├── users/           # User lookup & creation
│   │   ├── doc/[id]/page.tsx    # Google Docs-inspired document editor page
│   │   ├── layout.tsx           # App layout with AuthProvider & theme
│   │   └── page.tsx             # Main dashboard (Templates, Search, Filters, Grid)
│   ├── components/
│   │   ├── editor/              # EditorCanvas, EditorToolbar, EditorHeader, VersionHistory
│   │   ├── sharing/             # ShareModal, CollaboratorList
│   │   ├── upload/              # FileUploadModal (drag-drop, parser preview)
│   │   └── dashboard/           # DocumentCard, DocumentList, TemplateSelector, UserSwitcher
│   ├── lib/
│   │   ├── db.ts                # Prisma client singleton
│   │   ├── auth-context.tsx     # Persona auth context
│   │   ├── file-parsers.ts      # Mammoth, marked, turndown parser engine
│   │   ├── permissions.ts       # RBAC role resolution algorithm
│   │   ├── seed-users.ts        # Test persona definitions
│   │   └── templates.ts         # Starter templates (PRD, Sync, RFC, Blank)
│   └── tests/                   # Automated Vitest test suites
├── README.md                    # Setup & documentation
├── ARCHITECTURE.md              # Technical architecture & tradeoffs
├── AI_WORKFLOW.md               # AI-native workflow & verification note
├── SUBMISSION.md                # Submission manifest & reviewer guide
└── WALKTHROUGH.md               # 3-5 min video walkthrough script
```
view deployed project 
https://ajaia-docs-lfut.vercel.app/
