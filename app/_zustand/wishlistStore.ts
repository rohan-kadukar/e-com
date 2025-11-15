import { create } from "zustand";

export type ProductInWishlist = {
  id: string;             // keep ids as string for consistent comparisons
  title?: string;
  price?: number;
  image?: string;
  slug?: string;
  stockAvailabillity?: number;
};

export type State = {
  wishlist: ProductInWishlist[];
  wishQuantity: number;
};

export type Actions = {
  addToWishlist: (product: ProductInWishlist) => void;
  removeFromWishlist: (id: string) => void;
  setWishlist: (wishlist: ProductInWishlist[]) => void;
};

export const useWishlistStore = create<State & Actions>((set) => ({
  wishlist: [],
  wishQuantity: 0,

  addToWishlist: (product) =>
    set((state) => {
      const exists = state.wishlist.some((item) => item.id === product.id);
      const next = exists ? state.wishlist : [...state.wishlist, product];
      return { wishlist: next, wishQuantity: next.length };
    }),

  removeFromWishlist: (id) =>
    set((state) => {
      const next = state.wishlist.filter((item) => item.id !== id);
      return { wishlist: next, wishQuantity: next.length };
    }),

  setWishlist: (wishlist) =>
    set(() => {
      // ensure unique by id
      const map = new Map<string, ProductInWishlist>();
      for (const p of wishlist) map.set(p.id, p);
      const next = Array.from(map.values());
      return { wishlist: next, wishQuantity: next.length };
    }),
}));
