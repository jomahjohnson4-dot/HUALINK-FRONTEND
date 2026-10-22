import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, Loader2, PhoneCall, ShieldCheck, TriangleAlert, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  PAYMENT_PROVIDERS,
  MOBILE_MONEY_PROVIDERS,
  createOrderService,
  initiatePaymentService,
  normalizeMsisdn,
  parseAmount,
  subscribeToPaymentStatusService,
} from '../api/paymentService';
import { ProviderBadge, CardBadge, CashMark } from './PaymentProviderBadges';

const CARD_NETWORKS = ['VISA', 'Mastercard', 'AMEX', 'CRDB', 'NMB'];

/**
 * Payment Methods & Security panel.
 *
 * When `onSelectProvider` is supplied the panel defers to the parent (the
 * details page opens the PaymentModal, which owns the phone, amount and
 * receipt steps). Without it the panel dispatches the prompt itself.
 */
export default function PaymentMethodsPanel({
  product,
  quantity = 1,
  selectedProvider = null,
  onSelectProvider,
}) {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();

  const [phoneInput, setPhoneInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const streamRef = useRef(null);

  // Falls back to the signed-in customer profile until the phone is edited.
  const phone = phoneInput || user?.phone || '';

  const amount = useMemo(() => parseAmount(product?.price) * (quantity || 1), [product, quantity]);

  useEffect(() => {
    return () => streamRef.current?.();
  }, []);

  const handlePaymentSelect = async (provider) => {
    // The parent owns the flow (modal with input + processing + receipt steps)
    if (onSelectProvider) {
      onSelectProvider(provider);
      return;
    }

    setStatus({ type: '', message: '' });

    if (provider.id === 'CASH') {
      setStatus({
        type: 'success',
        message: t('payment.cashSelected'),
      });
      return;
    }

    if (!isAuthenticated) {
      setStatus({
        type: 'error',
        message: t('payment.signInRequired'),
      });
      return;
    }

    const msisdn = normalizeMsisdn(phone);
    if (msisdn.length < 12) {
      setStatus({
        type: 'error',
        message: t('payment.invalidPhone'),
      });
      return;
    }

    try {
      setLoading(true);
      setStatus({
        type: 'info',
        message: t('payment.sendingPrompt', { provider: provider.shortLabel, phone: msisdn }),
      });

      const order = await createOrderService({
        customerName: user?.name || user?.customerName || 'Hualink Customer',
        customerPhone: msisdn,
        deliveryRegion: 'Dar es Salaam',
        deliveryAddress: 'Hualink Distribution Hub, Dar es Salaam',
        paymentMethod: provider.method,
        totalAmount: amount,
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
        amount,
        provider: provider.code,
      });

      setStatus({
        type: 'success',
        message: t('payment.promptSent', { provider: provider.label }),
      });

      // Follow the webhook driven status updates for this order
      streamRef.current?.();
      streamRef.current = subscribeToPaymentStatusService(orderId, (data) => {
        if (data.status === 'PAID') {
          setStatus({ type: 'success', message: t('checkout.paymentSuccess') });
        } else if (data.status === 'FAILED' || data.status === 'CANCELLED') {
          setStatus({
            type: 'error',
            message: t('payment.declined'),
          });
        }
      });
    } catch (err) {
      console.error('Payment initialization failed:', err);
      setStatus({
        type: 'error',
        message: err?.response?.data?.message || t('payment.initializationFailed'),
      });
    } finally {
      setLoading(false);
    }
  };

  const statusStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-red-50 border-red-200 text-red-700',
  };

  const activeId = selectedProvider?.id;

  return (
    <div className="mt-6 bg-white rounded-2xl p-5 shadow-sm space-y-4">
      <h3 className="text-sm font-extrabold text-gray-900 pb-2">
        {t('payment.title')}
      </h3>

      {/* Cash on Delivery / Lipa */}
      <button
        type="button"
        onClick={() => handlePaymentSelect(PAYMENT_PROVIDERS.CASH)}
        className={`w-full flex items-center gap-3 p-3 border rounded-xl text-left transition-all cursor-pointer ${
          activeId === 'CASH'
            ? 'bg-orange-50 border-orange-400 ring-1 ring-orange-200'
            : 'bg-orange-50 border-orange-200 hover:border-orange-400'
        }`}
      >
        <div className="w-9 h-9 bg-orange-500 text-white rounded-lg flex items-center justify-center shrink-0">
          <CashMark className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-orange-900">{t('payment.cashLabel')}</p>
          <p className="text-[11px] text-orange-700">{t('payment.cashHint')}</p>
        </div>
        {activeId === 'CASH' ? (
          <Check size={15} className="ml-auto text-orange-600 shrink-0" />
        ) : null}
      </button>

      {/* Mobile Money Networks */}
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">{t('payment.mobileMoneyNetworks')}</p>
        <div className="grid grid-cols-2 gap-2">
          {MOBILE_MONEY_PROVIDERS.map((provider) => {
            const isSelected = activeId === provider.id;
            return (
              <button
                key={provider.id}
                type="button"
                onClick={() => handlePaymentSelect(provider)}
                aria-pressed={isSelected}
                className={`flex items-center gap-2 p-2 border rounded-lg text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white border-[#E50914] ring-1 ring-[#E50914]'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                }`}
              >
                <ProviderBadge provider={provider} className="min-w-0" />
              </button>
            );
          })}
        </div>

        {/* Phone number captured for the payment prompt */}
        <div className="mt-2">
          <label
            htmlFor="payment-phone"
            className="text-[11px] font-semibold text-gray-500 block mb-1"
          >
            {t('payment.mobileMoneyNumber')}
          </label>
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 focus-within:border-[#E50914] transition-colors">
            <PhoneCall size={14} className="text-gray-400 shrink-0" />
            <input
              id="payment-phone"
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="0781359770"
              className="w-full py-2 text-xs font-semibold text-gray-800 outline-none bg-transparent"
            />
          </div>
          {activeId && activeId !== 'CASH' && !onSelectProvider ? (
            <button
              type="button"
              onClick={() => handlePaymentSelect(PAYMENT_PROVIDERS[activeId])}
              disabled={loading}
              className="mt-2 w-full bg-[#E50914] hover:bg-[#C0040F] disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Wallet size={14} />
              )}
              {loading
                ? t('payment.sendingPromptShort')
                : t('payment.payAmount', { amount: amount.toLocaleString('en-US') })}
            </button>
          ) : null}
        </div>
      </div>

      {/* Bank Cards */}
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">{t('payment.bankCards')}</p>
        <div className="flex flex-wrap items-center gap-2">
          {CARD_NETWORKS.map((network) => (
            <CardBadge key={network} network={network} />
          ))}
        </div>
        <p className="text-[11px] text-gray-500 mt-2">
          {t('payment.cardDetailsNote')}
        </p>
        <Link
          to={`/shop?add=${product.id}`}
          className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-[#E50914] hover:text-[#C0040F] transition-colors"
        >
          <ShieldCheck size={12} />
          {t('payment.payByCard')}
        </Link>
      </div>

      {/* Status feedback */}
      {status.message ? (
        <div
          className={`flex items-start gap-2 text-xs font-semibold border rounded-xl px-3 py-2.5 ${
            statusStyles[status.type] || statusStyles.info
          }`}
          role="status"
        >
          {status.type === 'error' ? (
            <TriangleAlert size={14} className="shrink-0 mt-0.5" />
          ) : status.type === 'success' ? (
            <Check size={14} className="shrink-0 mt-0.5" />
          ) : (
            <Loader2 size={14} className="shrink-0 mt-0.5 animate-spin" />
          )}
          <span>{status.message}</span>
        </div>
      ) : null}

      {/* TRA & Delivery Guarantee */}
      <div className="pt-2 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
        {[
          t('payment.traReceiptIncluded'),
          t('payment.secureCheckoutInstant'),
          t('payment.fastRegionalDelivery'),
        ].map((item) => (
          <div key={item} className="flex items-center gap-2">
            <span className="text-green-600 font-bold">✓</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
