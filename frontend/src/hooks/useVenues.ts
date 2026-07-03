import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export const useVenues = (filters?: { status?: string; sport?: string; location?: string; minRating?: number; lat?: number; lng?: number; radius?: number; sortBy?: string }) => {
  return useQuery({
    queryKey: ['venues', filters],
    queryFn: async () => {
      const { data } = await api.get('/venues', { params: filters });
      return data;
    },
  });
};

export const useVenueDetail = (id: string) => {
  return useQuery({
    queryKey: ['venues', id],
    queryFn: async () => {
      const { data } = await api.get(`/venues/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateVenue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post('/venues', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
  });
};

export const useAddVenueReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, rating, comment }: { id: string; rating: number; comment: string }) => {
      const { data } = await api.post(`/venues/${id}/reviews`, { rating, comment });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['venues', variables.id] });
    },
  });
};

export const useAdminVerifyVenue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'VERIFIED' | 'REJECTED' }) => {
      const { data } = await api.put(`/admin/venues/${id}/verify`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    },
  });
};
