/**
 * Official brand logo assets for the payment panel.
 *
 * Every URL below was resolved through the Wikimedia Commons API and verified
 * to return HTTP 200 with a valid PNG payload (the ones originally sketched by
 * hand returned 404/400 because the file hash paths did not exist).
 *
 * Each consumer falls back to the inline vector mark in
 * PaymentProviderBadges.jsx if the remote asset ever fails to load, so a
 * dead URL can never leave a broken image behind.
 */

/** Mobile money + cash brand images. */
export const LOGOS = {
  lipaCash: 'https://img.icons8.com/color/96/cash-in-hand.png',
  vodacomMpesa:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/M-PESA_LOGO-01.svg/330px-M-PESA_LOGO-01.svg.png',
  airtelMoney:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Airtel_logo.svg/330px-Airtel_logo.svg.png',
  mixxYas:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Logo_Tigo.svg/330px-Logo_Tigo.svg.png',
  halopesa:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Logo_new_Halotel.png/330px-Logo_new_Halotel.png',
};

/** Bank card + bank brand images. */
export const CARD_LOGOS = {
  visa:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Visa_Inc._logo_%282005%E2%80%932014%29.svg/330px-Visa_Inc._logo_%282005%E2%80%932014%29.svg.png',
  mastercard:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/330px-Mastercard-logo.svg.png',
  amex:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/330px-American_Express_logo_%282018%29.svg.png',
  crdb: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/CRDB_BANK.png/330px-CRDB_BANK.png',
  nmb: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/NMB_Bank_Logo.png',
};

/** Maps a payment provider id to its official logo asset. */
export const PROVIDER_LOGOS = {
  MPESA: LOGOS.vodacomMpesa,
  AIRTEL: LOGOS.airtelMoney,
  MIXX: LOGOS.mixxYas,
  TIGO: LOGOS.mixxYas,
  HALOPESA: LOGOS.halopesa,
  CASH: LOGOS.lipaCash,
};

export default LOGOS;
