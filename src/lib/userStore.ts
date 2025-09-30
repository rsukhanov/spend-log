import { create } from 'zustand'

interface UserStore {
  id: string;
  photo_url?: string;
  name?: string;
  prefered_currency?: string;
  setUser: ({
    id, 
    photo_url, 
    name,
    prefered_currency
  }: {
    id: string;
    photo_url?: string;
    name?: string;
    prefered_currency?: string;
  }) => void;
  setPreferedCurrency: (prefered_currency: string) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  id: '',
  name: '',
  photo_url: '',

  setUser: ({id, photo_url, name, prefered_currency}) => set({ 
    id, 
    photo_url, 
    name,
    prefered_currency
  }),
  setPreferedCurrency: (prefered_currency: string) => set({ prefered_currency })
}))