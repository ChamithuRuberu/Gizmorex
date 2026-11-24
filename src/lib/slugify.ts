/** Turns any label into a URL slug: "Keyboard & Mouse" → "keyboard-mouse". */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
