import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from './cartStore';

export type OrderItem = Pick<CartItem, 'id' | 'name' | 'price' | 'quantity'>;

export type OrderStatus = 'Pending' | 'Paid' | 'Successful' | 'Declined' | 'Quote Request';
export type DeliveryType = 'door' | 'pickup' | 'whatsapp';
export type OrderDelivery = {
  type?: DeliveryType;
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
} | null;

export type Order = {
  id: string;
  date: string;
  customer: string;
  email: string;
  total: number;
  items: OrderItem[];
  status: OrderStatus;
  reference: string;
  delivery?: OrderDelivery;
  quoteMessage?: string;
  message?: string;
  interestedItems?: string;
  company?: string;
  phone?: string;
  paymentMethod?: 'paystack' | 'cod';
  deliveryType?: DeliveryType;
};

type OrdersStore = {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  clearOrders: () => void;
};

export const useOrders = create<OrdersStore>()(
  persist(
    (set) => ({
      orders: [],
      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
      updateOrderStatus: (id, status) => 
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === id ? { ...order, status } : order
          ),
        })),
      clearOrders: () => set({ orders: [] }),
    }),
    { name: 'pharmaequip-orders' }
  )
);
