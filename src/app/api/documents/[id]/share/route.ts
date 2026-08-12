import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../lib/db';
import { canUserManage } from '../../../../../lib/permissions';

function getUserIdFromRequest(req: NextRequest): string | null {
  const headerUserId = req.headers.get('x-user-id');
  if (headerUserId) return headerUserId;
  const cookieUserId = req.cookies.get('ajaia_user_id')?.value;
  if (cookieUserId) return cookieUserId;
  return null;
}

// POST: Add or update a collaborator share
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUserId = getUserIdFromRequest(req);
    const body = await req.json();
    const { email, role, userId } = body;

    const doc = await db.document.findUnique({
      where: { id },
      include: { owner: true },
    });

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (!canUserManage(doc, currentUserId)) {
      return NextResponse.json(
        { error: 'Forbidden: Only the document owner can manage collaborators.' },
        { status: 403 }
      );
    }

    const assignedRole = role === 'EDITOR' ? 'EDITOR' : 'VIEWER';

    let targetUser: any = null;

    if (userId) {
      targetUser = await db.user.findUnique({ where: { id: userId } });
    } else if (email) {
      const cleanEmail = email.trim().toLowerCase();
      // Find or create user
      targetUser = await db.user.upsert({
        where: { email: cleanEmail },
        update: {},
        create: {
          email: cleanEmail,
          name: cleanEmail.split('@')[0],
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
            cleanEmail
          )}&backgroundColor=d1d4f9`,
        },
      });
    }

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Target user email or ID is required' },
        { status: 400 }
      );
    }

    // Owner cannot share to themselves as collaborator
    if (targetUser.id === doc.ownerId) {
      return NextResponse.json(
        { error: 'User is already the owner of this document.' },
        { status: 400 }
      );
    }

    // Upsert share
    const share = await db.documentShare.upsert({
      where: {
        documentId_userId: {
          documentId: id,
          userId: targetUser.id,
        },
      },
      update: {
        role: assignedRole,
      },
      create: {
        documentId: id,
        userId: targetUser.id,
        role: assignedRole,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    return NextResponse.json({
      share: {
        ...share,
        createdAt: share.createdAt.toISOString(),
        updatedAt: share.updatedAt.toISOString(),
      },
      message: `Document successfully shared with ${targetUser.email} as ${assignedRole}.`,
    });
  } catch (error: any) {
    console.error('Error adding collaborator:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to share document' },
      { status: 500 }
    );
  }
}

// DELETE: Revoke collaborator access
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const currentUserId = getUserIdFromRequest(req);
    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get('userId');

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'Target userId parameter is required' },
        { status: 400 }
      );
    }

    const doc = await db.document.findUnique({
      where: { id },
    });

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Check if current user is owner or revoking their own access
    const isOwner = canUserManage(doc, currentUserId);
    const isSelf = currentUserId === targetUserId;

    if (!isOwner && !isSelf) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to remove this collaborator.' },
        { status: 403 }
      );
    }

    await db.documentShare.deleteMany({
      where: {
        documentId: id,
        userId: targetUserId,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Collaborator access revoked successfully.',
    });
  } catch (error: any) {
    console.error('Error removing collaborator:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to remove collaborator' },
      { status: 500 }
    );
  }
}
