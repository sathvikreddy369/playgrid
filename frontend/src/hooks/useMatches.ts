import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import api from '../lib/api';

export const useMatches = (filters: any) => {
  return useQuery({
    queryKey: ['matches', filters],
    queryFn: async () => {
      const { data } = await api.get('/matches', { params: filters });
      return data;
    },
    placeholderData: keepPreviousData,
  });
};

export const useMatchDetail = (id: string) => {
  return useQuery({
    queryKey: ['matches', id],
    queryFn: async () => {
      const { data } = await api.get(`/matches/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateMatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post('/matches', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
};

export const useJoinMatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/matches/${id}/join`);
      return data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['matches', id] });
    },
  });
};

export const useMatchAction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ matchId, userId, action, rating }: { matchId: string; userId?: string; action: 'approve' | 'reject' | 'attend' | 'cancel' | 'leave' | 'kick'; rating?: number }) => {
      let res;
      if (action === 'cancel') {
        res = await api.put(`/matches/${matchId}/cancel`);
      } else if (action === 'leave') {
        res = await api.put(`/matches/${matchId}/leave`);
      } else if (action === 'attend') {
        res = await api.post(`/matches/${matchId}/players/${userId}/attend`, { rating });
      } else {
        res = await api.put(`/matches/${matchId}/players/${userId}/${action}`);
      }
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matches', variables.matchId] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
};

export const useMatchRecommendations = () => {
  return useQuery({
    queryKey: ['matchRecommendations'],
    queryFn: async () => {
      const { data } = await api.get('/matches/recommendations');
      return data;
    },
  });
};

export const useAddMatchComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ matchId, content }: { matchId: string; content: string }) => {
      const { data } = await api.post(`/matches/${matchId}/comments`, { content });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matches', variables.matchId] });
    },
  });
};

export const useEditMatchComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ matchId, commentId, content }: { matchId: string; commentId: string; content: string }) => {
      const { data } = await api.put(`/matches/${matchId}/comments/${commentId}`, { content });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matches', variables.matchId] });
    },
  });
};

export const useDeleteMatchComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ matchId, commentId }: { matchId: string; commentId: string }) => {
      const { data } = await api.delete(`/matches/${matchId}/comments/${commentId}`);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matches', variables.matchId] });
    },
  });
};

export const useUpdateMatchStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ matchId, status }: { matchId: string; status: string }) => {
      const { data } = await api.put(`/matches/${matchId}/status`, { status });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matches', variables.matchId] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
};

export const useBroadcastMessage = () => {
  return useMutation({
    mutationFn: async ({ matchId, content }: { matchId: string; content: string }) => {
      const { data } = await api.post(`/matches/${matchId}/message`, { content });
      return data;
    },
  });
};

export const useAddMatchReview = () => {
  return useMutation({
    mutationFn: async ({ matchId, rating, comment }: { matchId: string; rating: number; comment?: string }) => {
      const { data } = await api.post(`/matches/${matchId}/reviews`, { rating, comment });
      return data;
    },
  });
};
