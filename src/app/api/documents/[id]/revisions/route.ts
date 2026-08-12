import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../lib/db';
import { canUserEdit } from '../../../../../lib/permissions';

function getUserIdFromRequest(req: NextRequest): string | null {
  const headerUserId = req.headers.get('x-user-id');
  if (headerUserId) return headerUserId;
  const cookieUserId = req.cookies.get('ajaia_user_id')?.value;
  if (cookieUserId) return cookieUserId;
  return null;
}

// GET: List all revisions for a document
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const revisions = await db.documentRevision.findMany({
      where: { documentId: id },
      include: {
        savedBy: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      revisions: revisions.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      })),
    });
  } catch (error: any) {
    console.error('Error fetching revisions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch revisions' },
      { status: 500 }
    );
  }
}

// POST: Create a revision or restore a previous revision
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUserId = getUserIdFromRequest(req);
    const body = await req.json();
    const { action, revisionId, summary } = body;

    const doc = await db.document.findUnique({
      where: { id },
      include: { shares: true },
    });

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (!canUserEdit(doc, currentUserId)) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have edit rights on this document.' },
        { status: 403 }
      );
    }

    if (action === 'restore') {
      if (!revisionId) {
        return NextResponse.json(
          { error: 'revisionId is required to restore' },
          { status: 400 }
        );
      }

      const revision = await db.documentRevision.findUnique({
        where: { id: revisionId },
      });

      if (!revision || revision.documentId !== id) {
        return NextResponse.json(
          { error: 'Revision not found for this document' },
          { status: 404 }
        );
      }

      // Save current state as revision before restoring
      await db.documentRevision.create({
        data: {
          documentId: id,
          title: doc.title,
          content: doc.content,
          summary: `Pre-restore snapshot before reverting to "${revision.title}"`,
          savedById: currentUserId || undefined,
        },
      });

      // Restore document
      const updatedDoc = await db.document.update({
        where: { id },
        data: {
          title: revision.title,
          content: revision.content,
        },
      });

      return NextResponse.json({
        document: updatedDoc,
        message: 'Document successfully restored to selected revision.',
      });
    }

    // Default: create snapshot
    const newRevision = await db.documentRevision.create({
      data: {
        documentId: id,
        title: doc.title,
        content: doc.content,
        summary: summary || 'Manual snapshot',
        savedById: currentUserId || undefined,
      },
      include: {
        savedBy: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    return NextResponse.json({
      revision: {
        ...newRevision,
        createdAt: newRevision.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error saving revision:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to manage revisions' },
      { status: 500 }
    );
  }
}
