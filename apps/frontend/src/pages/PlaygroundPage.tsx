
import React, { useState, useEffect } from 'react';
import ProductGrid from '../components/ProductGrid';
import CartDrawer from '../components/CartDrawer';
import MetricTileArea from '../components/MetricTileArea';
import BenchmarkChart from '../components/BenchmarkChart';
import Tooltip from '../components/Tooltip';

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

interface PlaygroundPageProps {
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

const PlaygroundPage: React.FC<PlaygroundPageProps> = ({ showNotification }) => {
  const [selectedImpl, setSelectedImpl] = useState<Record<string, string>>({
    user: 'Node.js',
    product: 'Python',
    cart: 'Python',
    chat: 'Node.js',
    analytics: 'Python',
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [benchmarkMessage, setBenchmarkMessage] = useState('');

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/v1/cart', {
        headers: {
          'X-Session-ID': 'some-hardcoded-session-id',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCartItems(data.items || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
      showNotification('Failed to fetch cart data.', 'error');
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleSwap = (serviceId: string, impl: string) => {
    setSelectedImpl((prev) => ({ ...prev, [serviceId]: impl }));
    console.log(`Swapping ${serviceId} to ${impl}`);
    showNotification(`Swapping ${serviceId} to ${impl}...`, 'info');
    // In a real app, this would trigger an API call and visual feedback
  };

  const handleAddToCart = async (productId: string) => {
    try {
      const response = await fetch('/api/v1/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': 'some-hardcoded-session-id',
        },
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log(`Product ${productId} added to cart`);
      showNotification(`Added product ${productId} to cart!`, 'success');
      fetchCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
      showNotification('Failed to add product to cart.', 'error');
    }
  };

  const runBenchmark = () => {
    setIsBenchmarking(true);
    setBenchmarkMessage('Benchmark started...');
    showNotification('Benchmark started...', 'info');
    setTimeout(() => {
      setIsBenchmarking(false);
      setBenchmarkMessage('Benchmark completed!');
      showNotification('Benchmark completed!', 'success');
      // In a real app, this would involve an API call and processing results
    }, 3000);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Panel */}
      <div className="w-1/4 bg-white p-6 shadow-md">
        <h2 className="text-2xl font-bold mb-6">Services</h2>
        <div className="space-y-4">
          {services.map((service) => (
            <div key={service.id} className="p-4 border rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 hover:border-indigo-500 transition-all duration-200">
              <Tooltip content="Swap the runtime used by this demo session. This only affects your session.">
                <h3 className="font-bold">{service.label}</h3>
                <p className="text-sm text-gray-600">{service.description}</p>
                <div className="mt-2">
                  <select
                    value={selectedImpl[service.id]}
                    onChange={(e) => handleSwap(service.id, e.target.value)}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                  >
                    {implementations[service.id as keyof typeof implementations].map((impl) => (
                      <option key={impl} value={impl}>
                        {impl}
                      </option>
                    ))}
                  </select>
                </div>
              </Tooltip>
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
        <div className="space-y-4">
          <MetricTileArea />
          <BenchmarkChart chart_types={['line', 'bar']} tooltip_format='locale' />
          <Tooltip content="Run a short or full k6 benchmark against the chosen implementation.">
            <button
              onClick={runBenchmark}
              disabled={isBenchmarking}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 w-full"
            >
              {isBenchmarking ? 'Running Benchmark...' : 'Run Quick Benchmark'}
            </button>
          </Tooltip>
          {benchmarkMessage && <p className="mt-2 text-sm text-gray-600 text-center">{benchmarkMessage}</p>}
        </div>
      </div>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cartItems} />
    </div>
  );
};

export default PlaygroundPage;
