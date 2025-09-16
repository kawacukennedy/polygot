
import React from 'react';

interface ProductCardProps {
  id: string;
  title: string;
  short_description: string;
  price_cents: number;
  image_url: string;
  stock: number;
  onAdd: (id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ id, title, short_description, price_cents, image_url, stock, onAdd }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img src={image_url} alt={title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{short_description}</p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-xl font-bold">${(price_cents / 100).toFixed(2)}</span>
          <button 
            onClick={() => onAdd(id)}
            disabled={stock === 0}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
          >
            {stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
