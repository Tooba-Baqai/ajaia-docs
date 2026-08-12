export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  badge?: string;
  defaultTitle: string;
  content: string;
}

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'blank',
    name: 'Blank Document',
    description: 'Start completely from scratch with a clean slate.',
    icon: 'FileText',
    defaultTitle: 'Untitled document',
    content: '<p>Start typing your document here...</p>',
  },
  {
    id: 'prd',
    name: 'Product Specification (PRD)',
    description: 'Structure feature goals, user stories, architecture, and milestones.',
    icon: 'Sparkles',
    badge: 'Popular',
    defaultTitle: 'PRD: Real-time Collaboration Engine',
    content: `
<h1>PRD: Real-time Collaboration Engine</h1>
<p><strong>Author:</strong> Tooba Baqai (Product Engineer) &nbsp;|&nbsp; <strong>Date:</strong> August 2026 &nbsp;|&nbsp; <strong>Status:</strong> In Review</p>
<hr />
<h2>1. Problem Statement &amp; Objective</h2>
<p>Distributed engineering teams require low-latency, conflict-free collaborative editing with clear access boundaries and instantaneous file import workflows.</p>
<h2>2. Target Personas</h2>
<ul>
  <li><strong>Document Owners:</strong> Lead engineers creating technical specifications and managing reviewer permissions.</li>
  <li><strong>Collaborating Editors:</strong> Teammates contributing sections, editing drafts, and importing research docs.</li>
  <li><strong>Stakeholder Viewers:</strong> Executive and client reviewers needing read-only verification.</li>
</ul>
<h2>3. Key Functional Requirements</h2>
<ol>
  <li><strong>Rich Text Editing:</strong> Full WYSIWYG capabilities with headings, lists, alignment, and formatting.</li>
  <li><strong>Granular Sharing:</strong> Role-based access control (Owner, Editor, Viewer).</li>
  <li><strong>Multi-Format Ingestion:</strong> Ingest .docx, .md, and .txt files directly into live editable drafts.</li>
  <li><strong>Autosave &amp; Persistence:</strong> Debounced autosave with visual status indicators.</li>
</ol>
<blockquote><p><strong>Success Metric:</strong> 100% document integrity across browser reloads and zero unauthorized edits.</p></blockquote>
    `.trim(),
  },
  {
    id: 'meeting-notes',
    name: 'Weekly Team Sync',
    description: 'Capture agenda, attendees, discussion points, and action items.',
    icon: 'Users',
    defaultTitle: 'Weekly Team Sync - Sprint Planning',
    content: `
<h1>Weekly Team Sync &amp; Sprint Review</h1>
<p><strong>Date:</strong> August 12, 2026 &nbsp;|&nbsp; <strong>Facilitator:</strong> Alex Rivera</p>
<hr />
<h2>Attendees</h2>
<ul>
  <li>Alex Rivera (Team Lead)</li>
  <li>Tooba Baqai (Full Stack Product Engineer)</li>
  <li>Jordan Lee (Product Designer)</li>
  <li>Sam Taylor (Technical Reviewer)</li>
</ul>
<h2>Agenda &amp; Discussion</h2>
<ol>
  <li><strong>Sprint Goal:</strong> Deliver Ajaia Docs collaborative editor v1.0.</li>
  <li><strong>Architecture Review:</strong> SQLite persistence, TipTap rich-text integration, and access control model.</li>
  <li><strong>QA &amp; Verification:</strong> End-to-end testing of sharing permissions and file upload pipelines.</li>
</ol>
<h2>Action Items</h2>
<ul data-type="taskList">
  <li data-checked="true" data-type="taskItem"><label><input type="checkbox" checked="checked"><span></span></label><div><p>Complete rich-text toolbar and paper canvas UI</p></div></li>
  <li data-checked="true" data-type="taskItem"><label><input type="checkbox" checked="checked"><span></span></label><div><p>Implement multi-user simulated auth and share modal</p></div></li>
  <li data-checked="false" data-type="taskItem"><label><input type="checkbox"><span></span></label><div><p>Record 3-5 minute product walkthrough video</p></div></li>
</ul>
    `.trim(),
  },
  {
    id: 'rfc',
    name: 'Technical RFC',
    description: 'Propose system architectures, tradeoff evaluations, and security designs.',
    icon: 'Code',
    badge: 'Engineering',
    defaultTitle: 'RFC 042: Hybrid CRDT/OT Persistence Layer',
    content: `
<h1>RFC 042: Hybrid Access Control &amp; Document Persistence</h1>
<p><strong>Author:</strong> Tooba Baqai &nbsp;|&nbsp; <strong>Reviewers:</strong> Ajaia Engineering Team</p>
<hr />
<h2>Abstract</h2>
<p>This RFC outlines the architectural blueprint for persistent document editing, granular user access control, and asynchronous file ingestion.</p>
<h2>Architecture Overview</h2>
<p>The application employs an optimized Next.js App Router full-stack architecture paired with Prisma SQLite. State transitions follow a strict role resolution algorithm:</p>
<pre><code>// Permission verification pipeline
const role = resolveUserRole(document, currentUserId);
if (role !== 'OWNER' &amp;&amp; role !== 'EDITOR') {
  throw new ForbiddenError('View-only access: modifications prohibited.');
}</code></pre>
<h2>Tradeoff Analysis</h2>
<ul>
  <li><strong>SQLite vs Remote DB:</strong> SQLite guarantees zero external network hops and deterministic local testing for reviewers.</li>
  <li><strong>Headless TipTap vs Monolithic Quill:</strong> TipTap provides extensible ProseMirror primitives with clean JSON/HTML duality.</li>
</ul>
    `.trim(),
  },
];
