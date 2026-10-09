import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { careerApi } from '@/api/career.api';

export const useCareerHealth = () => {
  return useQuery({
    queryKey: ['career-health'],
    queryFn: () => careerApi.checkHealth(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};

export const useSkillGaps = (careerId: string) => {
  return useQuery({
    queryKey: ['career-skill-gaps', careerId],
    queryFn: () => careerApi.getSkillGaps(careerId),
    enabled: !!careerId,
    staleTime: 5 * 60 * 1000,
  });
};

