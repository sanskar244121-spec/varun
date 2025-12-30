
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
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-lg font-bold text-slate-800">{product.name}</h3>
          {product.hindiName && (
            <p className="text-sm font-medium text-indigo-600 mb-1">{product.hindiName}</p>
          )}
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(product.category)}`}>
          {product.category}
        </span>
      </div>
      <p className="text-sm text-slate-600 mb-4 line-clamp-2 italic">{product.description}</p>
      
      <div className="space-y-4">
        <div className="flex items-start gap-2">
          <i className="fas fa-check-circle text-green-500 mt-1"></i>
          <div className="flex-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Benefits / फायदे</span>
            <p className="text-sm text-slate-700 leading-tight">{product.benefits}</p>
            {product.hindiBenefits && (
              <p className="text-sm text-indigo-800 font-medium leading-tight mt-1">{product.hindiBenefits}</p>
            )}
          </div>
        </div>
        <div className="flex items-start gap-2">
          <i className="fas fa-prescription-bottle-alt text-blue-500 mt-1"></i>
          <div className="flex-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Dosage / खुराक</span>
            <p className="text-sm text-slate-700 leading-tight">{product.dosage}</p>
            {product.hindiDosage && (
              <p className="text-sm text-blue-900 font-medium leading-tight mt-1">{product.hindiDosage}</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-50 flex flex-wrap gap-1">
        {product.ingredients.map((ing, idx) => (
          <span key={idx} className="bg-slate-50 text-slate-500 text-[10px] px-2 py-0.5 rounded border border-slate-100">
            {ing}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ProductCard;
