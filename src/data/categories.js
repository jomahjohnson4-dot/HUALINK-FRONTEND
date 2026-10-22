/**
 * Hualink department / sub-category hierarchy powering the header's
 * "All Categories" hover mega-flyout.
 */
import {
  Coffee,
  Flame,
  Headphones,
  Radio,
  Smartphone,
  Speaker,
  Usb,
  Zap,
} from 'lucide-react';

export const hualinkCategories = [
  {
    id: 'electronics',
    name: 'Electronics & Tech',
    nameKey: 'categories.electronicsTech',
    subcategories: [
      { name: 'Phones & Smartphones', nameKey: 'categories.phonesSmartphones', icon: 'Smartphone', slug: 'smartphones' },
      { name: 'Power & Charging', nameKey: 'categories.powerCharging', icon: 'Zap', slug: 'chargers' },
      { name: 'Audio & Sound', nameKey: 'categories.audioSound', icon: 'Headphones', slug: 'audio' },
      { name: 'Radios & Players', nameKey: 'categories.radiosPlayers', icon: 'Radio', slug: 'radios' },
      { name: 'Digital Accessories', nameKey: 'categories.digitalAccessories', icon: 'Usb', slug: 'accessories' },
    ],
  },
  {
    id: 'appliances',
    name: 'Home & Living',
    nameKey: 'categories.homeLiving',
    subcategories: [
      { name: 'Electric Kettles', nameKey: 'categories.electricKettles', icon: 'Coffee', slug: 'kettles' },
      { name: 'Steam Irons', nameKey: 'categories.steamIrons', icon: 'Flame', slug: 'irons' },
      { name: 'Home Audio', nameKey: 'categories.homeAudio', icon: 'Speaker', slug: 'speakers' },
    ],
  },
];

export const CATEGORY_ICONS = {
  Smartphone,
  Zap,
  Headphones,
  Radio,
  Usb,
  Coffee,
  Flame,
  Speaker,
};

export default hualinkCategories;
