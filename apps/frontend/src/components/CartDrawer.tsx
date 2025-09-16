import React from 'react';
import useTranslation from '../hooks/useTranslation';

interface CartItem {
  product_id: string;
  name: string;
  quantity: number;
  price_cents: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, items }) => {
  const { t } = useTranslation();
  const total = items.reduce((sum, item) => sum + item.quantity * item.price_cents, 0);
  const formattedTotal = `$${(total / 100).toFixed(2)}`;

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden ${isOpen ? '' : 'pointer-events-none'}`}
      aria-labelledby="cart-drawer-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 overflow-hidden">
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={onClose}
          aria-hidden="true"
        ></div>

        <div className={`fixed inset-y-0 right-0 pl-10 max-w-full flex transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} transition ease-in-out duration-500 sm:duration-700`}>
          <div className="w-screen max-w-md">
            <div className="h-full flex flex-col bg-white shadow-xl overflow-y-scroll">
              <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-medium text-gray-900" id="cart-drawer-title">
                    {t('shopping_cart')}
                  </h2>
                  <div className="ml-3 h-7 flex items-center">
                    <button
                      type="button"
                      className="-m-2 p-2 text-gray-400 hover:text-gray-500"
                      onClick={onClose}
                      aria-label="Close cart"
                    >
                      <span className="sr-only">Close panel</span>
                      {/* Heroicon name: outline/x */}
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="mt-8">
                  <div className="flow-root">
                    <ul className="-my-6 divide-y divide-gray-200">
                      {items.length === 0 ? (
                        <li className="py-6 text-center text-muted">{t('your_cart_is_empty')}</li>
                      ) : (
                        items.map((item) => (
                          <li key={item.product_id} className="py-6 flex">
                            <div className="ml-4 flex-1 flex flex-col">
                              <div>
                                <div className="flex justify-between text-base font-medium text-gray-900">
                                  <button className="text-base font-medium text-gray-900"> {item.name} </button>
                                  <p className="ml-4">${(item.price_cents / 100).toFixed(2)}</p>
                                </div>
                                <p className="mt-1 text-sm text-gray-500">Qty: {item.quantity}</p>
                              </div>
                            </div>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                <div className="flex justify-between text-base font-medium text-gray-900">
                  <p>{t('subtotal')}</p>
                  <p>{formattedTotal}</p>
                </div>
                <p className="mt-0.5 text-sm text-gray-500">{t('shipping_taxes_checkout')}</p>
                <div className="mt-6">
                  <button
                    className="flex items-center justify-center rounded-md border border-transparent bg-primary px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-primary_600"
                  >
                    {t('checkout')}
                  </button>
                </div>
                <div className="mt-6 flex justify-center text-sm text-center text-gray-500">
                  <p>
                    {t('or')} <button type="button" className="font-medium text-primary hover:text-primary_600" onClick={onClose}>{t('continue_shopping')}<span aria-hidden="true"> &rarr;</span></button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
