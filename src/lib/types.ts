export type Role = 'OWNER' | 'EDITOR' | 'VIEWER';

export interface UserSummary {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  role?: string;
}

export interface DocumentShareInfo {
  id: string;
  documentId: string;
  userId: string;
  role: 'EDITOR' | 'VIEWER';
  user: UserSummary;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentRevisionInfo {
  id: string;
  documentId: string;
  title: string;
  content: string;
  summary?: string | null;
  savedById?: string | null;
  savedBy?: UserSummary | null;
  createdAt: string;
}

export interface AttachmentInfo {
  id: string;
  documentId: string;
  filename: string;
  fileType: string;
  fileSize: number;
  url: string;
  createdAt: string;
}

export interface DocumentDetail {
  id: string;
  title: string;
  content: string;
  plainText?: string | null;
  ownerId: string;
  owner: UserSummary;
  isPublic: boolean;
  publicRole: 'VIEWER' | 'EDITOR';
  createdAt: string;
  updatedAt: string;
  shares: DocumentShareInfo[];
  revisions?: DocumentRevisionInfo[];
  attachments?: AttachmentInfo[];
  currentUserRole?: Role;
  canEdit?: boolean;
  canManage?: boolean;
}

export interface DocumentListItem {
  id: string;
  title: string;
  content: string;
  plainText?: string | null;
  ownerId: string;
  owner: UserSummary;
  isPublic: boolean;
  publicRole: 'VIEWER' | 'EDITOR';
  createdAt: string;
  updatedAt: string;
  currentUserRole: Role;
  sharesCount: number;
}
