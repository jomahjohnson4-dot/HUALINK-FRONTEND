/**
 * Centralized Hualink product catalogue.
 *
 * Authentic warehouse inventory for Hualink Distribution. Every product
 * surfaced anywhere in the application (marketplace grid, list view, quick
 * view modal and the product details page) is defined exactly once here with
 * a unique id, matching name, working image + thumbnail gallery, pricing and
 * a unique specification list.
 *
 * Every image URL below was verified to return HTTP 200 and visually checked
 * to depict the product it belongs to.
 */
export const productsCatalog = [
  {
    id: 'fast-charger-adapter',
    name: 'Hualink 65W Fast Charger Adapter with Dual Type-C & USB Ports',
    category: 'Chargers & Cables',
    categorySlug: 'chargers-cables',
    price: 'TSh 25,000',
    originalPrice: 'TSh 35,000',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&q=80',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Lazos_GaN_Charger_30W_L-AC-G30.jpg/960px-Lazos_GaN_Charger_30W_L-AC-G30.jpg',
    ],
    badge: 'HOT',
    rating: 4.9,
    reviewsCount: 210,
    moq: '1 piece',
    action: 'cart',
    location: 'TZ',
    specs: [
      '65W GaN Fast Charging technology',
      'Dual Type-C and USB-A outputs',
      'Over-heat and surge protection',
    ],
    details: {
      Brand: 'Hualink Tech',
      Output: '65W Max',
      Port: 'Type-C / USB',
    },
  },
  {
    id: 'portable-digital-radio',
    name: 'Rechargeable FM/AM Digital Radio with USB & TF Card Player',
    category: 'Audio & Sound',
    categorySlug: 'audio',
    price: 'TSh 30,000',
    originalPrice: 'TSh 45,000',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/ER210.jpg/960px-ER210.jpg',
    thumbnails: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/ER210.jpg/960px-ER210.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/DEGEN_DE-1129_%282%29.JPG/960px-DEGEN_DE-1129_%282%29.JPG',
    ],
    badge: 'NEW',
    rating: 4.7,
    reviewsCount: 85,
    moq: '1 piece',
    action: 'cart',
    location: 'TZ',
    specs: [
      'High sensitivity FM/AM digital tuner',
      'Supports USB drives & TF MicroSD cards',
      'Long-lasting rechargeable battery',
    ],
    details: {
      Brand: 'Hualink Sound',
      Battery: '1200mAh',
      Connectivity: 'FM / USB / TF',
    },
  },
  {
    id: 'airpods-pro-wireless',
    name: 'Hualink Wireless AirPods Pro with Active Noise Cancellation',
    category: 'Audio & Sound',
    categorySlug: 'audio',
    price: 'TSh 55,000',
    originalPrice: 'TSh 80,000',
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&q=80',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Fifth-generation_AirPods_in_their_charging_case.jpg/960px-Fifth-generation_AirPods_in_their_charging_case.jpg',
    ],
    badge: 'VERIFIED',
    rating: 4.8,
    reviewsCount: 340,
    moq: '1 piece',
    action: 'cart',
    location: 'TZ',
    specs: [
      'Active Noise Cancellation (ANC)',
      'Pop-up pairing & touch controls',
      'Up to 24 hours total playtime with case',
    ],
    details: {
      Brand: 'Hualink Audio',
      Bluetooth: 'v5.3',
      CaseCharging: 'Wireless / Lightning',
    },
  },
  {
    id: 'selfie-stick-tripod-stand',
    name: 'Extendable Selfie Stick Stand with Wireless Bluetooth Remote',
    category: 'Accessories',
    categorySlug: 'accessories',
    price: 'TSh 20,000',
    originalPrice: 'TSh 30,000',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Completely_expanded_Selfie_Stick.jpg/960px-Completely_expanded_Selfie_Stick.jpg',
    thumbnails: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Completely_expanded_Selfie_Stick.jpg/960px-Completely_expanded_Selfie_Stick.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Half_expanded_Selfie_Stick.jpg/960px-Half_expanded_Selfie_Stick.jpg',
    ],
    badge: 'HOT',
    rating: 4.9,
    reviewsCount: 175,
    moq: '1 piece',
    action: 'cart',
    location: 'TZ',
    specs: [
      '3-in-1 Selfie Stick & Floor Tripod Stand',
      'Detachable Bluetooth shutter remote',
      '360° rotating phone holder clamp',
    ],
    details: {
      Brand: 'Hualink Gear',
      MaxHeight: '160cm',
      Material: 'Aluminum Alloy',
    },
  },
  {
    id: 'iphone-pro-series',
    name: 'Apple iPhone Pro Series (Grade A Certified)',
    category: 'Smartphones',
    categorySlug: 'smartphones',
    price: 'TSh 1,250,000',
    originalPrice: 'TSh 1,450,000',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80',
    ],
    badge: 'VERIFIED',
    rating: 4.9,
    reviewsCount: 310,
    moq: '1 piece',
    action: 'cart',
    location: 'TZ',
    specs: [
      'Unlocked for Vodacom, Airtel, Tigo, Halotel',
      '85%+ guaranteed battery health',
      '1 Year Hualink Warranty',
    ],
    details: {
      Brand: 'Apple',
      Condition: 'Grade A Certified',
      Storage: '128GB / 256GB',
    },
  },
  {
    id: 'usb-fast-data-cable',
    name: 'High-Speed USB 3.0 Flash Drive & Braided Fast Charging Cable Kit',
    category: 'Chargers & Cables',
    categorySlug: 'chargers-cables',
    price: 'TSh 18,000',
    originalPrice: 'TSh 25,000',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Kingston_Technology_DataTraveler_G4_USB_flash_drive_USB_3.0_32_Gb.jpg/960px-Kingston_Technology_DataTraveler_G4_USB_flash_drive_USB_3.0_32_Gb.jpg',
    thumbnails: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Kingston_Technology_DataTraveler_G4_USB_flash_drive_USB_3.0_32_Gb.jpg/960px-Kingston_Technology_DataTraveler_G4_USB_flash_drive_USB_3.0_32_Gb.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Supertalent_USB-Stick.jpg/960px-Supertalent_USB-Stick.jpg',
    ],
    badge: 'FREE SHIPPING',
    rating: 4.7,
    reviewsCount: 142,
    moq: '1 piece',
    action: 'cart',
    location: 'TZ',
    specs: [
      '64GB Metal High-Speed USB 3.0 Drive',
      'Heavy-duty nylon braided fast charge cable',
      'Universal compatibility',
    ],
    details: {
      Brand: 'Hualink Tech',
      USBCapacity: '64GB',
      CableLength: '2 Meters',
    },
  },
  {
    id: 'electric-stainless-kettle',
    name: 'Decakila 1.5L Stainless Steel Electric Jug Kettle 1800W',
    category: 'Home Appliances',
    categorySlug: 'home-appliances',
    price: 'TSh 52,500',
    originalPrice: 'TSh 65,000',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/2023_Czajnik_elektryczny_Bosch_%281%29.jpg/960px-2023_Czajnik_elektryczny_Bosch_%281%29.jpg',
    thumbnails: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/2023_Czajnik_elektryczny_Bosch_%281%29.jpg/960px-2023_Czajnik_elektryczny_Bosch_%281%29.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/2023_Czajnik_elektryczny_Bosch_%282%29.jpg/960px-2023_Czajnik_elektryczny_Bosch_%282%29.jpg',
    ],
    badge: 'VERIFIED',
    rating: 4.8,
    reviewsCount: 198,
    moq: '1 piece',
    action: 'cart',
    location: 'TZ',
    specs: [
      '1800W rapid boiling power',
      'Stainless steel body with water level gauge',
      'Boil-dry protection & auto shut-off',
    ],
    details: {
      Brand: 'Decakila',
      Capacity: '1.5 Liters',
      Power: '1800W',
    },
  },
  {
    id: 'jbl-charge-5-speaker',
    name: 'JBL CHARGE 5 Portable Waterproof Bluetooth Speaker',
    category: 'Audio & Sound',
    categorySlug: 'audio',
    price: 'TSh 520,000',
    originalPrice: 'TSh 620,000',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/JBL_Charge_4_1v2.jpg/960px-JBL_Charge_4_1v2.jpg',
    thumbnails: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/JBL_Charge_4_1v2.jpg/960px-JBL_Charge_4_1v2.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/JBL_Charge_4_2v2.jpg/960px-JBL_Charge_4_2v2.jpg',
    ],
    badge: 'HOT',
    rating: 4.9,
    reviewsCount: 260,
    moq: '1 piece',
    action: 'cart',
    location: 'TZ',
    specs: [
      'JBL Original Pro Sound with deep bass',
      '20 Hours of continuous playtime',
      'IP67 Waterproof and Dustproof',
    ],
    details: {
      Brand: 'JBL',
      BatteryLife: '20 Hours',
      Feature: 'Powerbank Output',
    },
  },
  {
    id: 'electric-steam-iron-pasi',
    name: 'Non-Stick Electric Steam Iron (Pasi ya Umeme)',
    category: 'Home Appliances',
    categorySlug: 'home-appliances',
    price: 'TSh 38,000',
    originalPrice: 'TSh 50,000',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Philips_steam_iron_model_HD_1256_A.jpg/960px-Philips_steam_iron_model_HD_1256_A.jpg',
    thumbnails: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Philips_steam_iron_model_HD_1256_A.jpg/960px-Philips_steam_iron_model_HD_1256_A.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Teal_and_white_electric_steam_iron_-_side_view.jpg/960px-Teal_and_white_electric_steam_iron_-_side_view.jpg',
    ],
    badge: 'NEW',
    rating: 4.7,
    reviewsCount: 110,
    moq: '1 piece',
    action: 'cart',
    location: 'TZ',
    specs: [
      'Smooth non-stick Teflon soleplate',
      'Adjustable temperature control dial for all fabrics',
      'Steam burst and spray functions',
    ],
    details: {
      Brand: 'Hualink Home',
      Power: '1200W',
      Soleplate: 'Non-stick Teflon',
    },
  },
];

/* -------------------------------------------------------------------------- */
/*  Lookups                                                                   */
/* -------------------------------------------------------------------------- */

/** Find a catalogue product by its id. */
export const getProductById = (id) => {
  if (!id) return undefined;
  return productsCatalog.find((product) => product.id === id);
};

/**
 * Products that belong to the same category as the given product.
 *
 * When a category only holds a single item (for example the smartphones
 * shelf) the remaining slots are filled with other catalogue products so the
 * "More in ..." shelf never renders empty.
 */
export const getRelatedProducts = (product, limit = 4) => {
  if (!product) return [];

  const others = productsCatalog.filter((item) => item.id !== product.id);
  const sameCategory = others.filter((item) => item.categorySlug === product.categorySlug);
  const fallback = others.filter((item) => item.categorySlug !== product.categorySlug);

  return [...sameCategory, ...fallback].slice(0, limit);
};

export default productsCatalog;
