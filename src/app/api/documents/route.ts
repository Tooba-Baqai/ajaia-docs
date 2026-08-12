import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { resolveUserRole } from '../../../lib/permissions';
import { extractPlainText } from '../../../lib/file-parsers';

// Helper to get active user ID from header or cookie
function getUserIdFromRequest(req: NextRequest): string | null {
  const headerUserId = req.headers.get('x-user-id');
  if (headerUserId) return headerUserId;
  const cookieUserId = req.cookies.get('ajaia_user_id')?.value;
  if (cookieUserId) return cookieUserId;
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'all'; // 'all' | 'owned' | 'shared'
    const search = searchParams.get('search') || '';

    // Fetch all docs that the user owns, or is shared with, or is public
    let whereClause: any = {};

    if (userId) {
      if (filter === 'owned') {
        whereClause = { ownerId: userId };
      } else if (filter === 'shared') {
        whereClause = {
          shares: {
            some: { userId },
          },
          ownerId: { not: userId },
        };
      } else {
        // all accessible
        whereClause = {
          OR: [
            { ownerId: userId },
            { shares: { some: { userId } } },
            { isPublic: true },
          ],
        };
      }
    } else {
      // Unauthenticated, return public only
      whereClause = { isPublic: true };
    }

    if (search.trim()) {
      whereClause.AND = [
        whereClause,
        {
          OR: [
            { title: { contains: search } },
            { plainText: { contains: search } },
          ],
        },
      ];
    }

    const documents = await db.document.findMany({
      where: whereClause,
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
      orderBy: { updatedAt: 'desc' },
    });

    const enrichedDocs = documents.map((doc) => {
      const userRole = resolveUserRole(doc, userId) || 'VIEWER';
      return {
        id: doc.id,
        title: doc.title,
        content: doc.content,
        plainText: doc.plainText,
        ownerId: doc.ownerId,
        owner: doc.owner,
        isPublic: doc.isPublic,
        publicRole: doc.publicRole,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
        currentUserRole: userRole,
        sharesCount: doc.shares.length,
      };
    });

    return NextResponse.json({ documents: enrichedDocs });
  } catch (error: any) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required to create a document' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, content, isPublic, publicRole } = body;

    const initialTitle = title?.trim() || 'Untitled document';
    const initialContent = content || '<p>Start typing your document here...</p>';
    const plain = extractPlainText(initialContent);

    // Verify user exists in db or create them
    let user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      user = await db.user.create({
        data: {
          id: userId,
          email: `${userId}@ajaia.io`,
          name: userId.replace('user_', '').replace('_', ' '),
        },
      });
    }

    const doc = await db.document.create({
      data: {
        title: initialTitle,
        content: initialContent,
        plainText: plain,
        ownerId: user.id,
        isPublic: !!isPublic,
        publicRole: publicRole || 'VIEWER',
        revisions: {
          create: {
            title: initialTitle,
            content: initialContent,
            summary: 'Initial document creation',
            savedById: user.id,
          },
        },
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
        shares: true,
      },
    });

    return NextResponse.json({
      document: {
        ...doc,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
        currentUserRole: 'OWNER',
        canEdit: true,
        canManage: true,
      },
    });
  } catch (error: any) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create document' },
      { status: 500 }
    );
  }
}
