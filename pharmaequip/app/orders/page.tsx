'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { Order } from '@/lib/ordersStore';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/orders', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load your orders');
      const data = await res.json();
      setOrders(data);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Could not load orders from the database.';
      setError(message);
      toast.error('Could not load your orders. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-5xl mx-auto px-6 pt-10">
        <Link href="/" className="flex items-center gap-2 text-blue-600 mb-8 hover:underline">
          <ArrowLeft size={20} /> Back to Shop
        </Link>

        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-4xl font-bold">My Orders &amp; Quotes</h1>
            <p className="text-gray-600 mt-1">Track your previous purchases and quote requests</p>
          </div>
          <button
            onClick={loadOrders}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-xl text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow overflow-hidden border border-gray-100 mt-6">
          {isLoading ? (
            <div className="p-20 text-center text-gray-500">Loading your orders from the database...</div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-red-600 font-semibold mb-2">{error}</p>
              <p className="text-sm text-gray-500">The site may still be connecting to Supabase. Please try again in a moment.</p>
              <button onClick={loadOrders} className="mt-4 text-blue-600 underline">Try again</button>
            </div>
          ) : orders.length === 0 ? (
            <p className="text-center py-20 text-gray-500">You have no orders or quote requests yet.</p>
          ) : (
            <div className="divide-y">
              {orders.map((order) => (
                <div key={order.id} className="p-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4 hover:bg-gray-50">
                  <div>
                    <p className="font-mono text-sm text-gray-500">{order.id}</p>
                    <p className="font-semibold mt-1 text-lg">
                      {order.status === 'Quote Request' ? 'Quote request' : `${order.items?.length || 0} items`}
                    </p>
                    <p className="text-sm text-gray-600">{order.date}</p>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-2xl font-bold">₦{(order.total || 0).toLocaleString()}</p>
                    <span className={`inline-block px-4 py-1 rounded-full text-sm mt-2 ${
                      order.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 mt-6 text-center">
          Orders are stored securely in our database. Contact us on WhatsApp if you need help with an order.
        </p>
      </div>
    </div>
  );
}
