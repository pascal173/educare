'use client';

import Image from 'next/image';
import { useCart } from '@/lib/cartStore';
import { Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useMemo, useState } from 'react';

const allProducts = [
  {
    id: 'aneroid-sphygmomanometer',
    name: 'Aneroid Sphygmomanometer',
    price: 8500,
    category: 'Individual Items',
    image: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Sphygmomanometer.JPG',
  },
  {
    id: 'stethoscope',
    name: 'Stethoscope',
    price: 3500,
    category: 'Individual Items',
    image: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Stethoscope%201.jpg',
  },
  {
    id: 'littmann-classic-ii',
    name: 'Littmann Classic II Stethoscope',
    price: 12000,
    category: 'Individual Items',
    image: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Stethoscope%201.jpg',
  },
  {
    id: 'littmann-classic-iii',
    name: 'Littmann Classic III Stethoscope',
    price: 18000,
    category: 'Individual Items',
    image: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Stethoscope%201.jpg',
  },
  {
    id: 'pulse-oximeter',
    name: 'Pulse Oximeter',
    price: 4000,
    category: 'Individual Items',
    image: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Pulox%20Pulse%20Oximeter.JPG',
  },
  {
    id: 'basic-set',
    name: 'Basic Nursing Set',
    price: 20000,
    category: 'Sets',
    image: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/CM-2000.jpg',
    description: 'Aneroid sphygmomanometer, stethoscope, thermometer, pulse oximeter, chain breast watch.',
  },
  {
    id: 'premium-set',
    name: 'Premium Nursing Set',
    price: 23000,
    category: 'Sets',
    image: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/CM-2000.jpg',
    description: 'Digital sphygmomanometer, thermometer, pulse oximeter, chain breast watch.',
  },
  {
    id: 'classic-set',
    name: 'Classic Nursing Set',
    price: 41000,
    category: 'Sets',
    image: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/CM-2000.jpg',
    description: "Digital sphygmomanometer, Littmann Classic III stethoscope, thermometer, pulse oximeter, chain breast watch.",
  },
  {
    id: 'advanced-set',
    name: 'Advanced Nursing Set',
    price: 55000,
    category: 'Sets',
    image: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/CM-2000.jpg',
    description: 'Digital sphygmomanometer, Littmann Classic III stethoscope, thermometer, pulse oximeter, chain breast watch, tourniquet, pen torch, retractable tape, patella hammer.',
  },
];

export default function ProductGrid() {
  const { addToCart } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState('default');

  const categories = ['All', ...new Set(allProducts.map((product) => product.category))];

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...allProducts];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter((product) =>
        `${product.name} ${product.category} ${product.description || ''}`.toLowerCase().includes(term)
      );
    }

    if (selectedCategory !== 'All') {
      result = result.filter((product) => product.category === selectedCategory);
    }

    if (sortOption === 'price-low') result.sort((a, b) => a.price - b.price);
    if (sortOption === 'price-high') result.sort((a, b) => b.price - a.price);
    if (sortOption === 'name-az') result.sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }, [searchTerm, selectedCategory, sortOption]);

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-4 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search items or sets..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full pl-12 pr-4 py-4 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)} className="px-6 py-4 border border-slate-300 rounded-2xl">
          {categories.map((category) => <option key={category} value={category}>{category}</option>)}
        </select>

        <select value={sortOption} onChange={(event) => setSortOption(event.target.value)} className="px-6 py-4 border border-slate-300 rounded-2xl">
          <option value="default">Sort by</option>
          <option value="price-low">Price Low to High</option>
          <option value="price-high">Price High to Low</option>
          <option value="name-az">Name A-Z</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-stretch">
        {filteredAndSortedProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-xl transition-all group h-full flex flex-col">
            <div className="relative h-52 bg-slate-100 flex-shrink-0">
              <Image src={product.image} alt={product.name} fill unoptimized className="object-cover group-hover:scale-105 transition" sizes="(max-width: 640px) 100vw, 50vw" />
            </div>
            <div className="p-6 flex flex-col flex-1">
              <p className="text-sm font-bold text-blue-700">{product.category}</p>
              <h3 className="font-bold text-xl my-2 text-slate-950 min-h-[3.5rem] leading-tight">{product.name}</h3>
              <p className="text-sm text-slate-600 min-h-[4.5rem] leading-relaxed">
                {product.description || 'Trusted diagnostic supply for first aid, training, and daily care use.'}
              </p>
              <p className="text-2xl font-bold mt-4 text-slate-950">₦{product.price.toLocaleString()}</p>
              <button
                onClick={() => {
                  addToCart(product);
                  toast.success(`${product.name} added to cart`);
                }}
                type="button"
                className="mt-auto w-full bg-blue-700 text-white py-4 rounded-2xl font-bold hover:bg-blue-800 transition min-h-14"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
