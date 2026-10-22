import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  X,
  Loader2,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Copy,
  RefreshCw,
} from 'lucide-react';

/**
 * Verification Code (OTP / PIN) modal.
 *
 * Used by both the sign-up flow (6-digit code) and the wholesale order
 * confirmation (4-digit PIN). The component owns the input ergonomics —
 * auto-advance, backspace, paste and arrow navigation — and delegates the
 * actual verification to the caller.
 *
 * When the backend runs in demo mode it returns the expected code, which is
 * surfaced here as a one-click autofill helper so the flow can be tested
 * without a live mail/SMS provider.
 */
export default function OtpVerificationModal({
  isOpen,
  onClose,
  onVerify,
  onResend,
  title,
  subtitle,
  length = 6,
  demoCode = null,
  isDemo = false,
  destination = '',
  loading = false,
  resendLoading = false,
  expiresAt = null,
}) {
  const { t } = useTranslation();

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [copied, setCopied] = useState(false);

  const inputsRef = useRef([]);
  const dialogRef = useRef(null);

  /** Reset the modal every time it is opened. */
  useEffect(() => {
    if (!isOpen) return;
    setCode('');
    setError('');
    setCopied(false);
    // Focus the first box as soon as the modal paints.
    const timer = setTimeout(() => inputsRef.current[0]?.focus(), 60);
    return () => clearTimeout(timer);
  }, [isOpen]);

  /** Close on Escape. */
  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !loading) onClose?.();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  /** Expiry countdown. */
  useEffect(() => {
    if (!isOpen || !expiresAt) {
      setSecondsLeft(0);
      return undefined;
    }

    const tick = () => {
      const remaining = Math.max(
        0,
        Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)
      );
      setSecondsLeft(remaining);
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [isOpen, expiresAt]);

  const countdown = useMemo(() => {
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  }, [secondsLeft]);

  const expired = Boolean(expiresAt) && secondsLeft === 0;
  const isComplete = code.length === length;

  // Fallback copy for callers that do not supply their own wording.
  const modalTitle = title || t('otp.verifyTitle');
  const modalSubtitle = subtitle || t('otp.verifySubtitle');

  /** Writes a character into the box at `index`. */
  const setDigitAt = useCallback(
    (index, value) => {
      setError('');
      setCode((current) => {
        const digits = current.padEnd(length, ' ').split('');
        digits[index] = value;
        return digits.join('').trimEnd().slice(0, length);
      });
    },
    [length]
  );

  /** Handles typing, pasting and backspacing in a single box. */
  const handleChange = (index, event) => {
    const raw = event.target.value.replace(/\D/g, '');

    if (!raw) {
      setDigitAt(index, ' ');
      return;
    }

    // A pasted code fills every box from the current one.
    if (raw.length > 1) {
      const digits = raw.split('').slice(0, length - index);
      setCode((current) => {
        const next = current.padEnd(length, ' ').split('');
        digits.forEach((digit, offset) => {
          next[index + offset] = digit;
        });
        return next.join('').trimEnd().slice(0, length);
      });
      const focusIndex = Math.min(index + digits.length, length - 1);
      inputsRef.current[focusIndex]?.focus();
      return;
    }

    setDigitAt(index, raw);
    if (index < length - 1) inputsRef.current[index + 1]?.focus();
  };

  /** Moves the caret on Backspace / Arrow keys. */
  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !code[index] && index > 0) {
      event.preventDefault();
      setDigitAt(index - 1, ' ');
      inputsRef.current[index - 1]?.focus();
      return;
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      inputsRef.current[index - 1]?.focus();
      return;
    }

    if (event.key === 'ArrowRight' && index < length - 1) {
      event.preventDefault();
      inputsRef.current[index + 1]?.focus();
    }
  };

  /** Fills every box with the demo code. */
  const applyDemoCode = () => {
    if (!demoCode) return;
    setError('');
    setCode(String(demoCode).slice(0, length).padEnd(length, ' ').trimEnd());
    inputsRef.current[length - 1]?.focus();
  };

  /** Copies the demo code to the clipboard. */
  const copyDemoCode = async () => {
    if (!demoCode) return;
    try {
      await navigator.clipboard.writeText(String(demoCode));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard access can be denied — the autofill button still works.
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isComplete) {
      setError(t('otp.incompleteCode', { count: length }));
      return;
    }

    setError('');
    try {
      await onVerify?.(code);
    } catch (submitError) {
      setError(
        submitError?.response?.data?.message ||
          submitError?.message ||
          t('otp.confirmFailed')
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="otp-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-fade-in-up"
    >
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-red-600 to-red-700 px-6 py-6 text-white">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label={t('otp.closeDialog')}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
          >
            <X size={16} />
          </button>

          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
            <ShieldCheck size={22} />
          </span>

          <h3 id="otp-modal-title" className="text-lg font-black mt-3">
            {modalTitle}
          </h3>
          <p className="text-[11px] font-semibold text-white/80 mt-1 leading-relaxed">
            {modalSubtitle}
          </p>
          {destination ? (
            <p className="text-[11px] font-black text-white mt-2 flex items-center gap-1.5">
              <KeyRound size={12} />
              <span className="truncate">{destination}</span>
            </p>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          {/* Code boxes */}
          <div className="flex justify-center gap-2" onPaste={(e) => e.preventDefault()}>
            {Array.from({ length }).map((_, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputsRef.current[index] = element;
                }}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={length}
                value={code[index] || ''}
                onChange={(event) => handleChange(index, event)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                onPaste={(event) => {
                  event.preventDefault();
                  const pasted = event.clipboardData
                    .getData('text')
                    .replace(/\D/g, '')
                    .slice(0, length);
                  if (!pasted) return;
                  setCode(pasted);
                  inputsRef.current[Math.min(pasted.length, length - 1)]?.focus();
                }}
                aria-label={t('otp.digitAria', { index: index + 1, length })}
                className={`w-full max-w-[52px] h-14 text-center text-xl font-black rounded-xl border-2 bg-slate-50 text-slate-900 outline-none transition-all focus:bg-white focus:border-red-600 focus:ring-4 focus:ring-red-500/10 ${
                  error ? 'border-red-300' : 'border-slate-200'
                }`}
              />
            ))}
          </div>

          {/* Countdown */}
          {expiresAt ? (
            <p className="text-center text-[11px] font-bold text-slate-500">
              {expired ? (
                <span className="text-red-600">{t('otp.expired')}</span>
              ) : (
                <>
                  {t('otp.expiresIn')}{' '}
                  <span className="text-slate-900 tabular-nums">{countdown}</span>
                </>
              )}
            </p>
          ) : null}

          {/* Error */}
          {error ? (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[11px] font-bold text-red-700 flex items-start gap-2">
              <AlertCircle size={14} className="shrink-0 mt-px" />
              <span>{error}</span>
            </div>
          ) : null}

          {/* Demo autofill helper */}
          {isDemo && demoCode ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-wider text-amber-700">
                    {t('otp.demoMode')}
                  </p>
                  <p className="text-[11px] font-bold text-amber-900 mt-0.5">
                    {t('otp.defaultCode')}{' '}
                    <span className="font-black tracking-widest">{demoCode}</span>
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={copyDemoCode}
                    className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg border border-amber-300 bg-white text-[10px] font-black text-amber-800 hover:bg-amber-100 transition-colors cursor-pointer"
                  >
                    {copied ? <CheckCircle2 size={11} /> : <Copy size={11} />}
                    <span>{copied ? t('otp.copied') : t('otp.copy')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={applyDemoCode}
                    className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg bg-amber-500 text-white text-[10px] font-black hover:bg-amber-600 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 size={11} />
                    <span>{t('otp.autofill')}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {onResend ? (
              <button
                type="button"
                onClick={onResend}
                disabled={loading || resendLoading}
                className="inline-flex items-center gap-1.5 h-11 px-4 rounded-xl border border-slate-200 text-[11px] font-black text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                {resendLoading ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <RefreshCw size={13} />
                )}
                <span>{t('otp.resendCode')}</span>
              </button>
            ) : null}

            <button
              type="submit"
              disabled={loading || !isComplete || expired}
              className="flex-1 h-11 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-bold text-[11px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>{t('otp.verifying')}</span>
                </>
              ) : (
                <span>{t('otp.verifyContinue')}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
