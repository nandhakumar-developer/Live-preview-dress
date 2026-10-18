import { Product } from '@/types/database';

/**
 * Builds a clean, metadata-informed prompt for Decart Lucy V-TON.
 * Preserves garment type, color, and key attributes without promising physical tailoring or claiming guaranteed exact fit.
 */
export function buildTryOnPrompt(product: Product): string {
  const name = (product.name || '').trim();
  const rawType = (product.garment_type || '').toLowerCase().trim();

  // Determine effective garment type from name or garment_type
  let effectiveType = rawType || 'clothing';
  if (/polo/i.test(name)) effectiveType = 'polo shirt';
  else if (/shirt/i.test(name)) effectiveType = 'shirt';
  else if (/tee|t-shirt/i.test(name)) effectiveType = 't-shirt';
  else if (/blazer|suit/i.test(name)) effectiveType = 'blazer';
  else if (/jacket|coat/i.test(name)) effectiveType = 'jacket';
  else if (/saree/i.test(name)) effectiveType = 'saree';
  else if (/kurti|kurta/i.test(name)) effectiveType = 'kurti';
  else if (/dress|gown/i.test(name)) effectiveType = 'dress';

  const isShirtOrTop = /shirt|polo|tee|top|blazer|jacket/i.test(name + ' ' + effectiveType);

  // If a custom prompt exists, verify it doesn't contain stale dress/gown templates for a shirt/polo
  if (product.try_on_prompt && product.try_on_prompt.trim().length > 0) {
    const customPrompt = product.try_on_prompt.trim();
    const hasStaleGownTerms = /evening gown|corset bodice|floor-length|maxi dress|slit dress/i.test(customPrompt);

    // If it's a shirt/top but prompt contains gown terms, override with accurate prompt
    if (!(isShirtOrTop && hasStaleGownTerms)) {
      return customPrompt;
    }
  }

  const color = product.color ? `${product.color} ` : '';

  // Reference-guided prompt ensuring Decart Lucy V-TON transfers the exact uploaded image
  if (/polo/i.test(effectiveType)) {
    return `Realistic virtual try-on fitting the exact ${color}polo shirt shown in the reference image. Accurately replicate its specific collar, short sleeves, button placket, color, fabric drape, and authentic fit on the person's upper body.`;
  }

  if (/shirt|tee|t-shirt|top/i.test(effectiveType)) {
    return `Realistic virtual try-on fitting the exact ${color}shirt shown in the reference image. Accurately transfer its specific pattern, collar, sleeves, color, texture, and natural upper-body drape onto the person.`;
  }

  if (/blazer|suit|jacket|coat/i.test(effectiveType)) {
    return `Structured tailored virtual try-on fitting the exact ${color}jacket shown in the reference image. Transfer the specific lapels, shoulders, buttons, and textile pattern accurately onto the person.`;
  }

  if (/saree/i.test(effectiveType)) {
    return `Graceful virtual try-on fitting the exact ${color}saree shown in the reference image. Transfer its authentic border, pallu, pleats, and silk sheen onto the person with traditional draping.`;
  }

  if (/kurti|kurta/i.test(effectiveType)) {
    return `Authentic virtual try-on fitting the exact ${color}ethnic kurti shown in the reference image. Transfer its specific embroidery, neckline, cut, and fabric drape accurately.`;
  }

  if (/dress|gown/i.test(effectiveType)) {
    return `High-fashion virtual try-on fitting the exact ${color}dress shown in the reference image. Accurately transfer its specific silhouette, fabric drape, neckline, and texture onto the person.`;
  }

  return `Realistic virtual try-on fitting the exact garment shown in the reference image: ${color}${name || 'clothing item'}. Transfer the reference garment's precise colors, patterns, cut, and fabric texture naturally onto the person.`;
}
