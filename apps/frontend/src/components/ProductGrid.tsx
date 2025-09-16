import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import useTranslation from '../hooks/useTranslation';

interface Product {
  id: string;
  title: string;
  description: string;
  price_cents: number;
  image_url: string;
  stock: number;
}

interface ProductGridProps {
  onAdd: (productId: string) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ onAdd }) => {
  useTranslation();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/v1/products');
        const data = await response.json();
        setProducts(data.items);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          title={product.title}
          short_description={product.description}
          price_cents={product.price_cents}
          image_url={product.image_url || 'https://via.placeholder.com/300'}
          stock={product.stock}
          onAdd={onAdd}
        />
      ))}
    </div>
  );
};

export default ProductGrid;