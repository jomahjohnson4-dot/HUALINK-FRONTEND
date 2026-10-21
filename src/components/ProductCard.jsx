import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Eye,
  Star,
  Grid,
  List,
  Package,
  ShoppingCart,
  MessageCircle,
  Check,
} from 'lucide-react';
import heroImage from '../assets/hero.png';
import { formatPrice } from './productFormat';
import { useCart } from '../context/CartContext';

const ACTION_META = {
  cart: { label: 'Add to Cart', doneLabel: 'Added!', icon: ShoppingCart },
  inquiry: { label: 'Inquire Now', doneLabel: 'Sent!', icon: MessageCircle },
};

/** Verified remote fallback used when a product image cannot be loaded. */
const REMOTE_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&q=80';

/**
 * Social proof line for the card ("1.2k+ sold"). The catalogue ships a
 * pre-formatted `sold` string; everything else falls back to the review count.
 */
const formatSold = (product, reviews) => {
  const sold = String(product.sold ?? '').trim();
  if (sold) return sold;
  const count = String(reviews ?? '').trim();
  return count ? `${count}+ sold` : '1.2k+ sold';
};

/**
 * True when the item is physically available at a Hualink hub, which powers
 * the green "Local Stock" chip. Catalogue rows only expose a location, API
 * rows expose a real stock count and availability flag.
 */
const hasLocalStock = (product) => {
  if (product.isAvailable === false) return false;
  if (Number.isFinite(product.stock)) return product.stock > 0;
  if (product.warehouseLocation) return true;
  return Boolean(product.location);
};

/* -------------------------------------------------------------------------- */
/*  Small building blocks                                                     */
/* -------------------------------------------------------------------------- */

export function RatingStars({ rating, reviews }) {
  const safeRating = Number(rating) || 0;
  const full = Math.floor(safeRating);
  const hasHalf = safeRating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-1.5">
      <span className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={11}
            className={
              i < full
                ? 'fill-amber-400 text-amber-400'
                : i === full && hasHalf
                  ? 'fill-amber-400 text-amber-400/50'
                  : 'text-gray-300'
            }
          />
        ))}
        <span className="text-[10px] text-gray-600 font-bold ml-0.5">{safeRating}</span>
      </span>
      {reviews ? (
        <span className="text-[10px] text-gray-500 font-semibold">({reviews})</span>
      ) : null}
    </div>
  );
}

/**
 * Product image with a fallback chain: primary URL -> verified remote
 * fallback -> bundled hero asset -> branded placeholder. A dead URL can
 * therefore never leave a broken image or raw alt text in the card.
 */
