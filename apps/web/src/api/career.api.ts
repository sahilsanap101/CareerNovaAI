import { api } from './axiosInstance';



export interface EngineHealth {
  researchDataReady: boolean;
  careerUniverseReady: boolean;
  competencyEngineReady: boolean;
  preferenceEngineReady: boolean;
  rankingReady: boolean;
  explainabilityReady: boolean;
  skillGapReady: boolean;
  dependencyReady: boolean;
  roadmapReady: boolean;
  resourceReady: boolean;
  geminiReady: boolean;
  marketReady: boolean;
}



export const careerApi = {
  checkHealth: async () => {
    const { data } = await api.get('/recommendations/health');
    return data as EngineHealth;
  },



  getSkillGaps: async (careerId: string) => {
    const { data } = await api.get(`/recommendations/${encodeURIComponent(careerId)}/skill-gaps`);
    return data.data;
  },


};
