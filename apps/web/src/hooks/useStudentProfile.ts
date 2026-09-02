import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { profileApi } from '@/api/profile.api';
import { useToast } from '@/hooks/useToast';
import type {
  UpdateProfileInput,
  UserSkillInput,
  UserInterestInput,
  CareerGoalInput,
  ProjectInput,
  CertificationInput,
  CodingPlatformInput,
} from '@pathforge/shared-zod';

export function useStudentProfile() {
  const queryClient = useQueryClient();
  const toast = useToast();

  // 1. Fetch Student Profile
  const profileQuery = useQuery({
    queryKey: ['studentProfile'],
    queryFn: profileApi.getProfile,
    staleTime: 5 * 60 * 1000,
  });

  // 2. Fetch Completion Score
  const completionQuery = useQuery({
    queryKey: ['profileCompletion'],
    queryFn: profileApi.getCompletion,
    staleTime: 2 * 60 * 1000,
  });

  // 3. Fetch Master Lists
  const masterSkillsQuery = useQuery({
    queryKey: ['masterSkills'],
    queryFn: profileApi.getMasterSkills,
    staleTime: 30 * 60 * 1000,
  });

  const masterInterestsQuery = useQuery({
    queryKey: ['masterInterests'],
    queryFn: profileApi.getMasterInterests,
    staleTime: 30 * 60 * 1000,
  });

  const invalidateProfile = () => {
    void queryClient.invalidateQueries({ queryKey: ['studentProfile'] });
    void queryClient.invalidateQueries({ queryKey: ['profileCompletion'] });
  };

  // 4. Mutations
  const handleError = (error: unknown, fallback: string) => {
    if (isAxiosError(error) && error.response?.data?.message) {
      toast.error(`${fallback}: ${error.response.data.message}`);
    } else {
      toast.error(fallback);
    }
  };

  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileInput) => profileApi.updateProfile(data),
    onSuccess: () => {
      toast.success('Profile updated successfully.');
      invalidateProfile();
    },
    onError: (error) => handleError(error, 'Failed to update profile'),
  });

  const addSkillMutation = useMutation({
    mutationFn: (data: UserSkillInput) => profileApi.addUserSkill(data),
    onSuccess: () => {
      toast.success('Skill added.');
      invalidateProfile();
    },
    onError: (error) => handleError(error, 'Failed to add skill'),
  });

  const deleteSkillMutation = useMutation({
    mutationFn: (id: string) => profileApi.deleteUserSkill(id),
    onSuccess: () => {
      toast.success('Skill removed.');
      invalidateProfile();
    },
    onError: (error) => handleError(error, 'Failed to remove skill'),
  });

  const addInterestMutation = useMutation({
    mutationFn: (data: UserInterestInput) => profileApi.addUserInterest(data),
    onSuccess: () => {
      toast.success('Interest added.');
      invalidateProfile();
    },
    onError: (error) => handleError(error, 'Failed to add interest'),
  });

  const deleteInterestMutation = useMutation({
    mutationFn: (id: string) => profileApi.deleteUserInterest(id),
    onSuccess: () => {
      toast.success('Interest removed.');
      invalidateProfile();
    },
    onError: (error) => handleError(error, 'Failed to remove interest'),
  });

  const updateCareerGoalsMutation = useMutation({
    mutationFn: (data: CareerGoalInput) => profileApi.updateCareerGoals(data),
    onSuccess: () => {
      toast.success('Career goals updated.');
      invalidateProfile();
    },
    onError: (error) => handleError(error, 'Failed to update career goals'),
  });

  const addProjectMutation = useMutation({
    mutationFn: (data: ProjectInput) => profileApi.addProject(data),
    onSuccess: () => {
      toast.success('Project added.');
      invalidateProfile();
    },
    onError: (error) => handleError(error, 'Failed to add project'),
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => profileApi.deleteProject(id),
    onSuccess: () => {
      toast.success('Project deleted.');
      invalidateProfile();
    },
    onError: (error) => handleError(error, 'Failed to delete project'),
  });

  const addCertificationMutation = useMutation({
    mutationFn: (data: CertificationInput) => profileApi.addCertification(data),
    onSuccess: () => {
      toast.success('Certification added.');
      invalidateProfile();
    },
    onError: (error) => handleError(error, 'Failed to add certification'),
  });

  const deleteCertificationMutation = useMutation({
    mutationFn: (id: string) => profileApi.deleteCertification(id),
    onSuccess: () => {
      toast.success('Certification deleted.');
      invalidateProfile();
    },
    onError: (error) => handleError(error, 'Failed to delete certification'),
  });

  const addCodingPlatformMutation = useMutation({
    mutationFn: (data: CodingPlatformInput) => profileApi.addCodingPlatform(data),
    onSuccess: () => {
      toast.success('Coding platform added.');
      invalidateProfile();
    },
    onError: (error) => handleError(error, 'Failed to add coding platform'),
  });

  const deleteCodingPlatformMutation = useMutation({
    mutationFn: (id: string) => profileApi.deleteCodingPlatform(id),
    onSuccess: () => {
      toast.success('Coding platform removed.');
      invalidateProfile();
    },
    onError: (error) => handleError(error, 'Failed to remove coding platform'),
  });

  return {
    studentData: profileQuery.data,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    completion: completionQuery.data,
    masterSkills: masterSkillsQuery.data ?? [],
    masterInterests: masterInterestsQuery.data ?? [],

    updateProfile: updateProfileMutation.mutate,
    isUpdatingProfile: updateProfileMutation.isPending,

    addSkill: addSkillMutation.mutate,
    deleteSkill: deleteSkillMutation.mutate,

    addInterest: addInterestMutation.mutate,
    deleteInterest: deleteInterestMutation.mutate,

    updateCareerGoals: updateCareerGoalsMutation.mutate,
    isUpdatingCareerGoals: updateCareerGoalsMutation.isPending,

    addProject: addProjectMutation.mutate,
    deleteProject: deleteProjectMutation.mutate,

    addCertification: addCertificationMutation.mutate,
    deleteCertification: deleteCertificationMutation.mutate,

    addCodingPlatform: addCodingPlatformMutation.mutate,
    deleteCodingPlatform: deleteCodingPlatformMutation.mutate,

    refetch: invalidateProfile,
  };
}
