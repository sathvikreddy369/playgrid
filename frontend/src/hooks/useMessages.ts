import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export const useConversations = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data } = await api.get('/messages/conversations');
      return data;
    },
  });
};

export const useChatHistory = (userId?: string) => {
  return useQuery({
    queryKey: ['messages', userId],
    queryFn: async () => {
      const { data } = await api.get(`/messages/${userId}`);
      return data;
    },
    enabled: !!userId,
  });
};

// We handle sending messages via socket.io, but we can also have a markAsRead mutation via REST
export const useMarkMessagesRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await api.put(`/messages/${userId}/read`);
      return data;
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages', userId] });
    },
  });
};
