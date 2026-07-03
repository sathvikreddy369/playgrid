import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export const useTournaments = () => {
  return useQuery({
    queryKey: ['tournaments'],
    queryFn: async () => {
      const { data } = await api.get('/tournaments');
      return data;
    }
  });
};

export const useTournamentDetail = (id: string) => {
  return useQuery({
    queryKey: ['tournament', id],
    queryFn: async () => {
      const { data } = await api.get(`/tournaments/${id}`);
      return data;
    },
    enabled: !!id
  });
};

export const useCreateTournament = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/tournaments', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
    }
  });
};

export const useJoinTournament = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/tournaments/${id}/join`);
      return res.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['tournament', id] });
    }
  });
};
