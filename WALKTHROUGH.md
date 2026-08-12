# Product Walkthrough Video Script & Verification Matrix

**Candidate:** Tooba Baqai (`toobabaqai1@gmail.com`)  
**Role:** AI-Native Full Stack Product Engineer  
**Company:** Ajaia LLC  
**Product:** Ajaia Docs Collaborative Workspace  
**Target Video Length:** 3–5 Minutes

---

## 🎬 3–5 Minute Video Walkthrough Script

### **Segment 1: Introduction & Architecture Overview (0:00 – 0:45)**
> *"Hi everyone, my name is Tooba Baqai. Today, I'm presenting Ajaia Docs, a lightweight collaborative document editor built for Ajaia LLC.*  
> *Rather than building a shallow MVP, I focused on shipping a high-depth, production-quality product slice: a Google Docs-inspired rich-text engine built on TipTap and ProseMirror, a multi-format file ingestion pipeline that parses Word docs and Markdown into live drafts, and a strict role-based access control system with simulated persona testing.*  
> *Let’s dive right into the live application."*

---

### **Segment 2: Document Creation, Templates & Rich-Text Editing (0:45 – 1:45)**
> *"Starting on the main dashboard, we have quick-start templates like Product Spec, Weekly Team Sync, Technical RFC, or a clean Blank Document.*  
> *Let's open our seeded document: 'Ajaia Collaborative Editor - Architecture & Engineering Spec'.*  
> *Notice the paper canvas design, styled with authentic Google Docs dimensions, drop shadows, and typography.*  
> *We have a comprehensive formatting toolbar: Headings 1 through 3, character styles with Bold, Italic, Underline, and Strikethrough, custom text colors and highlights, text alignment, and interactive task checklists.*  
> *As I type, notice the 800ms debounced autosave in the header transitioning smoothly from 'Saving to cloud...' to 'All changes saved to cloud'. If I refresh the browser, 100% of my formatting and content is preserved."*

---

### **Segment 3: File Upload & Multi-Format Ingestion (1:45 – 2:30)**
> *"Next, let's explore File Ingestion. In real product environments, teams frequently migrate content from existing files.*  
> *I can click 'Import File' or use drag-and-drop. The app accepts Microsoft Word .docx files, Markdown .md files, and plain text .txt files.*  
> *When I drop in a markdown or docx file, our server-side engine parses the AST, extracts clean HTML, and displays a content preview.*  
> *I can either ingest it as a brand new document with the title auto-populated, or insert it directly into my current document. Let's create a new document from it — and instantly we have an editable rich-text draft."*

---

### **Segment 4: Sharing & Granular Access Control (2:30 – 3:30)**
> *"Now let's examine our sharing and permissions model.*  
> *Currently, I am logged in as Tooba, the Owner of this document. When I click the blue 'Share' button, I can invite collaborators by email and choose between 'Editor' or 'Viewer' roles, or toggle public link access.*  
> *Let's see access control in action using our Persona Switcher in the top navbar.*  
> *I'll switch to Jordan Lee, who has been granted View-Only access to this document.*  
> *Notice what happens immediately: The toolbar disables, editing is locked on the canvas, and a clear warning banner alerts Jordan that they have View-Only access.*  
> *If I switch to Alex Rivera, who is an Editor, Alex has full editing access but cannot delete the document or revoke the owner's permissions.*  
> *This deterministic access logic is enforced at both the API layer and the UI layer."*

---

### **Segment 5: Persistence, Version History & AI Workflow (3:30 – 4:30)**
> *"Ajaia Docs also includes version history snapshots. Clicking the History icon opens a timeline of previous revisions, allowing reviewers to preview past states and restore any snapshot with automatic safety backups.*  
> *We also provide a full export suite: Exporting to Markdown (.md), HTML (.html), Plain Text (.txt), or instant Print / Save as PDF.*  
> *Finally, regarding my AI-native engineering workflow: I leveraged DeepMind Antigravity AI to accelerate TipTap boilerplate, schema modeling, and automated test authoring. However, I applied human engineering judgment to reject fragile WebSocket setups in favor of reliable autosave, and refactored permissions into a testable pure function with automated Vitest coverage.*  
> *Thank you for your time and evaluation!"*

---

## 📋 Reviewer Self-Service Verification Matrix

Follow these step-by-step actions in your local or deployed environment:

| Step | Action to Test | Expected Result |
| :--- | :--- | :--- |
| **1** | Open Dashboard at `http://localhost:3000` | Pre-seeded documents appear with Owner tags, timestamps, and template selector. |
| **2** | Click **"Product Specification (PRD)"** template | A new PRD document is instantly created and loaded into the rich text editor. |
| **3** | Type text, select text, and apply **Bold**, **Highlight**, and **Heading 2** | Text reflects formatting immediately; status pill shows `"Saving..."` then `"All changes saved"`. |
| **4** | Refresh browser (`F5` / `Cmd+R`) | Document reloads instantly with title and formatting intact. |
| **5** | Click **"Share"** button & invite `sam@ajaia.io` as **Viewer** | Sam is added to collaborator list; share count badge increments. |
| **6** | Use top navbar **Persona Switcher** -> Switch to **Jordan Lee** | Persona switches to Jordan. Opening Tooba's Architecture Spec shows read-only banner & disabled toolbar. |
| **7** | Click **"Import File"** -> upload a `.md` or `.docx` file | File format is parsed and previewed; clicking "Create Document" creates editable draft. |
| **8** | Click **"Export"** -> **"Export as Markdown"** | A clean `.md` file is downloaded to your machine. |
| **9** | Open terminal & run `npm test` | All Vitest automated unit tests pass with 100% success. |
