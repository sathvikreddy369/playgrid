import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export const useGrounds = (status?: string) => {
  return useQuery({
    queryKey: ['grounds', status],
    queryFn: async () => {
      const { data } = await api.get('/grounds', { params: { status } });
      return data;
    },
  });
};

export const useGroundDetail = (id: string) => {
  return useQuery({
    queryKey: ['grounds', id],
    queryFn: async () => {
      const { data } = await api.get(`/grounds/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateGround = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post('/grounds', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grounds'] });
    },
  });
};

export const useAddGroundReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, rating, comment }: { id: string; rating: number; comment: string }) => {
      const { data } = await api.post(`/grounds/${id}/reviews`, { rating, comment });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['grounds', variables.id] });
    },
  });
};

export const useAdminVerifyGround = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'VERIFIED' | 'REJECTED' }) => {
      const { data } = await api.put(`/admin/grounds/${id}/verify`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grounds'] });
    },
  });
};
