import { api } from './axiosInstance';

export interface PlatformStats {
    registeredUsers: number;
    recommendationsGenerated: number;
    careerPaths: number;
    skillsModeled: number;
    roadmapsGenerated: number;
}

export const getPlatformStats = async (): Promise<PlatformStats> => {
    const response = await api.get<{ data: PlatformStats }>('/platform/stats');
    return response.data.data;
};
