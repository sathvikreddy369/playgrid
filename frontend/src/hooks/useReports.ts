import { useMutation } from '@tanstack/react-query';
import api from '../lib/api';

export function useCreateReport() {
  return useMutation({
    mutationFn: async (data: { targetType: 'USER' | 'POST' | 'COMMUNITY' | 'GROUND' | 'MESSAGE'; targetId: string; reason: string }) => {
      const response = await api.post('/reports', data);
      return response.data;
    },
  });
}
