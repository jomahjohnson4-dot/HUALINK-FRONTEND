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
    subcategories: [
      { name: 'Phones & Smartphones', icon: 'Smartphone', slug: 'smartphones' },
      { name: 'Power & Charging', icon: 'Zap', slug: 'chargers' },
      { name: 'Audio & Sound', icon: 'Headphones', slug: 'audio' },
      { name: 'Radios & Players', icon: 'Radio', slug: 'radios' },
      { name: 'Digital Accessories', icon: 'Usb', slug: 'accessories' },
    ],
  },
  {
    id: 'appliances',
    name: 'Home & Living',
    subcategories: [
      { name: 'Electric Kettles', icon: 'Coffee', slug: 'kettles' },
      { name: 'Steam Irons', icon: 'Flame', slug: 'irons' },
      { name: 'Home Audio', icon: 'Speaker', slug: 'speakers' },
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
