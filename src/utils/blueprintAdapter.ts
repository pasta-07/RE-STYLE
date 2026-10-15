import type { DesignConcept } from '../api/generateDesigns';
import type { UpcycleIdea, StepInstruction, BlueprintCategory } from '../data/upcyclingIdeas';
import type { FabricSample } from '../data/mockFabrics';

// Item-type classification keys
type ProductItemType = 
  | 'chore-jacket' 
  | 'kimono-vest' 
  | 'crossbody-rig' 
  | 'market-tote' 
  | 'maker-apron' 
  | 'protective-pouch' 
  | 'bucket-hat' 
  | 'cushion-home' 
  | 'wall-art';

// Color/Fiber family classification keys
type ColorFamily = 
  | 'yellow-gold' 
  | 'purple-silk' 
  | 'white-light' 
  | 'indigo-denim' 
  | 'wool-earth' 
  | 'dark-black' 
  | 'green-olive' 
  | 'red-terracotta' 
  | 'pink-coral' 
  | 'silk-vibrant' 
  | 'default';

/**
 * Editorial photography catalog indexed by [ProductItemType][ColorFamily].
 * All URLs are verified live high-resolution textile & fashion images.
 */
const CURATED_PRODUCT_IMAGES: Record<ProductItemType, Partial<Record<ColorFamily, string[]>>> = {
  'chore-jacket': {
    'yellow-gold': [
      '/blueprints/yellow-cotton-summer-tunic.jpg',
      '/blueprints/yellow-cotton-studio-shirt.jpg',
    ],
    'purple-silk': [
      '/blueprints/purple-silk-kimono-shrug.jpg',
      '/blueprints/purple-silk-quilted-vest.jpg',
    ],
    'white-light': [
      '/blueprints/belgian-slub-linen-chore-jacket.jpg',
    ],
    'indigo-denim': [
      '/blueprints/denim-chore-jacket.jpg',
    ],
    'green-olive': [
      '/blueprints/olive-chore-jacket.jpg',
      '/blueprints/sage-lace-overlay-top.jpg',
    ],
    'red-terracotta': [
      '/blueprints/terracotta-corduroy-overshirt.jpg',
    ],
    'wool-earth': [
      '/blueprints/belgian-slub-linen-chore-jacket.jpg',
      '/blueprints/wool-tweed-waistcoat.jpg',
    ],
    'dark-black': [
      '/blueprints/olive-chore-jacket.jpg',
      '/blueprints/denim-chore-jacket.jpg',
    ],
    'default': [
      '/blueprints/belgian-slub-linen-chore-jacket.jpg',
      '/blueprints/yellow-cotton-summer-tunic.jpg',
    ],
  },

  'kimono-vest': {
    'yellow-gold': [
      '/blueprints/yellow-cotton-summer-tunic.jpg',
      '/blueprints/yellow-cotton-maker-apron.jpg',
    ],
    'purple-silk': [
      '/blueprints/purple-silk-kimono-shrug.jpg',
      '/blueprints/purple-silk-quilted-vest.jpg',
    ],
    'white-light': [
      '/blueprints/belgian-slub-linen-kimono-gilet.jpg',
    ],
    'indigo-denim': [
      '/blueprints/denim-crossbody-rig.jpg',
    ],
    'green-olive': [
      '/blueprints/olive-utility-rig.jpg',
      '/blueprints/lace-bolero.jpg',
    ],
    'red-terracotta': [
      '/blueprints/terracotta-corduroy-overshirt.jpg',
    ],
    'wool-earth': [
      '/blueprints/belgian-slub-linen-kimono-gilet.jpg',
      '/blueprints/wool-tweed-waistcoat.jpg',
    ],
    'dark-black': [
      '/blueprints/olive-utility-rig.jpg',
    ],
    'default': [
      '/blueprints/belgian-slub-linen-kimono-gilet.jpg',
      '/blueprints/purple-silk-kimono-shrug.jpg',
    ],
  },

  'crossbody-rig': {
    'yellow-gold': [
      '/blueprints/yellow-cotton-market-carryall.jpg',
    ],
    'purple-silk': [
      '/blueprints/purple-silk-evening-pouch.jpg',
    ],
    'white-light': [
      '/blueprints/belgian-slub-linen-crossbody-rig.jpg',
    ],
    'indigo-denim': [
      '/blueprints/denim-crossbody-rig.jpg',
    ],
    'green-olive': [
      '/blueprints/olive-utility-rig.jpg',
      '/blueprints/green-lace-pouch.jpg',
    ],
    'red-terracotta': [
      '/blueprints/corduroy-zip-pouch.jpg',
    ],
    'wool-earth': [
      '/blueprints/belgian-slub-linen-crossbody-rig.jpg',
      '/blueprints/corduroy-zip-pouch.jpg',
    ],
    'dark-black': [
      '/blueprints/olive-utility-rig.jpg',
    ],
    'default': [
      '/blueprints/belgian-slub-linen-crossbody-rig.jpg',
      '/blueprints/denim-crossbody-rig.jpg',
    ],
  },

  'maker-apron': {
    'yellow-gold': [
      '/blueprints/yellow-cotton-maker-apron.jpg',
    ],
    'purple-silk': [
      '/blueprints/purple-silk-quilted-vest.jpg',
    ],
    'white-light': [
      '/blueprints/belgian-slub-linen-maker-apron.jpg',
    ],
    'indigo-denim': [
      '/blueprints/belgian-slub-linen-maker-apron.jpg',
    ],
    'green-olive': [
      '/blueprints/olive-chore-jacket.jpg',
    ],
    'red-terracotta': [
      '/blueprints/terracotta-corduroy-overshirt.jpg',
    ],
    'wool-earth': [
      '/blueprints/belgian-slub-linen-maker-apron.jpg',
    ],
    'default': [
      '/blueprints/belgian-slub-linen-maker-apron.jpg',
      '/blueprints/yellow-cotton-maker-apron.jpg',
    ],
  },

  'market-tote': {
    'yellow-gold': [
      '/blueprints/yellow-cotton-market-carryall.jpg',
    ],
    'purple-silk': [
      '/blueprints/purple-silk-evening-pouch.jpg',
    ],
    'white-light': [
      '/blueprints/belgian-slub-linen-weekend-carryall.jpg',
    ],
    'indigo-denim': [
      '/blueprints/belgian-slub-linen-weekend-carryall.jpg',
    ],
    'green-olive': [
      '/blueprints/green-lace-pouch.jpg',
    ],
    'red-terracotta': [
      '/blueprints/corduroy-zip-pouch.jpg',
    ],
    'wool-earth': [
      '/blueprints/belgian-slub-linen-weekend-carryall.jpg',
    ],
    'default': [
      '/blueprints/belgian-slub-linen-weekend-carryall.jpg',
      '/blueprints/yellow-cotton-market-carryall.jpg',
    ],
  },

  'bucket-hat': {
    'yellow-gold': [
      '/blueprints/yellow-cotton-market-carryall.jpg',
    ],
    'purple-silk': [
      '/blueprints/purple-silk-origami-scarf.jpg',
    ],
    'white-light': [
      '/blueprints/belgian-slub-linen-crossbody-rig.jpg',
    ],
    'indigo-denim': [
      '/blueprints/denim-crossbody-rig.jpg',
    ],
    'green-olive': [
      '/blueprints/green-lace-pouch.jpg',
    ],
    'wool-earth': [
      '/blueprints/corduroy-zip-pouch.jpg',
    ],
    'default': [
      '/blueprints/belgian-slub-linen-crossbody-rig.jpg',
    ],
  },

  'protective-pouch': {
    'yellow-gold': [
      '/blueprints/yellow-cotton-market-carryall.jpg',
    ],
    'purple-silk': [
      '/blueprints/purple-silk-evening-pouch.jpg',
    ],
    'white-light': [
      '/blueprints/belgian-slub-linen-crossbody-rig.jpg',
    ],
    'indigo-denim': [
      '/blueprints/denim-crossbody-rig.jpg',
    ],
    'green-olive': [
      '/blueprints/green-lace-pouch.jpg',
    ],
    'red-terracotta': [
      '/blueprints/corduroy-zip-pouch.jpg',
    ],
    'wool-earth': [
      '/blueprints/corduroy-zip-pouch.jpg',
    ],
    'default': [
      '/blueprints/corduroy-zip-pouch.jpg',
    ],
  },

  'cushion-home': {
    'yellow-gold': [
      '/blueprints/yellow-cotton-envelope-cushion.jpg',
    ],
    'purple-silk': [
      '/blueprints/purple-silk-envelope-cushion.jpg',
    ],
    'white-light': [
      '/blueprints/belgian-slub-linen-weekend-carryall.jpg',
    ],
    'indigo-denim': [
      '/blueprints/yellow-cotton-envelope-cushion.jpg',
    ],
    'wool-earth': [
      '/blueprints/belgian-slub-linen-weekend-carryall.jpg',
      '/blueprints/yellow-cotton-envelope-cushion.jpg',
    ],
    'default': [
      '/blueprints/yellow-cotton-envelope-cushion.jpg',
    ],
  },

  'wall-art': {
    'yellow-gold': [
      '/blueprints/yellow-cotton-envelope-cushion.jpg',
    ],
    'purple-silk': [
      '/blueprints/purple-silk-envelope-cushion.jpg',
    ],
    'white-light': [
      '/blueprints/belgian-slub-linen-weekend-carryall.jpg',
    ],
    'default': [
      '/blueprints/belgian-slub-linen-weekend-carryall.jpg',
    ],
  },
};

