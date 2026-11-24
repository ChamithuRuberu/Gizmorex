import {
  Camera, Car, Gamepad2, HardDrive, Headphones, Mouse, Package, Phone, Smartphone, Sparkles, Watch, Wifi,
  type LucideIcon,
} from 'lucide-react';

/** Maps a category's `icon` name (stored in the database) to its Lucide icon. */
const ICONS: Record<string, LucideIcon> = {
  Camera, Car, Gamepad2, HardDrive, Headphones, Mouse, Package, Phone, Smartphone, Sparkles, Watch, Wifi,
};

export const CATEGORY_ICON_NAMES = Object.keys(ICONS);

export default function CategoryIcon({ name, className }: { name?: string; className?: string }) {
  const Icon = (name && ICONS[name]) || Package;
  return <Icon className={className} aria-hidden="true" />;
}
