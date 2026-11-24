/**
 * Gizmorex category tree (two levels, like ido.lk: parent → sub-category).
 *
 * This is only the starting structure used by the "Sync categories" admin action.
 * After that the database is the source of truth: add, rename or hide categories
 * in Admin → Categories.
 *
 * Products always point at a sub-category slug. A parent category page shows the
 * products of all its sub-categories.
 */

export interface TaxonomyNode {
  slug: string;
  name: string;
  icon: string;
  children?: { slug: string; name: string }[];
}

export const CATEGORY_TREE: TaxonomyNode[] = [
  {
    slug: 'computer-accessories',
    name: 'Computer Accessories',
    icon: 'Mouse',
    children: [
      { slug: 'keyboard-and-mouse', name: 'Keyboard and Mouse' },
      { slug: 'laptop-chargers', name: 'Laptop Chargers' },
      { slug: 'usb-hubs-adapters', name: 'USB Hubs & Card Readers' },
      { slug: 'web-camera', name: 'Web Cameras' },
      { slug: 'hdmi-video', name: 'HDMI & Video' },
    ],
  },
  {
    slug: 'storage',
    name: 'Storage & Memory',
    icon: 'HardDrive',
    children: [
      { slug: 'memory-cards', name: 'Memory Cards' },
      { slug: 'pendrives', name: 'Pendrives' },
    ],
  },
  {
    slug: 'networking',
    name: 'Networking',
    icon: 'Wifi',
    children: [
      { slug: 'wifi-extenders', name: 'WiFi Extenders' },
      { slug: 'routers', name: '4G Routers' },
      { slug: 'wifi-adapters', name: 'WiFi Adapters' },
    ],
  },
  {
    slug: 'mobile-accessories',
    name: 'Mobile Accessories',
    icon: 'Smartphone',
    children: [
      { slug: 'chargers', name: 'Chargers' },
      { slug: 'phone-holders', name: 'Phone Holders' },
    ],
  },
  {
    slug: 'audio',
    name: 'Audio',
    icon: 'Headphones',
    children: [
      { slug: 'earbuds', name: 'Earbuds' },
      { slug: 'speakers', name: 'Speakers' },
      { slug: 'recorders-sound-cards', name: 'Recorders & Sound Cards' },
    ],
  },
  {
    slug: 'smartwatches',
    name: 'Smartwatches',
    icon: 'Watch',
    children: [{ slug: 'smart-watches', name: 'Smart Watches' }],
  },
  {
    slug: 'creator-products',
    name: 'Creator Products',
    icon: 'Camera',
    children: [
      { slug: 'lights', name: 'Lights' },
      { slug: 'tripods', name: 'Tripods' },
    ],
  },
  {
    slug: 'car-accessories',
    name: 'Car Accessories',
    icon: 'Car',
    children: [{ slug: 'car-camera', name: 'Car Cameras' }],
  },
  {
    slug: 'phones',
    name: 'Phones',
    icon: 'Phone',
    children: [{ slug: 'land-phones', name: 'Land Phones' }],
  },
  {
    slug: 'gaming',
    name: 'Gaming',
    icon: 'Gamepad2',
    children: [{ slug: 'controllers', name: 'Controllers' }],
  },
  {
    slug: 'health-beauty',
    name: 'Health & Beauty',
    icon: 'Sparkles',
    children: [{ slug: 'trimmers', name: 'Trimmers' }],
  },
];