/**
 * Classify a design concept into a specific physical product type
 */
function detectProductItemType(concept: DesignConcept): ProductItemType {
  const text = `${concept.title} ${concept.subtitle || ''} ${concept.description || ''}`.toLowerCase();

  if (/shrug|kimono|bolero/i.test(text)) {
    return 'kimono-vest';
  }
  if (/jacket|chore|blazer|overshirt|coat/i.test(text)) {
    return 'chore-jacket';
  }
  if (/gilet|vest|sleeveless|waistcoat|layering vest/i.test(text)) {
    return 'kimono-vest';
  }
  if (/crossbody|chest pack|harness|rig|sling|tactical bag|bellows/i.test(text)) {
    return 'crossbody-rig';
  }
  if (/apron|smock|pinafore/i.test(text)) {
    return 'maker-apron';
  }
  if (/tote|carryall|market bag|duffle|shopper/i.test(text)) {
    return 'market-tote';
  }
  if (/scarf|ascot|cravat|neck|hat|cap|beanie|bonnet|headband|scrunchie/i.test(text)) {
    return 'bucket-hat';
  }
  if (/pouch|potli|minaudiere|sleeve|case|envelope|clutch|wallet|dopp/i.test(text)) {
    return 'protective-pouch';
  }
  if (/cushion|pillow|throw|blanket|mat|napkin|runner|coaster/i.test(text)) {
    return 'cushion-home';
  }
  if (/tapestry|wall hanging|acoustic|artwork/i.test(text)) {
    return 'wall-art';
  }

  // Fallbacks based on category if provided
  if (concept.category === 'Bags & Carry') return 'market-tote';
  if (concept.category === 'Home Goods') return 'cushion-home';
  if (concept.category === 'Accessories') return 'protective-pouch';
  return 'chore-jacket';
}

