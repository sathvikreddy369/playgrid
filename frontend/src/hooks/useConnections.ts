import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import toast from 'react-hot-toast';
import type { UserConnection } from '../types';

export const useConnections = (userId: string | undefined) => {
  return useQuery<UserConnection[]>({
    queryKey: ['connections', userId],
    queryFn: async () => {
      const { data } = await api.get(`/users/${userId}/connections`);
      return data;
    },
    enabled: !!userId,
  });
};

export const useSendConnectionRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ recipientId }: { requesterId: string; recipientId: string }) => {
      const { data } = await api.post(`/users/${recipientId}/connect`);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['connection-status', variables.recipientId] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.recipientId] });
      toast.success('Connection request sent');
    },
    onError: () => {
      toast.error('Failed to send connection request');
    }
  });
};

export function useAcceptConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requesterId }: { userId: string; requesterId: string }) => {
      const { data } = await api.put(`/users/${requesterId}/accept`);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['connection-status', variables.requesterId] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.requesterId] });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      toast.success('Connection accepted');
    },
    onError: () => {
      toast.error('Failed to accept connection');
    }
  });
}

export function useRejectConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requesterId }: { userId: string; requesterId: string }) => {
      const { data } = await api.put(`/users/${requesterId}/reject`);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['connection-status', variables.requesterId] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.requesterId] });
      toast.success('Connection rejected');
    },
    onError: () => {
      toast.error('Failed to reject connection');
    }
  });
}

export function useRemoveConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ otherUserId }: { userId: string; otherUserId: string }) => {
      const { data } = await api.delete(`/users/${otherUserId}/connection`);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['connections', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['connections', variables.otherUserId] });
    },
  });
};
