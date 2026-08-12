# AI-Native Workflow & Engineering Note

**Candidate:** Tooba Baqai (`toobabaqai1@gmail.com`)  
**Role:** AI-Native Full Stack Product Engineer  
**Project:** Ajaia Docs  
**Date:** August 2026

---

## 1. AI Tools Utilized

During the development of Ajaia Docs, AI tools were leveraged as an intelligent pair-programming collaborator:
- **Google DeepMind Antigravity AI Engine & Gemini 3.6 Flash / Claude 3.5 Sonnet**: Used for full-stack architectural design, rapid boilerplate scaffolding, API schema formulation, and automated test suite authoring.
- **AI-Assisted Code Refactoring & Typings**: Used to streamline TipTap extension integration and TypeScript interface definitions.

---

## 2. Where AI Materially Accelerated Delivery

AI was instrumental in compressing what would typically be a 2–3 day build into a tightly focused 4-hour delivery:

1. **Rich-Text Ecosystem Integration**:
   - Integrating TipTap extensions (headings, text align, colors, highlights, task lists, links, images) involves substantial boilerplate. AI rapidly scaffolded the complete extension array and toolbar action bindings.
2. **Universal File Parsing Engine**:
   - AI helped structure the multipart form data handlers and conversion logic across `mammoth` (Word docx), `marked` (Markdown AST), and `turndown` (HTML to markdown serialization).
3. **Comprehensive Automated Test Matrix**:
   - AI accelerated the generation of unit tests for access control and file parsing, covering edge cases like HTML entity escaping, unauthenticated visitors, and role hierarchies.
4. **Realistic Mock Data & Seeding**:
   - Generating rich, realistic starter documents (PRD, Technical RFC, Meeting Notes, Design Guidelines) that immediately show off the product’s formatting capabilities.

---

## 3. What AI-Generated Output was Changed or Rejected

True AI-native engineering requires rigorous human judgment to filter out suboptimal or overengineered AI suggestions:

1. **Rejected Raw `contenteditable` / Basic Textarea Approaches**:
   - Initial AI suggestions proposed using a raw `contenteditable` div or simple markdown textarea. I rejected this because raw DOM editing leads to inconsistent browser HTML, broken cursor positions, and messy undo stacks. I directed the architecture to use **TipTap / ProseMirror**, ensuring a rock-solid Abstract Syntax Tree (AST).
2. **Rejected Fragile WebSocket Signaling in Favor of Robust Autosave**:
   - AI initially proposed setting up a full WebSocket server for real-time collaboration. I recognized that WebSocket connections without a dedicated persistent infrastructure would create deployment fragility for reviewers on serverless platforms (e.g., Vercel). I replaced this with an 800ms debounced autosave protocol and a persona switcher, ensuring 100% reliability.
3. **Refactored Naive Route-Level Permission Checks into Centralized Pure Functions**:
   - AI initially generated duplicate permission checks across individual API route files. I extracted this into a single, pure `resolveUserRole` utility in `src/lib/permissions.ts`, making the access control logic fully testable in isolation via Vitest.
4. **Refined UI Aesthetics & Page Margins**:
   - Standard AI UI generation often outputs generic Tailwind gray cards. I customized the canvas styling with realistic Google Docs paper margins, drop shadows (`0 1px 3px 0 rgba(60, 64, 67, 0.3)`), dark mode contrast tokens, and linear-grade typography.

---

## 4. Verification & Reliability Protocol

To guarantee that the shipped product meets high engineering standards:
1. **Automated Verification**:
   - Executed automated unit tests (`npm test`) covering permission gates, role resolution, file parsers, and HTML cleaners.
2. **End-to-End Persona Verification**:
   - Manually tested user flows across all 4 seeded accounts:
     - Verified that **Tooba** can edit owned docs and invite **Jordan** as a Viewer.
     - Verified that switching to **Jordan** disables the toolbar, locks the editor, and shows the View-Only banner.
     - Verified that switching to **Alex** allows editing shared documents.
3. **File Ingestion Verification**:
   - Tested drag-and-drop ingestion of markdown files with complex nested lists and verified that HTML formatting renders identically.
4. **Persistence & Refresh Resilience**:
   - Verified that autosaved content, renamed titles, and shared permissions survive page reloads and browser restarts without data loss.
