'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useOrders } from '@/lib/ordersStore';

export default function Orders() {
  const { orders } = useOrders();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-5xl mx-auto px-6 pt-10">
        <Link href="/" className="flex items-center gap-2 text-blue-600 mb-8 hover:underline">
          <ArrowLeft size={20} /> Back to Shop
        </Link>

        <h1 className="text-4xl font-bold mb-2">My Orders & Quotes</h1>
        <p className="text-gray-600 mb-10">Track your previous purchases and quote requests</p>

        <div className="bg-white rounded-3xl shadow overflow-hidden">
          {orders.length === 0 ? (
            <p className="text-center py-20 text-gray-500">No orders yet</p>
          ) : (
            <div className="divide-y">
              {orders.map((order) => (
                <div key={order.id} className="p-8 flex justify-between items-center hover:bg-gray-50">
                  <div>
                    <p className="font-mono text-sm text-gray-500">{order.id}</p>
                    <p className="font-semibold mt-1">
                      {order.status === 'Quote Request' ? 'Quote request' : `${order.items.length} items`}
                    </p>
                    <p className="text-sm text-gray-600">{order.date}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold">₦{order.total.toLocaleString()}</p>
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
      </div>
    </div>
  );
}
