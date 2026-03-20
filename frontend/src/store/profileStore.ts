import { create } from "zustand";                                                                                                                                        
  import type { UserProfilePublic } from "../types";                                                                                                                       
                                                                                                                                                                           
  interface ProfileStore {                                                                                                                                                 
    userProfile: UserProfilePublic | null;                                                                                                                                 
    setUserProfile: (profile: UserProfilePublic) => void;                                                                                                                  
    clearUserProfile: () => void;                                                                                                                                          
  }                                                                                                                                                                        
                                                                                                                                                                           
  export const useProfileStore = create<ProfileStore>((set) => ({                                                                                                          
    userProfile: null,                                                                                                                                                     
    setUserProfile: (profile) => set({ userProfile: profile }),                                                                                                            
    clearUserProfile: () => set({ userProfile: null }),                                                                                                                    
  }));