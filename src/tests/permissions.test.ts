import { describe, it, expect } from 'vitest';
import {
  resolveUserRole,
  canUserView,
  canUserEdit,
  canUserManage,
  PermissionCheckDoc,
} from '../lib/permissions';

describe('Document Access Control & Permissions Suite', () => {
  const mockDoc: PermissionCheckDoc = {
    ownerId: 'user_tooba',
    isPublic: false,
    publicRole: 'VIEWER',
    shares: [
      { userId: 'user_alex', role: 'EDITOR' },
      { userId: 'user_jordan', role: 'VIEWER' },
    ],
  };

  const publicDoc: PermissionCheckDoc = {
    ownerId: 'user_alex',
    isPublic: true,
    publicRole: 'VIEWER',
    shares: [],
  };

  describe('resolveUserRole', () => {
    it('identifies the document owner correctly with OWNER role', () => {
      const role = resolveUserRole(mockDoc, 'user_tooba');
      expect(role).toBe('OWNER');
    });

    it('identifies invited collaborator with EDITOR role', () => {
      const role = resolveUserRole(mockDoc, 'user_alex');
      expect(role).toBe('EDITOR');
    });

    it('identifies invited collaborator with VIEWER role', () => {
      const role = resolveUserRole(mockDoc, 'user_jordan');
      expect(role).toBe('VIEWER');
    });

    it('denies uninvited user access on private documents', () => {
      const role = resolveUserRole(mockDoc, 'user_stranger');
      expect(role).toBeNull();
    });

    it('falls back to publicRole for unauthenticated visitors on public documents', () => {
      const role = resolveUserRole(publicDoc, null);
      expect(role).toBe('VIEWER');
    });
  });

  describe('canUserEdit', () => {
    it('allows owner to edit', () => {
      expect(canUserEdit(mockDoc, 'user_tooba')).toBe(true);
    });

    it('allows EDITOR collaborator to edit', () => {
      expect(canUserEdit(mockDoc, 'user_alex')).toBe(true);
    });

    it('strictly prohibits VIEWER collaborator from editing', () => {
      expect(canUserEdit(mockDoc, 'user_jordan')).toBe(false);
    });

    it('prohibits unauthorized users from editing', () => {
      expect(canUserEdit(mockDoc, 'user_unauthorized')).toBe(false);
    });
  });

  describe('canUserManage', () => {
    it('allows only the owner to manage settings and delete', () => {
      expect(canUserManage(mockDoc, 'user_tooba')).toBe(true);
    });

    it('denies EDITOR collaborators from managing or deleting document', () => {
      expect(canUserManage(mockDoc, 'user_alex')).toBe(false);
    });

    it('denies VIEWER collaborators from managing document', () => {
      expect(canUserManage(mockDoc, 'user_jordan')).toBe(false);
    });
  });

  describe('canUserView', () => {
    it('allows owner, editor, and viewer to view private document', () => {
      expect(canUserView(mockDoc, 'user_tooba')).toBe(true);
      expect(canUserView(mockDoc, 'user_alex')).toBe(true);
      expect(canUserView(mockDoc, 'user_jordan')).toBe(true);
    });

    it('denies non-collaborator from viewing private document', () => {
      expect(canUserView(mockDoc, 'user_stranger')).toBe(false);
    });

    it('allows anyone to view public document', () => {
      expect(canUserView(publicDoc, 'user_stranger')).toBe(true);
      expect(canUserView(publicDoc, null)).toBe(true);
    });
  });
});
