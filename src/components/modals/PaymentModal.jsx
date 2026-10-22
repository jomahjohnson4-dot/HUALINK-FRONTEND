import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Check,
  Download,
  FileText,
  Loader2,
  PhoneCall,
  Receipt,
  ShieldCheck,
  TriangleAlert,
  X,
} from 'lucide-react';
import { ProviderTile } from '../PaymentProviderBadges';

/**
 * Payment modal.
 *
 * Three steps:
 *   1. INPUT      - confirm the network, phone number and amount
 *   2. PROCESSING - the STK USSD prompt is pushed to the phone
 *   3. SUCCESS    - a receipt confirmation report
 *
 * The parent owns the payment state; this component only presents it.
 */
export default function PaymentModal({
  open,
  step = 'INPUT',
  provider,
  phone = '',
  amount = 0,
  result = null,
  error = '',
  onPhoneChange,
  onExecute,
  onClose,
}) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && step !== 'PROCESSING') onClose?.();
    };

    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, step, onClose]);

  if (!open || !provider) return null;

  const formattedAmount = `TSh ${Number(amount || 0).toLocaleString('en-US')}`;

  const handlePhoneChange = (event) => {
    onPhoneChange?.(event.target.value);
  };

  const handleDownloadReceipt = () => {
    if (!result) return;

    const receipt = [
      t('payment.receiptHeader'),
      '=======================================',
      `${t('payment.statusLabel')}: ${t('payment.successful')}`,
      `${t('payment.transactionReference')}: ${result.ref}`,
      `${t('payment.providerLabel')}: ${provider.label}`,
      `${t('payment.amountPaid')}: ${formattedAmount}`,
      `${t('payment.phoneLabel')}: ${result.phone}`,
      `${t('payment.dateLabel')}: ${result.date}`,
      `${t('payment.efdReceipt')}: ${result.efdRef}`,
      `${t('payment.orderReference')}: ${result.orderId || 'N/A'}`,
      `${t('payment.receiptMode')}: ${
        result.mode === 'simulated' ? t('payment.modeSimulated') : t('payment.modeLive')
      }`,
      '=======================================',
      t('payment.receiptThanks'),
    ].join('\n');

    const blob = new Blob([receipt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hualink-receipt-${result.ref}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm"
        onClick={step === 'PROCESSING' ? undefined : onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('payment.modalAria')}
        className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <ProviderTile provider={provider} />
          <div className="min-w-0">
            <p className="text-sm font-extrabold text-gray-900 leading-tight">
              {t('payment.payWith', { provider: provider.label })}
            </p>
            <p className="text-[11px] text-gray-500">{t('payment.secureCheckout')}</p>
          </div>
          {step !== 'PROCESSING' ? (
            <button
              type="button"
              onClick={onClose}
              aria-label={t('payment.closePayment')}
              className="ml-auto h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
          ) : null}
        </div>

        {/* ------------------------------------------------------------ INPUT */}
        {step === 'INPUT' ? (
          <div className="p-5 space-y-4">
            <div>
              <label
                htmlFor="modal-payment-phone"
                className="text-[11px] font-semibold text-gray-500 block mb-1.5"
              >
                {t('payment.phoneNumber')}
              </label>
              <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 focus-within:border-[#E50914] transition-colors">
                <PhoneCall size={15} className="text-gray-400 shrink-0" />
                <input
                  id="modal-payment-phone"
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="0781359770"
                  className="w-full py-2.5 text-sm font-semibold text-gray-900 outline-none bg-transparent"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                {t('payment.ussdPromptNote')}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-gray-500 block mb-1.5">
                {t('payment.amount')}
              </span>
              <div className="flex items-center justify-between border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50">
                <span className="text-sm font-bold text-gray-500">{t('payment.totalPayable')}</span>
                <span className="text-lg font-black text-gray-900">{formattedAmount}</span>
              </div>
            </div>

            {error ? (
              <div className="flex items-start gap-2 text-xs font-semibold border border-red-200 bg-red-50 text-red-700 rounded-xl px-3 py-2.5">
                <TriangleAlert size={14} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            ) : null}

            <button
              type="button"
              onClick={onExecute}
              disabled={!phone}
              className="w-full bg-[#E50914] hover:bg-[#C0040F] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-extrabold py-3 rounded-xl transition-colors shadow-md shadow-[#E50914]/20 cursor-pointer"
            >
              {t('payment.payButton', { amount: formattedAmount })}
            </button>

            <p className="text-[11px] text-gray-500 text-center flex items-center justify-center gap-1.5">
              <ShieldCheck size={12} className="text-green-600" />
              {t('payment.encryptedPrompt')}
            </p>
          </div>
        ) : null}

        {/* ------------------------------------------------------- PROCESSING */}
        {step === 'PROCESSING' ? (
          <div className="p-8 flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-gray-100 border-t-[#E50914] animate-spin" />
              <ProviderTile provider={provider} className="w-9 h-9 rounded-lg absolute inset-0 m-auto shadow-sm" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-gray-900">{t('payment.pushingPrompt')}</p>
              <p className="text-xs text-gray-500 mt-1">
                {t('payment.sendingRequestTo', { phone })}
              </p>
            </div>
            <p className="text-[11px] text-gray-400">
              {t('payment.enterPinHint')}
            </p>
          </div>
        ) : null}

        {/* ---------------------------------------------------------- SUCCESS */}
        {step === 'SUCCESS' && result ? (
          <div className="p-5 space-y-4">
            <div className="text-center pt-2">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center mx-auto">
                <Check size={26} className="text-emerald-600" />
              </div>
              <p className="text-base font-extrabold text-gray-900 mt-3">{t('payment.successful')}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {t('payment.confirmedProcessing')}
              </p>
            </div>

            {result.mode === 'simulated' ? (
              <div className="flex items-start gap-2 text-[11px] font-semibold border border-amber-200 bg-amber-50 text-amber-800 rounded-xl px-3 py-2.5">
                <TriangleAlert size={14} className="shrink-0 mt-0.5" />
                <span>
                  {t('payment.simulationMode')}
                </span>
              </div>
            ) : null}

            {/* Receipt report */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                <Receipt size={14} className="text-[#E50914]" />
                <span className="text-xs font-extrabold text-gray-800">{t('payment.receiptTitle')}</span>
              </div>

              <dl className="divide-y divide-gray-100">
                {[
                  [t('payment.statusLabel'), t('payment.successful')],
                  [t('payment.transactionReference'), result.ref],
                  [t('payment.providerLabel'), provider.label],
                  [t('payment.amountPaid'), formattedAmount],
                  [t('payment.phoneLabel'), result.phone],
                  [t('payment.dateLabel'), result.date],
                  [t('payment.efdReceipt'), result.efdRef],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-3 px-4 py-2.5">
                    <dt className="text-[11px] font-semibold text-gray-500 shrink-0">{label}</dt>
                    <dd className="text-[11px] font-bold text-gray-900 text-right break-all">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border-t border-emerald-200">
                <FileText size={14} className="text-emerald-600 shrink-0" />
                <span className="text-[11px] font-bold text-emerald-800">
                  {t('payment.efdGenerated')}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDownloadReceipt}
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download size={14} />
                <span>{t('payment.downloadReceipt')}</span>
              </button>

              <Link
                to="/orders"
                className="flex-1 bg-[#E50914] hover:bg-[#C0040F] text-white text-xs font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <FileText size={14} />
                <span>{t('checkout.viewOrderStatus')}</span>
              </Link>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
            >
              {t('common.close')}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