/**
 * Classify fabric color and fiber family
 */
function detectColorFamily(fabric: FabricSample): ColorFamily {
  // If explicitly designated by client-side canvas analysis or Vision inspection
  if (fabric.colorFamily && fabric.colorFamily !== 'default') {
    if (fabric.colorFamily === 'yellow-gold' || fabric.colorFamily.includes('yellow')) return 'yellow-gold';
    if (fabric.colorFamily === 'purple-silk' || fabric.colorFamily.includes('purple')) return 'purple-silk';
    if (fabric.colorFamily === 'indigo-denim' || fabric.colorFamily.includes('indigo') || fabric.colorFamily.includes('blue')) return 'indigo-denim';
    if (fabric.colorFamily === 'green-olive' || fabric.colorFamily.includes('green')) return 'green-olive';
    if (fabric.colorFamily === 'red-terracotta' || fabric.colorFamily.includes('red')) return 'red-terracotta';
    if (fabric.colorFamily === 'pink-coral' || fabric.colorFamily.includes('pink') || fabric.colorFamily.includes('coral')) return 'pink-coral';
    if (fabric.colorFamily === 'wool-earth' || fabric.colorFamily.includes('wool') || fabric.colorFamily.includes('brown')) {
      if (/jute|burlap|hemp|flax|linen|canvas/i.test(`${fabric.name} ${fabric.material}`)) {
        return 'white-light';
      }
      return 'wool-earth';
    }
    if (fabric.colorFamily === 'dark-black' || fabric.colorFamily.includes('black')) return 'dark-black';
    if (fabric.colorFamily === 'white-cream' || fabric.colorFamily.includes('white')) return 'white-light';
  }

  if (fabric.dominantColor) {
    const dom = fabric.dominantColor.toLowerCase();
    if (/green|olive|sage|emerald|forest|moss|khaki|mint/i.test(dom)) return 'green-olive';
    if (/yellow|gold|amber|mustard|lemon|honey|saffron|ochre/i.test(dom)) return 'yellow-gold';
    if (/purple|violet|magenta|plum|lavender|lilac|orchid|amethyst/i.test(dom)) return 'purple-silk';
    if (/indigo|cobalt|cyan|sapphire|blue/i.test(dom)) return 'indigo-denim';
    if (/red|terracotta|crimson|ruby|burgundy|rust|brick|maroon|scarlet|coral/i.test(dom)) return 'red-terracotta';
    if (/black|charcoal|ebony|onyx|slate|dark/i.test(dom)) return 'dark-black';
    if (/camel|tan|brown|earth/i.test(dom)) {
      if (/jute|burlap|hemp|flax|linen|canvas/i.test(`${fabric.name} ${fabric.material}`)) {
        return 'white-light';
      }
      return 'wool-earth';
    }
    if (/white|cream|ivory|ecru|off-white/i.test(dom)) return 'white-light';
  }

  const text = `${fabric.dominantColor || ''} ${fabric.name} ${fabric.material} ${fabric.texture || ''} ${fabric.tagline || ''}`.toLowerCase();

  // 1. Green / Olive
  if (/green|olive|sage|emerald|forest|moss|khaki|mint/i.test(text)) {
    return 'green-olive';
  }

  // 2. Yellow / Gold / Mustard / Handloom Cotton
  if (/yellow|gold|marigold|amber|mustard|ochre|lemon|saffron|sunbeam|handloom cotton/i.test(text)) {
    return 'yellow-gold';
  }

  // 3. Purple / Silk / Chanderi / Zari / Violet
  if (/purple|violet|lavender|lilac|magenta|plum|amethyst|wine|orchid|chanderi|zari/i.test(text)) {
    return 'purple-silk';
  }

  // Check palette colors for yellow or purple
  if (Array.isArray(fabric.colorPalette)) {
    for (const c of fabric.colorPalette) {
      const colName = (c.name || '').toLowerCase();
      if (/yellow|gold|marigold|amber|mustard|ochre/i.test(colName)) {
        return 'yellow-gold';
      }
      if (/purple|violet|magenta|plum|lilac|lavender|amethyst|orchid/i.test(colName)) {
        return 'purple-silk';
      }
      if (c.hex && /^#[0-9a-f]{6}$/i.test(c.hex)) {
        const r = parseInt(c.hex.slice(1, 3), 16);
        const g = parseInt(c.hex.slice(3, 5), 16);
        const b = parseInt(c.hex.slice(5, 7), 16);
        // Yellow hue has high Red and Green with lower Blue
        if (r > 180 && g > 140 && b < 120) {
          return 'yellow-gold';
        }
        // Purple hue has elevated Red and Blue compared to Green
        if (r > g + 15 && b > g + 15 && (r + b) > 160) {
          return 'purple-silk';
        }
      }
    }
  }

  // 3. Denim / Indigo
  if (/denim|indigo|blue|chambray|raw denim|twill/i.test(text)) {
    return 'indigo-denim';
  }

  // 4. Silk / Vibrant
  if (/silk|satin|coral|lustrous|organza|chiffon|velvet/i.test(text)) {
    return 'silk-vibrant';
  }

  // 5. Wool / Tweed / Earthy
  if (/wool|tweed|houndstooth|earth|brown|camel|terracotta|tan|olive|khaki/i.test(text)) {
    return 'wool-earth';
  }

  // 6. Dark / Black
  if (/black|charcoal|dark|noir|onyx|midnight/i.test(text)) {
    return 'dark-black';
  }

  // 7. White / Light linen
  if (/white|cream|linen|slub|ivory|ecru|bleached|paper|pale/i.test(text)) {
    return 'white-light';
  }

  return 'default';
}

