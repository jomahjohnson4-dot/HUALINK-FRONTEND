import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  Eye,
  Star,
  Grid,
  List,
  Package,
  ShoppingCart,
  MessageCircle,
  X,
  MapPin,
} from 'lucide-react';
import heroImage from '../assets/hero.png';

const ACTION_META = {
  cart: { label: 'Add to Cart', doneLabel: 'Added!', icon: ShoppingCart },
  inquiry: { label: 'Inquire Now', doneLabel: 'Sent!', icon: MessageCircle },
};

/** Verified remote fallback used when a product image cannot be loaded. */
const REMOTE_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&q=80';

/* -------------------------------------------------------------------------- */
/*  Small building blocks                                                     */
/* -------------------------------------------------------------------------- */

function RatingStars({ rating, reviews }) {
  const full = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

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
        <span className="text-[10px] text-gray-600 font-bold ml-0.5">{rating}</span>
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
function ProductImage({ product, className, ...rest }) {
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
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-300">
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
}) {
  const isList = layout === 'list';

  const name = product.name || product.title || 'Product';
  const reviews = product.reviewsCount ?? product.reviews;
  const detailLink = `/product/${product.id}`;

  // Discount percentage: explicit catalogue value ("discount: 29") first,
  // otherwise derived from the price strings ("TSh 25,000" / "TSh 35,000").
  const derivedDiscount = (() => {
    const currentPrice = Number(String(product.price ?? '').replace(/[^0-9]/g, ''));
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

  return (
    <div
      className={`group bg-white border border-gray-200/80 rounded-2xl p-3.5 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between animate-fade-in-up h-full ${
        isList ? 'sm:flex-row sm:gap-4' : ''
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Clean & Completely Borderless Product Image Wrapper (No Grey Background) */}
      <div
        className={`relative w-full bg-white overflow-hidden mb-4 flex items-center justify-center p-3 ${
          isList ? 'h-60 sm:w-56 sm:h-44 shrink-0 sm:mb-0' : 'h-52 sm:h-56'
        }`}
      >
        <Link to={detailLink} className="block h-full w-full" aria-label={name}>
          <ProductImage
            product={product}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Top-Left Badge: bright blue discount takes priority over brand badge */}
        {discountPercent > 0 ? (
          <span className="absolute top-3 left-3 z-10 bg-[#0070DC] text-white text-[10px] font-black px-2 py-1 rounded-none shadow-sm uppercase tracking-wide pointer-events-none">
            {discountPercent}% OFF
          </span>
        ) : product.badge ? (
          <span className="absolute top-3 left-3 z-10 bg-[#E50914] text-white text-[10px] font-black px-2 py-1 rounded-none shadow-sm uppercase tracking-wide pointer-events-none">
            {product.badge}
          </span>
        ) : null}

        {/* Slide-in hover actions */}
        {onQuickView ? (
          <div className="absolute right-2.5 top-2.5 flex flex-col gap-1.5 translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 focus-within:translate-x-0 focus-within:opacity-100 transition-all duration-300 z-10">
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
      </div>

      {/* Details Area (Clean & Minimalist) */}
      <div className="flex-1 flex flex-col justify-between space-y-2">
        <div>
          <Link to={detailLink} className="block">
            <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 group-hover:text-[#0070DC] transition-colors leading-snug">
              {name}
            </h3>
          </Link>
        </div>

        <div>
          {/* Price Layout: "From TSh ..." */}
          <div className="flex items-baseline gap-1.5 mb-1 flex-wrap">
            <span className="text-xs font-extrabold text-gray-900 tracking-tight">
              From {product.price}
            </span>
            {product.originalPrice ? (
              <span className="text-[10px] font-medium text-gray-400 line-through">
                {product.originalPrice}
              </span>
            ) : null}
          </div>

          {/* Yellow Star Rating */}
          <div className="flex items-center gap-1 text-[11px] text-gray-500">
            <span className="text-amber-400 font-black">★</span>
            <span className="font-bold text-gray-800">{product.rating || '4.8'}</span>
            <span className="text-gray-400">({reviews || '120'})</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Quick view modal                                                          */
/* -------------------------------------------------------------------------- */

export function ProductQuickView({ product, onClose, onAction }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!product) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };

    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [product, onClose]);

  if (!product) return null;

  const meta = ACTION_META[product.action] || ACTION_META.cart;
  const ActionIcon = meta.icon;
  const name = product.name || product.title || 'Product';

  const handleFullDetails = () => {
    onClose?.();
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close quick view"
          className="absolute right-3 top-3 z-10 h-8 w-8 rounded-full bg-white/90 backdrop-blur shadow-md flex items-center justify-center text-gray-600 hover:bg-[#E50914] hover:text-white transition-colors cursor-pointer"
        >
          <X size={15} />
        </button>

        <div className="relative w-full h-72 bg-white flex items-center justify-center p-4">
          <ProductImage
            product={product}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
          {product.badge ? (
            <span className="absolute left-3 top-3 bg-[#E50914] text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wider uppercase shadow-sm">
              {product.badge}
            </span>
          ) : null}
        </div>

        <div className="p-5">
          <p className="text-[11px] font-bold text-gray-400 mb-1">{product.category}</p>
          <h3 className="text-lg font-extrabold text-gray-900 leading-snug mb-3">{name}</h3>

          <div className="flex items-baseline gap-2 flex-wrap mb-2">
            <span className="text-2xl font-black text-gray-900 leading-none">{product.price}</span>
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
          </div>

          {/* Unique specifications for the selected product */}
          {product.specs?.length ? (
            <div className="mb-4">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 block mb-2">
                About this item
              </span>
              <ul className="space-y-1.5">
                {product.specs.map((spec) => (
                  <li key={spec} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
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

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onAction?.(product)}
              className="flex-1 bg-[#E50914] hover:bg-[#C0040F] text-white text-xs font-bold py-2.5 rounded-xl transition-colors duration-300 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <ActionIcon size={14} />
              <span>{meta.label}</span>
            </button>

            <button
              type="button"
              onClick={handleFullDetails}
              className="flex-1 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold py-2.5 rounded-xl transition-colors duration-300 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Eye size={14} />
              <span>Full details</span>
            </button>
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
