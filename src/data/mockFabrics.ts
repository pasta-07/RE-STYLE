export interface FabricSample {
  id: string;
  name: string;
  material: string;
  clothingType?: string;
  weave: string;
  weightGsm: number;
  condition: 'Crisp Remnant' | 'Gently Washed' | 'Vintage Worn' | 'Frayed Scrap' | 'Distressed / Stained' | 'Thrifted Garment' | string;
  dimensions: { width: number; height: number; unit: 'cm' | 'in' };
  dimensionsText?: string;
  colorPalette: { name: string; hex: string }[];
  texture: string;
  imageUrl: string;
  tagline: string;
  notes?: string;
  dominantColor?: string;
  colorFamily?: string;
  pattern?: string;
  structuralBody?: string;
  tensileDrape?: string;
  archetype?: string;
  isCustomItem?: boolean;
  uncertaintyNotice?: string | null;
  userConfirmedColor?: boolean;
  userConfirmedMaterial?: boolean;
}

export const SAMPLE_FABRICS: FabricSample[] = [
  {
    id: 'scrap-indigo-denim',
    name: 'Vintage Selvedge Indigo Denim',
    clothingType: 'Denim Remnant',
    material: '100% Organic Raw Cotton',
    weave: '3x1 Right-Hand Twill',
    weightGsm: 340,
    condition: 'Gently Washed',
    dimensions: { width: 45, height: 35, unit: 'cm' },
    dominantColor: 'Deep Indigo',
    colorFamily: 'blue-navy',
    pattern: '3x1 Twill Grain',
    colorPalette: [
      { name: 'Deep Indigo', hex: '#253247' },
      { name: 'Washed Denim', hex: '#496E8A' },
      { name: 'Pale Weft', hex: '#E2EBF0' },
      { name: 'Copper Thread', hex: '#C96F52' },
    ],
    texture: 'Sturdy, structured, tactile rib texture with authentic fading',
    imageUrl: 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80',
    tagline: 'Ideal for structured utility cases, reinforced bags, and sashiko boro mending.',
  },
  {
    id: 'scrap-linen-flax',
    name: 'Washed European Natural Linen',
    clothingType: 'Linen Remnant',
    material: '100% Belgian Flax',
    weave: 'Breathable Plain Weave',
    weightGsm: 185,
    condition: 'Crisp Remnant',
    dimensions: { width: 60, height: 40, unit: 'cm' },
    dominantColor: 'Natural Flax',
    colorFamily: 'beige-natural',
    pattern: 'Slub Plain Weave',
    colorPalette: [
      { name: 'Oatmeal Paper', hex: '#F7F4EE' },
      { name: 'Natural Flax', hex: '#D5CBB9' },
      { name: 'Slate Blue', hex: '#496E8A' },
      { name: 'Golden Thread', hex: '#D6AD64' },
    ],
    texture: 'Softly slubbed, airy drape with natural crumpled texture',
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
    tagline: 'Effortless relaxed drape, perfect for tea ceremony coasters, bento wraps, and table goods.',
  },
  {
    id: 'scrap-terracotta-corduroy',
    name: 'Warm Terracotta Wide-Wale Corduroy',
    clothingType: 'Corduroy Remnant',
    material: 'Cotton & Spandex Blend (98/2)',
    weave: 'Cut Weft Pile (8-Wale)',
    weightGsm: 290,
    condition: 'Crisp Remnant',
    dimensions: { width: 35, height: 25, unit: 'cm' },
    dominantColor: 'Spiced Terracotta',
    colorFamily: 'warm-earth',
    pattern: 'Ribbed Wale',
    colorPalette: [
      { name: 'Spiced Coral', hex: '#C96F52' },
      { name: 'Burnt Amber', hex: '#A6563A' },
      { name: 'Warm Paper', hex: '#F7F4EE' },
      { name: 'Muted Gold', hex: '#D6AD64' },
    ],
    texture: 'Velvety ribbed surface, tactile warmth and structured body',
    imageUrl: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=800&q=80',
    tagline: 'Plush hand-feel suited for pocket organizers, scrunchies, and cozy pouch linings.',
  },
  {
    id: 'scrap-botanical-cotton',
    name: 'Hand-Block Printed Artisan Cotton',
    clothingType: 'Printed Cotton Scrap',
    material: 'Hand-Spun Khadi Cotton',
    weave: 'Artisanal Handloom',
    weightGsm: 140,
    condition: 'Vintage Worn',
    dimensions: { width: 50, height: 50, unit: 'cm' },
    dominantColor: 'Warm Ecru',
    colorFamily: 'warm-neutral',
    pattern: 'Artisanal Botanical Block Print',
    colorPalette: [
      { name: 'Natural Cotton', hex: '#F7F4EE' },
      { name: 'Ink Navy', hex: '#253247' },
      { name: 'Warm Coral', hex: '#C96F52' },
      { name: 'Soft Blue-Gray', hex: '#E2EBF0' },
    ],
    texture: 'Lightweight, gentle softness with distinctive hand-stamped character',
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
    tagline: 'Artisanal organic motifs, ideal for patchwork accents, quilted envelopes, and headband twists.',
  },
  {
    id: 'scrap-thrifted-jeans',
    name: "Thrifted Levi's 501 Straight Jeans",
    clothingType: 'Denim Jeans',
    material: '100% Heavyweight Cotton Denim',
    weave: 'Heavy 14oz Twill',
    weightGsm: 410,
    condition: 'Distressed / Torn',
    dimensions: { width: 85, height: 35, unit: 'cm' },
    dominantColor: 'Washed Stone Indigo',
    colorFamily: 'blue-navy',
    pattern: 'Distressed Twill with Whiskering',
    colorPalette: [
      { name: 'Washed Indigo', hex: '#3B4F69' },
      { name: 'Stone Fade', hex: '#879EB3' },
      { name: 'Brass Rivet', hex: '#B87333' },
    ],
    texture: 'Rugged, thick deconstructed denim with copper rivets and back pockets intact',
    imageUrl: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80',
    tagline: 'Deconstructed denim trousers ready for modular tactical rigs, tool pouches, and boro totes.',
    notes: 'Preserve intact back pocket and outer flat-felled seam for zero-waste design details.'
  },
  {
    id: 'scrap-linen-shirt',
    name: 'Oversized Slub Linen Button-Down Shirt',
    clothingType: 'Button-Down Shirt',
    material: '100% Pure Flax Linen',
    weave: 'Airy Slub Weave',
    weightGsm: 160,
    condition: 'Vintage Worn',
    dimensions: { width: 75, height: 55, unit: 'cm' },
    dominantColor: 'Bone White / Oatmeal',
    colorFamily: 'beige-natural',
    pattern: 'Natural Slub Texture',
    colorPalette: [
      { name: 'Bone White', hex: '#F3EFE6' },
      { name: 'Mother of Pearl', hex: '#EBE5D8' },
      { name: 'Warm Flax', hex: '#C2B69D' },
    ],
    texture: 'Light, breathable, beautifully washed drape with horn buttons',
    imageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80',
    tagline: 'Generous front & back panels ideal for ascot collars, summer aprons, or pleated scarves.',
    notes: 'Preserves front placket button row and cuff interfacing.'
  },
  {
    id: 'scrap-sage-lace',
    name: 'Antique French Floral Sage Lace Remnant',
    clothingType: 'Lace Remnant',
    material: 'Mercerized Cotton & Rayon Lace',
    weave: 'Guipure Floral Openwork',
    weightGsm: 130,
    condition: 'Crisp Remnant',
    dimensions: { width: 45, height: 30, unit: 'cm' },
    dominantColor: 'Sage Green',
    colorFamily: 'green-olive',
    pattern: 'Floral Botanical Openwork',
    colorPalette: [
      { name: 'Sage Green', hex: '#6A8E72' },
      { name: 'Muted Moss', hex: '#8FA89B' },
      { name: 'Pale Mint', hex: '#D7E5DC' },
    ],
    texture: 'Delicate yet stable openwork lace with scalloped border selvedge',
    imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80',
    tagline: 'Exquisite openwork lace for heirloom statement collars, lavender sachets, and lingerie accents.'
  },
  {
    id: 'scrap-kyoto-silk',
    name: 'Kyoto Vintage Mulberry Silk Kimono Scrap',
    clothingType: 'Silk Kimono Scrap',
    material: '100% Pure Mulberry Silk',
    weave: 'Chirimen Crepe & Satin',
    weightGsm: 110,
    condition: 'Vintage Worn',
    dimensions: { width: 45, height: 22, unit: 'cm' },
    dominantColor: 'Royal Violet & Lilac',
    colorFamily: 'purple-violet',
    pattern: 'Traditional Botanical Damask',
    colorPalette: [
      { name: 'Imperial Violet', hex: '#5E2B7A' },
      { name: 'Lilac Mist', hex: '#A270B5' },
      { name: 'Gold Leaf', hex: '#D6AD64' },
    ],
    texture: 'Incredible fluid drape, lustrous pearlescent sheen, tactile crepe hand',
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
    tagline: 'Precious ceremonial silk offcut suited for origami ascots, cloud scrunchies, and evening pouches.'
  },
  {
    id: 'scrap-wool-tweed',
    name: 'Scottish Shetland Wool Tweed Remnant',
    clothingType: 'Wool Coat Scrap',
    material: '100% Pure Shetland Wool',
    weave: 'Broken Twill Houndstooth',
    weightGsm: 380,
    condition: 'Crisp Remnant',
    dimensions: { width: 50, height: 40, unit: 'cm' },
    dominantColor: 'Charcoal & Moss Green',
    colorFamily: 'earth-neutral',
    pattern: 'Micro Houndstooth Weave',
    colorPalette: [
      { name: 'Charcoal Wool', hex: '#2B2E33' },
      { name: 'Heather Moss', hex: '#4A5B48' },
      { name: 'Oatmeal Tweed', hex: '#C7BFA8' },
    ],
    texture: 'Warm, substantial, structured hand with rugged heritage durability',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
    tagline: 'Dense structured wool ideal for tailored waistcoats, valet trays, and quilted hot pads.'
  },
  {
    id: 'scrap-gold-flax',
    name: 'Golden Ochre Heavy Slub Flax Canvas',
    clothingType: 'Heavy Canvas Scrap',
    material: '100% Rustic Slub Linen & Cotton',
    weave: 'Coarse Oxford Canvas',
    weightGsm: 320,
    condition: 'Crisp Remnant',
    dimensions: { width: 55, height: 45, unit: 'cm' },
    dominantColor: 'Golden Ochre',
    colorFamily: 'yellow-gold',
    pattern: 'Heavy Crosshatch Canvas',
    colorPalette: [
      { name: 'Golden Mustard', hex: '#D6AD64' },
      { name: 'Warm Terracotta', hex: '#C96F52' },
      { name: 'Raw Flax', hex: '#EAE1CE' },
    ],
    texture: 'Thick, tactile, high-friction canvas weave with architectural stiffness',
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
    tagline: 'Vibrant sun-drenched canvas suited for durable market carryalls, studio aprons, and cushion covers.'
  },
  {
    id: 'scrap-olive-ripstop',
    name: 'Military Surplus Olive Ripstop Cotton',
    clothingType: 'Utility Jacket / Cargo Trousers',
    material: '100% Reinforced Combat Cotton',
    weave: 'Grid Ripstop Weave',
    weightGsm: 240,
    condition: 'Gently Washed',
    dimensions: { width: 65, height: 42, unit: 'cm' },
    dominantColor: 'Olive Drab Green',
    colorFamily: 'green-olive',
    pattern: 'Cross-Hatch Grid Ripstop',
    colorPalette: [
      { name: 'Olive Drab', hex: '#4B5320' },
      { name: 'Field Sage', hex: '#6B7A58' },
      { name: 'Black Oxide', hex: '#1C1F1B' },
    ],
    texture: 'Tear-resistant grid texture, light water resistance, washed tactical patina',
    imageUrl: 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=800&q=80',
    tagline: 'Tactical durability engineered for modular utility rigs, tech cable wraps, and bucket hats.'
  },
  {
    id: 'scrap-waffle-knit',
    name: 'Soft Heather Oatmeal Waffle Knit Offcut',
    clothingType: 'Waffle Knit Sweater',
    material: 'Organic Combed Cotton (100%)',
    weave: 'Thermal Honeycomb Waffle',
    weightGsm: 260,
    condition: 'Crisp Remnant',
    dimensions: { width: 42, height: 35, unit: 'cm' },
    dominantColor: 'Heather Oatmeal',
    colorFamily: 'beige-natural',
    pattern: 'Honeycomb Waffle Grid',
    colorPalette: [
      { name: 'Heather Oatmeal', hex: '#E5DFD3' },
      { name: 'Cream Wool', hex: '#F7F4EE' },
      { name: 'Warm Charcoal', hex: '#4A4A48' },
    ],
    texture: 'Plush, 3-dimensional thermal honeycomb with cozy natural warmth',
    imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    tagline: 'Cozy textured scrap suited for thermal coasters, pouch linings, and quilted coffee warmers.'
  }
];
