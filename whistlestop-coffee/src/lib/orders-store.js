'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const ORDER_STATUSES = ['pending', 'preparing', 'ready', 'completed'];

function generateOrderId() {
  const time = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `WS-${time}-${rand}`;
}

export const useOrdersStore = create(
  persist(
    (set) => ({
      orders: [],

      addOrder: ({ items, subtotal, customerEmail, pickupName, notes }) => {
        const order = {
          id: generateOrderId(),
          items,
          subtotal,
          customerEmail: customerEmail ?? null,
          pickupName: pickupName ?? '',
          notes: notes ?? '',
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ orders: [order, ...state.orders] }));
        return order;
      },

      updateStatus: (orderId, status) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status } : o,
          ),
        })),

      clearAll: () => set({ orders: [] }),
    }),
    {
      name: 'whistlestop_orders',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
