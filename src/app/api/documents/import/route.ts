import { NextRequest, NextResponse } from 'next/server';
import { parseUploadedFile } from '../../../../lib/file-parsers';
import { db } from '../../../../lib/db';

function getUserIdFromRequest(req: NextRequest): string | null {
  const headerUserId = req.headers.get('x-user-id');
  if (headerUserId) return headerUserId;
  const cookieUserId = req.cookies.get('ajaia_user_id')?.value;
  if (cookieUserId) return cookieUserId;
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req);
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const mode = formData.get('mode') as string | null; // 'create_doc' or 'parse_only'

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const filename = file.name;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse the file based on format
    const parsed = await parseUploadedFile(filename, buffer);

    if (mode === 'create_doc') {
      if (!userId) {
        return NextResponse.json(
          { error: 'User ID is required to create a document from an imported file' },
          { status: 401 }
        );
      }

      // Ensure user exists
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

      // Create new document from parsed content
      const doc = await db.document.create({
        data: {
          title: parsed.title,
          content: parsed.htmlContent,
          plainText: parsed.plainText,
          ownerId: user.id,
          revisions: {
            create: {
              title: parsed.title,
              content: parsed.htmlContent,
              summary: `Imported from file: ${filename} (${parsed.format.toUpperCase()})`,
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
        parsed,
        message: `Successfully created new document "${parsed.title}" from ${filename}`,
      });
    }

    // Return parsed content for client insertion
    return NextResponse.json({
      parsed,
      filename,
      size: file.size,
      message: `Parsed ${filename} successfully.`,
    });
  } catch (error: any) {
    console.error('Error importing file:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to parse and import file' },
      { status: 500 }
    );
  }
}
