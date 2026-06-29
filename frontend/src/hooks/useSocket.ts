import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../providers/AuthProvider';

export const useSocket = () => {
  const { firebaseUser, user } = useAuth();
  const socket = useRef<Socket | null>(null);

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
      });
    }

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [user]);

  return socket.current;
};
