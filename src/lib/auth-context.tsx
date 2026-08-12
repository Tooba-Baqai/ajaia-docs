'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SeedUser, SEEDED_USERS, DEFAULT_USER } from './seed-users';

interface AuthContextType {
  currentUser: SeedUser;
  setCurrentUser: (user: SeedUser) => void;
  switchUserById: (id: string) => void;
  loginCustomUser: (email: string, name?: string) => Promise<SeedUser>;
  availableUsers: SeedUser[];
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<SeedUser>(DEFAULT_USER);
  const [availableUsers, setAvailableUsers] = useState<SeedUser[]>(SEEDED_USERS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load persisted active persona from localStorage or cookie
    try {
      const storedId = localStorage.getItem('ajaia_current_user_id');
      if (storedId) {
        const found = SEEDED_USERS.find((u) => u.id === storedId);
        if (found) {
          setCurrentUser(found);
        } else {
          // Custom user stored
          const storedCustom = localStorage.getItem('ajaia_custom_user');
          if (storedCustom) {
            const parsed = JSON.parse(storedCustom) as SeedUser;
            setCurrentUser(parsed);
            setAvailableUsers((prev) =>
              prev.some((u) => u.id === parsed.id) ? prev : [...prev, parsed]
            );
          }
        }
      }
    } catch (e) {
      console.error('Failed to load user session from storage', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const switchUserById = (id: string) => {
    const target = availableUsers.find((u) => u.id === id);
    if (target) {
      setCurrentUser(target);
      try {
        localStorage.setItem('ajaia_current_user_id', target.id);
        // Set document cookie for SSR/API routes
        document.cookie = `ajaia_user_id=${target.id}; path=/; max-age=86400; SameSite=Lax`;
      } catch (e) {
        console.error('Error saving user session', e);
      }
    }
  };

  const loginCustomUser = async (
    email: string,
    name?: string
  ): Promise<SeedUser> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name?.trim() || cleanEmail.split('@')[0];
    const initials = cleanName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    // Call backend API to upsert user in database
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, name: cleanName }),
      });
      const data = await res.json();
      const dbUser = data.user;

      const newUser: SeedUser = {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: 'Collaborator',
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
          cleanName
        )}&backgroundColor=d1d4f9`,
        initials: initials || 'U',
        color: '#6366f1',
        bio: 'Simulated Collaborator Account',
      };

      setAvailableUsers((prev) =>
        prev.some((u) => u.id === newUser.id) ? prev : [...prev, newUser]
      );
      setCurrentUser(newUser);

      localStorage.setItem('ajaia_current_user_id', newUser.id);
      localStorage.setItem('ajaia_custom_user', JSON.stringify(newUser));
      document.cookie = `ajaia_user_id=${newUser.id}; path=/; max-age=86400; SameSite=Lax`;

      return newUser;
    } catch (e) {
      // Fallback local mock if backend call fails
      const mockId = `user_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const fallbackUser: SeedUser = {
        id: mockId,
        email: cleanEmail,
        name: cleanName,
        role: 'Collaborator',
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
          cleanName
        )}&backgroundColor=d1d4f9`,
        initials: initials || 'U',
        color: '#6366f1',
        bio: 'Simulated Collaborator Account',
      };
      setAvailableUsers((prev) => [...prev, fallbackUser]);
      setCurrentUser(fallbackUser);
      localStorage.setItem('ajaia_current_user_id', fallbackUser.id);
      document.cookie = `ajaia_user_id=${fallbackUser.id}; path=/; max-age=86400; SameSite=Lax`;
      return fallbackUser;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchUserById,
        loginCustomUser,
        availableUsers,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
