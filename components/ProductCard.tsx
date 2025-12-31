
import React from 'react';
import { Product, Category } from '../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const getCategoryColor = (cat: Category) => {
    switch (cat) {
      case Category.MEDICINE: return 'bg-blue-100 text-blue-800';
      case Category.SKINCARE: return 'bg-pink-100 text-pink-800';
      case Category.SUPPLEMENT: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-300 flex flex-col h-full group">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{product.name}</h3>
          {product.hindiName && (
            <p className="text-lg font-bold text-indigo-700 mt-0.5 leading-tight">{product.hindiName}</p>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getCategoryColor(product.category)}`}>
          {product.category}
        </span>
      </div>
      
      <p className="text-sm text-slate-500 mb-5 line-clamp-2 italic leading-relaxed">
        {product.description}
      </p>
      
      <div className="space-y-5 flex-1">
        {/* Benefits Section */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0 text-green-600">
            <i className="fas fa-heartbeat text-sm"></i>
          </div>
          <div className="flex-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Benefits / फायदे</span>
            <p className="text-sm text-slate-700 font-medium leading-snug">{product.benefits}</p>
            {product.hindiBenefits && (
              <p className="text-sm text-indigo-900 font-bold leading-snug mt-1.5 border-l-2 border-indigo-200 pl-2">
                {product.hindiBenefits}
              </p>
            )}
          </div>
        </div>

        {/* Dosage Section */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600">
            <i className="fas fa-clock text-sm"></i>
          </div>
          <div className="flex-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Dosage / खुराक</span>
            <p className="text-sm text-slate-700 font-medium leading-snug">{product.dosage}</p>
            {product.hindiDosage && (
              <p className="text-sm text-indigo-900 font-bold leading-snug mt-1.5 border-l-2 border-indigo-200 pl-2">
                {product.hindiDosage}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-1.5">
        {product.ingredients.map((ing, idx) => (
          <span key={idx} className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2.5 py-1 rounded-md border border-slate-200 uppercase tracking-tighter">
            {ing}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ProductCard;