export function ProductImage({ product, className, ...rest }) {
  const [stage, setStage] = useState('primary');

  const src =
    stage === 'primary'
      ? product.image || product.thumbnail || product.thumbnails?.[0] || heroImage
      : stage === 'remote'
        ? REMOTE_FALLBACK_IMAGE
        : heroImage;

  const handleError = () => {
    if (stage === 'primary') {
      setStage('remote');
    } else if (stage === 'remote') {
      setStage('local');
    } else {
      setStage('failed');
    }
  };

  if (stage === 'failed') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400">
        <Package size={34} />
        <span className="text-[10px] font-bold uppercase tracking-wider">Image unavailable</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={product.name || product.title || 'Product image'}
      loading="lazy"
      onError={handleError}
      className={className}
      {...rest}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Product card                                                              */
/* -------------------------------------------------------------------------- */

export default function ProductCard({
  product,
  index = 0,
  layout = 'grid',
  isWishlisted = false,
  onToggleWishlist,
  onQuickView,
  onAction,
  actionState,
}) {
  const isList = layout === 'list';

  // The shared cart is the single source of truth for the basket, so the
  // floating quick-cart button works on every surface — including the ones
  // that never wire up an `onAction` handler.
  const { addToCart, openCart } = useCart();

  const name = product.name || product.title || 'Product';
  const reviews = product.reviewsCount ?? product.reviews;
  const detailLink = `/product/${product.id}`;

  // "Added to cart" confirmation for the floating quick-cart button.
  const [justAdded, setJustAdded] = useState(false);
  const addedTimer = useRef(null);
  useEffect(() => () => clearTimeout(addedTimer.current), []);

  // Discount percentage: explicit catalogue value ("discount: 29") first,
  // otherwise derived from the price strings ("TSh 25,000" / "TSh 35,000").
  const rawPrice = product.price ?? product.basePrice;
  const derivedDiscount = (() => {
    const currentPrice = Number(String(rawPrice ?? '').replace(/[^0-9]/g, ''));
    const originalPrice = Number(String(product.originalPrice ?? '').replace(/[^0-9]/g, ''));
    return currentPrice > 0 && originalPrice > currentPrice
      ? Math.round((1 - currentPrice / originalPrice) * 100)
      : 0;
  })();

  const explicitDiscount = Number(product.discount);
  const discountPercent =
    Number.isFinite(explicitDiscount) && explicitDiscount > 0
      ? Math.round(explicitDiscount)
      : derivedDiscount;

  const priceLabel = formatPrice(rawPrice);
  const soldLabel = formatSold(product, reviews);
  const showLocalStock = hasLocalStock(product);

  // The floating button mirrors the product intent: inquiry items get the
  // message bubble, everything else the shopping cart.
  const actionMeta = product.action === 'inquiry' ? ACTION_META.inquiry : ACTION_META.cart;
  const ActionIcon = actionMeta.icon;

  const handleQuickAction = (event) => {
    event.preventDefault();
    event.stopPropagation();

    // Inquiry items are routed to the sales desk through the page handler.
    if (product.action === 'inquiry' && onAction) {
      onAction(product);
      return;
    }

    // Everything else goes straight into the cart, and the drawer is opened so
    // the updated basket count is visible right away.
    addToCart(product, 1);
    openCart();

    setJustAdded(true);
    clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setJustAdded(false), 1500);
  };

  const actionDone = justAdded || actionState === 'done';

  return (
    <div
      className={`group bg-white border border-gray-200/80 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col animate-fade-in-up h-full ${
        isList ? 'sm:flex-row' : ''
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Edge-to-edge image canvas: full square, zero inner padding */}
      <div
        className={`relative w-full aspect-square overflow-hidden rounded-t-xl bg-gray-100 ${
          isList ? 'sm:w-56 sm:shrink-0 sm:rounded-none' : ''
        }`}
      >
        <Link to={detailLink} className="absolute inset-0 block" aria-label={name}>
          <ProductImage
            product={product}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Badges pinned over the top-left corner of the image */}
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1 pointer-events-none">
          {discountPercent > 0 ? (
            <span className="bg-[#DC2626] text-white text-[11px] font-bold px-1.5 py-0.5 rounded shadow">
              {discountPercent}% OFF
            </span>
          ) : product.badge ? (
            <span className="bg-[#0070DC] text-white text-[11px] font-bold px-1.5 py-0.5 rounded shadow">
              {product.badge}
            </span>
          ) : null}

          {showLocalStock ? (
            <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
              Local Express
            </span>
          ) : null}
        </div>

        {/* Slide-in hover actions */}
        {onQuickView ? (
          <div className="absolute right-2.5 top-2.5 z-10 flex flex-col gap-1.5 translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 focus-within:translate-x-0 focus-within:opacity-100 transition-all duration-300 max-sm:translate-x-0 max-sm:opacity-100">
            <button
              type="button"
              onClick={() => onToggleWishlist?.(product)}
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              aria-pressed={isWishlisted}
              className="h-8 w-8 rounded-full bg-white/90 backdrop-blur shadow-md flex items-center justify-center text-gray-600 hover:bg-[#E50914] hover:text-white transition-colors cursor-pointer"
            >
              <Heart
                size={14}
                className={isWishlisted ? 'fill-current text-[#E50914] hover:text-white' : ''}
              />
            </button>

            <button
              type="button"
              onClick={() => onQuickView(product)}
              aria-label="Quick view"
              className="h-8 w-8 rounded-full bg-white/90 backdrop-blur shadow-md flex items-center justify-center text-gray-600 hover:bg-[#E50914] hover:text-white transition-colors cursor-pointer"
            >
              <Eye size={14} />
            </button>
          </div>
        ) : null}

        {/* Floating quick-cart action on the bottom-right of the image */}
        <button
          type="button"
          onClick={handleQuickAction}
          aria-label={actionMeta.label}
          className="absolute bottom-2 right-2 z-10 w-8 h-8 bg-white/95 hover:bg-white text-gray-800 rounded-full flex items-center justify-center shadow-md transition-all cursor-pointer opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 focus:opacity-100 focus:translate-y-0 focus-visible:opacity-100 max-sm:opacity-100 max-sm:translate-y-0"
        >
          {actionDone ? (
            <Check size={16} className="text-emerald-600" />
          ) : (
            <ActionIcon size={16} />
          )}
        </button>
      </div>

      {/* Card content below the image */}
      <div
        className={`flex-1 flex flex-col justify-between p-2.5 ${
          isList ? 'sm:py-4 sm:pr-4 sm:pl-4' : ''
        }`}
      >
        <div>
          <Link to={detailLink} className="block">
            <h3 className="line-clamp-2 text-xs font-medium text-gray-800 group-hover:text-red-600 leading-snug">
              {name}
            </h3>
          </Link>
        </div>

        <div className="mt-1.5">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-sm font-bold text-[#DC2626]">{priceLabel}</span>
            {product.originalPrice ? (
              <span className="text-[11px] text-gray-400 line-through">{product.originalPrice}</span>
            ) : null}
          </div>

          {/* Star rating + sold count */}
          <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
            <span className="text-amber-400 font-black">★</span>
            <span className="font-bold text-gray-800">{product.rating || '4.8'}</span>
            <span className="text-gray-400">({soldLabel})</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Shared grid / list view toggle                                           */
/* -------------------------------------------------------------------------- */

export function ViewToggle({ viewMode, onChange, className = '' }) {
  const options = [
    { id: 'grid', label: 'Grid view', Icon: Grid },
    { id: 'list', label: 'List view', Icon: List },
  ];

  return (
    <div className={`flex items-center bg-white border border-gray-300 rounded-sm p-0.5 shadow-sm ${className}`}>
      {options.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          aria-label={label}
          aria-pressed={viewMode === id}
          className={`p-2 rounded-sm transition-colors cursor-pointer ${
            viewMode === id ? 'bg-[#E50914] text-white' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Icon size={14} />
        </button>
      ))}
    </div>
  );
}
