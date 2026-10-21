import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  Eye,
  MapPin,
  MessageCircle,
  MessageSquare,
  Minus,
  Plus,
  ShoppingCart,
  X,
  Zap,
} from 'lucide-react';
import { ProductImage, RatingStars } from './ProductCard';
import { formatPrice, numericPrice, buildProductInquiryMessage } from './productFormat';
import { buildWhatsAppUrl } from '../data/servicesCatalog';
import CheckoutModal from './CheckoutModal';
import ChatModal from './ChatModal';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';

/**
 * Product details modal.
 *
 * The modal is the full product record: imagery, specifications and the
 * complete purchase block — quantity selection, cart / order actions and the
 * dual WhatsApp + live-chat inquiry bar.
 */
export default function ProductModal({
  product,
  onClose,
  onAction,
  currentUser,
}) {
  const navigate = useNavigate();
  const { push } = useToast();
  const { addToCart, openCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [activeProductId, setActiveProductId] = useState(product?.id);

  // Tracks whether a nested overlay (checkout / chat) is currently on screen so
  // Escape only closes the top-most layer.
  const overlayOpenRef = useRef(false);

  // A different product always starts from a single unit. Adjusting the state
  // while rendering keeps the modal in sync without an extra commit pass.
  if (product?.id !== activeProductId) {
    setActiveProductId(product?.id);
    setQuantity(1);
    setAdded(false);
  }

  useEffect(() => {
    overlayOpenRef.current = orderOpen || chatOpen;
  }, [orderOpen, chatOpen]);

  // Escape closes the modal and the page behind it stops scrolling.
  useEffect(() => {
    if (!product) return undefined;

    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      if (overlayOpenRef.current) return;
      onClose?.();
    };

    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [product, onClose]);

  const name = product?.name || product?.title || 'Product';
  const priceLabel = formatPrice(product?.price ?? product?.basePrice);
  const unitPrice = numericPrice(product?.price ?? product?.basePrice);

  const maxQuantity =
    Number.isFinite(product?.stock) && product.stock > 0 ? Math.min(product.stock, 99) : 99;

  // The checkout receives exactly this product, pre-filled with the chosen
  // quantity, so "Order Now" never needs another step.
  const orderItems = useMemo(
    () =>
      product
        ? [
            {
              ...product,
              id: product.id,
              name,
              price: unitPrice,
              unitPrice,
              quantity,
            },
          ]
        : [],
    [product, name, unitPrice, quantity]
  );

  const totalAmount = unitPrice * quantity;

  if (!product) return null;

  const handleAddToCart = () => {
    // Inquiry items keep their dedicated sales-desk flow.
    if (product.action === 'inquiry' && onAction) {
      onAction(product, quantity);
      return;
    }

    // The shared cart owns the basket; the drawer is opened so the updated
    // count is visible straight away.
    addToCart(product, quantity);
    openCart();

    push({
      title: 'Added to cart',
      message: `${name} × ${quantity} added to your cart.`,
      tone: 'success',
    });
    setAdded(true);
  };

  const handleOrderNow = () => setOrderOpen(true);

  const openWhatsApp = () => {
    const message = buildProductInquiryMessage(name, priceLabel);
    window.open(buildWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
  };

  const handleFullDetails = () => {
    onClose?.();
    navigate(`/product/${product.id}`);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[70] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-label={`${name} details`}
      >
        {/* Blurred backdrop — clicking it closes the modal cleanly */}
        <div
          className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />

        <div className="relative bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[92vh] flex flex-col">
          {/* Explicit close control pinned to the top-right corner */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close product details"
            className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-md text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>

          <div className="overflow-y-auto">
            <div className="relative w-full aspect-square overflow-hidden bg-gray-50">
              <ProductImage
                product={product}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {product.badge ? (
                <span className="absolute left-2 top-2 z-10 bg-[#0070DC] text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-md">
                  {product.badge}
                </span>
              ) : null}
            </div>

            <div className="p-5">
              <p className="text-[11px] font-bold text-gray-400 mb-1">{product.category}</p>
              <h3 className="text-lg font-extrabold text-gray-900 leading-snug mb-3">{name}</h3>

              <div className="flex items-baseline gap-2 flex-wrap mb-2">
                <span className="text-2xl font-black text-red-600 leading-none">
                  {priceLabel}
                </span>
                {product.originalPrice ? (
                  <span className="text-xs text-gray-400 line-through">{product.originalPrice}</span>
                ) : null}
              </div>

              <div className="flex items-center gap-3 flex-wrap mb-4">
                <RatingStars rating={product.rating} reviews={product.reviews} />
                <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded inline-block font-semibold">
                  MOQ: {product.moq}
                </span>
                {product.sold ? (
                  <span className="text-[11px] text-gray-500 font-semibold flex items-center gap-1">
                    <MapPin size={11} className="text-gray-400" />
                    {product.location} · {product.sold}
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={handleFullDetails}
                  className="text-[11px] font-bold text-gray-500 hover:text-red-600 transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <Eye size={12} />
                  Full details
                </button>
              </div>

              {/* Unique specifications for the selected product */}
              {product.specs?.length ? (
                <div className="mb-4">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 block mb-2">
                    About this item
                  </span>
                  <ul className="space-y-1.5">
                    {product.specs.map((spec) => (
                      <li
                        key={spec}
                        className="flex items-start gap-2 text-xs text-slate-700 font-medium"
                      >
                        <span className="text-[#E50914] font-black mt-0.5">•</span>
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {/* Unique specification table for the selected product */}
              {Object.keys(product.details || {}).length ? (
                <dl className="mb-4 border border-gray-200 rounded-xl overflow-hidden">
                  {Object.entries(product.details).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-start justify-between gap-3 px-3 py-2 text-xs even:bg-gray-50"
                    >
                      <dt className="font-bold text-slate-600 shrink-0">{key}</dt>
                      <dd className="font-semibold text-slate-900 text-right">{value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              {/* Purchase controls — quantity + primary calls to action */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Quantity selector */}
                  <div className="w-28 flex items-center justify-between border border-gray-300 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                      className="w-6 h-6 rounded-md flex items-center justify-center text-gray-600 hover:text-[#E50914] hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-600 transition-colors cursor-pointer"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="text-xs font-bold text-gray-900 tabular-nums">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((current) => Math.min(maxQuantity, current + 1))
                      }
                      disabled={quantity >= maxQuantity}
                      aria-label="Increase quantity"
                      className="w-6 h-6 rounded-md flex items-center justify-center text-gray-600 hover:text-[#E50914] hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-600 transition-colors cursor-pointer"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex-1 min-w-[140px] bg-[#E50914] hover:bg-[#C0040F] text-white text-xs font-bold py-3 rounded-xl transition-colors duration-300 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    {added ? <Check size={15} /> : <ShoppingCart size={15} />}
                    <span>{added ? 'Added to Cart!' : 'Add to Cart'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOrderNow}
                    className="flex-1 min-w-[120px] bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold py-3 rounded-xl transition-colors duration-300 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Zap size={15} />
                    <span>Order Now</span>
                  </button>
                </div>

                {/* Dual inquiry actions: WhatsApp + in-app live chat */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">
                    Contact Hualink Sales
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={openWhatsApp}
                      aria-label={`Inquiry about ${name} on WhatsApp`}
                      className="flex-1 min-w-[140px] bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <MessageCircle size={14} />
                      <span>WhatsApp Inquiry</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setChatOpen(true)}
                      aria-label={`Live chat about ${name}`}
                      className="flex-1 min-w-[140px] bg-[#DC2626] hover:bg-red-700 text-white text-xs font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <MessageSquare size={14} />
                      <span>Live Chat</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout pre-filled with this product and the chosen quantity */}
      <CheckoutModal
        isOpen={orderOpen}
        cartItems={orderItems}
        totalAmount={totalAmount}
        onClose={() => setOrderOpen(false)}
        zIndex="z-[95]"
      />

      {/* In-app live chat, pre-populated with the product context */}
      {chatOpen ? (
        <ChatModal
          product={product}
          currentUser={currentUser}
          initialMessage={`Hello! I'd like to know more about ${name}.`}
          onClose={() => setChatOpen(false)}
        />
      ) : null}
    </>
  );
}

/** Backwards-compatible alias used across the marketplace surfaces. */
export const ProductQuickView = ProductModal;
