import { X, ShoppingBag, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CartDrawer({ isOpen, onClose, cartItems = [], onUpdateQuantity, onRemoveItem }) {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} className="text-red-600" />
              <h2 className="text-lg font-black text-slate-900">Your Order Cart</h2>
              <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full border border-red-200">
                {cartItems.length}
              </span>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                <div className="p-4 rounded-2xl bg-slate-50 text-slate-400">
                  <ShoppingBag size={36} />
                </div>
                <p className="text-sm font-bold text-slate-700">Your cart is empty</p>
                <p className="text-xs text-slate-400 max-w-xs">Explore our regional catalog or TeKeL branding packages to add items.</p>
                <button 
                  onClick={onClose}
                  className="mt-2 text-xs font-bold text-red-600 hover:underline"
                >
                  Browse Catalog
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl flex gap-4 items-center justify-between"
                >
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-16 h-16 rounded-xl object-cover bg-slate-200 shrink-0" 
                  />

                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{item.name}</h4>
                    <p className="text-xs font-black text-slate-900">
                      {Number(item.price * item.quantity).toLocaleString()} TZS
                    </p>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 pt-1">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-white px-2 py-0.5 text-xs font-bold text-slate-800">
                        <button 
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="hover:text-red-600 px-1"
                        >
                          -
                        </button>
                        <span className="px-2">{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="hover:text-red-600 px-1"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => onRemoveItem(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer / Summary */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-slate-100 bg-slate-50 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-800">{Number(subtotal).toLocaleString()} TZS</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <span>Regional Delivery</span>
                  <span className="text-emerald-600 font-bold">Calculated at Checkout</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-black text-slate-900">
                  <span>Total Amount</span>
                  <span className="text-red-600">{Number(subtotal).toLocaleString()} TZS</span>
                </div>
              </div>

              <div className="space-y-2">
                <Link
                  to="/checkout"
                  onClick={onClose}
                  className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition-all"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={14} />
                </Link>

                <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-400 pt-1">
                  <ShieldCheck size={12} className="text-slate-500" />
                  <span>Secure Hualink Direct Transaction</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}