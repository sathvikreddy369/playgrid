import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export const useMatches = (filters: any) => {
  return useQuery({
    queryKey: ['matches', filters],
    queryFn: async () => {
      const { data } = await api.get('/matches', { params: filters });
      return data;
    },
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
    mutationFn: async ({ matchId, userId, action, rating }: { matchId: string; userId?: string; action: 'approve' | 'reject' | 'attend' | 'cancel'; rating?: number }) => {
      let res;
      if (action === 'cancel') {
        res = await api.put(`/matches/${matchId}/cancel`);
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
