'use client';

import Image from 'next/image';
import Link from 'next/link';
import ProductGrid from '@/components/ProductGrid';
import CartModal from '@/components/CartModal';
import { MapPin, Menu, MessageCircle, Phone, ShoppingCart, X } from 'lucide-react';
import { useCart } from '@/lib/cartStore';
import { useState } from 'react';

const whatsappUrl = 'https://wa.me/2347067526793';

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { cart } = useCart();
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <nav className="sticky top-0 bg-white/95 backdrop-blur border-b border-slate-200 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="EduCare Medical Supplies" width={58} height={58} className="rounded-xl object-contain" priority />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-blue-900">EduCare</h1>
              <p className="text-sm -mt-1 text-slate-600">Medical Supplies</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-base font-bold text-slate-800">
            <Link href="#products" className="hover:text-blue-700">Products</Link>
            <Link href="#sets" className="hover:text-blue-700">Sets</Link>
            <Link href="/request-quote" className="hover:text-blue-700">Request Quote</Link>
          </div>

          <div className="flex items-center gap-3">
            <a href={whatsappUrl} target="_blank" className="hidden md:flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-2xl font-bold hover:bg-green-700">
              <MessageCircle size={20} /> WhatsApp
            </a>

            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-3 hover:bg-slate-100 rounded-xl" aria-label="Open menu">
              {menuOpen ? <X size={28} className="text-slate-950" /> : <Menu size={28} className="text-slate-950" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t bg-white py-6 text-center space-y-6 text-lg font-bold">
            <Link href="#products" onClick={() => setMenuOpen(false)} className="block">Products</Link>
            <Link href="#sets" onClick={() => setMenuOpen(false)} className="block">Sets</Link>
            <Link href="/request-quote" onClick={() => setMenuOpen(false)} className="block">Request Quote</Link>
            <a href={whatsappUrl} target="_blank" className="block text-green-700">WhatsApp</a>
          </div>
        )}
      </nav>

      {cartCount > 0 && (
        <button onClick={() => setCartOpen(true)} className="fixed bottom-8 right-8 bg-green-600 hover:bg-green-700 text-white p-5 rounded-full shadow-2xl z-[100]" aria-label="Open cart">
          <ShoppingCart size={28} />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center border-2 border-white">
            {cartCount}
          </span>
        </button>
      )}

      <section className="bg-blue-950 text-white">
        <div className="max-w-7xl mx-auto px-5 py-20 md:py-24 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm font-bold mb-6">
              <MapPin size={16} /> Delivery currently focused on Asaba, Delta State
            </div>
            <h2 className="text-4xl md:text-6xl font-bold leading-tight mb-6">First aid kits, nursing training kits, and medical supplies.</h2>
            <p className="text-xl text-blue-100 mb-8">Order individual diagnostic tools or complete nursing sets from EduCare Medical Supplies in Asaba.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#products" className="bg-white text-blue-900 px-8 py-4 rounded-2xl text-lg font-bold text-center">Shop Products</a>
              <a href={whatsappUrl} target="_blank" className="border-2 border-white text-white px-8 py-4 rounded-2xl text-lg font-bold text-center hover:bg-white hover:text-blue-900">Chat on WhatsApp</a>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-2xl">
            <Image src="https://commons.wikimedia.org/wiki/Special:Redirect/file/CM-2000.jpg" alt="Nursing kit with stethoscope and blood pressure monitor" width={900} height={600} unoptimized className="rounded-2xl w-full h-auto object-cover" priority />
          </div>
        </div>
      </section>

      <section className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-5 grid md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <p className="text-sm font-bold text-blue-700">Location</p>
            <p className="text-xl font-bold mt-1">Asaba, Delta State</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <p className="text-sm font-bold text-blue-700">Phone / WhatsApp</p>
            <p className="text-xl font-bold mt-1">07067526793</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <p className="text-sm font-bold text-blue-700">Email</p>
            <p className="text-xl font-bold mt-1 break-all">educaresupplies21@gmail.com</p>
          </div>
        </div>
      </section>

      <section id="products" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-5">
          <div className="max-w-3xl mb-10">
            <h3 className="text-4xl font-bold mb-4">Shop Individual Items & Sets</h3>
            <p className="text-lg text-slate-600">Choose single items like sphygmomanometers, stethoscopes, and pulse oximeters, or buy ready-made nursing sets.</p>
          </div>
          <ProductGrid />
        </div>
      </section>

      <section id="sets" className="py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-5">
          <h3 className="text-4xl font-bold text-center mb-12">Available Sets</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              ['Basic Set', 'â‚¦20,000', 'Aneroid sphygmomanometer, stethoscope, thermometer, pulse oximeter, chain breast watch.'],
              ['Premium Set', 'â‚¦23,000', 'Digital sphygmomanometer, thermometer, pulse oximeter, chain breast watch.'],
              ['Classic Set', 'â‚¦41,000', 'Digital sphygmomanometer, Littmann Classic III stethoscope, thermometer, pulse oximeter, chain breast watch.'],
              ['Advanced Set', 'â‚¦55,000', 'Digital sphygmomanometer, Littmann Classic III stethoscope, thermometer, pulse oximeter, chain breast watch, tourniquet, pen torch, retractable tape, patella hammer.'],
            ].map(([name, price, items]) => (
              <div key={name} className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm">
                <p className="text-2xl font-bold text-blue-900">{name}</p>
                <p className="text-3xl font-bold my-4">{price}</p>
                <p className="text-slate-700">{items}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-blue-700 text-white text-center">
        <div className="max-w-3xl mx-auto px-5">
          <h3 className="text-4xl font-bold mb-6">Need help choosing the right set?</h3>
          <p className="text-xl text-blue-100 mb-10">Send a WhatsApp message and we will confirm the best option for your school, training, or care use.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={whatsappUrl} target="_blank" className="bg-white text-blue-900 px-8 py-4 rounded-2xl text-lg font-bold">Chat on WhatsApp</a>
            <Link href="/request-quote" className="border-2 border-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-white hover:text-blue-900">Request Quote</Link>
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 py-16 text-white">
        <div className="max-w-7xl mx-auto px-5 grid md:grid-cols-[1fr_1fr] gap-10 items-center">
          <div>
            <Image src="/logo.png" alt="EduCare Medical Supplies" width={220} height={90} className="bg-white rounded-2xl p-3 mb-6" />
            <p className="text-slate-300 text-lg">First Aid Kits | Nursing Training Kits | Medical Supplies</p>
            <p className="text-slate-400 mt-3">Equipping Learning & Care in Asaba, Delta State.</p>
          </div>
          <div className="space-y-4 md:text-right">
            <p className="flex md:justify-end items-center gap-3 text-lg"><Phone size={20} /> 07067526793 | 09049293418</p>
            <p className="text-lg">educaresupplies21@gmail.com</p>
            <p className="flex md:justify-end items-center gap-3 text-lg"><MapPin size={20} /> Asaba, Delta State</p>
          </div>
        </div>
      </footer>

      <CartModal isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

