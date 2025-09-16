import React, { useState, useEffect } from 'react';
import ProductGrid from '../components/ProductGrid';
import CartDrawer from '../components/CartDrawer';

const services = [
  { id: 'user', label: 'User Service', description: 'Auth, profile, registration' },
  { id: 'product', label: 'Product Service', description: 'Catalog, search' },
  { id: 'cart', label: 'Cart Service', description: 'Cart management' },
  { id: 'chat', label: 'Chat Service', description: 'Realtime messages' },
  { id: 'analytics', label: 'Analytics Service', description: 'Metrics and logs' },
];

const implementations = {
  user: ['Node.js', 'Go', 'Python', 'Rust'],
  product: ['Python', 'Go', 'Node.js'],
  cart: ['Python', 'Go', 'Node.js'],
  chat: ['Node.js', 'Elixir'],
  analytics: ['Python', 'Go', 'Node.js'],
};

interface CartItem {
  product_id: string;
  name: string;
  quantity: number;
  price_cents: number;
}

const PlaygroundPage: React.FC = () => {
  const [selectedImpl, setSelectedImpl] = useState<Record<string, string>>({
    user: 'Node.js',
    product: 'Python',
    cart: 'Python',
    chat: 'Node.js',
    analytics: 'Python',
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/v1/cart', {
        headers: {
          'X-Session-ID': 'some-hardcoded-session-id',
        },
      });
      const data = await response.json();
      // The cart service returns items in a nested 'items' property
      setCartItems(data.items || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleSwap = (serviceId: string, impl: string) => {
    setSelectedImpl((prev) => ({ ...prev, [serviceId]: impl }));
    console.log(`Swapping ${serviceId} to ${impl}`);
  };

  const handleAddToCart = async (productId: string) => {
    try {
      await fetch('/api/v1/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': 'some-hardcoded-session-id',
        },
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      });
      console.log(`Product ${productId} added to cart`);
      fetchCart(); // Refresh cart after adding an item
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Panel */}
      <div className="w-1/4 bg-white p-6 shadow-md">
        <h2 className="text-2xl font-bold mb-6">Services</h2>
        <div className="space-y-4">
          {services.map((service) => (
            <div key={service.id} className="p-4 border rounded-lg">
              <h3 className="font-bold">{service.label}</h3>
              <p className="text-sm text-gray-600">{service.description}</p>
              <div className="mt-2">
                <select
                  value={selectedImpl[service.id]}
                  onChange={(e) => handleSwap(service.id, e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {implementations[service.id as keyof typeof implementations].map((impl) => (
                    <option key={impl} value={impl}>
                      {impl}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Center Panel */}
      <div className="w-1/2 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Products</h2>
          <button onClick={() => setIsCartOpen(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            View Cart ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})
          </button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
            <ProductGrid onAdd={handleAddToCart} />
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-1/4 bg-white p-6 shadow-md">
        <h2 className="text-2xl font-bold mb-6">Metrics</h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
            <p>Metrics will be here</p>
        </div>
      </div>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cartItems} />
    </div>
  );
};

export default PlaygroundPage;