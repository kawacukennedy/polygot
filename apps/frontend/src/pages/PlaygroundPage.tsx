import React, { useState, useEffect, useCallback } from 'react';
import ProductGrid from '../components/ProductGrid';
import CartDrawer from '../components/CartDrawer';
import MetricTileArea from '../components/MetricTileArea';
import BenchmarkChart from '../components/BenchmarkChart';
import Tooltip from '../components/Tooltip';
import QuickBenchmark from '../components/QuickBenchmark';
import ServiceList from '../components/ServiceList';
import ChatWidget from '../components/ChatWidget';
import LoadingSpinner from '../components/LoadingSpinner';
import useTranslation from '../hooks/useTranslation';

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
  image_url?: string; // Added image_url
}

interface Product {
  id: string;
  title: string;
  description: string;
  price_cents: number;
  image_url: string;
  stock: number;
}

interface PlaygroundPageProps {
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  gainXp: (amount: number) => void;
}

const PlaygroundPage: React.FC<PlaygroundPageProps> = ({ showNotification, gainXp }) => {
  const { t } = useTranslation();
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
  const [benchmarkProgress, setBenchmarkProgress] = useState(0);
  const [benchmarkMessage, setBenchmarkMessage] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // New loading state

  const fetchCart = useCallback(async () => {
    setIsLoading(true); // Set loading to true
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
      const itemsWithDetails: CartItem[] = [];
      for (const item of data.items || []) {
        const productResponse = await fetch(`/api/v1/products/${item.product_id}`);
        if (productResponse.ok) {
          const product: Product = await productResponse.json();
          itemsWithDetails.push({
            ...item,
            name: product.title,
            image_url: product.image_url,
          });
        } else {
          itemsWithDetails.push({ ...item, name: 'Unknown Product', image_url: undefined });
        }
      }
      setCartItems(itemsWithDetails);
    } catch (error) {
      console.error('Error fetching cart:', error);
      showNotification(t('failed_to_fetch_cart'), 'error');
    } finally {
      setIsLoading(false); // Set loading to false
    }
  }, [showNotification, t]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'k') {
        event.preventDefault();
        setIsChatOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSwap = (serviceId: string, impl: string) => {
    setSelectedImpl((prev) => ({ ...prev, [serviceId]: impl }));
    console.log(`Swapping ${serviceId} to ${impl}`);
    showNotification(t('swap_runtime') + ` ${serviceId} to ${impl}...`, 'info');
    gainXp(5); // Award XP for runtime switch
    // In a real app, this would trigger an API call and visual feedback
  };

  const handleAddToCart = async (productId: string) => {
    setIsLoading(true); // Set loading to true
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
      showNotification(t('added_product') + ` ${productId} ` + t('to_cart'), 'success');
      fetchCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
      showNotification(t('failed_to_add_product'), 'error');
    } finally {
      setIsLoading(false); // Set loading to false
    }
  };

  const runBenchmark = () => {
    setIsBenchmarking(true);
    setBenchmarkProgress(0);
    setBenchmarkMessage(t('running_benchmark'));
    showNotification(t('running_benchmark'), 'info');

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress <= 100) {
        setBenchmarkProgress(progress);
      } else {
        clearInterval(interval);
      }
    }, 300);

    setTimeout(() => {
      clearInterval(interval);
      setIsBenchmarking(false);
      setBenchmarkProgress(100);
      setBenchmarkMessage(t('benchmark_completed'));
      showNotification(t('benchmark_completed'), 'success');
      gainXp(15); // Award XP for benchmark run
      // In a real app, this would involve an API call and processing results
    }, 3000);
  };

  const handleChatMessage = (message: string) => {
    console.log('Chat message sent:', message);
    // In a real app, this would send the message to the chat service
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Panel */}
      <div className="w-1/4 bg-white p-6 shadow-md">
        <h2 className="text-2xl font-bold mb-6">{t('services')}</h2>
        <ServiceList
          services={services}
          implementations={implementations}
          selectedImpl={selectedImpl}
          onSwap={handleSwap}
        />
      </div>

      {/* Center Panel */}
      <div className="w-1/2 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{t('products')}</h2>
          <button onClick={() => setIsCartOpen(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            {t('view_cart')} ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})
          </button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                <LoadingSpinner />
              </div>
            )}
            <ProductGrid onAdd={handleAddToCart} />
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-1/4 bg-white p-6 shadow-md">
        <h2 className="text-2xl font-bold mb-6">{t('metrics')}</h2>
        <div className="space-y-4">
          <MetricTileArea />
          <BenchmarkChart chart_types={['line', 'bar']} tooltip_format='locale' />
          <Tooltip content={t('run_benchmark_tooltip')}>
            <QuickBenchmark
              default_duration_s={10}
              allow_full_run={true}
              onRunBenchmark={runBenchmark}
              isBenchmarking={isBenchmarking}
            />
          </Tooltip>
          {benchmarkMessage && <p className="mt-2 text-sm text-gray-600 text-center">{benchmarkMessage}</p>}
          {isBenchmarking && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div
                className="bg-green-600 h-2.5 rounded-full"
                style={{ width: `${benchmarkProgress}%` }}
              ></div>
            </div>
          )}
        </div>

        {/* Recommended Runtimes */}
        <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">{t('recommended_runtimes')}</h2>
          <ul className="space-y-2">
            <li>Node.js (for quick prototyping)</li>
            <li>Rust (for high performance)</li>
          </ul>
        </div>
      </div>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cartItems} />

      {isChatOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-80">
          <ChatWidget session_id="some-session-id" user_id="some-user-id" onSend={handleChatMessage} />
        </div>
      )}
    </div>
  );
};

export default PlaygroundPage;