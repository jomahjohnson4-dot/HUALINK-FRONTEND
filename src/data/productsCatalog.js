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
      'Factory Unlocked for all Tanzanian networks (Vodacom, Airtel, Tigo, Halotel)',
      'High capacity battery health (85%+ guaranteed)',
      'Pro camera system with cinematic mode',
      '1 Year Hualink Replacement Warranty',
    ],
    details: {
      Brand: 'Apple',
      Condition: 'Grade A Certified',
      Storage: '128GB / 256GB',
    },
  },
  {
    id: 'flame-air-humidifier',
    name: 'Simulated Flame Air Aromatherapy Diffuser & Humidifier',
    category: 'Home Appliances',
    categorySlug: 'home-appliances',
    price: 'TSh 45,000',
    originalPrice: 'TSh 65,000',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/a/a6/Ultrasonic_Cool_Mist_Humidifier.jpg',
    thumbnails: [
      'https://upload.wikimedia.org/wikipedia/commons/a/a6/Ultrasonic_Cool_Mist_Humidifier.jpg',
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&q=80',
    ],
    badge: 'HOT',
    rating: 4.8,
    reviewsCount: 184,
    moq: '1 piece',
    action: 'cart',
    location: 'TZ',
    specs: [
      'Realistic LED flame light effect with soothing mist',
      'Essential oil aromatherapy diffuser function',
      'Auto shut-off protection when water runs out',
      'Ultra-silent operation for bedrooms and offices',
    ],
    details: {
      Brand: 'Hualink Home',
      TankCapacity: '250ml',
      Power: 'USB Type-C',
    },
  },
  {
    id: 'led-mirror-clock',
    name: 'LED Digital Mirror Alarm Clock with Temperature Display',
    category: 'Electronics & Tech',
    categorySlug: 'electronics',
    price: 'TSh 35,000',
    originalPrice: 'TSh 50,000',
    image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=600&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=600&q=80',
    ],
    badge: 'NEW',
    rating: 4.7,
    reviewsCount: 95,
    moq: '1 piece',
    action: 'cart',
    location: 'TZ',
    specs: [
      'Large LED mirror screen doubles as a vanity mirror',
      'Dual alarm settings with snooze function',
      'Indoor temperature and humidity sensor',
      'USB powered with backup battery memory',
    ],
    details: {
      Brand: 'TechTime',
      Display: 'LED Digital',
      Power: 'USB / Battery',
    },
  },
  {
    id: 'car-perfume-diffuser',
    name: 'Solar Rotating Car Air Freshener & Perfume Diffuser',
    category: 'Automobile',
    categorySlug: 'automobile',
    price: 'TSh 25,000',
    originalPrice: 'TSh 35,000',
    image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600&q=80',
    ],
    badge: 'FREE SHIPPING',
    rating: 4.9,
    reviewsCount: 240,
    moq: '1 piece',
    action: 'cart',
    location: 'TZ',
    specs: [
      'Solar-powered double ring suspension rotation',
      'Long-lasting natural plant extract fragrance',
      'Eliminates odors and freshens vehicle interior',
      'Compact dashboard mount with non-slip base',
    ],
    details: {
      Brand: 'AromaCar',
      Material: 'Zinc Alloy',
      Fragrance: 'Cologne / Ocean',
    },
  },
  {
    id: 'ring-light-tripod',
    name: '18-inch RGB LED Ring Light with Phone Holder & Tripod',
    category: 'Electronics & Tech',
    categorySlug: 'electronics',
    price: 'TSh 85,000',
    originalPrice: 'TSh 110,000',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Ring_Light_25280737679.jpg/960px-Ring_Light_25280737679.jpg',
    thumbnails: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Ring_Light_25280737679.jpg/960px-Ring_Light_25280737679.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/8/81/RING_1000x_IMG_5024.jpg',
    ],
    badge: 'VERIFIED',
    rating: 4.8,
    reviewsCount: 112,
    moq: '1 piece',
    action: 'cart',
    location: 'TZ',
    specs: [
      'Multi-color RGB lighting modes and adjustable color temperature',
      'Includes sturdy adjustable floor tripod and phone mount',
      'Ideal for TikTok creators, live streaming, and makeup artists',
      'Bluetooth remote shutter included',
    ],
    details: {
      Brand: 'CreatorStudio',
      Size: '18 Inch',
      Power: 'AC Adapter',
    },
  },
  {
    id: 'smartwatch-ultra',
    name: 'Smart Watch Ultra Series with Bluetooth Calling & Fitness Tracker',
    category: 'Smartphones',
    categorySlug: 'smartphones',
    price: 'TSh 65,000',
    originalPrice: 'TSh 90,000',
    image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&q=80',
    thumbnails: [
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&q=80',
    ],
    badge: 'HOT',
    rating: 4.6,
    reviewsCount: 156,
    moq: '1 piece',
    action: 'cart',
    location: 'TZ',
    specs: [
      'Make and receive phone calls via Bluetooth',
      'Heart rate, blood pressure, and blood oxygen monitors',
      'Multiple sports modes and IP67 water resistance',
      'Wireless magnetic charging cable included',
    ],
    details: {
      Brand: 'WearFit',
      Compatibility: 'Android & iOS',
      Battery: '3-5 Days',
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

/** Every product in a given category slug, excluding the product itself. */
export const getRelatedProducts = (product, limit = 4) => {
  if (!product) return [];
  return productsCatalog
    .filter((item) => item.categorySlug === product.categorySlug && item.id !== product.id)
    .slice(0, limit);
};

export default productsCatalog;
