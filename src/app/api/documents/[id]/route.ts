import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { resolveUserRole, canUserEdit, canUserManage } from '../../../../lib/permissions';
import { extractPlainText } from '../../../../lib/file-parsers';

function getUserIdFromRequest(req: NextRequest): string | null {
  const headerUserId = req.headers.get('x-user-id');
  if (headerUserId) return headerUserId;
  const cookieUserId = req.cookies.get('ajaia_user_id')?.value;
  if (cookieUserId) return cookieUserId;
  return null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = getUserIdFromRequest(req);

    const doc = await db.document.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        shares: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        revisions: {
          include: {
            savedBy: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const userRole = resolveUserRole(doc, userId);

    if (!userRole) {
      return NextResponse.json(
        { error: 'Access denied: You do not have permission to view this document.' },
        { status: 403 }
      );
    }

    const canEdit = userRole === 'OWNER' || userRole === 'EDITOR';
    const canManage = userRole === 'OWNER';

    return NextResponse.json({
      document: {
        ...doc,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
        currentUserRole: userRole,
        canEdit,
        canManage,
        revisions: doc.revisions.map((r) => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
        })),
        shares: doc.shares.map((s) => ({
          ...s,
          createdAt: s.createdAt.toISOString(),
          updatedAt: s.updatedAt.toISOString(),
        })),
      },
    });
  } catch (error: any) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch document' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = getUserIdFromRequest(req);
    const body = await req.json();
    const { title, content, isPublic, publicRole, createRevision, revisionSummary } =
      body;

    const doc = await db.document.findUnique({
      where: { id },
      include: { shares: true },
    });

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const isAllowedToEdit = canUserEdit(doc, userId);
    if (!isAllowedToEdit) {
      return NextResponse.json(
        { error: 'Forbidden: You have view-only access and cannot modify this document.' },
        { status: 403 }
      );
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim() || 'Untitled document';
    if (content !== undefined) {
      updateData.content = content;
      updateData.plainText = extractPlainText(content);
    }

    // Only owner can change public link visibility
    if (canUserManage(doc, userId)) {
      if (isPublic !== undefined) updateData.isPublic = !!isPublic;
      if (publicRole !== undefined) updateData.publicRole = publicRole;
    }

    // Update document
    const updatedDoc = await db.document.update({
      where: { id },
      data: updateData,
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        shares: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true },
            },
          },
        },
      },
    });

    // Optionally create revision snapshot
    if (createRevision && (title || content)) {
      await db.documentRevision.create({
        data: {
          documentId: id,
          title: updatedDoc.title,
          content: updatedDoc.content,
          summary: revisionSummary || 'Manual version snapshot',
          savedById: userId || undefined,
        },
      });
    }

    const userRole = resolveUserRole(updatedDoc, userId) || 'EDITOR';

    return NextResponse.json({
      document: {
        ...updatedDoc,
        createdAt: updatedDoc.createdAt.toISOString(),
        updatedAt: updatedDoc.updatedAt.toISOString(),
        currentUserRole: userRole,
        canEdit: true,
        canManage: userRole === 'OWNER',
      },
    });
  } catch (error: any) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update document' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = getUserIdFromRequest(req);

    const doc = await db.document.findUnique({
      where: { id },
    });

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (!canUserManage(doc, userId)) {
      return NextResponse.json(
        { error: 'Forbidden: Only the document owner can delete this document.' },
        { status: 403 }
      );
    }

    await db.document.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Document deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete document' },
      { status: 500 }
    );
  }
}
