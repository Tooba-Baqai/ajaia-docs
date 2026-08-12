import { Role } from './types';

export interface PermissionCheckDoc {
  ownerId: string;
  isPublic?: boolean;
  publicRole?: string;
  shares?: Array<{
    userId: string;
    role: string;
  }>;
}

/**
 * Resolves a user's role on a given document.
 * Returns 'OWNER' | 'EDITOR' | 'VIEWER' | null
 */
export function resolveUserRole(
  document: PermissionCheckDoc,
  userId?: string | null
): Role | null {
  if (!userId) {
    if (document.isPublic) {
      return (document.publicRole as Role) || 'VIEWER';
    }
    return null;
  }

  // 1. Owner has full rights
  if (document.ownerId === userId) {
    return 'OWNER';
  }

  // 2. Check explicit shares
  if (document.shares && document.shares.length > 0) {
    const directShare = document.shares.find((s) => s.userId === userId);
    if (directShare) {
      return directShare.role as Role;
    }
  }

  // 3. Fallback to public link permissions
  if (document.isPublic) {
    return (document.publicRole as Role) || 'VIEWER';
  }

  return null;
}

export function canUserView(
  document: PermissionCheckDoc,
  userId?: string | null
): boolean {
  const role = resolveUserRole(document, userId);
  return role !== null;
}

export function canUserEdit(
  document: PermissionCheckDoc,
  userId?: string | null
): boolean {
  const role = resolveUserRole(document, userId);
  return role === 'OWNER' || role === 'EDITOR';
}

export function canUserManage(
  document: PermissionCheckDoc,
  userId?: string | null
): boolean {
  const role = resolveUserRole(document, userId);
  return role === 'OWNER';
}
