# Submission Manifest & Reviewer Evaluation Guide

**Candidate:** Tooba Baqai  
**Email:** `toobabaqai1@gmail.com`  
**Role:** AI-Native Full Stack Product Engineer  
**Company:** Ajaia LLC  
**Assignment:** Collaborative Document Workspace  
**Date of Submission:** August 12, 2026

---

## 📦 What is Included in this Submission

| File / Resource | Description |
| :--- | :--- |
| **`src/` & `prisma/`** | Complete full-stack Next.js TypeScript application code and database schema. |
| **[`README.md`](./README.md)** | Local setup, run instructions, testing guide, and deployment instructions. |
| **[`ARCHITECTURE.md`](./ARCHITECTURE.md)** | Deep architectural note covering data schema, RBAC model, file ingestion pipeline, and tradeoff evaluations. |
| **[`AI_WORKFLOW.md`](./AI_WORKFLOW.md)** | Transparent AI-native engineering note detailing tool usage, speedups, rejected suggestions, and verification protocol. |
| **[`SUBMISSION.md`](./SUBMISSION.md)** | This document: Deliverable manifest, test accounts, live test matrix, and video script. |
| **[`WALKTHROUGH.md`](./WALKTHROUGH.md)** | Step-by-step 3-5 minute walkthrough video script and test scenarios for reviewers. |
| **Automated Tests** | Vitest unit test suite covering access control gates (`permissions.test.ts`) and file parsing (`file-parsers.test.ts`). |

---

## 🧪 Seeded Test Accounts (Instant Persona Switcher)

To make evaluation frictionless, Ajaia Docs includes a **One-Click Persona Switcher** in the top navigation bar:

1. **Tooba Baqai** (`toobabaqai1@gmail.com`) — *Candidate / Primary Owner*
   - Owns *"Ajaia Collaborative Editor - Architecture & Engineering Spec"*.
   - Can edit, share, rename, delete, and restore snapshots.
2. **Alex Rivera** (`alex@ajaia.io`) — *Engineering Lead*
   - Owns *"Q3 Engineering Roadmap & Team Objectives"*.
   - Collaborates as **Editor** on Tooba's Architecture Spec.
3. **Jordan Lee** (`jordan@ajaia.io`) — *Product Designer*
   - Owns *"Design System & UX Foundations"*.
   - Has **Viewer (Read-Only)** access on Tooba's Architecture Spec (test read-only toolbar lock & banner).
4. **Sam Taylor** (`sam@ajaia.io`) — *Security / QA Reviewer*
   - Uninvited reviewer account for testing custom invite & link sharing flows.

> [!TIP]
> You can also click **"Sign in as Custom Email"** in the persona menu to test arbitrary email invitations dynamically!

---

## 🔍 Core Feature Audit & Compliance Matrix

### 1. Document Creation & Editing (Google Docs UX)
- **Status:** **100% Complete & Verified**
- **Capabilities:**
  - Create blank document or pick from 4 pre-built templates (*Product Spec*, *Weekly Sync*, *Technical RFC*, *Blank*).
  - Inline Title editing with auto-focus and debounce save.
  - Headings (H1, H2, H3, Normal Text), Bold, Italic, Underline, Strikethrough, Colors, Highlights, Alignments, Bullet/Numbered/Task checklists, Code blocks, Blockquotes, Dividers, Links, Images.
  - Debounced Cloud Autosave (800ms) with visual status badge (`"All changes saved to cloud"`).
  - Word count, character count, and reading time status bar.

### 2. File Upload & Ingestion
- **Status:** **100% Complete & Verified**
- **Capabilities:**
  - Drag-and-drop file ingestion supporting `.docx` (Microsoft Word via `mammoth`), `.md` (Markdown via `marked`), `.txt` (Plain text), and `.html`.
  - Ingest as a **brand new document** or **insert into active document**.
  - Formats validated and parsed with snippet preview before ingestion.

### 3. Sharing & Access Control (RBAC)
- **Status:** **100% Complete & Verified**
- **Capabilities:**
  - Distinct roles: `OWNER`, `EDITOR`, `VIEWER`.
  - Share modal to invite users by email, toggle roles, or revoke access.
  - Public link sharing toggle (`Restricted` vs `Anyone with link`).
  - Clear dashboard separation: *All Documents*, *Created by Me*, and *Shared with Me*.
  - Strict read-only enforcement when in Viewer role (disabled toolbar, locked canvas, view-only banner).

### 4. Persistence & Version History
- **Status:** **100% Complete & Verified**
- **Capabilities:**
  - Relational SQLite schema with foreign keys and cascade deletions.
  - Data preserved across browser refreshes and tab restarts.
  - Version history drawer with snapshot creation and instant rollback.

### 5. Export Capabilities (Bonus Feature)
- **Status:** **100% Complete & Verified**
- **Capabilities:**
  - Export to Markdown (`.md`), HTML (`.html`), Plain text (`.txt`), and Print to PDF.

---

## ⏱️ What Would Be Built Next (With Another 2–4 Hours)

1. **Real-time Collaborative Cursors (Yjs + WebSockets)**:
   - Streaming live cursor presence and character-by-character conflict-free replication across concurrent browser tabs.
2. **Inline Comments & Suggestion Mode**:
   - Highlighting text ranges and attaching threaded discussion cards in the right margin.
3. **Cloud S3 Asset Storage**:
   - Integrating AWS S3 or Cloudflare R2 presigned URLs for uploading multi-megabyte media attachments.
