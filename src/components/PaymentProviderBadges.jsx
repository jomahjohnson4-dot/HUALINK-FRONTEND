/**
 * Official-style payment provider marks and badges.
 *
 * The primary artwork is the real company logo image (see ./paymentLogos.js).
 * If a remote asset ever fails to load, the component falls back to the
 * inline vector mark below so the panel never shows a broken image.
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PROVIDER_LOGOS, CARD_LOGOS } from './paymentLogos';

const TILE = 'w-9 h-9';

/* -------------------------------------------------------------------------- */
/*  Mobile money marks                                                        */
/* -------------------------------------------------------------------------- */

export function MPesaMark({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M5.5 17V7l6.5 6 6.5-6v10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AirtelMoneyMark({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M5 18 12 5l7 13M8 13.5h8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MixxMark({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M4 15V9l4 3.6L12 9v6M14.5 9v6H20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HaloPesaMark({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M8.5 6.5v11M15.5 6.5v11M8.5 12h7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function TigoMark({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M5 16c2-5.2 4-7.8 6.5-7.8S16 10.8 19 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AzamPayMark({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M16 9.4a4.4 4.4 0 1 0 0 5.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Cash mark (replaces the emoji)                                            */
/* -------------------------------------------------------------------------- */

export function CashMark({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="2" y="6" width="20" height="12" rx="2" fill="currentColor" />
      <circle cx="12" cy="12" r="3" fill="#fff" />
      <path d="M5 9.5h2M17 14.5h2" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Card network marks                                                        */
/* -------------------------------------------------------------------------- */

export function VisaMark({ className = 'h-3.5 w-auto' }) {
  return (
    <span
      className={`${className} inline-flex items-center justify-center italic font-black tracking-tight text-[#1A1F71]`}
    >
      VISA
    </span>
  );
}

export function MastercardMark({ className = 'h-4 w-auto' }) {
  return (
    <svg viewBox="0 0 40 24" className={className} aria-hidden="true">
      <circle cx="16" cy="12" r="10" fill="#EB001B" />
      <circle cx="24" cy="12" r="10" fill="#F79E1B" fillOpacity="0.9" />
    </svg>
  );
}

export function AmexMark({ className = 'h-3.5 w-auto' }) {
  return (
    <span
      className={`${className} inline-flex items-center justify-center font-black tracking-tight text-white bg-[#016FD0] px-1 rounded-sm`}
    >
      AMEX
    </span>
  );
}

export function CrdbMark({ className = 'h-3.5 w-auto' }) {
  return (
    <span
      className={`${className} inline-flex items-center justify-center font-black tracking-tight text-white bg-[#0B4A6F] px-1 rounded-sm`}
    >
      CRDB
    </span>
  );
}

export function NmbMark({ className = 'h-3.5 w-auto' }) {
  return (
    <span
      className={`${className} inline-flex items-center justify-center font-black tracking-tight text-white bg-[#0A3D91] px-1 rounded-sm`}
    >
      NMB
    </span>
  );
}

/** Vector fallbacks used when a logo image cannot be loaded. */
const CARD_MARKS = {
  VISA: VisaMark,
  Mastercard: MastercardMark,
  AMEX: AmexMark,
  CRDB: CrdbMark,
  NMB: NmbMark,
};

/* -------------------------------------------------------------------------- */
/*  Composed badges                                                           */
/* -------------------------------------------------------------------------- */

const PROVIDER_MARKS = {
  MPESA: MPesaMark,
  AIRTEL: AirtelMoneyMark,
  HALOPESA: HaloPesaMark,
  MIXX: MixxMark,
  TIGO: TigoMark,
  AZAMPAY: AzamPayMark,
  CASH: CashMark,
};

/** Brand tile colours (mark is drawn in the tile's foreground colour). */
const PROVIDER_TILES = {
  MPESA: { bg: '#E60000', fg: '#FFFFFF' },
  AIRTEL: { bg: '#E4002B', fg: '#FFFFFF' },
  MIXX: { bg: '#F5C518', fg: '#1F2937' },
  HALOPESA: { bg: '#F58220', fg: '#FFFFFF' },
  TIGO: { bg: '#1E40AF', fg: '#FFC400' },
  AZAMPAY: { bg: '#0EA5E9', fg: '#FFFFFF' },
  CASH: { bg: '#F97316', fg: '#FFFFFF' },
};

/** Case-insensitive lookup so 'VISA', 'Visa' and 'visa' all resolve. */
const findLogo = (map, key) => {
  if (!key) return undefined;
  if (map[key]) return map[key];
  const target = String(key).toLowerCase();
  return Object.entries(map).find(([name]) => name.toLowerCase() === target)?.[1];
};

/** Square brand tile containing the provider's official logo image. */
export function ProviderTile({ provider, className = TILE }) {
  const { t } = useTranslation();
  const [imageFailed, setImageFailed] = useState(false);

  const Mark = PROVIDER_MARKS[provider?.id] || CashMark;
  const tile = PROVIDER_TILES[provider?.id] || PROVIDER_TILES.CASH;
  const logo = findLogo(PROVIDER_LOGOS, provider?.id);

  if (logo && !imageFailed) {
    return (
      <span
        className={`${className} inline-flex items-center justify-center shrink-0 bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden`}
      >
        <img
          src={logo}
          alt={t('payment.providerLogoAlt', { provider: provider?.label })}
          loading="lazy"
          onError={() => setImageFailed(true)}
          className="w-full h-full object-contain p-0.5"
        />
      </span>
    );
  }

  return (
    <span
      className={`${className} inline-flex items-center justify-center shrink-0 shadow-sm`}
      style={{ backgroundColor: tile.bg, color: tile.fg }}
      aria-hidden="true"
    >
      <Mark />
    </span>
  );
}

/** Mobile money / cash provider badge: official logo + readable label. */
export function ProviderBadge({ provider, className = '' }) {
  return (
    <span className={`flex items-center gap-2 min-w-0 ${className}`.trim()}>
      <ProviderTile provider={provider} />
      <span className="text-xs font-bold text-gray-800 truncate">{provider?.label}</span>
    </span>
  );
}

/** Bank card network badge showing the real card network logo. */
export function CardBadge({ network, className = '' }) {
  const [imageFailed, setImageFailed] = useState(false);
  const logo = findLogo(CARD_LOGOS, network);
  const Mark = CARD_MARKS[network] || CARD_MARKS.VISA;

  return (
    <span
      className={`px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg flex items-center justify-center h-9 ${className}`.trim()}
    >
      {logo && !imageFailed ? (
        <img
          src={logo}
          alt={network}
          loading="lazy"
          onError={() => setImageFailed(true)}
          className="max-h-5 w-auto object-contain"
        />
      ) : (
        <Mark className="h-4 w-auto" />
      )}
    </span>
  );
}
