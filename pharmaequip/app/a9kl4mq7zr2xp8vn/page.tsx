'use client';
import { useEffect, useMemo, useState } from 'react';
import type { Order } from '@/lib/ordersStore';
import { LogOut, Eye, X, Reply, Mail, Phone, RefreshCw } from 'lucide-react';

type AdminTab = 'all' | 'orders' | 'quotes';
const ADMIN_USERNAME = 'educare-owner';
const ADMIN_PASSWORD = 'Edc-7Qm2-Client-91';
const ADMIN_SESSION_KEY = 'educare-admin-session';

const isQuoteRequest = (item: Order) => item.status === 'Quote Request';
const formatMoney = (amount: number) => `NGN ${amount.toLocaleString()}`;

const getRequestSummary = (item: Order) => {
  if (isQuoteRequest(item)) {
    return item.interestedItems?.trim() || item.quoteMessage?.trim() || item.message?.trim() || 'Quote request submitted';
  }

  if (!item.items.length) return 'No items saved';

  return item.items
    .map((orderItem) => `${orderItem.name} x${orderItem.quantity}`)
    .join(', ');
};

const getPhone = (item: Order) => item.phone || item.delivery?.phone;
const getDeliveryAddress = (item: Order) => {
  if (!item.delivery) return '';
  return [item.delivery.address, item.delivery.city, item.delivery.state]
    .filter(Boolean)
    .join(', ');
};

