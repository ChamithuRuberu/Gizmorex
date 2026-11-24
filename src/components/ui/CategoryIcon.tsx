import {
  BatteryCharging, Cable, Camera, Car, Cpu, Gamepad2, HardDrive, Headphones, Keyboard, Laptop, Monitor, Mouse,
  Package, Phone, Plug, Router, Smartphone, Sparkles, Tv, Usb, Watch, Webcam, Wifi,
  type LucideIcon,
} from 'lucide-react';

/** Maps a category's `icon` name (stored in the database) to its Lucide icon. */
const ICONS: Record<string, LucideIcon> = {
  BatteryCharging, Cable, Camera, Car, Cpu, Gamepad2, HardDrive, Headphones, Keyboard, Laptop, Monitor, Mouse,
  Package, Phone, Plug, Router, Smartphone, Sparkles, Tv, Usb, Watch, Webcam, Wifi,
};

export const CATEGORY_ICON_NAMES = Object.keys(ICONS);

/** Best-guess icon from the category name, used when no specific icon was chosen. */
const GUESSES: [RegExp, LucideIcon][] = [
  [/power\s?bank|battery/i, BatteryCharging],
  [/laptop charger|charger|adapter/i, Plug],
  [/hdmi|vga|cable|network/i, Cable],
  [/keyboard/i, Keyboard],
  [/mouse/i, Mouse],
  [/web\s?cam|web camera/i, Webcam],
  [/camera|cctv/i, Camera],
  [/wi-?fi|extender|router|modem/i, Router],
  [/pen\s?drive|flash|usb/i, Usb],
  [/storage|hard|ssd|memory/i, HardDrive],
  [/gaming|console|controller/i, Gamepad2],
  [/land\s?phone|telephone/i, Phone],
  [/phone|mobile|tablet/i, Smartphone],
  [/laptop|computer/i, Laptop],
  [/monitor|display/i, Monitor],
  [/tv|entertainment/i, Tv],
  [/audio|headphone|earbud|speaker/i, Headphones],
  [/watch/i, Watch],
  [/car/i, Car],
];

export default function CategoryIcon({ name, label, className }: { name?: string; label?: string; className?: string }) {
  const chosen = name && name !== 'Package' ? ICONS[name] : undefined;
  const guessed = !chosen && label ? GUESSES.find(([re]) => re.test(label))?.[1] : undefined;
  const Icon = chosen || guessed || Package;
  return <Icon className={className} aria-hidden="true" />;
}
