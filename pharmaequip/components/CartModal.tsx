'use client';

import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useCart } from '@/lib/cartStore';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function CartModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const total = totalPrice();

  return (
    <div className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <ShoppingBag size={28} className="text-blue-700" />
            <h2 className="text-2xl font-bold text-black">Your Cart ({cart.length})</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition" aria-label="Close cart">
            <X size={32} className="text-black" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-6">
          {cart.map((item) => (
            <div key={item.id} className="flex gap-4 bg-gray-50 p-5 rounded-2xl">
              <div className="w-20 h-20 bg-gray-200 rounded-xl flex-shrink-0 overflow-hidden">
                {item.image && <Image src={item.image} alt={item.name} width={80} height={80} unoptimized className="w-full h-full object-cover" />}
              </div>

              <div className="flex-1">
                <h4 className="font-semibold text-black">{item.name}</h4>
                <p className="text-blue-700 font-bold mt-1">₦{(item.price * item.quantity).toLocaleString()}</p>

                <div className="flex items-center gap-4 mt-4">
                  <button
                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    className="w-11 h-11 border-2 border-gray-400 rounded-2xl flex items-center justify-center hover:bg-gray-200 text-black"
                    aria-label={`Reduce ${item.name} quantity`}
                  >
                    <Minus size={24} className="text-black" />
                  </button>
                  <span className="font-semibold text-xl w-8 text-center text-black">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-11 h-11 border-2 border-gray-400 rounded-2xl flex items-center justify-center hover:bg-gray-200 text-black"
                    aria-label={`Increase ${item.name} quantity`}
                  >
                    <Plus size={24} className="text-black" />
                  </button>
                </div>
              </div>

              <button onClick={() => removeFromCart(item.id)} className="text-red-600 hover:bg-red-100 p-3 rounded-2xl transition self-start" aria-label={`Remove ${item.name}`}>
                <Trash2 size={26} className="text-red-600" />
              </button>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t bg-gray-50">
            <div className="flex justify-between text-3xl font-bold mb-6 text-black">
              <span>Total</span>
              <span>₦{total.toLocaleString()}</span>
            </div>

            <button
              onClick={() => {
                window.location.href = '/checkout';
                onClose();
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-5 rounded-2xl text-xl font-semibold transition mb-3"
            >
              Proceed to Checkout
            </button>

            <button onClick={clearCart} className="w-full text-slate-950 py-4 font-bold hover:text-red-600 border-2 border-slate-300 rounded-2xl bg-white">
              Clear All Items
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
