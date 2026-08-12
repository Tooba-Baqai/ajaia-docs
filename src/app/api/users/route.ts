import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { SEEDED_USERS } from '../../../lib/seed-users';

export async function GET() {
  try {
    const users = await db.user.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json({ users });
  } catch (error) {
    // If db fails, fallback to seeded users
    return NextResponse.json({ users: SEEDED_USERS });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name?.trim() || cleanEmail.split('@')[0];

    const user = await db.user.upsert({
      where: { email: cleanEmail },
      update: { name: cleanName },
      create: {
        email: cleanEmail,
        name: cleanName,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
          cleanName
        )}&backgroundColor=d1d4f9`,
      },
    });

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}
