import { create } from 'zustand'
import { Currency } from './components/currency-modal';

interface UserStore {
  id: string;
  photo_url?: string;
  name?: string;
  preferred_currency?: Currency;
  setUser: ({
    id, 
    photo_url, 
    name,
    preferred_currency
  }: {
    id: string;
    photo_url?: string;
    name?: string;
    preferred_currency?: Currency;
  }) => void;
  setPreferedCurrency: (preferred_currency: Currency) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  id: '',
  name: undefined,
  photo_url: undefined,
  preferred_currency: undefined,
  setUser: ({id, photo_url, name, preferred_currency}) => set({ 
    id, 
    photo_url, 
    name,
    preferred_currency
  }),
  setPreferedCurrency: (preferred_currency: Currency) => set({ preferred_currency })
}))