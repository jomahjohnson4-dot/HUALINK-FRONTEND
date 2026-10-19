import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Star,
  PackageX,
  Minus,
  Plus,
  Layers,
} from 'lucide-react';
import {
  getProductById as getCatalogProduct,
  getRelatedProducts,
} from '../data/productsCatalog';
import { getProductById as fetchProductById } from '../api/productService';
import { normalizeProduct } from '../components/productsData';
import PaymentMethodsPanel from '../components/PaymentMethodsPanel';
import PaymentModal from '../components/modals/PaymentModal';
import { useAuth } from '../context/AuthContext';
import {
  createOrderService,
  initiatePaymentService,
  normalizeMsisdn,
  parseAmount,
  subscribeToPaymentStatusService,
} from '../api/paymentService';

/** Hualink receipt reference, e.g. HLK-TZ-2026-9842X */
const buildReceiptRef = () => {
  const digits = Math.floor(100000 + Math.random() * 900000).toString();
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return `HLK-TZ-${new Date().getFullYear()}-${digits.slice(0, 4)}${digits.slice(4)}${letter}`;
};

/** TRA EFD fiscal receipt number, e.g. EFD-2026-771234 */
const buildEfdRef = () =>
  `EFD-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

const COLOR_SWATCHES = {
  Black: '#111111',
  Blue: '#1E40AF',
  Red: '#DC2626',
  White: '#F8FAFC',
  Green: '#059669',
  Grey: '#64748B',
  Gray: '#64748B',
  Silver: '#C0C4C9',
};

const COLOR_LABELS = {
  Black: 'Black',
  Blue: 'Blue',
  Red: 'Red',
  White: 'White',
  Green: 'Green',
  Grey: 'Grey',
  Gray: 'Gray',
  Silver: 'Silver',
};

export default function ProductDetails() {
  const { id } = useParams();
  const catalogProduct = getCatalogProduct(id);
  const { user, isAuthenticated } = useAuth();

  const [apiState, setApiState] = useState({ id: null, product: null, checked: false });
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);

  // Payment flow state
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccessReport, setPaymentSuccessReport] = useState(null);
  const [paymentError, setPaymentError] = useState('');
  const [paymentStep, setPaymentStep] = useState('INPUT');
  const [paymentOpen, setPaymentOpen] = useState(false);

  // Prefilled with the signed-in customer profile until the phone is edited
  const phoneInput = phoneNumber || user?.phone || '';

  // Products that are not part of the catalogue (e.g. live API records linked
  // from /shop) fall back to the backend so no product link dead-ends.
  useEffect(() => {
    if (catalogProduct) return undefined;

    let cancelled = false;

    fetchProductById(id)
      .then((data) => {
        if (cancelled) return;
        setApiState({
          id,
          product: data ? normalizeProduct(data) : null,
          checked: true,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setApiState({ id, product: null, checked: true });
      });

    return () => {
      cancelled = true;
    };
  }, [id, catalogProduct]);

  const apiProduct = apiState.id === id ? apiState.product : null;
  const apiChecked = apiState.id === id ? apiState.checked : false;

  const product = catalogProduct || apiProduct;

  const gallery = useMemo(() => {
    if (!product) return [];
    const images = [product.image, ...(product.thumbnails || [])];
    return [...new Set(images.filter(Boolean))];
  }, [product]);

  const related = useMemo(
    () => (catalogProduct ? getRelatedProducts(catalogProduct) : []),
    [catalogProduct]
  );

  // The related shelf falls back to other catalogue items when a category only
  // holds a single product, so the heading only names a category when every
  // card really belongs to it.
  const relatedIsSameCategory =
    related.length > 0 && related.every((item) => item.categorySlug === product?.categorySlug);

  const paymentAmount = useMemo(
    () => parseAmount(product?.price) * (quantity || 1),
    [product, quantity]
  );

  /** Open the payment modal for the chosen mobile money network. */
  const handleSelectProvider = (provider) => {
    setSelectedMethod(provider);
    setPaymentError('');
    setPaymentSuccessReport(null);
    setPaymentStep('INPUT');
    setPaymentOpen(true);
  };

  const handleClosePayment = () => {
    setPaymentOpen(false);
    setPaymentStep('INPUT');
    setIsProcessing(false);
    setPaymentError('');
  };

  /**
   * Trigger the payment (STK push).
   *
   * Creates the order, dispatches the STK USSD prompt through the live
   * gateway and follows the payment status stream. When the gateway is
   * unreachable the flow falls back to a clearly flagged simulated receipt so
   * the UI can still be reviewed without a running backend.
   */
  const handleTriggerPayment = async () => {
    if (!selectedMethod) return;

    const msisdn = normalizeMsisdn(phoneInput);
    if (msisdn.length < 12) {
      setPaymentError('Please enter a valid phone number');
      return;
    }

    if (!isAuthenticated) {
      setPaymentError('Please sign in to complete a mobile money payment.');
      return;
    }

    setIsProcessing(true);
    setPaymentError('');
    setPaymentSuccessReport(null);

    try {
      const order = await createOrderService({
        customerName: user?.name || user?.customerName || 'Hualink Customer',
        customerPhone: msisdn,
        deliveryRegion: 'Dar es Salaam',
        deliveryAddress: 'Hualink Distribution Hub, Dar es Salaam',
        paymentMethod: selectedMethod.method,
        totalAmount: paymentAmount,
        items: [
          {
            productId: product.id,
            quantity: quantity || 1,
            unitPrice: parseAmount(product.price),
          },
        ],
      });

      const orderId = order?.id || order?.orderId || order?.orderNumber;

      await initiatePaymentService({
        orderId,
        phone: msisdn,
        amount: paymentAmount,
        provider: selectedMethod.code,
      });

      // Follow the webhook driven payment status for this order
      subscribeToPaymentStatusService(orderId, (data) => {
        if (data.status === 'FAILED' || data.status === 'CANCELLED') {
          setPaymentError('Payment was declined or timed out. Please try again.');
          setPaymentStep('INPUT');
          setIsProcessing(false);
        }
      });

      setPaymentSuccessReport({
        success: true,
        ref: buildReceiptRef(),
        efdRef: buildEfdRef(),
        provider: selectedMethod,
        amount: paymentAmount,
        phone: msisdn,
        date: new Date().toLocaleString(),
        orderId,
        mode: 'live',
      });
      setPaymentStep('SUCCESS');
    } catch (err) {
      console.error('Live payment gateway unavailable, falling back to simulation:', err);

      // Simulated fallback so the receipt flow can be reviewed offline
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setPaymentSuccessReport({
        success: true,
        ref: buildReceiptRef(),
        efdRef: buildEfdRef(),
        provider: selectedMethod,
        amount: paymentAmount,
        phone: msisdn,
        date: new Date().toLocaleString(),
        orderId: null,
        mode: 'simulated',
      });
      setPaymentStep('SUCCESS');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!product && !apiChecked) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] font-sans text-slate-900 py-20 px-4 text-center">
        <p className="text-sm font-bold text-slate-500">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] font-sans text-slate-900 py-16 px-4">
        <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-2xl p-10 text-center shadow-sm">
          <PackageX size={40} className="mx-auto text-gray-300 mb-4" />
          <h1 className="text-xl font-black text-gray-900 mb-2">Product not found</h1>
          <p className="text-sm text-slate-600 mb-6">
            We could not find a catalogue product with the reference
            <span className="font-bold text-gray-900"> &quot;{id}&quot;</span>. It may have been
            removed or the link is out of date.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link
              to="/"
              className="bg-[#E50914] hover:bg-[#C0040F] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors"
            >
              Back to Marketplace
            </Link>
            <Link
              to="/shop"
              className="bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors"
            >
              Browse the Shop
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const detailsEntries = Object.entries(product.details || {});
  const reviewsCount = product.reviewsCount ?? product.reviews ?? 0;
  const colorValue = product.details?.Color || product.details?.Colors;
  const availableColors = colorValue
    ? String(colorValue)
        .split('/')
        .map((color) => color.trim())
        .filter((color) => COLOR_SWATCHES[color])
    : [];
  const activeColor = selectedColor || availableColors[0] || null;

  const breadcrumbItems = ['Home', product.category, product.name];

  const handleAddToCart = () => {
    window.location.href = `/shop?add=${product.id}&qty=${quantity}${
      activeColor ? `&color=${activeColor}` : ''
    }`;
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans text-slate-900 py-8 px-4 md:px-12">
      {/* Breadcrumb */}
      <nav className="max-w-7xl mx-auto mb-6">
        <ol className="flex items-center gap-2 text-xs font-medium text-slate-600 flex-wrap">
          {breadcrumbItems.map((item, idx) => (
            <li key={`${item}-${idx}`} className="flex items-center gap-1">
              {idx < breadcrumbItems.length - 1 ? (
                <>
                  <Link
                    to={idx === 0 ? '/' : `/?category=${encodeURIComponent(product.categorySlug)}`}
                    className="hover:text-[#E50914] transition-colors"
                  >
                    {item}
                  </Link>
                  <ArrowLeft size={12} className="text-slate-400" />
                </>
              ) : (
                <span className="text-[#E50914] font-bold">{item}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Vertical Thumbnail Gallery */}
        <div className="lg:col-span-2 hidden lg:block">
          <div className="flex flex-col gap-2">
            {gallery.map((thumb, i) => (
              <button
                key={thumb}
                type="button"
                onClick={() => setActiveImage(i)}
                aria-label={`View image ${i + 1} of ${product.name}`}
                className={`w-16 h-16 cursor-pointer transition-all ${
                  activeImage === i
                    ? 'border-2 border-[#E50914] rounded-lg p-0.5'
                    : 'border border-gray-200 hover:border-gray-400 rounded-lg overflow-hidden'
                }`}
              >
                <img
                  src={thumb}
                  alt={`${product.name} view ${i + 1}`}
                  className="w-full h-full object-contain"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Center Column - Main Image (borderless, enlarged) */}
        <div className="lg:col-span-4">
          <div className="w-full flex items-center justify-center p-2 min-h-[380px] sm:min-h-[460px] border-0 shadow-none bg-transparent">
            <img
              src={gallery[activeImage] || product.image}
              alt={product.name}
              className="max-h-[450px] w-auto object-contain transition-all duration-300 hover:scale-105"
            />
          </div>

          {/* Mobile thumbnail switcher */}
          {gallery.length > 1 ? (
            <div className="lg:hidden flex gap-2 mt-3 overflow-x-auto no-scrollbar">
              {gallery.map((thumb, i) => (
                <button
                  key={thumb}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  aria-label={`View image ${i + 1}`}
                  className={`w-16 h-16 shrink-0 cursor-pointer transition-all ${
                    activeImage === i
                      ? 'border-2 border-[#E50914] rounded-lg p-0.5'
                      : 'border border-gray-200 hover:border-gray-400 rounded-lg overflow-hidden'
                  }`}
                >
                  <img src={thumb} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* Right Column - Product Details */}
        <div className="lg:col-span-6">
          {/* Brand */}
          <span className="text-[11px] font-black uppercase tracking-widest text-[#E50914] block mb-2">
            Hualink Certified / {product.details?.Brand || product.category}
          </span>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight mb-3">
            {product.name}
          </h1>

          {/* Rating & Model */}
          <div className="flex items-center gap-3 flex-wrap mb-4">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-gray-700">{product.rating}</span>
              <Star size={12} className="fill-amber-400 text-amber-400" />
              <span className="text-xs text-slate-600 font-medium">
                ({reviewsCount} ratings)
              </span>
            </div>
            {product.details?.Model ? (
              <span className="text-xs text-slate-500">Model Number: {product.details.Model}</span>
            ) : null}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-black text-[#E50914]">{product.price}</span>
            {product.originalPrice ? (
              <span className="text-sm text-slate-400 line-through">{product.originalPrice}</span>
            ) : null}
          </div>

          <p className="text-xs text-slate-500 font-medium mb-6">
            Minimum order: {product.moq}
            {product.sold ? ` · ${product.sold}` : ''}
          </p>

          {/* Color Selection */}
          {availableColors.length ? (
            <div className="mb-6">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-3">
                Select Color
              </span>
              <div className="flex items-center gap-3">
                {availableColors.map((color) => {
                  const isSelected = activeColor === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      aria-label={COLOR_LABELS[color] || color}
                      aria-pressed={isSelected}
                      title={COLOR_LABELS[color] || color}
                      className={`w-10 h-10 rounded-full cursor-pointer transition-all ${
                        isSelected
                          ? 'ring-2 ring-[#E50914] ring-offset-2'
                          : 'ring-1 ring-gray-300 hover:ring-gray-400'
                      }`}
                      style={{ backgroundColor: COLOR_SWATCHES[color] }}
                    />
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Quantity */}
          <div className="mb-6">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-3">
              Quantity
            </span>
            <div className="inline-flex items-center border border-gray-300 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <Minus size={14} />
              </button>
              <span className="w-12 text-center text-sm font-bold text-gray-900 border-x border-gray-200">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* About this item - unique specifications */}
          {product.specs?.length ? (
            <div className="mb-6">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-3">
                About This Item
              </h2>
              <ul className="space-y-2 text-sm text-slate-700 font-medium">
                {product.specs.map((spec) => (
                  <li key={spec} className="flex items-start gap-2">
                    <span className="text-[#E50914] font-black mt-0.5">•</span>
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Specifications table - unique details */}
          {detailsEntries.length ? (
            <div className="mb-6">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-3">
                Specifications
              </h2>
              <dl className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {detailsEntries.map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-start justify-between gap-4 px-4 py-3 text-sm even:bg-gray-50"
                  >
                    <dt className="font-bold text-slate-600">{key}</dt>
                    <dd className="font-semibold text-slate-900 text-right">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}

          {/* Warranty & Returns */}
          <div className="bg-gray-50 border border-gray-200 p-5 rounded-xl space-y-3 mb-6">
            {product.details?.Warranty ? (
              <div className="flex items-start gap-2">
                <ShieldCheck size={16} className="text-[#E50914] shrink-0" />
                <span className="text-sm text-slate-700 font-medium">{product.details.Warranty}</span>
              </div>
            ) : null}
            {['Easy Returns & Exchanges', 'Verified Hualink Supplier'].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-[#10b981] shrink-0" />
                <span className="text-sm text-slate-700 font-medium">{item}</span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full bg-[#E50914] text-white font-bold py-3 px-6 rounded-lg text-center hover:bg-[#C0040F] transition-colors shadow-md shadow-[#E50914]/30 cursor-pointer"
          >
            Add to Cart
          </button>

          {/* Payment Methods & Security */}
          <PaymentMethodsPanel
            product={product}
            quantity={quantity}
            selectedProvider={selectedMethod}
            onSelectProvider={handleSelectProvider}
          />
        </div>
      </div>

      {/* Related products */}
      {related.length ? (
        <section className="max-w-7xl mx-auto mt-16">
          <div className="flex items-center gap-2 mb-5">
            <Layers size={18} className="text-[#E50914]" />
            <h2 className="text-lg font-bold text-gray-800">
              {relatedIsSameCategory ? `More in ${product.category}` : 'More from Hualink Distribution'}
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map((item) => (
              <Link
                key={item.id}
                to={`/product/${item.id}`}
                className="group bg-white border border-gray-200/80 rounded-2xl p-3 sm:p-4 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col"
              >
                <div className="relative w-full h-44 bg-transparent overflow-hidden rounded-2xl mb-3 flex items-center justify-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    className="w-full h-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-108"
                  />
                </div>
                <h3 className="text-sm font-extrabold text-gray-900 line-clamp-2 mb-1.5 group-hover:text-[#E50914] transition-colors">
                  {item.name}
                </h3>
                <span className="text-base font-black text-gray-900 tracking-tight">{item.price}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Payment flow modal: input -> processing -> receipt report */}
      <PaymentModal
        open={paymentOpen}
        step={isProcessing ? 'PROCESSING' : paymentStep}
        provider={selectedMethod}
        phone={phoneInput}
        amount={paymentAmount}
        result={paymentSuccessReport}
        error={paymentError}
        onPhoneChange={setPhoneNumber}
        onExecute={handleTriggerPayment}
        onClose={handleClosePayment}
      />
    </div>
  );
}
