'use client';

import { X } from 'lucide-react';
import Image from 'next/image';

interface ProductImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: string;
  name: string;
  price: number;
  description?: string;
}

export default function ProductImageModal({ isOpen, onClose, image, name, price, description }: ProductImageModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[300] flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-10 bg-white/90 rounded-full p-2 hover:bg-white transition"
        >
          <X size={24} />
        </button>

        <div className="relative w-full h-[400px] bg-slate-100">
          <Image 
            src={image} 
            alt={name} 
            fill 
            className="object-contain p-8" 
            unoptimized 
          />
        </div>

        <div className="p-8">
          <p className="text-blue-700 font-bold text-sm mb-1">PRODUCT DETAILS</p>
          <h2 className="text-3xl font-bold text-slate-950 mb-2">{name}</h2>
          <p className="text-3xl font-bold text-slate-950 mb-4 /* NairaCacheBust-20260601214047 */ /* Naira fix v2 */">{"\u20A6"}{price.toLocaleString()}</p>
          
          {description && (
            <p className="text-slate-600 text-lg leading-relaxed">{description}</p>
          )}
          
          <div className="mt-6 text-sm text-slate-500">
            Click outside or press the X to close
          </div>
        </div>
      </div>
    </div>
  );
}



