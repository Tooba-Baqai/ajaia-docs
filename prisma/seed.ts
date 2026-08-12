import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Ajaia Docs database...');

  // 1. Clean existing records
  await prisma.attachment.deleteMany();
  await prisma.documentRevision.deleteMany();
  await prisma.documentShare.deleteMany();
  await prisma.document.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users
  const tooba = await prisma.user.create({
    data: {
      id: 'user_tooba',
      name: 'Tooba Baqai',
      email: 'toobabaqai1@gmail.com',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tooba&backgroundColor=b6e3f4',
      role: 'Candidate / Full Stack Engineer',
    },
  });

  const alex = await prisma.user.create({
    data: {
      id: 'user_alex',
      name: 'Alex Rivera',
      email: 'alex@ajaia.io',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=ffd5dc',
      role: 'Engineering Lead',
    },
  });

  const jordan = await prisma.user.create({
    data: {
      id: 'user_jordan',
      name: 'Jordan Lee',
      email: 'jordan@ajaia.io',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan&backgroundColor=c0aede',
      role: 'Product Designer',
    },
  });

  const sam = await prisma.user.create({
    data: {
      id: 'user_sam',
      name: 'Sam Taylor',
      email: 'sam@ajaia.io',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam&backgroundColor=d1d4f9',
      role: 'Security Reviewer',
    },
  });

  console.log('Created seeded users: Tooba, Alex, Jordan, Sam');

  // 3. Create Sample Documents

  // Doc 1: Owned by Tooba, Shared with Alex (Editor) and Jordan (Viewer)
  const doc1 = await prisma.document.create({
    data: {
      id: 'doc_product_architecture',
      title: 'Ajaia Collaborative Editor - Architecture & Engineering Spec',
      ownerId: tooba.id,
      isPublic: true,
      publicRole: 'VIEWER',
      plainText:
        'Ajaia Collaborative Editor technical architecture, role-based access control, file ingestion pipelines, and SQLite persistence.',
      content: `
<h1>Ajaia Collaborative Editor - Architecture &amp; Engineering Spec</h1>
<p><strong>Candidate:</strong> Tooba Baqai (toobabaqai1@gmail.com) &nbsp;|&nbsp; <strong>Role:</strong> AI-Native Full Stack Product Engineer</p>
<p><strong>Status:</strong> <mark>Production Ready</mark> &nbsp;|&nbsp; <strong>Version:</strong> 1.0.0</p>
<hr />
<h2>1. Executive Summary &amp; Product Vision</h2>
<p>Ajaia Docs is a modern, lightweight collaborative document workspace inspired by Google Docs. It demonstrates robust full-stack execution across <strong>rich-text WYSIWYG editing</strong>, <strong>multi-format file ingestion (.docx, .md, .txt)</strong>, <strong>granular permission sharing</strong>, and <strong>zero-latency persistence</strong>.</p>

<h2>2. Core Architectural Pillars</h2>
<ol>
  <li><strong>Headless Rich-Text Engine:</strong> Built on TipTap and ProseMirror, providing a predictable document schema, structured AST, and flawless serialization.</li>
  <li><strong>Deterministic Access Control (RBAC):</strong> Strict permission enforcement (<code>OWNER</code>, <code>EDITOR</code>, <code>VIEWER</code>) evaluated at both API route middleware and UI canvas layer.</li>
  <li><strong>Universal File Ingestion:</strong> Ingestion pipeline transforming binary Word documents (<code>mammoth</code>), Markdown (<code>marked</code>), and plaintext into structured HTML.</li>
  <li><strong>Simulated Persona Authentication:</strong> Frictionless testing interface allowing reviewers to switch between candidate, team lead, and guest reviewers with one click.</li>
</ol>

<h2>3. Key User Flows &amp; Capabilities</h2>
<ul data-type="taskList">
  <li data-checked="true" data-type="taskItem"><label><input type="checkbox" checked="checked"><span></span></label><div><p>Document creation, auto-save, and inline title renaming</p></div></li>
  <li data-checked="true" data-type="taskItem"><label><input type="checkbox" checked="checked"><span></span></label><div><p>Rich text formatting: Bold, Italic, Underline, Lists, Alignments, Colors</p></div></li>
  <li data-checked="true" data-type="taskItem"><label><input type="checkbox" checked="checked"><span></span></label><div><p>File upload modal with format preview and direct document conversion</p></div></li>
  <li data-checked="true" data-type="taskItem"><label><input type="checkbox" checked="checked"><span></span></label><div><p>Granular sharing dialog with email lookup, role toggling, and link sharing</p></div></li>
  <li data-checked="true" data-type="taskItem"><label><input type="checkbox" checked="checked"><span></span></label><div><p>Version history snapshots and instant rollback restoration</p></div></li>
</ul>

<blockquote>
  <p><strong>Reviewer Note:</strong> Use the persona switcher in the top navigation bar to test shared vs owned states across users.</p>
</blockquote>
      `.trim(),
      shares: {
        create: [
          { userId: alex.id, role: 'EDITOR' },
          { userId: jordan.id, role: 'VIEWER' },
        ],
      },
      revisions: {
        create: [
          {
            title: 'Ajaia Collaborative Editor - Architecture & Engineering Spec',
            content: '<h1>Initial Draft</h1><p>Drafting architecture spec.</p>',
            summary: 'Initial revision creation',
            savedById: tooba.id,
          },
          {
            title: 'Ajaia Collaborative Editor - Architecture & Engineering Spec',
            content: '<h1>Ajaia Architecture Spec v1</h1><p>Added RBAC details.</p>',
            summary: 'Added permission matrix',
            savedById: tooba.id,
          },
        ],
      },
    },
  });

  // Doc 2: Owned by Alex Rivera, Shared with Tooba (Editor)
  const doc2 = await prisma.document.create({
    data: {
      id: 'doc_team_roadmap',
      title: 'Q3 Engineering Roadmap & Team Objectives',
      ownerId: alex.id,
      isPublic: false,
      plainText:
        'Q3 engineering roadmap covering core productivity tools, document collaboration, and AI integrations.',
      content: `
<h1>Q3 Engineering Roadmap &amp; Objectives</h1>
<p><strong>Owner:</strong> Alex Rivera (Engineering Lead) &nbsp;|&nbsp; <strong>Confidentiality:</strong> Internal Only</p>
<hr />
<h2>Key Milestones</h2>
<ul>
  <li><strong>Sprint 1-2:</strong> Core Editor Foundation &amp; Autosave Protocol.</li>
  <li><strong>Sprint 3-4:</strong> File Upload and Multi-format Parser integration (.docx, .md).</li>
  <li><strong>Sprint 5-6:</strong> Access Control, Link Sharing, and Version Snapshotting.</li>
</ul>
<h2>Immediate Action Items for Candidate (Tooba)</h2>
<p>Tooba is leading the full stack implementation of Ajaia Docs. Review the candidate build and evaluate architecture clarity, testing coverage, and UX responsiveness.</p>
      `.trim(),
      shares: {
        create: [{ userId: tooba.id, role: 'EDITOR' }],
      },
      revisions: {
        create: [
          {
            title: 'Q3 Engineering Roadmap & Team Objectives',
            content: '<h1>Q3 Roadmap</h1><p>Planning sprint tasks.</p>',
            summary: 'Alex initial roadmap draft',
            savedById: alex.id,
          },
        ],
      },
    },
  });

  // Doc 3: Owned by Jordan Lee, Shared with Tooba (VIEWER)
  const doc3 = await prisma.document.create({
    data: {
      id: 'doc_design_guidelines',
      title: 'Design System & UX Foundations (View Only Demo)',
      ownerId: jordan.id,
      isPublic: false,
      plainText:
        'Design guidelines for document editor typography, paper layout canvas, and color contrast tokens.',
      content: `
<h1>Design System &amp; UX Foundations</h1>
<p><strong>Author:</strong> Jordan Lee (Product Designer) &nbsp;|&nbsp; <strong>Access Mode:</strong> <mark>View-Only for Tooba</mark></p>
<hr />
<h2>Typography &amp; Spacing Tokens</h2>
<p>This document is shared with Tooba as a <strong>VIEWER</strong>. Notice that editing is disabled, the toolbar is locked, and a view-only warning banner is displayed above.</p>
<ul>
  <li><strong>Canvas Color:</strong> #f8f9fa in light mode, #121316 in dark mode.</li>
  <li><strong>Paper Canvas:</strong> Centered A4 ratio with subtle drop shadow (0 1px 3px rgba(60,64,67,0.3)).</li>
  <li><strong>Font Stack:</strong> Inter, Merriweather, JetBrains Mono.</li>
</ul>
      `.trim(),
      shares: {
        create: [{ userId: tooba.id, role: 'VIEWER' }],
      },
    },
  });

  console.log('Seeded sample documents successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
