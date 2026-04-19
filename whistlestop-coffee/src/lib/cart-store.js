'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (x) => x.menuItemId === item.menuItemId && x.size === item.size,
          );

          if (existing) {
            return {
              items: state.items.map((x) =>
                x === existing ? { ...x, qty: x.qty + 1 } : x,
              ),
            };
          }

          return { items: [...state.items, { ...item, qty: 1 }] };
        }),

      setQty: (menuItemId, size, qty) =>
        set((state) => ({
          items: state.items
            .map((x) =>
              x.menuItemId === menuItemId && x.size === size ? { ...x, qty } : x,
            )
            .filter((x) => x.qty > 0),
        })),

      removeItem: (menuItemId, size) =>
        set((state) => ({
          items: state.items.filter(
            (x) => !(x.menuItemId === menuItemId && x.size === size),
          ),
        })),

      clear: () => set({ items: [] }),
    }),
    {
      name: 'whistlestop_cart',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
