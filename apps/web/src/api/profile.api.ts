import { api } from '@/api/axiosInstance';
import type { ApiResponse } from '@pathforge/shared-types';
import type {
  UpdateProfileInput,
  UserSkillInput,
  UserInterestInput,
  CareerGoalInput,
  ProjectInput,
  CertificationInput,
  CodingPlatformInput,
} from '@pathforge/shared-zod';

export interface StudentData {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isVerified: boolean;
  profile: {
    id: string;
    college?: string | null;
    university?: string | null;
    degree?: string | null;
    branch?: string | null;
    specialization?: string | null;
    currentYear?: number | null;
    currentSemester?: number | null;
    graduationYear?: number | null;
    cgpa?: number | null;
    bio?: string | null;
    profileImage?: string | null;
    city?: string | null;
    country?: string | null;
  } | null;
  skills: Array<{
    id: string;
    proficiency: number;
    experienceMonths: number;
    confidence: number;
    skill: { id: string; name: string; category: string };
  }>;
  interests: Array<{
    id: string;
    priority: number;
    interest: { id: string; name: string; category?: string | null };
  }>;
  careerGoal: {
    id: string;
    preferredJobRole?: string | null;
    preferredIndustry?: string | null;
    preferredWorkMode: 'REMOTE' | 'HYBRID' | 'ONSITE';
    preferredCountries?: string | null;
    expectedSalary?: string | null;
    higherStudies: boolean;
    entrepreneurship: boolean;
    governmentJobs: boolean;
    startup: boolean;
    research: boolean;
  } | null;
  projects: Array<{
    id: string;
    title: string;
    description: string;
    technologies: string;
    githubUrl?: string | null;
    demoUrl?: string | null;
    completionStatus: string;
  }>;
  certifications: Array<{
    id: string;
    title: string;
    issuer: string;
    issueDate?: string | null;
    credentialUrl?: string | null;
  }>;
  codingPlatforms: Array<{
    id: string;
    platform: string;
    username: string;
    problemsSolved: number;
  }>;
}

export interface ProfileCompletionData {
  completionPercentage: number;
  missingSections: string[];
  breakdown: Record<string, number>;
}

export const profileApi = {
  // Get full student data & profile
  getProfile: async (): Promise<StudentData> => {
    const res = await api.get<ApiResponse<StudentData>>('/profile');
    return res.data.data!;
  },

  // Get completion score & breakdown
  getCompletion: async (): Promise<ProfileCompletionData> => {
    const res = await api.get<ApiResponse<ProfileCompletionData>>('/profile/completion');
    return res.data.data!;
  },

  // Master Lists
  getMasterSkills: async () => {
    const res = await api.get<ApiResponse<Array<{ id: string; name: string; category: string }>>>('/profile/skills/master');
    return res.data.data ?? [];
  },

  getMasterInterests: async () => {
    const res = await api.get<ApiResponse<Array<{ id: string; name: string; category?: string | null }>>>('/profile/interests/master');
    return res.data.data ?? [];
  },

  // Profile Update
  updateProfile: async (data: UpdateProfileInput): Promise<StudentData> => {
    const res = await api.put<ApiResponse<StudentData>>('/users/profile', data);
    return res.data.data!;
  },

  // Skills
  addUserSkill: async (data: UserSkillInput) => {
    const res = await api.post<ApiResponse<unknown>>('/profile/skills', data);
    return res.data.data;
  },

  deleteUserSkill: async (id: string) => {
    const res = await api.delete<ApiResponse<unknown>>(`/profile/skills/${id}`);
    return res.data.data;
  },

  // Interests
  addUserInterest: async (data: UserInterestInput) => {
    const res = await api.post<ApiResponse<unknown>>('/profile/interests', data);
    return res.data.data;
  },

  deleteUserInterest: async (id: string) => {
    const res = await api.delete<ApiResponse<unknown>>(`/profile/interests/${id}`);
    return res.data.data;
  },

  // Career Goals
  updateCareerGoals: async (data: CareerGoalInput) => {
    const res = await api.put<ApiResponse<unknown>>('/profile/career-goals', data);
    return res.data.data;
  },

  // Projects
  addProject: async (data: ProjectInput) => {
    const res = await api.post<ApiResponse<unknown>>('/profile/projects', data);
    return res.data.data;
  },

  updateProject: async (id: string, data: Partial<ProjectInput>) => {
    const res = await api.put<ApiResponse<unknown>>(`/profile/projects/${id}`, data);
    return res.data.data;
  },

  deleteProject: async (id: string) => {
    const res = await api.delete<ApiResponse<unknown>>(`/profile/projects/${id}`);
    return res.data.data;
  },

  // Certifications
  addCertification: async (data: CertificationInput) => {
    const res = await api.post<ApiResponse<unknown>>('/profile/certifications', data);
    return res.data.data;
  },

  updateCertification: async (id: string, data: Partial<CertificationInput>) => {
    const res = await api.put<ApiResponse<unknown>>(`/profile/certifications/${id}`, data);
    return res.data.data;
  },

  deleteCertification: async (id: string) => {
    const res = await api.delete<ApiResponse<unknown>>(`/profile/certifications/${id}`);
    return res.data.data;
  },

  // Coding Platforms
  addCodingPlatform: async (data: CodingPlatformInput) => {
    const res = await api.post<ApiResponse<unknown>>('/profile/coding-platforms', data);
    return res.data.data;
  },

  updateCodingPlatform: async (id: string, data: Partial<CodingPlatformInput>) => {
    const res = await api.put<ApiResponse<unknown>>(`/profile/coding-platforms/${id}`, data);
    return res.data.data;
  },

  deleteCodingPlatform: async (id: string) => {
    const res = await api.delete<ApiResponse<unknown>>(`/profile/coding-platforms/${id}`);
    return res.data.data;
  },
};
