'use client';

import { useEffect, useState } from 'react';

export default function PaymentMethod({ 
  paymentMethod, 
  setPaymentMethod, 
  canUseCOD, 
  isWhatsApp 
}: { 
  paymentMethod: 'paystack' | 'cod'; 
  setPaymentMethod: (method: 'paystack' | 'cod') => void; 
  canUseCOD: boolean; 
  isWhatsApp: boolean; 
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="bg-white p-8 rounded-3xl shadow h-48" />; // Placeholder during hydration
  }

  return (
    <div className="bg-white p-8 rounded-3xl shadow">
      <h2 className="text-2xl font-semibold mb-6">Payment Method</h2>
      <div className="space-y-4">
        <label className={`flex items-center gap-4 p-5 border rounded-2xl ${isWhatsApp ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}`}>
          <input type="radio" checked={paymentMethod === 'paystack'} onChange={() => !isWhatsApp && setPaymentMethod('paystack')} disabled={isWhatsApp} />
          <span className="font-medium">💳 Pay with Paystack</span>
        </label>

        <label className={`flex items-center gap-4 p-5 border rounded-2xl ${(!canUseCOD || isWhatsApp) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}`}>
          <input type="radio" checked={paymentMethod === 'cod'} onChange={() => (!isWhatsApp && canUseCOD) && setPaymentMethod('cod')} disabled={!canUseCOD || isWhatsApp} />
          <div>
            <p className="font-medium">💵 Cash on Delivery</p>
            {!canUseCOD && <p className="text-sm text-red-600">Not available for orders above ₦100,000</p>}
          </div>
        </label>
      </div>
    </div>
  );
}