import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const { data } = await api.get('/admin/stats');
      return data;
    },
  });
};

export const useAdminQueue = () => {
  return useQuery({
    queryKey: ['admin', 'queue'],
    queryFn: async () => {
      const { data } = await api.get('/admin/queue');
      return data;
    },
  });
};

export const useAdminUsers = () => {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const { data } = await api.get('/admin/users');
      return data;
    },
  });
};

export const useAdminMatches = () => {
  return useQuery({
    queryKey: ['admin', 'matches'],
    queryFn: async () => {
      const { data } = await api.get('/admin/matches');
      return data;
    },
  });
};

export const useAdminVerifyGround = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await api.put(`/admin/grounds/${id}/verify`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'queue'] });
    },
  });
};

export const useAdminVerifyCommunity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await api.put(`/admin/communities/${id}/verify`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'queue'] });
    },
  });
};

export const useAdminReports = () => {
  return useQuery({
    queryKey: ['admin', 'reports'],
    queryFn: async () => {
      const { data } = await api.get('/admin/reports');
      return data;
    },
  });
};

export const useResolveReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'ACTION_TAKEN' | 'DISMISSED' }) => {
      const { data } = await api.put(`/admin/reports/${id}/resolve`, { action });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
    },
  });
};

export const useBlockUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.put(`/admin/users/${id}/block`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/admin/posts/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
    },
  });
};
