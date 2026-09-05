import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Tag, 
  Package, 
  Check, 
  ExternalLink, 
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { CATALOG_PRODUCTS } from '../data/catalog';
import { Product } from '../types';

interface CatalogBrowserProps {
  onSelectItemForChat?: (product: Product) => void;
}

export const CatalogBrowser: React.FC<CatalogBrowserProps> = ({ onSelectItemForChat }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'electronics' | 'apparel' | 'home'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSku, setExpandedSku] = useState<string | null>(null);

  const filteredProducts = CATALOG_PRODUCTS.filter((product) => {
    const matchesCat = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 mb-1">
            <ShoppingBag className="h-4 w-4" />
            Verified D2C Product Catalog (SQLite Backed)
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Live Product Inventory ({filteredProducts.length} Items)
          </h1>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-72">
            <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search SKU or title..."
              className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All Products (15)' },
          { id: 'electronics', label: '⚡ Electronics & Gadgets (5)' },
          { id: 'apparel', label: '👕 Apparel & Commuter (5)' },
          { id: 'home', label: '🏡 Home & Coffee Essentials (5)' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id as any)}
            className={`text-xs px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === cat.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-50 shadow-2xs'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.map((product) => {
          const isExpanded = expandedSku === product.sku;

          return (
            <div
              key={product.sku}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all"
            >
              <div className="space-y-3">
                
                {/* SKU Badge and Stock */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {product.sku}
                  </span>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                    {product.stock_quantity} in stock
                  </span>
                </div>

                {/* Title and Category */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {product.title}
                  </h3>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    {product.category}
                  </span>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-2xl font-black text-slate-900">
                    ₹{product.price_inr.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs text-slate-500">incl. all taxes</span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed">
                  {product.description}
                </p>

                {/* Toggleable Tech Specs */}
                <div>
                  <button
                    onClick={() => setExpandedSku(isExpanded ? null : product.sku)}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 cursor-pointer py-1"
                  >
                    <span>{isExpanded ? 'Hide Specifications' : 'View Specifications'}</span>
                    {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 animate-in fade-in duration-150">
                      {Object.entries(product.specs).map(([key, val]) => (
                        <div key={key} className="flex justify-between text-slate-600">
                          <span className="capitalize text-slate-500">{key.replace(/_/g, ' ')}:</span>
                          <span className="font-medium text-slate-800 text-right max-w-[180px] truncate">{val}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-100 mt-4">
                <button
                  onClick={() => onSelectItemForChat && onSelectItemForChat(product)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  <span>Select & Buy in Chat Simulator</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