/**
 * Detect physical fabric archetype for image matching
 */
function detectFabricArchetype(text: string, material: string = '', pattern: string = ''): 'jute-burlap' | 'lace-sheer' | 'corduroy-velvet' | 'denim-workwear' | 'silk-satin' | 'linen-slub' | 'wool-tweed' | 'cotton-handloom' {
  const combined = `${text} ${material} ${pattern}`.toLowerCase();
  if (/jute|burlap|hessian|sackcloth/i.test(combined)) {
    return 'jute-burlap';
  }
  if (/lace|guipure|chiffon|crochet|mesh|netting|tulle|eyelet|beaded|sheer|openwork/i.test(combined)) {
    return 'lace-sheer';
  }
  if (/corduroy|wale|velvet|pile|velveteen/i.test(combined)) {
    return 'corduroy-velvet';
  }
  if (/denim|jean|twill|canvas|duck|selvedge|workwear/i.test(combined)) {
    return 'denim-workwear';
  }
  if (/silk|satin|zari|chanderi|brocade|organza|charmeuse/i.test(combined)) {
    return 'silk-satin';
  }
  if (/linen|flax|slub|ramie|hemp|sisal|canvas|bast/i.test(combined)) {
    return 'linen-slub';
  }
  if (/wool|tweed|houndstooth|cashmere|flannel/i.test(combined)) {
    return 'wool-tweed';
  }
  return 'cotton-handloom';
}

/**
 * Generate a bespoke Pollinations AI image URL directly tailored to the concept description, fabric and color
 */
