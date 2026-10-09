import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SelectedCareer {
  careerId: string;
  careerName: string;
  domain: string;
  selectedAt: string;
}

interface CareerState {
  selectedCareer: SelectedCareer | null;
  setSelectedCareer: (career: SelectedCareer | null) => void;
}

export const useCareerStore = create<CareerState>()(
  persist(
    (set) => ({
      selectedCareer: null,
      setSelectedCareer: (career) => set({ selectedCareer: career }),
    }),
    {
      name: 'pathforge-career-storage',
    }
  )
);
