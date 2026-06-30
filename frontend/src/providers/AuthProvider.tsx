import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth } from '../lib/firebase';
import api from '../lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
  reputation: number;
  badges?: any[];
  communityMemberships?: any[];
  profile?: ProfileData;
}

interface ProfileData {
  id: string;
  bio: string | null;
  location: string | null;
  avatarUrl: string | null;
  sports: string[];
  homeLatitude: number | null;
  homeLongitude: number | null;
  age: number | null;
  favoriteGames: string[];
  preferredPlayTimes: string[];
  skillLevels: Record<string, string> | null;
}

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: UserData | null;
  profile: ProfileData | null;
  isLoading: boolean;
  syncUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  user: null,
  profile: null,
  isLoading: true,
  syncUser: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setFirebaseUser(user);
      if (user) {
        // Upon login, we eagerly sync to ensure DB has the user
        await syncUser(user);
      } else {
        // Clear cached user data if logged out
        queryClient.setQueryData(['me'], null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [queryClient]);

  const syncUser = async (userObj?: FirebaseUser) => {
    try {
      const u = userObj || firebaseUser;
      await api.post('/auth/sync', {
        email: u?.email,
        name: u?.displayName
      });
      queryClient.invalidateQueries({ queryKey: ['me'] });
    } catch (error) {
      console.error('Failed to sync user with database', error);
    }
  };

  // Fetch the full user details from the database
  const { data: dbData, isLoading: isDbLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await api.get('/auth/me');
      return res.data;
    },
    enabled: !!firebaseUser, // Only fetch if authenticated in Firebase
    retry: false,
  });

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        user: dbData || null,
        profile: dbData?.profile || null,
        isLoading: isLoading || isDbLoading,
        syncUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
