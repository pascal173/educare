'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Smile } from 'lucide-react';
import { toast } from 'react-hot-toast';
import emailjs from '@emailjs/browser';

export default function RequestQuote() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    interestedItems: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.message) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);

    const quoteRequest = {
      id: "QUOTE-" + Date.now(),
      date: new Date().toLocaleDateString('en-GB'),
      customer: formData.fullName,
      email: formData.email,
      total: 0,
      items: [],
      status: "Quote Request" as const,
      reference: "Request for Quote",
      delivery: null,
      quoteMessage: formData.message,
      interestedItems: formData.interestedItems,
      company: formData.company,
      phone: formData.phone,
    };

    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: quoteRequest.id,
          customer: quoteRequest.customer,
          email: quoteRequest.email,
          phone: quoteRequest.phone,
          company: quoteRequest.company,
          interestedItems: quoteRequest.interestedItems,
          message: quoteRequest.quoteMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Quote request could not be saved');
      }
    } catch {
      toast.error("We could not save your quote request. Please try again.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    setIsSuccess(true);

    emailjs.send(
        "service_41pn9v4",
        "template_slj46bq",
        {
          to_email: formData.email,
          customer_name: formData.fullName,
          order_id: quoteRequest.id,
          date: quoteRequest.date,
          total: "Quote Request",
          address: "We will contact you soon",
        },
        "Spu0RTPNhcm1JUPIN"
      )
      .catch(() => console.log("Email not sent"));

    setTimeout(() => {
      router.push('/');
    }, 3500);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-green-100 rounded-full mb-8">
            <Smile size={80} className="text-green-600" />
          </div>
          <h2 className="text-5xl font-bold text-green-700 mb-4">Quote Received!</h2>
          <p className="text-2xl text-gray-600 mb-6">Thank you, {formData.fullName.split(" ")[0]}!</p>
          <p className="text-xl text-gray-600">We will get back to you as soon as possible.</p>
          <p className="text-green-600 mt-10">Redirecting to homepage...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-3xl mx-auto px-6 pt-10">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-blue-600 mb-8 hover:underline">
          <ArrowLeft size={20} /> Back to Shop
        </button>

        <h1 className="text-4xl font-bold mb-2">Request for Quote</h1>
        <p className="text-gray-600 mb-10">Tell us what you need for your school, hospital, or laboratory</p>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow p-10 space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <input type="text" placeholder="Full Name *" className="border p-4 rounded-2xl" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} required />
            <input type="email" placeholder="Email Address *" className="border p-4 rounded-2xl" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
            <input type="tel" placeholder="Phone Number" className="border p-4 rounded-2xl" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
            <input type="text" placeholder="Company / Institution" className="border p-4 rounded-2xl" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm mb-2 font-medium">What equipment are you interested in?</label>
            <textarea placeholder="E.g: Hospital beds, Lab centrifuges, School microscopes..." className="border p-4 rounded-2xl w-full h-24" value={formData.interestedItems} onChange={(e) => setFormData({...formData, interestedItems: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm mb-2 font-medium">Additional Message / Requirements *</label>
            <textarea placeholder="Tell us more about your needs..." className="border p-4 rounded-2xl w-full h-32" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} required />
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white py-5 rounded-3xl text-xl font-semibold hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-3">
            {isSubmitting ? "Sending Request..." : "Send Quote Request"}
            <Send size={24} />
          </button>
        </form>
      </div>
    </div>
  );
}
