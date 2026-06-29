import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../lib/api';

export const useGlobalSearch = (params: { q: string; type: string; lat?: string; lng?: string; radius?: string }) => {
  return useQuery({
    queryKey: ['search', params],
    queryFn: async () => {
      if (!params.q && (!params.lat || !params.lng)) return null;
      const { data } = await api.get('/search', { params });
      return data;
    },
    enabled: !!params.q || (!!params.lat && !!params.lng),
  });
};

export const useAISearch = () => {
  return useMutation({
    mutationFn: async (query: string) => {
      const { data } = await api.post('/search/ai', { q: query });
      return data;
    },
  });
};
