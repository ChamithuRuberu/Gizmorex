import { revalidatePath } from 'next/cache';

/**
 * Call after any admin write to products or categories so the storefront
 * (home, listing, category and product pages) shows the change on the next request.
 */
export function revalidateStorefront() {
  revalidatePath('/', 'layout');
}
