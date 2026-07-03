import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
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
    mutationFn: async ({ requesterId, recipientId }: { requesterId: string; recipientId: string }) => {
      const { data } = await api.post(`/users/${recipientId}/connect`);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['connections', variables.requesterId] });
      queryClient.invalidateQueries({ queryKey: ['connections', variables.recipientId] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.recipientId] });
    },
  });
};

export const useAcceptConnection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, requesterId }: { userId: string; requesterId: string }) => {
      const { data } = await api.put(`/users/${requesterId}/accept`);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['connections', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['connections', variables.requesterId] });
    },
  });
};

export const useRejectConnection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, requesterId }: { userId: string; requesterId: string }) => {
      const { data } = await api.put(`/users/${requesterId}/reject`);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['connections', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['connections', variables.requesterId] });
    },
  });
};

export const useRemoveConnection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, otherUserId }: { userId: string; otherUserId: string }) => {
      const { data } = await api.delete(`/users/${otherUserId}/connection`);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['connections', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['connections', variables.otherUserId] });
    },
  });
};