export function generateDynamicConceptImageUrl(
  concept: Partial<DesignConcept>,
  fabric: FabricSample,
  index: number = 0
): string {
  const cleanTitle = concept.title || 'Sustainable Fashion Garment';
  const cleanFabric = fabric.material || fabric.name || 'sustainable textile remnant';
  const cleanColor = fabric.dominantColor ? `${fabric.dominantColor} ` : '';
  const cleanPattern = fabric.pattern || fabric.weave ? `with ${fabric.pattern || fabric.weave} structure, ` : '';
  const cleanSubtitle = concept.subtitle ? `${concept.subtitle}. ` : '';
  const cleanDesc = concept.description ? `${concept.description.slice(0, 140)}. ` : '';

  const prompt = `Award-winning professional editorial fashion studio catalog photography of ${cleanTitle}, ${cleanSubtitle}${cleanDesc}Handcrafted from authentic ${cleanColor}${cleanFabric} remnant ${cleanPattern}tactile woven textile surface details visible in crisp clarity, zero-waste sustainable bespoke circular design, soft directional atelier studio daylighting, clean minimalist boutique backdrop, 8k resolution, photorealistic, sharp focus, magazine lookbook, no text, no watermark`;

  let hash = 0;
  const str = `${cleanTitle}-${cleanSubtitle}-${cleanFabric}-${cleanColor}-${index}`;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  const seed = Math.abs(hash) % 100000;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=600&nologo=true&seed=${seed}&model=flux`;
}

/**
 * Curated catalog image matcher used as a guaranteed offline fallback
 */
export function pickCuratedCatalogImage(concept: DesignConcept, fabric: FabricSample, index: number): string {
  const colorFamily = detectColorFamily(fabric);
  const archetype = fabric.archetype || detectFabricArchetype(
    fabric.name, 
    fabric.material, 
    fabric.pattern || fabric.weave || ''
  );

  // Safeguard: ONLY accept concept.imageUrl if it genuinely matches this fabric's archetype & color
  if (concept.imageUrl && (concept.imageUrl.startsWith('http') || concept.imageUrl.startsWith('/'))) {
    const img = concept.imageUrl.toLowerCase();
    const isBadUnsplash = /photo-1583847268964|photo-1553062407|photo-1490481651871/i.test(img);

    if (!isBadUnsplash) {
      if (archetype === 'lace-sheer' && (img.includes('lace') || img.includes('sage') || img.includes('green-lace'))) {
        return concept.imageUrl;
      }
      if (archetype === 'corduroy-velvet' && img.includes('corduroy')) {
        return concept.imageUrl;
      }
      if (archetype === 'wool-tweed' && (img.includes('wool') || img.includes('tweed'))) {
        return concept.imageUrl;
      }
      if (archetype === 'denim-workwear') {
        if (colorFamily === 'green-olive' && img.includes('olive')) return concept.imageUrl;
        if (colorFamily !== 'green-olive' && img.includes('denim')) return concept.imageUrl;
      }
      if ((archetype === 'silk-satin' || colorFamily === 'purple-silk') && (img.includes('purple-silk') || img.includes('silk'))) {
        return concept.imageUrl;
      }
      if ((archetype === 'cotton-handloom' || colorFamily === 'yellow-gold') && img.includes('yellow-cotton')) {
        return concept.imageUrl;
      }
      if ((archetype === 'linen-slub' || colorFamily === 'white-light' || colorFamily === 'wool-earth') && (img.includes('belgian-slub-linen') || img.includes('linen') || img.includes('jute') || img.includes('burlap'))) {
        return concept.imageUrl;
      }
    }
  }

  const title = (concept.title || '').toLowerCase();
  const text = `${concept.title} ${concept.subtitle || ''} ${concept.description || ''}`.toLowerCase();

  // 0. Jute & Burlap Dedicated Archetype
  if (archetype === 'jute-burlap' || /jute|burlap/i.test(`${fabric.name} ${fabric.material} ${fabric.dominantColor || ''}`)) {
    // Check title first for high-confidence precision match
    if (/\b(crossbody|rig|chest pack|sling)\b/i.test(title)) return '/blueprints/jute-crossbody-rig.jpg';
    if (/\b(shrug|bolero|jacket|gilet)\b/i.test(title)) return '/blueprints/jute-sculptural-shrug.jpg';
    if (/\b(folio|sleeve|laptop|document|portfolio)\b/i.test(title)) return '/blueprints/jute-document-folio.jpg';
    if (/\b(choker|necklace|cravat|collar)\b/i.test(title)) return '/blueprints/jute-statement-choker.jpg';
    if (/\b(hat|bucket|cap)\b/i.test(title)) return '/blueprints/jute-bucket-hat.jpg';
    if (/\b(apron|smock)\b/i.test(title)) return '/blueprints/jute-maker-apron.jpg';
    if (/\b(tote|bag|carryall|market|shopper)\b/i.test(title)) return '/blueprints/jute-patchwork-tote.jpg';

    // Broader text match with strict word boundaries
    if (/\b(crossbody|chest rig|chest pack|tactical rig)\b/i.test(text)) return '/blueprints/jute-crossbody-rig.jpg';
    if (/\b(shrug|bolero|sculptural shrug)\b/i.test(text)) return '/blueprints/jute-sculptural-shrug.jpg';
    if (/\b(laptop sleeve|document folio|laptop folio|portfolio sleeve)\b/i.test(text)) return '/blueprints/jute-document-folio.jpg';
    if (/\b(choker|statement choker|cravat collar|neck choker)\b/i.test(text)) return '/blueprints/jute-statement-choker.jpg';
    if (/\b(bucket hat|studio hat)\b/i.test(text)) return '/blueprints/jute-bucket-hat.jpg';
    if (/\b(maker apron|craft apron|utility apron)\b/i.test(text)) return '/blueprints/jute-maker-apron.jpg';
    if (/\b(market tote|patchwork tote|carryall bag)\b/i.test(text)) return '/blueprints/jute-patchwork-tote.jpg';

    const juteImages = [
      '/blueprints/jute-statement-choker.jpg',
      '/blueprints/jute-crossbody-rig.jpg',
      '/blueprints/jute-sculptural-shrug.jpg',
      '/blueprints/jute-document-folio.jpg',
      '/blueprints/jute-patchwork-tote.jpg',
      '/blueprints/jute-bucket-hat.jpg',
      '/blueprints/jute-maker-apron.jpg'
    ];
    return juteImages[index % juteImages.length];
  }

  // 1. Delicate Lace / Guipure
  if (archetype === 'lace-sheer') {
    if (/camisole|overlay|crop top|top|bustier|tank|slip|bodice|shirt/i.test(text)) {
      return '/blueprints/sage-lace-overlay-top.jpg';
    }
    if (/pouch|potli|wristlet|reticule|minaudiere|bag|purse|clutch|carry/i.test(text)) {
      return '/blueprints/green-lace-pouch.jpg';
    }
    if (/collar|choker|neck|statement|ribbon|cravat|ascot/i.test(text)) {
      return '/blueprints/lace-collar.jpg';
    }
    if (/shrug|bolero|waistcoat|vest|gilet|jacket|layer/i.test(text)) {
      return '/blueprints/lace-bolero.jpg';
    }
    if (/sheath|dress|gown|shift|overlay|skirt|evening/i.test(text)) {
      return '/blueprints/sage-lace-french-evening-dress-1.jpg';
    }
    const laceImages = [
      '/blueprints/sage-lace-overlay-top.jpg',
      '/blueprints/green-lace-pouch.jpg',
      '/blueprints/lace-collar.jpg',
      '/blueprints/lace-bolero.jpg',
      '/blueprints/sage-lace-french-evening-dress-1.jpg'
    ];
    return laceImages[index % laceImages.length];
  }

  // 2. Corduroy & Plush Velvet
  if (archetype === 'corduroy-velvet') {
    if (/shacket|overshirt|jacket|shirt/i.test(text)) {
      return '/blueprints/terracotta-corduroy-overshirt.jpg';
    }
    if (/pouch|dopp|tech|case|sleeve/i.test(text)) {
      return '/blueprints/corduroy-zip-pouch.jpg';
    }
    if (/cushion|pillow|floor/i.test(text)) {
      return '/blueprints/yellow-cotton-envelope-cushion.jpg';
    }
    const cordImages = [
      '/blueprints/terracotta-corduroy-overshirt.jpg',
      '/blueprints/corduroy-zip-pouch.jpg',
      '/blueprints/terracotta-corduroy-overshirt.jpg',
      '/blueprints/corduroy-zip-pouch.jpg',
      '/blueprints/yellow-cotton-envelope-cushion.jpg'
    ];
    return cordImages[index % cordImages.length];
  }

  // 3. Denim & Rugged Workwear
  if (archetype === 'denim-workwear') {
    if (colorFamily === 'green-olive') {
      if (/jacket|chore|overshirt/i.test(text)) {
        return '/blueprints/olive-chore-jacket.jpg';
      }
      if (/crossbody|rig|chest pack|sling|bag/i.test(text)) {
        return '/blueprints/olive-utility-rig.jpg';
      }
      return index % 2 === 0 ? '/blueprints/olive-chore-jacket.jpg' : '/blueprints/olive-utility-rig.jpg';
    }
    if (/chore jacket|workwear.*jacket|atelier.*jacket|jacket/i.test(text)) {
      return '/blueprints/denim-chore-jacket.jpg';
    }
    if (/crossbody.*rig|chest pack|utility.*rig|origami.*fold|crossbody/i.test(text)) {
      return '/blueprints/denim-crossbody-rig.jpg';
    }
    if (/kimono|studio gilet|layering vest|open-front.*vest|gilet/i.test(text)) {
      return '/blueprints/belgian-slub-linen-kimono-gilet.jpg';
    }
    if (/maker.*apron|wrap apron|studio smock|craft apron|smock|apron/i.test(text)) {
      return '/blueprints/belgian-slub-linen-maker-apron.jpg';
    }
    if (/carryall|weekend.*carryall|patchwork.*tote|market tote|weekend tote|tote/i.test(text)) {
      return '/blueprints/belgian-slub-linen-weekend-carryall.jpg';
    }
  }

  // 4. Wool & Tweed
  if (archetype === 'wool-tweed') {
    if (/waistcoat|vest|gilet/i.test(text)) {
      return '/blueprints/wool-tweed-waistcoat.jpg';
    }
    if (/folio|sleeve|pouch/i.test(text)) {
      return '/blueprints/corduroy-zip-pouch.jpg';
    }
    return '/blueprints/wool-tweed-waistcoat.jpg';
  }

  // 5. Silk & Fluid Satin
  if (archetype === 'silk-satin' || colorFamily === 'purple-silk') {
    if (/shrug|kimono|bolero|jacket|coat|overshirt/i.test(text)) {
      return '/blueprints/purple-silk-kimono-shrug.jpg';
    }
    if (/pouch|potli|minaudiere|bag|purse|clutch|carry/i.test(text)) {
      return '/blueprints/purple-silk-evening-pouch.jpg';
    }
    if (/scarf|ascot|cravat|neck|bandana|tie|ribbon/i.test(text)) {
      return '/blueprints/purple-silk-origami-scarf.jpg';
    }
    if (/vest|waistcoat|gilet|smock|apron|crop/i.test(text)) {
      return '/blueprints/purple-silk-quilted-vest.jpg';
    }
    if (/cushion|pillow|folio|envelope|case|living|home/i.test(text)) {
      return '/blueprints/purple-silk-envelope-cushion.jpg';
    }
    const purpleImages = [
      '/blueprints/purple-silk-kimono-shrug.jpg',
      '/blueprints/purple-silk-evening-pouch.jpg',
      '/blueprints/purple-silk-origami-scarf.jpg',
      '/blueprints/purple-silk-quilted-vest.jpg',
      '/blueprints/purple-silk-envelope-cushion.jpg',
    ];
    return purpleImages[index % purpleImages.length];
  }

  // 6. Yellow Handloom Cotton Specialized Blueprints
  if (colorFamily === 'yellow-gold') {
    if (/tunic|dress|gown|robe|shrug|jacket|overshirt/i.test(text)) {
      return '/blueprints/yellow-cotton-summer-tunic.jpg';
    }
    if (/carryall|tote|market|bag|shopper|weekend/i.test(text)) {
      return '/blueprints/yellow-cotton-market-carryall.jpg';
    }
    if (/shirt|camp|collar|studio shirt|blouse|top/i.test(text)) {
      return '/blueprints/yellow-cotton-studio-shirt.jpg';
    }
    if (/apron|smock|pinafore|maker|craft|vest|gilet/i.test(text)) {
      return '/blueprints/yellow-cotton-maker-apron.jpg';
    }
    if (/cushion|pillow|home|envelope|cover|living|wall/i.test(text)) {
      return '/blueprints/yellow-cotton-envelope-cushion.jpg';
    }
    const yellowImages = [
      '/blueprints/yellow-cotton-summer-tunic.jpg',
      '/blueprints/yellow-cotton-market-carryall.jpg',
      '/blueprints/yellow-cotton-studio-shirt.jpg',
      '/blueprints/yellow-cotton-maker-apron.jpg',
      '/blueprints/yellow-cotton-envelope-cushion.jpg',
    ];
    return yellowImages[index % yellowImages.length];
  }

  // 7. Linen / Jute / Burlap / Slub / White-Light
  if (archetype === 'linen-slub' || colorFamily === 'white-light') {
    if (/chore jacket|workwear.*jacket|atelier.*jacket|jacket/i.test(text)) {
      return '/blueprints/belgian-slub-linen-chore-jacket.jpg';
    }
    if (/crossbody.*rig|chest pack|utility.*rig|origami.*fold|crossbody/i.test(text)) {
      return '/blueprints/belgian-slub-linen-crossbody-rig.jpg';
    }
    if (/kimono|studio gilet|layering vest|open-front.*vest|gilet/i.test(text)) {
      return '/blueprints/belgian-slub-linen-kimono-gilet.jpg';
    }
    if (/maker.*apron|wrap apron|studio smock|craft apron|smock|apron/i.test(text)) {
      return '/blueprints/belgian-slub-linen-maker-apron.jpg';
    }
    if (/carryall|weekend.*carryall|patchwork.*tote|market tote|weekend tote|tote|bag/i.test(text)) {
      return '/blueprints/belgian-slub-linen-weekend-carryall.jpg';
    }
    const linenImages = [
      '/blueprints/belgian-slub-linen-chore-jacket.jpg',
      '/blueprints/belgian-slub-linen-crossbody-rig.jpg',
      '/blueprints/belgian-slub-linen-kimono-gilet.jpg',
      '/blueprints/belgian-slub-linen-maker-apron.jpg',
      '/blueprints/belgian-slub-linen-weekend-carryall.jpg'
    ];
    return linenImages[index % linenImages.length];
  }

  // General Curated Image Catalog lookup
  const productType = detectProductItemType(concept);
  const productSet = CURATED_PRODUCT_IMAGES[productType] || CURATED_PRODUCT_IMAGES['chore-jacket'];
  const matchedImages = productSet[colorFamily] || productSet['default'];

  if (matchedImages && matchedImages.length > 0) {
    return matchedImages[index % matchedImages.length];
  }

  // Color & archetype specific safety fallbacks
  const rawColor: string = colorFamily;
  const rawArch: string = archetype;

  if (rawColor === 'green-olive' || rawArch === 'lace-sheer') {
    const greenImages = [
      '/blueprints/sage-lace-overlay-top.jpg',
      '/blueprints/green-lace-pouch.jpg',
      '/blueprints/lace-collar.jpg',
      '/blueprints/lace-bolero.jpg',
      '/blueprints/olive-chore-jacket.jpg',
      '/blueprints/olive-utility-rig.jpg'
    ];
    return greenImages[index % greenImages.length];
  }
  if (rawColor === 'purple-silk' || rawArch === 'silk-satin') {
    const purpleImages = [
      '/blueprints/purple-silk-kimono-shrug.jpg',
      '/blueprints/purple-silk-evening-pouch.jpg',
      '/blueprints/purple-silk-origami-scarf.jpg',
      '/blueprints/purple-silk-quilted-vest.jpg',
      '/blueprints/purple-silk-envelope-cushion.jpg'
    ];
    return purpleImages[index % purpleImages.length];
  }
  if (rawColor === 'white-light' || rawArch === 'linen-slub') {
    const whiteImages = [
      '/blueprints/belgian-slub-linen-chore-jacket.jpg',
      '/blueprints/belgian-slub-linen-crossbody-rig.jpg',
      '/blueprints/belgian-slub-linen-kimono-gilet.jpg',
      '/blueprints/belgian-slub-linen-maker-apron.jpg',
      '/blueprints/belgian-slub-linen-weekend-carryall.jpg'
    ];
    return whiteImages[index % whiteImages.length];
  }
  if (rawColor === 'indigo-denim' || rawArch === 'denim-workwear') {
    const denimImages = [
      '/blueprints/denim-chore-jacket.jpg',
      '/blueprints/denim-crossbody-rig.jpg',
      '/blueprints/olive-chore-jacket.jpg',
      '/blueprints/denim-chore-jacket.jpg',
      '/blueprints/denim-crossbody-rig.jpg'
    ];
    return denimImages[index % denimImages.length];
  }
  if (rawColor === 'red-terracotta' || rawArch === 'corduroy-velvet') {
    const terraImages = [
      '/blueprints/terracotta-corduroy-overshirt.jpg',
      '/blueprints/corduroy-zip-pouch.jpg',
      '/blueprints/terracotta-corduroy-overshirt.jpg',
      '/blueprints/corduroy-zip-pouch.jpg'
    ];
    return terraImages[index % terraImages.length];
  }
  if (rawColor === 'yellow-gold' || rawArch === 'cotton-handloom') {
    const yellowImages = [
      '/blueprints/yellow-cotton-summer-tunic.jpg',
      '/blueprints/yellow-cotton-market-carryall.jpg',
      '/blueprints/yellow-cotton-studio-shirt.jpg',
      '/blueprints/yellow-cotton-maker-apron.jpg',
      '/blueprints/yellow-cotton-envelope-cushion.jpg'
    ];
    return yellowImages[index % yellowImages.length];
  }

  return fabric.imageUrl || '/blueprints/yellow-cotton-summer-tunic.jpg';
}

/**
 * Select the most suitable image based on both the garment type, fabric archetype, and color.
 * For bespoke AI concepts, dynamically generates the photo tailored directly to the description.
 */
function pickSmartImage(concept: DesignConcept, fabric: FabricSample, index: number): string {
  // 1. If concept already has a verified local blueprint image or valid fast asset, use it!
  if (concept.imageUrl && (concept.imageUrl.startsWith('/blueprints/') || (concept.imageUrl.startsWith('http') && !concept.imageUrl.includes('pollinations.ai')))) {
    return concept.imageUrl;
  }

  // 2. Select the verified, photorealistic studio asset matching the concept title, description & fabric
  return pickCuratedCatalogImage(concept, fabric, index);
}

/**
 * Resolve semantic category
 */
function resolveCategory(concept: DesignConcept): BlueprintCategory {
  if (concept.category && ['Apparel & Garments', 'Bags & Carry', 'Accessories', 'Home Goods', 'Art & Living'].includes(concept.category)) {
    return concept.category;
  }

  const text = `${concept.title} ${concept.subtitle || ''} ${concept.description || ''}`.toLowerCase();

  // Apparel & Outerwear
  if (/jacket|coat|chore|blazer|overshirt|vest|gilet|kimono|smock|garment|apparel/i.test(text)) {
    return 'Apparel & Garments';
  }
  // Bags & Carry
  if (/bag|tote|carryall|pouch|sleeve|sling|pack|backpack|crossbody|clutch|rig/i.test(text)) {
    return 'Bags & Carry';
  }
  // Accessories
  if (/charm|loop|scrunchie|headband|strap|wristlet|wallet|key|hair|tie|collar|cuff|bandana|scarf|hat|cap/i.test(text)) {
    return 'Accessories';
  }
  // Home Goods
  if (/cushion|pillow|cozy|apron|mat|table|runner|napkin|pot|coaster|curtain|cover|home/i.test(text)) {
    return 'Home Goods';
  }
  return 'Art & Living';
}

function resolveDifficulty(concept: DesignConcept): 'Beginner' | 'Intermediate' | 'Artisan' {
  if (concept.difficulty && ['Beginner', 'Intermediate', 'Artisan'].includes(concept.difficulty)) {
    return concept.difficulty;
  }

  const text = `${concept.title} ${concept.description}`.toLowerCase();
  if (/charm|loop|scrunchie|headband|strap|wristlet|simple|tie|coaster/i.test(text)) {
    return 'Beginner';
  }
  if (/jacket|coat|tailored|kimono|intricate|chassis|gilet|complex/i.test(text)) {
    return 'Artisan';
  }
  return 'Intermediate';
}

function resolveTimeEstimate(difficulty: 'Beginner' | 'Intermediate' | 'Artisan', concept: DesignConcept): string {
  if (concept.timeEstimate) return concept.timeEstimate;
  switch (difficulty) {
    case 'Beginner':
      return '45 Minutes';
    case 'Intermediate':
      return '1.5 - 2 Hours';
    case 'Artisan':
      return '3 - 4 Hours';
  }
}

export function convertDesignConceptToUpcycleIdea(
  concept: DesignConcept,
  fabric: FabricSample,
  index: number
): UpcycleIdea {
  const category = resolveCategory(concept);
  const difficulty = resolveDifficulty(concept);
  const timeEstimate = resolveTimeEstimate(difficulty, concept);

  const baseScore = 96 + (index % 4);
  const matchScore = Math.min(99, Math.max(93, baseScore));

  const imageUrl = pickSmartImage(concept, fabric, index);
  const fallbackImageUrl = concept.fallbackImageUrl || pickCuratedCatalogImage(concept, fabric, index);

  const steps: StepInstruction[] = (concept.steps && concept.steps.length > 0)
    ? concept.steps
    : [
        {
          step: 1,
          title: `Square & press the ${fabric.name || 'remnant'}`,
          description: `Gently steam press the scrap to release fold creases and align the grainline. Trim edge fray cleanly using a rotary ruler to produce crisp rectilinear panels.`,
          tip: `Preserve intact selvedges where possible for an intentional raw atelier finish along opening rims.`
        },
        {
          step: 2,
          title: 'Zero-waste tessellation layout',
          description: `Mark cutting contours using tailor's chalk following zero-waste interlocking geometric lines. This ensures 100% material diversion from landfill.`,
          tip: `Double-check dimensional allowances (${fabric.dimensions.width}×${fabric.dimensions.height} ${fabric.dimensions.unit}) before slicing.`
        },
        {
          step: 3,
          title: 'Join structural panels & seams',
          description: `Stitch primary seams with a 1cm seam allowance. For lightweight or frayed edges, use enclosed French seams or flat-felled stitches for commercial durability.`,
        },
        {
          step: 4,
          title: 'Finishing, edge binding & hardware',
          description: `Affix any necessary closures, strap anchors, or reinforcing topstitches. Complete with a final steam press for a boutique-ready finish.`,
          tip: `Use contrasting thread tones from your Atelier Chromatic Palette to accent bespoke handcrafted details.`
        }
      ];

  const materialsNeeded: string[] = (concept.materialsNeeded && concept.materialsNeeded.length > 0)
    ? concept.materialsNeeded
    : [
        `Main textile: ${fabric.name} (${fabric.material}, ~${fabric.weightGsm} GSM)`,
        'Heavy-duty color-matched sewing thread',
        'Contrasting lining scrap or fusible interfacing if extra structure is desired',
        'Essential hardware or closure (brass snap, elastic, or webbing)'
      ];

  const toolsNeeded: string[] = (concept.toolsNeeded && concept.toolsNeeded.length > 0)
    ? concept.toolsNeeded
    : [
        'Fabric shears or rotary cutter',
        "Tailor's chalk & clear acrylic ruler",
        'Sewing machine or hand-stitching needles',
        'Steam iron & pressing cloth',
        'Wonder clips or fine glass-head pins'
      ];

  const suitabilityReason = concept.suitabilityReason || 
    `The ${fabric.weave || 'woven structure'} and estimated ${fabric.weightGsm} GSM weight of this remnant provide optimal tensile strength and zero-fray resilience tailored for ${category.toLowerCase()}.`;

  const patternNotes = concept.patternNotes ||
    `Cutting blueprint: Optimized for ${concept.estimatedFabricUsage || `${fabric.dimensions.width}×${fabric.dimensions.height} ${fabric.dimensions.unit}`}. Zero-waste geometric tessellation leaves no unusable offcuts.`;

  const uniqueIdeaId = concept.design_id || `${fabric.id || 'fabric'}-${concept.id || `design-${index + 1}`}-${fabric.archetype || 'arch'}-${fabric.colorFamily || 'col'}-${index}`;

  return {
    id: uniqueIdeaId,
    design_id: concept.design_id || concept.id,
    title: concept.title,
    subtitle: concept.subtitle || (concept.description ? concept.description.slice(0, 100) + '...' : 'Zero-waste bespoke blueprint'),
    product_type: concept.product_type || category,
    category,
    difficulty,
    timeEstimate,
    fabricRequired: concept.estimatedFabricUsage || `${fabric.dimensions.width}×${fabric.dimensions.height} ${fabric.dimensions.unit}`,
    fabric_requirements: concept.fabric_requirements,
    suitabilityReason,
    design_rationale: concept.design_rationale || suitabilityReason,
    imageUrl,
    image_url: imageUrl,
    image_status: concept.image_status || 'success',
    generation_status: concept.generation_status || 'success',
    fallbackImageUrl,
    matchScore,
    tags: concept.tags && concept.tags.length > 0 ? concept.tags : ['zero-waste', '2026-trend', 'ai-generated', fabric.material.toLowerCase()],
    materialsNeeded,
    toolsNeeded,
    steps,
    patternNotes,
    isAiGenerated: true,
    productionCost: concept.estimatedProductionCost,
    sellingPrice: concept.potentialSellingPrice,
    wasteReductionImpact: concept.wasteReductionImpact,
    sourcesUsed: concept.sourcesUsed || [],
    trend_evidence: concept.trend_evidence || concept.sourcesUsed || [],
    feasibility: concept.feasibility,
    image_validation: concept.image_validation,
    rawConcept: concept,
  };
}
