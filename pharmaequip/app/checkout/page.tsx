'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/lib/cartStore';
import type { CartItem } from '@/lib/cartStore';
import type { Order, OrderStatus } from '@/lib/ordersStore';
import { useRouter } from 'next/navigation';
import { AlertTriangle, MessageCircle, Smile } from 'lucide-react';
import { toast } from 'react-hot-toast';

type PaystackConstructor = new () => {
  newTransaction: (options: {
    key: string;
    email: string;
    amount: number;
    currency: string;
    reference: string;
    firstName?: string;
    phone?: string;
    metadata?: Record<string, unknown>;
    onLoad?: () => void;
    onError?: (error: { message?: string }) => void;
    onSuccess: (transaction: { reference?: string }) => void;
    onCancel: () => void;
  }) => void;
};

export default function Checkout() {
  const { cart, totalPrice, clearCart } = useCart();
  const router = useRouter();

  const [deliveryType, setDeliveryType] = useState<'door' | 'pickup' | 'whatsapp'>('door');
  const [deliveryInfo, setDeliveryInfo] = useState({ fullName: '', email: '', phone: '', address: '', city: 'Asaba', state: 'Delta' });
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'cod'>('paystack');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [PaystackPop, setPaystackPop] = useState<PaystackConstructor | null>(null);
  const [mounted, setMounted] = useState(false);

  const subtotal = totalPrice();
  const deliveryFee = deliveryType === 'door' ? 2000 : 0;
  const total = subtotal + deliveryFee;
  const canUseCOD = subtotal <= 100000;
  const isWhatsApp = deliveryType === 'whatsapp';
  const isAsabaDelivery = deliveryInfo.state === 'Delta' && deliveryInfo.city.trim().toLowerCase() === 'asaba';
  const requiredDeliveryFields = [
    { key: 'fullName', label: 'Full name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone number' },
    { key: 'address', label: 'Full address' },
    { key: 'city', label: 'City' },
  ] as const;
  const missingDeliveryFields = deliveryType === 'door'
    ? requiredDeliveryFields
        .filter((field) => !deliveryInfo[field.key].trim())
        .map((field) => field.label)
    : [];
  const canConfirmOrder = missingDeliveryFields.length === 0 && (deliveryType !== 'door' || isAsabaDelivery);

  useEffect(() => {
    setMounted(true);
    import('@paystack/inline-js').then((mod) => setPaystackPop(() => mod.default));
  }, []);

  useEffect(() => {
    if (isWhatsApp) setPaymentMethod('cod');
  }, [isWhatsApp]);

  const sendConfirmationEmail = async (order: Order) => {
    if (!deliveryInfo.email) return;

    try {
      await fetch('/api/send-order-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to_email: deliveryInfo.email,
          customer_name: deliveryInfo.fullName || 'Valued Customer',
          order_id: order.id,
          date: order.date,
          total: `NGN ${total.toLocaleString()}`,
          address: deliveryType === 'door' 
            ? `${deliveryInfo.address}, ${deliveryInfo.city}, ${deliveryInfo.state}` 
            : 'WhatsApp order',
          items_list: cart.map((item: CartItem) => `${item.name} x${item.quantity}`).join('\n'),
        }),
      });
    } catch (err) {
      console.error('Failed to send confirmation email:', err);
    }
  };

  const createOrder = (orderStatus: OrderStatus, reference?: string): Order => ({
    id: `ORD-${Date.now()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    date: new Date().toLocaleDateString('en-GB'),
    customer: deliveryInfo.fullName,
    email: deliveryInfo.email,
    total,
    items: cart.map(({ id, name, price, quantity }) => ({ id, name, price, quantity })),
    status: orderStatus,
    reference: paymentMethod === 'cod' ? 'Cash on delivery' : reference || 'Paystack payment',
    paymentMethod,
    deliveryType,
    delivery: { ...deliveryInfo, type: deliveryType },
  });

  const saveOrder = async (order: Order) => {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: order.id,
        customer: order.customer,
        email: order.email,
        phone: deliveryInfo.phone,
        total: order.total,
        status: order.status,
        reference: order.reference,
        paymentMethod: order.paymentMethod,
        deliveryType: order.deliveryType,
        delivery: {
          address: deliveryInfo.address,
          city: deliveryInfo.city,
          state: deliveryInfo.state,
        },
        items: order.items,
      }),
    });

    if (!response.ok) {
      throw new Error('Order could not be saved');
    }
  };

  const showSuccess = (message: string, order: Order) => {
    setStatusMessage(message);
    setStatus('success');
    sendConfirmationEmail(order);
    setTimeout(() => {
      clearCart();
      router.push('/');
    }, 3500);
  };

  const showFailure = (message: string) => {
    setStatusMessage(message);
    setStatus('failed');
    setIsLoading(false);
  };

  const handleConfirmOrder = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!canConfirmOrder) {
      if (missingDeliveryFields.length > 0) {
        toast.error(`Please complete: ${missingDeliveryFields.join(', ')}`);
      } else {
        toast.error('Delivery is currently limited to Asaba, Delta State.');
      }
      return;
    }

    if (isWhatsApp) {
      const message = `Hello,%0A%0AI want to order:%0A${cart.map((item: CartItem) => `- ${item.name} x${item.quantity}`).join('%0A')}%0A%0ATotal: NGN ${total.toLocaleString()}%0AName: ${deliveryInfo.fullName}%0APhone: ${deliveryInfo.phone}`;
      window.open(`https://wa.me/2347067526793?text=${message}`, '_blank');
      toast.success('Opening WhatsApp...');
      setTimeout(() => {
        clearCart();
        router.push('/');
      }, 2000);
      return;
    }

    setIsLoading(true);

    if (paymentMethod === 'cod') {
      const orderData = createOrder('Pending');
      saveOrder(orderData)
        .then(() => showSuccess('Your order has been placed. We will contact you to confirm delivery in Asaba.', orderData))
        .catch(() => showFailure('We could not place your order. Please try again or contact us on WhatsApp.'))
        .finally(() => setIsLoading(false));
      return;
    }

    if (!PaystackPop) {
      setIsLoading(false);
      toast.error('Paystack is still loading...');
      return;
    }

    const paystack = new PaystackPop();
    const reference = `EDUCARE-${Date.now()}`;

    if (!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) {
      toast.error("Payment is not configured. Please contact support.");
      setIsLoading(false);
      return;
    }

    try {
      paystack.newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: deliveryInfo.email,
        amount: Math.round(total * 100),
        currency: 'NGN',
        reference,
        firstName: deliveryInfo.fullName,
        phone: deliveryInfo.phone,
        metadata: {
          custom_fields: [
            { display_name: 'Delivery City', variable_name: 'delivery_city', value: deliveryInfo.city },
            { display_name: 'Items', variable_name: 'items', value: cart.map((item) => `${item.name} x${item.quantity}`).join(', ') },
          ],
        },
        onLoad: () => setIsLoading(false),
        onError: (error) => showFailure(error?.message || 'Payment could not be started. Your order was not placed.'),
        onSuccess: (transaction) => {
          setIsLoading(true);
          const paidOrder = createOrder('Paid', transaction.reference || reference);
          saveOrder(paidOrder)
            .then(() => showSuccess('Payment successful. Your order was placed and Paystack will send your receipt to your email.', paidOrder))
            .catch(() => showFailure('Payment was successful, but we could not save your order. Please contact us immediately with your Paystack receipt.'))
            .finally(() => setIsLoading(false));
        },
        onCancel: () => {
          toast.error('Payment cancelled or declined');
          showFailure('Payment was cancelled or declined. Your order was not placed.');
        },
      });
    } catch {
      showFailure('Payment could not be started. Your order was not placed.');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md bg-white rounded-3xl shadow-xl p-10 border border-green-100">
          <Smile size={110} className="mx-auto text-green-600 mb-6" />
          <h1 className="text-4xl font-bold text-green-700 mb-4">Order Confirmed</h1>
          <p className="text-xl text-gray-700">{statusMessage || 'Thank you for shopping with EduCare.'}</p>
          <button onClick={() => router.push('/')} className="mt-10 bg-green-600 text-white px-10 py-4 rounded-2xl text-lg font-semibold hover:bg-green-700">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-6">
        <div className="text-center max-w-lg bg-white border border-red-100 rounded-3xl shadow-xl p-10">
          <AlertTriangle size={96} className="mx-auto text-red-600 mb-6" />
          <h1 className="text-4xl font-bold text-red-700 mb-4">Order Not Placed</h1>
          <p className="text-xl text-gray-700">{statusMessage || 'Payment was declined or cancelled. Your order was not placed.'}</p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => setStatus('idle')} className="bg-red-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-red-700">
              Try Again
            </button>
            <button onClick={() => router.push('/')} className="border border-gray-400 px-8 py-4 rounded-2xl text-lg font-semibold">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <button onClick={() => router.back()} className="flex items-center gap-2 mb-8 text-black font-bold text-lg hover:text-blue-700">
          Back to Cart
        </button>

        <h1 className="text-4xl font-bold mb-3">Checkout</h1>
        <p className="text-slate-600 mb-10">Delivery is currently limited to Asaba, Delta State.</p>

        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow">
              <h2 className="text-2xl font-semibold mb-6">Delivery Method</h2>
              <div className="space-y-4">
                <label className="flex items-center gap-4 p-5 border rounded-2xl cursor-pointer hover:bg-gray-50">
                  <input type="radio" checked={deliveryType === 'door'} onChange={() => setDeliveryType('door')} />
                  <div>
                    <p className="font-medium">Door to Door Delivery</p>
                    <p className="text-sm text-gray-600">NGN 2,000 - Asaba, Delta State only</p>
                  </div>
                </label>

                <label className="flex items-center gap-4 p-5 border rounded-2xl opacity-50 blur-[0.4px] cursor-not-allowed">
                  <input type="radio" disabled />
                  <div>
                    <p className="font-medium">Pickup Station</p>
                    <p className="text-sm text-red-600">Coming Soon</p>
                  </div>
                </label>

                <label className="flex items-center gap-4 p-5 border rounded-2xl cursor-pointer hover:bg-gray-50">
                  <input type="radio" checked={deliveryType === 'whatsapp'} onChange={() => setDeliveryType('whatsapp')} />
                  <div>
                    <p className="font-medium flex items-center gap-2">Order via WhatsApp <MessageCircle size={20} /></p>
                  </div>
                </label>
              </div>
            </div>

            {deliveryType === 'door' && (
              <div className="bg-white p-8 rounded-3xl shadow">
                <h2 className="text-2xl font-semibold mb-6">Delivery Information</h2>
                <div className="space-y-5">
                  <input type="text" placeholder="Full Name *" className="w-full p-4 border rounded-2xl" value={deliveryInfo.fullName} onChange={(event) => setDeliveryInfo({ ...deliveryInfo, fullName: event.target.value })} />
                  <input type="email" placeholder="Email *" className="w-full p-4 border rounded-2xl" value={deliveryInfo.email} onChange={(event) => setDeliveryInfo({ ...deliveryInfo, email: event.target.value })} />
                  <input type="tel" placeholder="Phone *" className="w-full p-4 border rounded-2xl" value={deliveryInfo.phone} onChange={(event) => setDeliveryInfo({ ...deliveryInfo, phone: event.target.value })} />
                  <input type="text" placeholder="Full Address *" className="w-full p-4 border rounded-2xl" value={deliveryInfo.address} onChange={(event) => setDeliveryInfo({ ...deliveryInfo, address: event.target.value })} />
                  <div className="grid grid-cols-2 gap-5">
                    <select className="p-4 border rounded-2xl" value={deliveryInfo.state} onChange={(event) => setDeliveryInfo({ ...deliveryInfo, state: event.target.value })}>
                      <option value="Delta">Delta</option>
                    </select>
                    <input type="text" placeholder="City *" className="p-4 border rounded-2xl" value={deliveryInfo.city} onChange={(event) => setDeliveryInfo({ ...deliveryInfo, city: event.target.value })} />
                  </div>
                  {!isAsabaDelivery && (
                    <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
                      Delivery is currently available only within Asaba, Delta State.
                    </p>
                  )}
                </div>
              </div>
            )}

            {mounted && (
              <div className="bg-white p-8 rounded-3xl shadow">
                <h2 className="text-2xl font-semibold mb-6">Payment Method</h2>
                <div className="space-y-4">
                  <label className={`flex items-center gap-4 p-5 border rounded-2xl ${isWhatsApp ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}`}>
                    <input type="radio" checked={paymentMethod === 'paystack'} onChange={() => !isWhatsApp && setPaymentMethod('paystack')} disabled={isWhatsApp} />
                    <span className="font-medium">Pay with Paystack</span>
                  </label>

                  <label className={`flex items-center gap-4 p-5 border rounded-2xl ${(!canUseCOD || isWhatsApp) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}`}>
                    <input type="radio" checked={paymentMethod === 'cod'} onChange={() => (!isWhatsApp && canUseCOD) && setPaymentMethod('cod')} disabled={!canUseCOD || isWhatsApp} />
                    <div>
                      <p className="font-medium">Cash on Delivery</p>
                      {!canUseCOD && <p className="text-sm text-red-600">Not available for orders above NGN 100,000</p>}
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white p-8 rounded-3xl shadow sticky top-8">
              <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>
              <div className="space-y-4 max-h-80 overflow-auto">
                {cart.map((item: CartItem) => (
                  <div key={item.id} className="flex justify-between text-black">
                    <span>{item.name} x{item.quantity}</span>
                    <span>NGN {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-6 mt-6 space-y-3 text-black">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>NGN {mounted ? subtotal.toLocaleString() : '0'}</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>NGN {deliveryFee.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-3xl font-bold border-t pt-6">
                  <span>Total</span>
                  <span>NGN {mounted ? total.toLocaleString() : '0'}</span>
                </div>
              </div>

              {!canConfirmOrder && (
                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {missingDeliveryFields.length > 0
                    ? `Please complete the delivery form before confirming your order. Missing: ${missingDeliveryFields.join(', ')}.`
                    : 'Delivery is currently limited to Asaba, Delta State.'}
                </div>
              )}

              <button
                onClick={handleConfirmOrder}
                disabled={!canConfirmOrder || isLoading || cart.length === 0}
                aria-disabled={!canConfirmOrder || isLoading || cart.length === 0}
                className={`w-full mt-10 bg-green-600 text-white py-5 rounded-3xl text-xl font-semibold hover:bg-green-700 disabled:opacity-70 ${(!canConfirmOrder || cart.length === 0) ? 'opacity-60 cursor-not-allowed hover:bg-green-600' : ''}`}
              >
                {isLoading ? 'Processing...' : deliveryType === 'whatsapp' ? 'Continue on WhatsApp' : 'Confirm Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}





