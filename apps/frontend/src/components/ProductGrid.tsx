import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';

interface Product {
  id: string;
  title: string;
  description: string;
  price_cents: number;
  image_url: string;
  stock: number;
}

const ProductGrid: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // This will be the endpoint of our product service
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
          short_description={product.description} // Assuming full description for now
          price_cents={product.price_cents}
          image_url={product.image_url || 'https://via.placeholder.com/300'} // Placeholder image
          stock={product.stock}
          onAdd={handleAddToCart}
        />
      ))}
    </div>
  );
};

export default ProductGrid;<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id}
          title={product.title}
          short_description={product.description} // Assuming full description for now
          price_cents={product.price_cents}
          image_url={product.image_url || 'https://via.placeholder.com/300'} // Placeholder image
          stock={product.stock}
          onAdd={handleAddToCart}
        />
      ))}
    </div>
  );
};

export default ProductGrid;