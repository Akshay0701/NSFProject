import { create } from 'zustand';

const initialResearcherProfile = {
  name: '',
  affiliation: '',
  researchArea: '',
  text: '',
  pdfFile: null,
  expanded: true,
  isProcessingPDF: false,
  inputMethod: 'text',
};

const MAX_RESEARCHERS = 10;

const useProfileStore = create((set) => ({
  profiles: [{ ...initialResearcherProfile }],
  extractedProfiles: [],
  teams: [],
  teamsWithProposals: [], // New state for teams with proposals
  isLoading: false,
  isCreatingTeams: false,
  isGeneratingProposals: false,

  addProfile: () =>
    set((state) => {
      if (state.profiles.length >= MAX_RESEARCHERS) return state;
      return { profiles: [...state.profiles, { ...initialResearcherProfile }] };
    }),

  removeProfile: (index) =>
    set((state) => ({
      profiles: state.profiles.filter((_, i) => i !== index),
    })),

  updateProfile: (index, updatedProfile) =>
    set((state) => {
      const updatedProfiles = [...state.profiles];
      updatedProfiles[index] = updatedProfile;
      return { profiles: updatedProfiles };
    }),

  setProfiles: (profiles) => set({ profiles }),

  setExtractedProfiles: (extractedProfiles) => set({ extractedProfiles }),

  setTeams: (teams) => set({ teams }),

  setTeamsWithProposals: (teamsWithProposals) => set({ teamsWithProposals }), // New action

  setIsLoading: (isLoading) => set({ isLoading }),

  setIsCreatingTeams: (isCreatingTeams) => set({ isCreatingTeams }),

  setIsGeneratingProposals: (isGeneratingProposals) =>
    set({ isGeneratingProposals }),
}));

export default useProfileStore;