export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedItem, setSelectedItem] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('all');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const quoteRequests = useMemo(
    () => orders.filter((item) => isQuoteRequest(item)),
    [orders]
  );
  const customerOrders = useMemo(
    () => orders.filter((item) => !isQuoteRequest(item)),
    [orders]
  );

  const displayedItems = activeTab === 'all'
    ? orders
    : activeTab === 'orders'
      ? customerOrders
      : quoteRequests;

  const refreshRequests = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/admin-requests', { cache: 'no-store' });
      if (!response.ok) throw new Error('Unable to load requests');
      const data = (await response.json()) as Order[];
      setOrders(data);
    } catch {
      alert('Could not load orders and quotes. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true') {
      setIsLoggedIn(true);
    }

    refreshRequests();
    refreshRequests();
    const interval = window.setInterval(refreshRequests, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (failedAttempts >= 5) {
      alert('Too many login attempts. Refresh the page before trying again.');
      return;
    }

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      setFailedAttempts(0);
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
    } else {
      setFailedAttempts((attempts) => attempts + 1);
      alert('Wrong credentials.');
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  };

  const replyToQuote = (quote: Order) => {
    const subject = `Re: Quote Request ${quote.id}`;
    const body = [
      `Dear ${quote.customer},`,
      '',
      'Thank you for your quote request.',
      '',
      `We received your request${quote.interestedItems ? ` for: ${quote.interestedItems}` : ''}.`,
      'Please find our response below:',
      '',
      '',
      'Best regards,',
      'EduCare Team',
    ].join('\n');

    window.location.href = `mailto:${quote.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const markOrderAsPaid = async (order: Order) => {
    const response = await fetch('/api/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: order.id, status: 'Paid' }),
    });

    if (!response.ok) {
      alert('Could not update the order status.');
      return;
    }

    setSelectedItem({ ...order, status: 'Paid' });
    await refreshRequests();
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 text-slate-950">
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl w-full max-w-md border border-slate-200">
          <h2 className="text-3xl font-bold text-center mb-3 text-slate-950">Secure Staff Login</h2>
          <p className="text-center text-base text-slate-700 mb-8">Enter the private staff credentials to view orders and quote requests.</p>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-base font-semibold mb-2 text-slate-900">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-5 py-4 border border-slate-400 rounded-2xl text-lg text-slate-950 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600" placeholder="Staff username" required />
            </div>
            <div>
              <label className="block text-base font-semibold mb-2 text-slate-900">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-5 py-4 border border-slate-400 rounded-2xl text-lg text-slate-950 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600" placeholder="Staff password" required />
            </div>
            {failedAttempts > 0 && (
              <p className="rounded-2xl bg-red-50 border border-red-200 p-3 text-sm font-semibold text-red-700">
                Wrong login details. Attempts used: {failedAttempts}/5.
              </p>
            )}
            <button type="submit" className="w-full bg-blue-700 text-white py-4 rounded-2xl text-lg font-bold hover:bg-blue-800 disabled:bg-slate-400" disabled={failedAttempts >= 5}>Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6 text-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-950">Orders & Quote Requests</h1>
            <p className="text-base font-medium text-slate-700 mt-2">Clear view of customer requests, items to deliver, payment status, and contact details.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={refreshRequests} className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-300 rounded-2xl text-slate-950 font-bold shadow-sm hover:bg-slate-50" disabled={isRefreshing}>
              <RefreshCw size={18} /> {isRefreshing ? 'Refreshing' : 'Refresh'}
            </button>
            <button onClick={logout} className="flex items-center gap-2 px-5 py-3 bg-white border border-red-200 rounded-2xl text-red-700 font-bold shadow-sm hover:bg-red-50">
              <LogOut size={20} /> Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6 rounded-2xl bg-white p-2 shadow-sm border border-slate-200 overflow-x-auto">
          {[
            { id: 'all' as const, label: 'All', count: orders.length },
            { id: 'orders' as const, label: 'Orders', count: customerOrders.length },
            { id: 'quotes' as const, label: 'Quotes', count: quoteRequests.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`min-w-28 px-4 py-3 rounded-xl flex items-center justify-center gap-2 whitespace-nowrap text-base font-bold ${
                activeTab === tab.id ? 'bg-blue-700 text-white' : 'text-slate-950 hover:bg-slate-100'
              }`}
            >
              {tab.label}
              <span className={`${activeTab === tab.id ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-800'} text-sm font-bold px-2 py-0.5 rounded-full`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="hidden md:block bg-white rounded-3xl shadow overflow-hidden border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-200">
                <tr>
                  <th className="text-left p-6 text-base font-bold text-slate-900">ID</th>
                  <th className="text-left p-6 text-base font-bold text-slate-900">Date</th>
                  <th className="text-left p-6 text-base font-bold text-slate-900">Customer</th>
                  <th className="text-left p-6 text-base font-bold text-slate-900">Request / Items</th>
                  <th className="text-left p-6 text-base font-bold text-slate-900">Type</th>
                  <th className="text-left p-6 text-base font-bold text-slate-900">Status</th>
                  <th className="text-center p-6 text-base font-bold text-slate-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {displayedItems.length === 0 ? (
                  <tr><td colSpan={7} className="p-12 text-center text-slate-600 text-lg font-semibold">No requests yet.</td></tr>
                ) : (
                  displayedItems.map((item, index) => (
                    <tr key={`${item.id}-${index}`} className="hover:bg-blue-50">
                      <td className="p-6 font-mono text-sm text-slate-800">{item.id}</td>
                      <td className="p-6 text-slate-800 font-medium">{item.date}</td>
                      <td className="p-6 font-bold text-slate-950">{item.customer}</td>
                      <td className="p-6 max-w-xs">
                        <p className="line-clamp-2 text-base font-medium text-slate-800">{getRequestSummary(item)}</p>
                      </td>
                      <td className="p-6">
                        <span className={`px-4 py-1 rounded-full text-sm font-bold ${isQuoteRequest(item) ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                          {isQuoteRequest(item) ? 'Quote' : 'Order'}
                        </span>
                      </td>
                      <td className="p-6 font-bold text-slate-800">{item.status}</td>
                      <td className="p-6 text-center">
                        <button onClick={() => setSelectedItem(item)} className="inline-flex items-center gap-2 bg-blue-700 text-white px-4 py-3 rounded-xl font-bold hover:bg-blue-800" aria-label={`View ${item.id}`}>
                          <Eye size={20} /> View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="md:hidden space-y-4">
          {displayedItems.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center text-slate-600 text-lg font-bold shadow border border-slate-200">No requests yet.</div>
          ) : (
            displayedItems.map((item, index) => (
              <div key={`${item.id}-${index}`} className="bg-white rounded-3xl shadow p-5 border border-slate-200">
                <div className="flex justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-slate-600 truncate">{item.id}</p>
                    <h3 className="font-bold text-xl text-slate-950 truncate">{item.customer}</h3>
                    <p className="text-base font-medium text-slate-700">{item.date}</p>
                    <p className="text-base font-medium text-slate-800 mt-2 line-clamp-2">{getRequestSummary(item)}</p>
                  </div>
                  <button onClick={() => setSelectedItem(item)} className="bg-blue-700 text-white px-4 py-3 rounded-xl font-bold self-start flex items-center gap-2" aria-label={`View ${item.id}`}>
                    <Eye size={20} /> View
                  </button>
                </div>
                <div className="flex justify-between items-center mt-5">
                  <span className={`px-4 py-1 rounded-full text-sm font-bold ${isQuoteRequest(item) ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                    {isQuoteRequest(item) ? 'Quote' : 'Order'}
                  </span>
                  <span className="text-base font-bold text-slate-800">{item.status}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-black/70 z-[200] flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-white rounded-t-3xl md:rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-5 md:p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-2xl font-bold text-slate-950">{isQuoteRequest(selectedItem) ? 'Quote Request' : 'Order Details'}</h2>
                <p className="text-sm font-semibold text-slate-600">{selectedItem.id}</p>
              </div>
              <button onClick={() => setSelectedItem(null)} className="p-2 text-slate-950 hover:bg-slate-200 rounded-full" aria-label="Close details">
                <X size={28} />
              </button>
            </div>

            <div className="p-5 md:p-6 space-y-6 overflow-auto max-h-[65vh]">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-100 p-4 rounded-2xl">
                  <p className="text-sm font-semibold text-slate-600">Customer</p>
                  <p className="font-bold text-slate-950 text-lg">{selectedItem.customer}</p>
                </div>
                <div className="bg-slate-100 p-4 rounded-2xl">
                  <p className="text-sm font-semibold text-slate-600">Date</p>
                  <p className="font-bold text-slate-950 text-lg">{selectedItem.date}</p>
                </div>
                {selectedItem.email && (
                  <div className="bg-slate-100 p-4 rounded-2xl md:col-span-2">
                    <p className="text-sm font-semibold text-slate-600 flex items-center gap-2"><Mail size={16} /> Email</p>
                    <p className="font-bold text-slate-950 break-all">{selectedItem.email}</p>
                  </div>
                )}
                {getPhone(selectedItem) && (
                  <div className="bg-slate-100 p-4 rounded-2xl md:col-span-2">
                    <p className="text-sm font-semibold text-slate-600 flex items-center gap-2"><Phone size={16} /> Phone</p>
                    <p className="font-bold text-slate-950">{getPhone(selectedItem)}</p>
                  </div>
                )}
              </div>

              {isQuoteRequest(selectedItem) ? (
                <div className="space-y-4">
                  {selectedItem.company && (
                    <div>
                      <p className="text-sm font-semibold text-slate-600 mb-2">Company / Institution</p>
                      <p className="bg-slate-100 p-5 rounded-2xl text-slate-950 font-semibold">{selectedItem.company}</p>
                    </div>
                  )}
                  {selectedItem.interestedItems && (
                    <div>
                      <p className="text-sm font-semibold text-slate-600 mb-2">Interested Items</p>
                      <p className="bg-slate-100 p-5 rounded-2xl whitespace-pre-wrap text-slate-950 font-semibold">{selectedItem.interestedItems}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-slate-600 mb-2">Customer Message</p>
                    <p className="bg-slate-100 p-5 rounded-2xl whitespace-pre-wrap text-slate-950 font-semibold">
                      {selectedItem.quoteMessage || selectedItem.message || 'No message provided.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                  <p className="text-base font-bold text-slate-800 mb-3">Items to Deliver</p>
                  <div className="space-y-3">
                    {selectedItem.items.length > 0 ? (
                      selectedItem.items.map((item, index) => (
                        <div key={`${item.id}-${index}`} className="flex justify-between gap-4 bg-slate-100 p-4 rounded-2xl">
                          <div>
                            <p className="font-bold text-slate-950">{item.name}</p>
                            <p className="text-base font-semibold text-slate-700">Quantity: {item.quantity}</p>
                          </div>
                          <span className="font-bold text-slate-950">{formatMoney(item.price * item.quantity)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="bg-slate-100 p-5 rounded-2xl text-slate-600 font-semibold">No ordered items were saved for this order.</p>
                    )}
                  </div>
                  <div className="flex justify-between text-xl font-bold border-t mt-5 pt-5">
                    <span>Total</span>
                    <span>{formatMoney(selectedItem.total || 0)}</span>
                  </div>
                  </div>

                  <div>
                    <p className="text-base font-bold text-slate-800 mb-3">Delivery Information</p>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="bg-slate-100 p-4 rounded-2xl">
                        <p className="text-sm font-semibold text-slate-600">Delivery Type</p>
                        <p className="font-bold text-slate-950 capitalize">{selectedItem.deliveryType || selectedItem.delivery?.type || 'Not specified'}</p>
                      </div>
                      <div className="bg-slate-100 p-4 rounded-2xl">
                        <p className="text-sm font-semibold text-slate-600">Payment</p>
                        <p className="font-bold text-slate-950">{selectedItem.reference || selectedItem.paymentMethod || 'Not specified'}</p>
                      </div>
                      <div className="bg-slate-100 p-4 rounded-2xl md:col-span-2">
                        <p className="text-sm font-semibold text-slate-600">Address</p>
                        <p className="font-bold text-slate-950">{getDeliveryAddress(selectedItem) || 'No delivery address saved'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 md:p-6 border-t border-slate-200 bg-slate-50 flex flex-col md:flex-row gap-3">
              {isQuoteRequest(selectedItem) && selectedItem.email && (
                <button onClick={() => replyToQuote(selectedItem)} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700">
                  <Reply size={20} /> Reply via Email
                </button>
              )}
              {!isQuoteRequest(selectedItem) && selectedItem.status === 'Pending' && (
                <button onClick={() => markOrderAsPaid(selectedItem)} className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-semibold hover:bg-green-700">
                  Mark as Paid
                </button>
              )}
              <button onClick={() => setSelectedItem(null)} className="flex-1 md:flex-none bg-gray-900 text-white py-4 px-8 rounded-2xl font-semibold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
