import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../providers/AuthProvider';
import { useQueryClient } from '@tanstack/react-query';

export const useSocket = () => {
  const { firebaseUser, user } = useAuth();
  const socket = useRef<Socket | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (firebaseUser && user) {
      // Get the firebase token directly since we need it for socket auth
      firebaseUser.getIdToken().then((token: string) => {
        socket.current = io(import.meta.env.VITE_API_URL.replace('/api', ''), {
          auth: { token },
          transports: ['websocket']
        });

        socket.current.on('connect', () => {
          console.log('Socket connected');
        });

        socket.current.on('connect_error', (err: any) => {
          console.error('Socket connection error:', err);
        });

        // Global Presence Updates
        socket.current.on('presence_update', (data: { userId: string, isOnline: boolean, lastActive: string }) => {
          // Update specific user profile cache if it exists
          queryClient.setQueryData(['user', data.userId], (oldData: any) => {
            if (!oldData) return oldData;
            return { ...oldData, isOnline: data.isOnline, lastActive: data.lastActive };
          });
          
          // Optionally invalidate connections list if needed
          // queryClient.invalidateQueries({ queryKey: ['connections'] });
        });
      });
    }

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [user, firebaseUser, queryClient]);

  return socket.current;
};
