export interface FabricSample {
  id: string;
  name: string;
  material: string;
  weave: string;
  weightGsm: number;
  condition: 'Crisp Remnant' | 'Gently Washed' | 'Vintage Worn' | 'Frayed Scrap';
  dimensions: { width: number; height: number; unit: 'cm' | 'in' };
  colorPalette: { name: string; hex: string }[];
  texture: string;
  imageUrl: string;
  tagline: string;
  dominantColor?: string;
  colorFamily?: string;
  pattern?: string;
  structuralBody?: string;
  tensileDrape?: string;
  archetype?: string;
}

export const SAMPLE_FABRICS: FabricSample[] = [
  {
    id: 'scrap-indigo-denim',
    name: 'Vintage Selvedge Indigo Denim',
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
    material: '100% Belgian Flax',
    weave: 'Breathable Plain Weave',
    weightGsm: 185,
    condition: 'Crisp Remnant',
    dimensions: { width: 60, height: 40, unit: 'cm' },
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
    material: 'Cotton & Spandex Blend (98/2)',
    weave: 'Cut Weft Pile (8-Wale)',
    weightGsm: 290,
    condition: 'Crisp Remnant',
    dimensions: { width: 35, height: 25, unit: 'cm' },
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
    material: 'Hand-Spun Khadi Cotton',
    weave: 'Artisanal Handloom',
    weightGsm: 140,
    condition: 'Vintage Worn',
    dimensions: { width: 50, height: 50, unit: 'cm' },
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
];