/** One-time re-categorisation of the current catalog: product slug → sub-category slug. */
export const PRODUCT_CATEGORY_MAP: Record<string, string> = {
  'philips-8-in-1-trimmer-3000-series-all-in-one-mg3917-15': 'trimmers',
  'lenovo-64gb-dual-usb-type-c-flash-drive': 'pendrives',
  'ugreen-30333-usb-3-0-all-in-one-card-reader-cr125-sd-tf-cf-ms-50cm-cable': 'usb-hubs-adapters',
  'ugreen-65w-uno-rg-gan-fast-charging-adapter-25686': 'chargers',
  'porodo-24inch-led-flat-panel-light-75w': 'lights',
  'porodo-19inch-led-flat-panel-light': 'lights',
  'porodo-40w-rechargeable-handheld-fill-light': 'lights',
  'porodo-cannes-studio-100w-led-studio-light': 'lights',
  '2-channel-video-switcher-hdmi-video-mixer': 'hdmi-video',
  'zsyb-w80b-80w-handheld-video-light': 'lights',
  'plokama-pk-9950-tripod': 'tripods',
  'plokama-cx-60-flexible-neck-bracket-phone-holder': 'phone-holders',
  'ugreen-75593-2k-usb-web-camera': 'web-camera',
  '70mai-dash-camera-m310-pro-2k': 'car-camera',
  '4g-2k-dual-lens-dash-camera-with-gps-live-tracking': 'car-camera',
  'philips-voicetracer-audio-recorder-dvt1170': 'recorders-sound-cards',
  'hdmi-arc-audio-extractor-192khz-dac-converter': 'hdmi-video',
  'lenovo-thinkplus-pro-64gb-microsd-card': 'memory-cards',
  'lenovo-thinkplus-128gb-microsd-card': 'memory-cards',
  'lenovo-thinkplus-64gb-micro-sd-card': 'memory-cards',
  'professional-studio-sound-card-audio-interface': 'recorders-sound-cards',
  'lenovo-thinkplus-32gb-micro-sd-card': 'memory-cards',
  'anker-soundcore-p20i-wireless-earbuds': 'earbuds',
  'anker-soundcore-p30i-wireless-earbuds': 'earbuds',
  'haylou-faro-smart-watch': 'smart-watches',
  'haylou-solar-neo-2-smartwatch': 'smart-watches',
  'haylou-solar-ultra-smart-watch': 'smart-watches',
  'haylou-solar-pro-smartwatch-ls18': 'smart-watches',
  'haylou-watch-4s-smartwatch-five-star-gps': 'smart-watches',
  'haylou-solar-neo-smartwatch-calling-watch': 'smart-watches',
  'haylou-watch-s6-smart-watch': 'smart-watches',
  'dell-130w-usb-c-laptop-charger-power-adapter-20v-6-5a': 'laptop-chargers',
  'aoc-ms320-wireless-mouse': 'keyboard-and-mouse',
  'meetion-m100-silent-wired-mouse': 'keyboard-and-mouse',
  'aoc-km460-wireless-keyboard-and-mouse-combo': 'keyboard-and-mouse',
  'ugreen-55773-wired-keyboard-and-mouse-combo': 'keyboard-and-mouse',
  'ugreen-25894-full-size-wireless-keyboard': 'keyboard-and-mouse',
  'boxu-2-in-1-usb-hub-type-c-usb-a-4-port-adapter-ad-010': 'usb-hubs-adapters',
  'ugreen-55146-dual-mode-wireless-mouse-bluetooth-5-0-2-4ghz-m331': 'keyboard-and-mouse',
  'panasonic-kx-tg1711-cordless-phone': 'land-phones',
  'panasonic-kx-tg6711-digital-cordless-phone-smart-function-key-power-backup': 'land-phones',
  'yesido-c265-car-center-mirror-phone-mount': 'phone-holders',
  'dlna-zt968g-dual-sim-landphone-desktop-telephone': 'land-phones',
  'microlab-t11-2-1-bluetooth-subwoofer-gaming-speaker-system': 'speakers',
  'meetion-c2000-wireless-keyboard-and-mouse-combo': 'keyboard-and-mouse',
  'ps4-dualshock-4-fifa-wireless-controller': 'controllers',
  'tp-link-m7005-4g-lte-mobile-wi-fi-router': 'routers',
  'lb-link-re300-300mbps-wi-fi-range-extender': 'wifi-extenders',
  'lb-link-ax900-wi-fi-6-bluetooth-5-4-usb-adapter-bl-wdn953ax': 'wifi-adapters',
  'lb-link-mf518eu-portable-4g-lte-router': 'routers',
  '100m-hdmi-wireless-extender-transmitter-and-receiver': 'hdmi-video',
  '200m-wireless-hdmi-extender-transmitter-and-receiver': 'hdmi-video',
  'lb-link-ac1200-dual-band-wifi-range-extender': 'wifi-extenders',
  'lb-link-ac1300-dual-band-usb-wi-fi-adapter-bl-wdn1300h': 'wifi-adapters',
};

/** Turns any label into a URL slug: "Keyboard & Mouse" → "keyboard-mouse". */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
