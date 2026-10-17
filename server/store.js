import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isServerless = process.env.VERCEL === '1' || Boolean(process.env.VERCEL_ENV) || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
const isTestEnv = process.env.NODE_ENV === 'test' || Boolean(process.argv[1] && process.argv[1].includes('.test.'));
const BASE_DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_DIR = isTestEnv 
  ? path.join(os.tmpdir(), 're_style_test_store') 
  : (isServerless ? '/tmp/data' : (process.env.DATA_DIR || BASE_DATA_DIR));
const DB_FILE = path.join(DATA_DIR, 're_style_store.json');
const SEED_FILE = path.join(BASE_DATA_DIR, 're_style_store.json');

// Ensure data directory exists if writable
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  // Graceful fallback for strictly read-only execution roots
}

// Initial seed specimens for a great out-of-the-box user experience
const DEFAULT_SEED_FABRICS = [
  {
    id: 'fabric-selvedge-denim',
    userId: 'default-maker',
    name: 'Vintage Selvedge Indigo Denim',
    imageUrl: 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80',
    material: 'denim',
    materialLabel: '100% Organic Raw Cotton Twill',
    dominantColor: 'Deep Indigo',
    secondaryColors: ['Washed Denim', 'Pale Weft', 'Copper'],
    pattern: '3x1 Right-Hand Twill Weave',
    dimensions: { length: 45, width: 35, unit: 'cm' },
    shape: 'rectangular',
    totalQuantity: 1,
    reservedQuantity: 0,
    consumedQuantity: 0,
    availableQuantity: 1,
    condition: 'good',
    conditionLabel: 'Gently Washed',
    stretch: 'none',
    thickness: 'heavy',
    weightGsm: 340,
    purchaseCost: 8.5,
    storageLocation: 'Studio Bin A - Denim Stash',
    notes: 'Sturdy deadstock remnant with authentic fading. Perfect for utility goods.',
    source: 'purchased',
    parentFabricId: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
  },
  {
    id: 'fabric-belgian-linen',
    userId: 'default-maker',
    name: 'Washed European Natural Linen',
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
    material: 'linen',
    materialLabel: '100% Belgian Flax',
    dominantColor: 'Natural Flax',
    secondaryColors: ['Oatmeal Paper', 'Slate Blue', 'Muted Ecru'],
    pattern: 'Breathable Plain Weave Slub',
    dimensions: { length: 60, width: 40, unit: 'cm' },
    shape: 'rectangular',
    totalQuantity: 1,
    reservedQuantity: 0,
    consumedQuantity: 0,
    availableQuantity: 1,
    condition: 'new',
    conditionLabel: 'Crisp Remnant',
    stretch: 'none',
    thickness: 'medium',
    weightGsm: 185,
    purchaseCost: 12.0,
    storageLocation: 'Shelf 2 - Linen & Silk Drawer',
    notes: 'Airy slub drape with natural artisanal texture.',
    source: 'purchased',
    parentFabricId: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString()
  },
  {
    id: 'fabric-terracotta-corduroy',
    userId: 'default-maker',
    name: 'Warm Terracotta Wide-Wale Corduroy',
    imageUrl: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=800&q=80',
    material: 'corduroy',
    materialLabel: 'Cotton & Spandex Blend (98/2)',
    dominantColor: 'Spiced Terracotta',
    secondaryColors: ['Burnt Amber', 'Warm Ochre'],
    pattern: 'Cut Weft Pile (8-Wale Rib)',
    dimensions: { length: 35, width: 25, unit: 'cm' },
    shape: 'rectangular',
    totalQuantity: 1,
    reservedQuantity: 0,
    consumedQuantity: 0,
    availableQuantity: 1,
    condition: 'new',
    conditionLabel: 'Crisp Remnant',
    stretch: 'low',
    thickness: 'heavy',
    weightGsm: 290,
    purchaseCost: 6.0,
    storageLocation: 'Studio Bin C - Textured Remnants',
    notes: 'Plush hand-feel with structured body.',
    source: 'leftover',
    parentFabricId: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  },
  {
    id: 'fabric-botanical-cotton',
    userId: 'default-maker',
    name: 'Hand-Block Printed Artisan Cotton',
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
    material: 'cotton',
    clothingType: 'Printed Cotton Scrap',
    materialLabel: 'Hand-Spun Khadi Cotton',
    dominantColor: 'Warm Ecru',
    secondaryColors: ['Ink Navy', 'Warm Coral', 'Soft Slate'],
    pattern: 'Artisanal Hand-Block Motif',
    dimensions: { length: 50, width: 50, unit: 'cm' },
    shape: 'rectangular',
    totalQuantity: 1,
    reservedQuantity: 0,
    consumedQuantity: 0,
    availableQuantity: 1,
    condition: 'worn',
    conditionLabel: 'Vintage Worn',
    stretch: 'none',
    thickness: 'light',
    weightGsm: 140,
    purchaseCost: 5.5,
    storageLocation: 'Basket 1 - Printed Scraps',
    notes: 'Gentle softness with hand-stamped character.',
    source: 'scrap',
    parentFabricId: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
  },
  {
    id: 'fabric-thrifted-jeans',
    userId: 'default-maker',
    name: "Thrifted Levi's 501 Straight Jeans",
    imageUrl: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80',
    material: 'denim',
    clothingType: 'Denim Jeans',
    materialLabel: '100% Heavyweight Cotton Denim',
    dominantColor: 'Washed Stone Indigo',
    secondaryColors: ['Stone Fade', 'Brass Rivet', 'Deep Indigo'],
    pattern: 'Distressed Twill with Whiskering',
    dimensions: { length: 85, width: 35, unit: 'cm' },
    shape: 'rectangular',
    totalQuantity: 1,
    reservedQuantity: 0,
    consumedQuantity: 0,
    availableQuantity: 1,
    condition: 'worn',
    conditionLabel: 'Distressed / Torn',
    stretch: 'none',
    thickness: 'heavy',
    weightGsm: 410,
    purchaseCost: 7.0,
    storageLocation: 'Upcycling Rack - Denim Garments',
    notes: 'Deconstructed denim trousers ready for modular tactical rigs, tool pouches, and boro totes.',
    source: 'thrifted',
    parentFabricId: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString()
  },
  {
    id: 'fabric-linen-shirt',
    userId: 'default-maker',
    name: 'Oversized Slub Linen Button-Down Shirt',
    imageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80',
    material: 'linen',
    clothingType: 'Button-Down Shirt',
    materialLabel: '100% Pure Flax Linen',
    dominantColor: 'Bone White / Oatmeal',
    secondaryColors: ['Mother of Pearl', 'Warm Flax'],
    pattern: 'Natural Slub Texture',
    dimensions: { length: 75, width: 55, unit: 'cm' },
    shape: 'rectangular',
    totalQuantity: 1,
    reservedQuantity: 0,
    consumedQuantity: 0,
    availableQuantity: 1,
    condition: 'good',
    conditionLabel: 'Vintage Worn',
    stretch: 'none',
    thickness: 'light',
    weightGsm: 160,
    purchaseCost: 9.0,
    storageLocation: 'Wardrobe Rail - Pre-loved Garments',
    notes: 'Generous front & back panels ideal for ascot collars, summer aprons, or pleated scarves.',
    source: 'thrifted',
    parentFabricId: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString()
  },
  {
    id: 'fabric-sage-lace',
    userId: 'default-maker',
    name: 'Antique French Floral Sage Lace Remnant',
    imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80',
    material: 'lace',
    clothingType: 'Lace Remnant',
    materialLabel: 'Mercerized Cotton & Rayon Lace',
    dominantColor: 'Sage Green',
    secondaryColors: ['Muted Moss', 'Pale Mint'],
    pattern: 'Floral Botanical Openwork',
    dimensions: { length: 45, width: 30, unit: 'cm' },
    shape: 'rectangular',
    totalQuantity: 1,
    reservedQuantity: 0,
    consumedQuantity: 0,
    availableQuantity: 1,
    condition: 'new',
    conditionLabel: 'Crisp Remnant',
    stretch: 'low',
    thickness: 'light',
    weightGsm: 130,
    purchaseCost: 11.5,
    storageLocation: 'Delicate Goods Box - Lace & Silk',
    notes: 'Exquisite openwork lace for heirloom statement collars, lavender sachets, and lingerie accents.',
    source: 'purchased',
    parentFabricId: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()
  },
  {
    id: 'fabric-kyoto-silk',
    userId: 'default-maker',
    name: 'Kyoto Vintage Mulberry Silk Kimono Scrap',
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
    material: 'silk',
    clothingType: 'Silk Kimono Scrap',
    materialLabel: '100% Pure Mulberry Silk',
    dominantColor: 'Royal Violet & Lilac',
    secondaryColors: ['Imperial Violet', 'Gold Leaf'],
    pattern: 'Traditional Botanical Damask',
    dimensions: { length: 45, width: 22, unit: 'cm' },
    shape: 'rectangular',
    totalQuantity: 1,
    reservedQuantity: 0,
    consumedQuantity: 0,
    availableQuantity: 1,
    condition: 'worn',
    conditionLabel: 'Vintage Worn',
    stretch: 'none',
    thickness: 'light',
    weightGsm: 110,
    purchaseCost: 14.0,
    storageLocation: 'Silk Envelope - Studio Drawer 1',
    notes: 'Precious ceremonial silk offcut suited for origami ascots, cloud scrunchies, and evening pouches.',
    source: 'scrap',
    parentFabricId: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
  },
  {
    id: 'fabric-wool-tweed',
    userId: 'default-maker',
    name: 'Scottish Shetland Wool Tweed Remnant',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
    material: 'wool',
    clothingType: 'Wool Coat Scrap',
    materialLabel: '100% Pure Shetland Wool',
    dominantColor: 'Charcoal & Moss Green',
    secondaryColors: ['Heather Moss', 'Oatmeal Tweed'],
    pattern: 'Micro Houndstooth Weave',
    dimensions: { length: 50, width: 40, unit: 'cm' },
    shape: 'rectangular',
    totalQuantity: 1,
    reservedQuantity: 0,
    consumedQuantity: 0,
    availableQuantity: 1,
    condition: 'new',
    conditionLabel: 'Crisp Remnant',
    stretch: 'none',
    thickness: 'heavy',
    weightGsm: 380,
    purchaseCost: 16.0,
    storageLocation: 'Wool & Tweed Chest - Studio Bench',
    notes: 'Dense structured wool ideal for tailored waistcoats, valet trays, and quilted hot pads.',
    source: 'purchased',
    parentFabricId: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
  },
  {
    id: 'fabric-gold-flax',
    userId: 'default-maker',
    name: 'Golden Ochre Heavy Slub Flax Canvas',
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
    material: 'linen',
    clothingType: 'Heavy Canvas Scrap',
    materialLabel: '100% Rustic Slub Linen & Cotton',
    dominantColor: 'Golden Ochre',
    secondaryColors: ['Warm Terracotta', 'Raw Flax'],
    pattern: 'Heavy Crosshatch Canvas',
    dimensions: { length: 55, width: 45, unit: 'cm' },
    shape: 'rectangular',
    totalQuantity: 1,
    reservedQuantity: 0,
    consumedQuantity: 0,
    availableQuantity: 1,
    condition: 'new',
    conditionLabel: 'Crisp Remnant',
    stretch: 'none',
    thickness: 'heavy',
    weightGsm: 320,
    purchaseCost: 13.0,
    storageLocation: 'Canvas Bin 2',
    notes: 'Vibrant sun-drenched canvas suited for durable market carryalls, studio aprons, and cushion covers.',
    source: 'purchased',
    parentFabricId: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
  },
  {
    id: 'fabric-olive-ripstop',
    userId: 'default-maker',
    name: 'Military Surplus Olive Ripstop Cotton',
    imageUrl: 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=800&q=80',
    material: 'cotton',
    clothingType: 'Utility Jacket / Cargo Trousers',
    materialLabel: '100% Reinforced Combat Cotton',
    dominantColor: 'Olive Drab Green',
    secondaryColors: ['Field Sage', 'Black Oxide'],
    pattern: 'Cross-Hatch Grid Ripstop',
    dimensions: { length: 65, width: 42, unit: 'cm' },
    shape: 'rectangular',
    totalQuantity: 1,
    reservedQuantity: 0,
    consumedQuantity: 0,
    availableQuantity: 1,
    condition: 'good',
    conditionLabel: 'Gently Washed',
    stretch: 'none',
    thickness: 'medium',
    weightGsm: 240,
    purchaseCost: 8.0,
    storageLocation: 'Utility Gear Box',
    notes: 'Tactical durability engineered for modular utility rigs, tech cable wraps, and bucket hats.',
    source: 'thrifted',
    parentFabricId: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: 'fabric-waffle-knit',
    userId: 'default-maker',
    name: 'Soft Heather Oatmeal Waffle Knit Offcut',
    imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    material: 'cotton',
    clothingType: 'Waffle Knit Sweater',
    materialLabel: 'Organic Combed Cotton (100%)',
    dominantColor: 'Heather Oatmeal',
    secondaryColors: ['Cream Wool', 'Warm Charcoal'],
    pattern: 'Honeycomb Waffle Grid',
    dimensions: { length: 42, width: 35, unit: 'cm' },
    shape: 'rectangular',
    totalQuantity: 1,
    reservedQuantity: 0,
    consumedQuantity: 0,
    availableQuantity: 1,
    condition: 'new',
    conditionLabel: 'Crisp Remnant',
    stretch: 'medium',
    thickness: 'medium',
    weightGsm: 260,
    purchaseCost: 6.5,
    storageLocation: 'Knit & Fleece Basket',
    notes: 'Cozy textured scrap suited for thermal coasters, pouch linings, and quilted coffee warmers.',
    source: 'leftover',
    parentFabricId: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString()
  }
];

class ReStyleStore {
  constructor() {
    this.data = {
      fabrics: [],
      projects: [],
      sessions: [],
      movements: [],
      shares: []
    };
    this.init();
  }

  init() {
    const targetFile = fs.existsSync(DB_FILE) ? DB_FILE : (fs.existsSync(SEED_FILE) ? SEED_FILE : null);
    if (targetFile) {
      try {
        const raw = fs.readFileSync(targetFile, 'utf-8');
        this.data = JSON.parse(raw);
        if (!Array.isArray(this.data.fabrics)) this.data.fabrics = [];
        if (!Array.isArray(this.data.projects)) this.data.projects = [];
        if (!Array.isArray(this.data.sessions)) this.data.sessions = [];
        if (!Array.isArray(this.data.movements)) this.data.movements = [];
        if (!Array.isArray(this.data.shares)) this.data.shares = [];

        // Ensure default seed fabrics exist so makers always have a rich library to choose from
        let addedNewSeed = false;
        for (const seed of DEFAULT_SEED_FABRICS) {
          if (!this.data.fabrics.some(f => f.id === seed.id)) {
            this.data.fabrics.push({ ...seed });
            addedNewSeed = true;
          }
        }
        if (addedNewSeed) {
          this.persist();
        }
      } catch (err) {
        console.error('[Store] Failed to read database file, initializing defaults:', err.message);
        this.data = {
          fabrics: [...DEFAULT_SEED_FABRICS],
          projects: [],
          sessions: [],
          movements: [],
          shares: []
        };
        this.persist();
      }
    } else {
      // First boot: populate with default seed fabrics
      this.data.fabrics = [...DEFAULT_SEED_FABRICS];
      this.persist();
    }
  }

  persist() {
    let tempFile = null;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        try {
          fs.mkdirSync(DATA_DIR, { recursive: true });
        } catch (_) {}
      }
      tempFile = `${DB_FILE}.tmp.${Date.now()}.${Math.random().toString(36).substring(2, 6)}`;
      fs.writeFileSync(tempFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.warn('[Store] Persistence notice:', err.message);
      if (tempFile && fs.existsSync(tempFile)) {
        try { fs.unlinkSync(tempFile); } catch (_) {}
      }
    }
  }

  // --- Helper Methods ---
  static calculateArea(dimensions) {
    if (!dimensions || !dimensions.length || !dimensions.width) return 0;
    const l = Number(dimensions.length);
    const w = Number(dimensions.width);
    if (isNaN(l) || isNaN(w) || l <= 0 || w <= 0) return 0;

    if (dimensions.unit === 'in') {
      // Convert square inches to square centimeters (1 sq in = 6.4516 sq cm)
      return (l * 2.54) * (w * 2.54);
    }
    return l * w;
  }

  // --- Fabric Stash Inventory API ---

  getFabrics(userId = 'default-maker', filters = {}) {
    let items = this.data.fabrics.filter(f => f.userId === userId);

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      items = items.filter(f => 
        (f.name && f.name.toLowerCase().includes(q)) ||
        (f.notes && f.notes.toLowerCase().includes(q)) ||
        (f.material && f.material.toLowerCase().includes(q)) ||
        (f.dominantColor && f.dominantColor.toLowerCase().includes(q)) ||
        (f.pattern && f.pattern.toLowerCase().includes(q))
      );
    }

    if (filters.material && filters.material !== 'all') {
      const mat = filters.material.toLowerCase();
      items = items.filter(f => f.material && f.material.toLowerCase().includes(mat));
    }

    if (filters.condition && filters.condition !== 'all') {
      items = items.filter(f => f.condition === filters.condition);
    }

    if (filters.color && filters.color !== 'all') {
      const col = filters.color.toLowerCase();
      items = items.filter(f => 
        (f.dominantColor && f.dominantColor.toLowerCase().includes(col)) ||
        (Array.isArray(f.secondaryColors) && f.secondaryColors.some(c => c.toLowerCase().includes(col)))
      );
    }

    if (filters.pattern && filters.pattern !== 'all') {
      const pat = filters.pattern.toLowerCase();
      items = items.filter(f => f.pattern && f.pattern.toLowerCase().includes(pat));
    }

    if (filters.availability && filters.availability !== 'all') {
      if (filters.availability === 'available') {
        items = items.filter(f => f.availableQuantity > 0);
      } else if (filters.availability === 'reserved') {
        items = items.filter(f => f.reservedQuantity > 0);
      } else if (filters.availability === 'consumed') {
        items = items.filter(f => f.consumedQuantity > 0);
      }
    }

    if (filters.source && filters.source !== 'all') {
      items = items.filter(f => f.source === filters.source);
    }

    // Sorting
    const sortBy = filters.sortBy || 'date_desc';
    items.sort((a, b) => {
      if (sortBy === 'date_desc') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortBy === 'date_asc') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sortBy === 'available_desc') {
        return b.availableQuantity - a.availableQuantity;
      }
      if (sortBy === 'material_asc') {
        return (a.material || '').localeCompare(b.material || '');
      }
      if (sortBy === 'area_desc') {
        return ReStyleStore.calculateArea(b.dimensions) - ReStyleStore.calculateArea(a.dimensions);
      }
      return 0;
    });

    return items;
  }

  getFabricById(id, userId = 'default-maker') {
    return this.data.fabrics.find(f => f.id === id && f.userId === userId) || null;
  }

  createFabric(payload, userId = 'default-maker') {
    if (!payload.name || !payload.name.trim()) {
      throw new Error('Fabric name is required');
    }

    const length = Number(payload.dimensions?.length || payload.length || 0);
    const width = Number(payload.dimensions?.width || payload.width || 0);
    const unit = payload.dimensions?.unit || payload.unit || 'cm';

    if (length < 0 || width < 0 || isNaN(length) || isNaN(width)) {
      throw new Error('Fabric dimensions must be non-negative numbers');
    }

    const totalQuantity = Number(payload.totalQuantity ?? 1);
    if (isNaN(totalQuantity) || totalQuantity <= 0) {
      throw new Error('Total quantity must be greater than zero');
    }

    const now = new Date().toISOString();
    const id = payload.id || `fabric-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const fabric = {
      id,
      userId,
      name: payload.name.trim(),
      imageUrl: payload.imageUrl || payload.image || 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80',
      material: (payload.material || 'cotton').toLowerCase(),
      materialLabel: payload.materialLabel || payload.material || 'Textile Remnant',
      dominantColor: payload.dominantColor || payload.color || 'Natural Tone',
      secondaryColors: Array.isArray(payload.secondaryColors) ? payload.secondaryColors : [],
      pattern: payload.pattern || 'Plain Solid Weave',
      dimensions: {
        length: length || 30,
        width: width || 30,
        unit: unit === 'in' ? 'in' : 'cm'
      },
      shape: payload.shape || 'rectangular',
      totalQuantity,
      reservedQuantity: 0,
      consumedQuantity: 0,
      availableQuantity: totalQuantity,
      condition: payload.condition || 'good',
      conditionLabel: payload.conditionLabel || 'Good Condition',
      stretch: payload.stretch || 'none',
      thickness: payload.thickness || 'medium',
      weightGsm: Number(payload.weightGsm || 200),
      purchaseCost: payload.purchaseCost !== undefined && payload.purchaseCost !== null ? Number(payload.purchaseCost) : null,
      storageLocation: payload.storageLocation ? payload.storageLocation.trim() : '',
      notes: payload.notes ? payload.notes.trim() : '',
      source: payload.source || 'purchased',
      parentFabricId: payload.parentFabricId || null,
      createdAt: now,
      updatedAt: now
    };

    this.data.fabrics.unshift(fabric);

    // Record initial movement log
    this.data.movements.push({
      id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      fabricId: fabric.id,
      projectId: null,
      userId,
      type: 'addition',
      quantity: fabric.totalQuantity,
      areaCm2: ReStyleStore.calculateArea(fabric.dimensions),
      notes: `Added fabric to inventory (${fabric.source})`,
      timestamp: now
    });

    this.persist();
    return fabric;
  }

  updateFabric(id, payload, userId = 'default-maker') {
    const index = this.data.fabrics.findIndex(f => f.id === id && f.userId === userId);
    if (index === -1) {
      throw new Error('Fabric record not found');
    }

    const current = this.data.fabrics[index];

    // Validate dimensions if provided
    let dimensions = current.dimensions;
    if (payload.dimensions) {
      const length = Number(payload.dimensions.length ?? current.dimensions.length);
      const width = Number(payload.dimensions.width ?? current.dimensions.width);
      const unit = payload.dimensions.unit || current.dimensions.unit;

      if (length < 0 || width < 0 || isNaN(length) || isNaN(width)) {
        throw new Error('Fabric dimensions must be non-negative numbers');
      }
      dimensions = { length, width, unit: unit === 'in' ? 'in' : 'cm' };
    }

    // Validate total quantity changes
    let totalQuantity = current.totalQuantity;
    if (payload.totalQuantity !== undefined) {
      const newTotal = Number(payload.totalQuantity);
      if (isNaN(newTotal) || newTotal < (current.reservedQuantity + current.consumedQuantity)) {
        throw new Error(`Total quantity cannot be less than reserved (${current.reservedQuantity}) + consumed (${current.consumedQuantity})`);
      }
      totalQuantity = newTotal;
    }

    const availableQuantity = Math.max(0, totalQuantity - current.reservedQuantity - current.consumedQuantity);
    const now = new Date().toISOString();

    const updated = {
      ...current,
      ...payload,
      id: current.id,
      userId: current.userId,
      dimensions,
      totalQuantity,
      availableQuantity,
      reservedQuantity: current.reservedQuantity,
      consumedQuantity: current.consumedQuantity,
      updatedAt: now
    };

    this.data.fabrics[index] = updated;
    this.persist();
    return updated;
  }

  deleteFabric(id, userId = 'default-maker') {
    const index = this.data.fabrics.findIndex(f => f.id === id && f.userId === userId);
    if (index === -1) {
      throw new Error('Fabric record not found');
    }

    const fabric = this.data.fabrics[index];

    // Check if fabric is reserved by an active project
    const activeProjects = this.data.projects.filter(p => 
      p.fabricId === id && 
      p.userId === userId && 
      !['completed', 'abandoned'].includes(p.status)
    );

    if (activeProjects.length > 0) {
      throw new Error(`Cannot delete fabric while it is reserved by ${activeProjects.length} active project(s). Cancel or abandon those projects first.`);
    }

    this.data.fabrics.splice(index, 1);
    this.persist();
    return { success: true, deletedId: id };
  }

  // --- Inventory Reservation & Consumption Safe Movements ---

  reserveFabric(fabricId, quantityToReserve = 1, projectId, userId = 'default-maker') {
    const fabric = this.getFabricById(fabricId, userId);
    if (!fabric) {
      throw new Error('Fabric item not found for reservation');
    }

    const qty = Number(quantityToReserve);
    if (isNaN(qty) || qty <= 0) {
      throw new Error('Invalid reservation quantity');
    }

    if (fabric.availableQuantity < qty) {
      throw new Error(`Insufficient available fabric. Available: ${fabric.availableQuantity}, Requested: ${qty}`);
    }

    fabric.reservedQuantity += qty;
    fabric.availableQuantity = Math.max(0, fabric.totalQuantity - fabric.reservedQuantity - fabric.consumedQuantity);
    fabric.updatedAt = new Date().toISOString();

    this.data.movements.push({
      id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      fabricId,
      projectId,
      userId,
      type: 'reservation',
      quantity: qty,
      areaCm2: ReStyleStore.calculateArea(fabric.dimensions),
      notes: `Reserved for project #${projectId}`,
      timestamp: new Date().toISOString()
    });

    this.persist();
    return fabric;
  }

  releaseFabricReservation(fabricId, quantityToRelease = 1, projectId, userId = 'default-maker') {
    const fabric = this.getFabricById(fabricId, userId);
    if (!fabric) return null;

    const qty = Math.min(fabric.reservedQuantity, Number(quantityToRelease));
    if (qty <= 0) return fabric;

    fabric.reservedQuantity -= qty;
    fabric.availableQuantity = Math.max(0, fabric.totalQuantity - fabric.reservedQuantity - fabric.consumedQuantity);
    fabric.updatedAt = new Date().toISOString();

    this.data.movements.push({
      id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      fabricId,
      projectId,
      userId,
      type: 'release',
      quantity: qty,
      areaCm2: ReStyleStore.calculateArea(fabric.dimensions),
      notes: `Released reservation from project #${projectId}`,
      timestamp: new Date().toISOString()
    });

    this.persist();
    return fabric;
  }

  consumeFabric(fabricId, quantityToConsume = 1, projectId, userId = 'default-maker') {
    const fabric = this.getFabricById(fabricId, userId);
    if (!fabric) {
      throw new Error('Fabric not found for consumption');
    }

    // Check if this project already consumed this fabric
    const existingConsumption = this.data.movements.find(m => 
      m.fabricId === fabricId && 
      m.projectId === projectId && 
      m.type === 'consumption'
    );

    if (existingConsumption) {
      throw new Error(`Project #${projectId} has already consumed fabric #${fabricId}. Duplicate consumption prevented.`);
    }

    const qty = Number(quantityToConsume);
    // Deduct from reserved if it was reserved, otherwise from available
    if (fabric.reservedQuantity >= qty) {
      fabric.reservedQuantity -= qty;
    } else {
      const leftover = qty - fabric.reservedQuantity;
      if (fabric.availableQuantity < leftover) {
        throw new Error(`Insufficient fabric remaining to consume ${qty}. Available: ${fabric.availableQuantity}`);
      }
      fabric.reservedQuantity = 0;
    }

    fabric.consumedQuantity += qty;
    fabric.availableQuantity = Math.max(0, fabric.totalQuantity - fabric.reservedQuantity - fabric.consumedQuantity);
    fabric.updatedAt = new Date().toISOString();

    this.data.movements.push({
      id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      fabricId,
      projectId,
      userId,
      type: 'consumption',
      quantity: qty,
      areaCm2: ReStyleStore.calculateArea(fabric.dimensions),
      notes: `Consumed by project #${projectId}`,
      timestamp: new Date().toISOString()
    });

    this.persist();
    return fabric;
  }

  recordLeftoverScrap(parentFabricId, scrapPayload, userId = 'default-maker') {
    const parent = this.getFabricById(parentFabricId, userId);
    const scrapLength = Number(scrapPayload.dimensions?.length || scrapPayload.length || 0);
    const scrapWidth = Number(scrapPayload.dimensions?.width || scrapPayload.width || 0);
    const scrapUnit = scrapPayload.dimensions?.unit || scrapPayload.unit || parent?.dimensions?.unit || 'cm';

    if (scrapLength <= 0 || scrapWidth <= 0 || isNaN(scrapLength) || isNaN(scrapWidth)) {
      throw new Error('Leftover dimensions must be positive numbers');
    }

    const scrapName = scrapPayload.name || `${parent ? parent.dominantColor : ''} Offcut Scrap (${scrapLength}×${scrapWidth} ${scrapUnit})`;

    const scrap = this.createFabric({
      name: scrapName,
      imageUrl: scrapPayload.imageUrl || parent?.imageUrl || 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=800&q=80',
      material: scrapPayload.material || parent?.material || 'cotton',
      materialLabel: parent?.materialLabel || 'Textile Scrap',
      dominantColor: scrapPayload.dominantColor || parent?.dominantColor || 'Natural Tone',
      secondaryColors: parent?.secondaryColors || [],
      pattern: parent?.pattern || 'Remnant Grain',
      dimensions: {
        length: scrapLength,
        width: scrapWidth,
        unit: scrapUnit
      },
      shape: scrapPayload.shape || 'irregular',
      totalQuantity: Number(scrapPayload.pieces || 1),
      condition: scrapPayload.condition || 'good',
      conditionLabel: scrapPayload.conditionLabel || 'Clean Offcut',
      stretch: parent?.stretch || 'none',
      thickness: parent?.thickness || 'medium',
      weightGsm: parent?.weightGsm || 200,
      storageLocation: scrapPayload.storageLocation || 'Studio Scrap Box',
      notes: scrapPayload.notes || `Saved offcut from project #${scrapPayload.projectId || 'completed'}`,
      source: 'scrap',
      parentFabricId: parentFabricId || null
    }, userId);

    return scrap;
  }

  // --- Saved Projects & Blueprints API ---

  getProjects(userId = 'default-maker', filters = {}) {
    let list = this.data.projects.filter(p => p.userId === userId);

    if (filters.status && filters.status !== 'all') {
      list = list.filter(p => p.status === filters.status);
    }

    if (filters.favourite === 'true' || filters.favourite === true) {
      list = list.filter(p => p.isFavourite);
    }

    if (filters.category && filters.category !== 'all') {
      list = list.filter(p => p.category === filters.category);
    }

    if (filters.difficulty && filters.difficulty !== 'all') {
      list = list.filter(p => p.difficulty === filters.difficulty);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(p => 
        p.title.toLowerCase().includes(q) ||
        (p.subtitle && p.subtitle.toLowerCase().includes(q)) ||
        (p.personalNotes && p.personalNotes.toLowerCase().includes(q))
      );
    }

    // Attach fabric snapshot & sessions summary
    return list.map(project => {
      const fabric = project.fabricId ? this.getFabricById(project.fabricId, userId) : null;
      const projectSessions = this.data.sessions.filter(s => s.projectId === project.id && s.userId === userId);
      const totalMinutes = projectSessions.reduce((acc, s) => acc + (Number(s.durationMinutes) || 0), 0);

      const completedStepCount = Array.isArray(project.steps) ? project.steps.filter(s => s.completed).length : 0;
      const totalStepCount = Array.isArray(project.steps) ? project.steps.length : 0;
      const progressPercent = totalStepCount > 0 ? Math.round((completedStepCount / totalStepCount) * 100) : 0;

      return {
        ...project,
        fabric,
        sessionsCount: projectSessions.length,
        totalTimeSpentMinutes: totalMinutes,
        completedStepCount,
        totalStepCount,
        progressPercent
      };
    }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  getProjectById(id, userId = 'default-maker') {
    const project = this.data.projects.find(p => p.id === id && p.userId === userId);
    if (!project) return null;

    const fabric = project.fabricId ? this.getFabricById(project.fabricId, userId) : null;
    const sessions = this.data.sessions.filter(s => s.projectId === project.id && s.userId === userId);
    const totalMinutes = sessions.reduce((acc, s) => acc + (Number(s.durationMinutes) || 0), 0);

    const completedStepCount = Array.isArray(project.steps) ? project.steps.filter(s => s.completed).length : 0;
    const totalStepCount = Array.isArray(project.steps) ? project.steps.length : 0;
    const progressPercent = totalStepCount > 0 ? Math.round((completedStepCount / totalStepCount) * 100) : 0;

    return {
      ...project,
      fabric,
      sessions,
      sessionsCount: sessions.length,
      totalTimeSpentMinutes: totalMinutes,
      completedStepCount,
      totalStepCount,
      progressPercent
    };
  }

  createOrUpdateProject(payload, userId = 'default-maker') {
    if (!payload.title || !payload.title.trim()) {
      throw new Error('Project title is required');
    }

    const now = new Date().toISOString();

    // Idempotency: Check if already saved by blueprintId and fabricId to avoid duplicate clutter
    let existing = null;
    if (payload.id) {
      existing = this.data.projects.find(p => p.id === payload.id && p.userId === userId);
    } else if (payload.blueprintId && payload.fabricId) {
      existing = this.data.projects.find(p => 
        p.blueprintId === payload.blueprintId && 
        p.fabricId === payload.fabricId && 
        p.userId === userId
      );
    }

    if (existing) {
      // Update existing record safely
      existing.title = payload.title || existing.title;
      existing.subtitle = payload.subtitle ?? existing.subtitle;
      existing.imageUrl = payload.imageUrl || existing.imageUrl;
      existing.difficulty = payload.difficulty || existing.difficulty;
      existing.timeEstimate = payload.timeEstimate || existing.timeEstimate;
      existing.personalNotes = payload.personalNotes !== undefined ? payload.personalNotes : existing.personalNotes;
      existing.isFavourite = payload.isFavourite !== undefined ? payload.isFavourite : existing.isFavourite;
      existing.updatedAt = now;
      if (payload.status) existing.status = payload.status;
      if (Array.isArray(payload.steps)) existing.steps = payload.steps;
      if (payload.cuttingPlan) existing.cuttingPlan = payload.cuttingPlan;
      if (Array.isArray(payload.materialsNeeded)) existing.materialsNeeded = payload.materialsNeeded;
      if (Array.isArray(payload.toolsNeeded)) existing.toolsNeeded = payload.toolsNeeded;
      if (payload.suitabilityReason) existing.suitabilityReason = payload.suitabilityReason;
      if (payload.fabricAllocated) existing.fabricAllocated = payload.fabricAllocated;
      this.persist();
      return this.getProjectById(existing.id, userId);
    }

    const id = payload.id || `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Prepare steps with completed boolean flag
    const rawSteps = Array.isArray(payload.steps) ? payload.steps : [];
    const steps = rawSteps.map((s, idx) => ({
      step: s.step || idx + 1,
      title: s.title || `Phase ${idx + 1}`,
      description: s.description || '',
      tip: s.tip || '',
      completed: Boolean(s.completed),
      completedAt: s.completed ? now : null
    }));

    // Auto-reserve fabric if requested and fabric exists
    let fabricAllocated = payload.fabricAllocated || null;
    if (payload.fabricId) {
      const fabric = this.getFabricById(payload.fabricId, userId);
      if (fabric) {
        fabricAllocated = {
          length: fabric.dimensions.length,
          width: fabric.dimensions.width,
          unit: fabric.dimensions.unit,
          areaCm2: ReStyleStore.calculateArea(fabric.dimensions)
        };
        // Auto-reserve if status is planned, ready, or in_progress
        const status = payload.status || 'planned';
        if (['planned', 'ready', 'in_progress'].includes(status) && fabric.availableQuantity >= 1) {
          try {
            this.reserveFabric(fabric.id, 1, id, userId);
          } catch (e) {
            console.warn('[Store] Could not auto-reserve fabric:', e.message);
          }
        }
      }
    }

    const project = {
      id,
      userId,
      blueprintId: payload.blueprintId || payload.id || id,
      title: payload.title.trim(),
      subtitle: payload.subtitle || '',
      category: payload.category || 'Accessories',
      difficulty: payload.difficulty || 'Intermediate',
      timeEstimate: payload.timeEstimate || '2 Hours',
      imageUrl: payload.imageUrl || 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80',
      fabricId: payload.fabricId || null,
      fabricAllocated,
      fabricConsumed: null,
      leftoversConfirmed: null,
      status: payload.status || 'planned',
      isFavourite: Boolean(payload.isFavourite),
      materialsNeeded: Array.isArray(payload.materialsNeeded) ? payload.materialsNeeded : [],
      toolsNeeded: Array.isArray(payload.toolsNeeded) ? payload.toolsNeeded : [],
      steps,
      cuttingPlan: payload.cuttingPlan || {
        patternPieces: [],
        seamAllowance: '1.0 cm (3/8 in) included',
        grainline: 'Parallel to warp grainline',
        cuttingOrder: ['Main body panels', 'Straps/accents', 'Pockets'],
        remainingFabricNotes: 'Calculated from geometric layout'
      },
      suitabilityReason: payload.suitabilityReason || '',
      matchScore: Number(payload.matchScore || 90),
      personalNotes: payload.personalNotes || '',
      progressPhotos: Array.isArray(payload.progressPhotos) ? payload.progressPhotos : [],
      startDate: payload.startDate || null,
      completedDate: null,
      createdAt: now,
      updatedAt: now
    };

    this.data.projects.unshift(project);
    this.persist();
    return this.getProjectById(project.id, userId);
  }

  updateProjectStatus(id, newStatus, userId = 'default-maker', details = {}) {
    const project = this.data.projects.find(p => p.id === id && p.userId === userId);
    if (!project) {
      throw new Error('Project not found');
    }

    const validStatuses = ['planned', 'ready', 'in_progress', 'paused', 'completed', 'abandoned'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status "${newStatus}". Must be one of: ${validStatuses.join(', ')}`);
    }

    const prevStatus = project.status;
    project.status = newStatus;
    project.updatedAt = new Date().toISOString();

    if (newStatus === 'in_progress' && !project.startDate) {
      project.startDate = new Date().toISOString();
    }

    // Lifecycle transition logic
    if (newStatus === 'completed') {
      project.completedDate = new Date().toISOString();
      // If fabric was reserved and not yet consumed, handle consumption
      if (project.fabricId && !project.fabricConsumed) {
        try {
          const qty = Number(details.consumedQuantity || 1);
          this.consumeFabric(project.fabricId, qty, project.id, userId);
          project.fabricConsumed = {
            consumedQuantity: qty,
            consumedLength: details.consumedLength || project.fabricAllocated?.length,
            consumedWidth: details.consumedWidth || project.fabricAllocated?.width,
            unit: project.fabricAllocated?.unit || 'cm',
            confirmedAt: new Date().toISOString()
          };
        } catch (err) {
          console.warn('[Store] Consumption warning on completion:', err.message);
        }
      }

      // If leftover scraps were confirmed, record them
      if (details.leftovers && details.leftovers.confirmed && project.fabricId) {
        try {
          const scrap = this.recordLeftoverScrap(project.fabricId, {
            ...details.leftovers,
            projectId: project.id
          }, userId);
          project.leftoversConfirmed = {
            ...details.leftovers,
            stashFabricId: scrap.id,
            recordedAt: new Date().toISOString()
          };
        } catch (err) {
          console.warn('[Store] Leftover recording warning:', err.message);
        }
      }
    } else if (newStatus === 'abandoned') {
      // Release reservation back to available stash safely
      if (project.fabricId && !project.fabricConsumed) {
        try {
          this.releaseFabricReservation(project.fabricId, 1, project.id, userId);
        } catch (err) {
          console.warn('[Store] Release reservation warning on abandonment:', err.message);
        }
      }
    } else if (['planned', 'ready', 'in_progress'].includes(newStatus) && prevStatus === 'abandoned') {
      // Re-reserve fabric if moving out of abandoned state
      if (project.fabricId) {
        try {
          this.reserveFabric(project.fabricId, 1, project.id, userId);
        } catch (err) {
          console.warn('[Store] Re-reserve warning:', err.message);
        }
      }
    }

    this.persist();
    return this.getProjectById(project.id, userId);
  }

  updateProjectStep(projectId, stepIndex, completed, userId = 'default-maker') {
    const project = this.data.projects.find(p => p.id === projectId && p.userId === userId);
    if (!project) throw new Error('Project not found');

    if (!Array.isArray(project.steps) || !project.steps[stepIndex]) {
      throw new Error(`Step index ${stepIndex} out of bounds`);
    }

    project.steps[stepIndex].completed = Boolean(completed);
    project.steps[stepIndex].completedAt = completed ? new Date().toISOString() : null;
    project.updatedAt = new Date().toISOString();

    // If starting step, auto move from planned to in_progress if still planned
    if (completed && project.status === 'planned') {
      project.status = 'in_progress';
      if (!project.startDate) project.startDate = new Date().toISOString();
    }

    this.persist();
    return this.getProjectById(project.id, userId);
  }

  deleteProject(id, userId = 'default-maker') {
    const index = this.data.projects.findIndex(p => p.id === id && p.userId === userId);
    if (index === -1) {
      throw new Error('Project not found');
    }

    const project = this.data.projects[index];

    // If project has reserved fabric and wasn't consumed, release reservation
    if (project.fabricId && !project.fabricConsumed && !['completed', 'abandoned'].includes(project.status)) {
      try {
        this.releaseFabricReservation(project.fabricId, 1, project.id, userId);
      } catch (err) {
        console.warn('[Store] Could not release reservation on delete:', err.message);
      }
    }

    this.data.projects.splice(index, 1);
    // Remove associated sessions and shares
    this.data.sessions = this.data.sessions.filter(s => s.projectId !== id);
    this.data.shares = this.data.shares.filter(s => s.projectId !== id);

    this.persist();
    return { success: true, deletedId: id };
  }

  // --- Work Sessions API ---

  logProjectSession(projectId, sessionData, userId = 'default-maker') {
    const project = this.data.projects.find(p => p.id === projectId && p.userId === userId);
    if (!project) throw new Error('Project not found');

    const durationMinutes = Number(sessionData.durationMinutes || sessionData.duration || 0);
    if (isNaN(durationMinutes) || durationMinutes <= 0) {
      throw new Error('Session duration must be greater than zero minutes');
    }

    const session = {
      id: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      projectId,
      userId,
      date: sessionData.date || new Date().toISOString().split('T')[0],
      durationMinutes,
      notes: sessionData.notes ? sessionData.notes.trim() : '',
      createdAt: new Date().toISOString()
    };

    this.data.sessions.unshift(session);

    // Auto mark project in_progress if it was planned/ready
    if (['planned', 'ready'].includes(project.status)) {
      project.status = 'in_progress';
      if (!project.startDate) project.startDate = new Date().toISOString();
    }
    project.updatedAt = new Date().toISOString();

    this.persist();
    return session;
  }

  deleteProjectSession(projectId, sessionId, userId = 'default-maker') {
    const index = this.data.sessions.findIndex(s => s.id === sessionId && s.projectId === projectId && s.userId === userId);
    if (index === -1) throw new Error('Session record not found');

    this.data.sessions.splice(index, 1);
    this.persist();
    return { success: true, deletedId: sessionId };
  }

  // --- Secure Public Sharing API ---

  createShareToken(projectId, userId = 'default-maker') {
    const project = this.data.projects.find(p => p.id === projectId && p.userId === userId);
    if (!project) throw new Error('Project not found');

    // Revoke any existing active token for this project
    const existing = this.data.shares.find(s => s.projectId === projectId && !s.isRevoked);
    if (existing) {
      return existing.token;
    }

    const token = `share_${Date.now()}_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
    const now = new Date().toISOString();

    const share = {
      token,
      projectId,
      userId,
      isRevoked: false,
      createdAt: now,
      revokedAt: null
    };

    this.data.shares.unshift(share);
    this.persist();
    return token;
  }

  getSharedProject(token) {
    const share = this.data.shares.find(s => s.token === token);
    if (!share || share.isRevoked) {
      return null;
    }

    const project = this.data.projects.find(p => p.id === share.projectId);
    if (!project) return null;

    // SANITIZATION: Never expose private inventory details, user notes, private costs, or user IDs to public
    const fabric = project.fabricId ? this.data.fabrics.find(f => f.id === project.fabricId) : null;

    return {
      title: project.title,
      subtitle: project.subtitle,
      category: project.category,
      difficulty: project.difficulty,
      timeEstimate: project.timeEstimate,
      imageUrl: project.imageUrl,
      status: project.status,
      suitabilityReason: project.suitabilityReason,
      materialsNeeded: project.materialsNeeded,
      toolsNeeded: project.toolsNeeded,
      steps: project.steps.map(s => ({
        step: s.step,
        title: s.title,
        description: s.description,
        tip: s.tip,
        completed: s.completed
      })),
      cuttingPlan: project.cuttingPlan,
      fabricSnapshot: fabric ? {
        material: fabric.material,
        materialLabel: fabric.materialLabel,
        dominantColor: fabric.dominantColor,
        pattern: fabric.pattern,
        dimensions: fabric.dimensions
      } : null,
      sharedAt: share.createdAt
    };
  }

  revokeShareToken(projectIdOrToken, userId = 'default-maker') {
    let count = 0;
    const now = new Date().toISOString();
    for (const share of this.data.shares) {
      if ((share.projectId === projectIdOrToken || share.token === projectIdOrToken) && (!userId || share.userId === userId || userId === 'default-maker') && !share.isRevoked) {
        share.isRevoked = true;
        share.revokedAt = now;
        count++;
      }
    }
    this.persist();
    return { success: true, revokedCount: count };
  }

  // --- Maker Dashboard Metrics & Sustainability Calculations ---

  getMakerStats(userId = 'default-maker') {
    const userFabrics = this.data.fabrics.filter(f => f.userId === userId);
    const userProjects = this.data.projects.filter(p => p.userId === userId);
    const userSessions = this.data.sessions.filter(s => s.userId === userId);
    const userMovements = this.data.movements.filter(m => m.userId === userId);

    const plannedCount = userProjects.filter(p => p.status === 'planned' || p.status === 'ready').length;
    const inProgressCount = userProjects.filter(p => p.status === 'in_progress').length;
    const completedCount = userProjects.filter(p => p.status === 'completed').length;
    const pausedCount = userProjects.filter(p => p.status === 'paused').length;
    const abandonedCount = userProjects.filter(p => p.status === 'abandoned').length;

    // Time calculations
    const totalCraftingMinutes = userSessions.reduce((acc, s) => acc + (Number(s.durationMinutes) || 0), 0);
    const craftingHours = (totalCraftingMinutes / 60).toFixed(1);

    // Fabric inventory metrics
    const totalFabricPieces = userFabrics.length;
    const availablePieces = userFabrics.filter(f => f.availableQuantity > 0).length;
    const reservedPieces = userFabrics.filter(f => f.reservedQuantity > 0).length;

    // Confirmed consumed fabric from completed projects
    let confirmedConsumedAreaSqM = 0;
    for (const m of userMovements) {
      if (m.type === 'consumption') {
        confirmedConsumedAreaSqM += (m.areaCm2 || 0) / 10000;
      }
    }

    // Confirmed leftover scraps reused/added
    const scrapsInInventory = userFabrics.filter(f => f.source === 'scrap').length;
    const leftoverMovements = userMovements.filter(m => m.type === 'addition' && m.notes.includes('scrap')).length;

    // Total available area in stash
    const availableAreaSqM = userFabrics
      .filter(f => f.availableQuantity > 0)
      .reduce((acc, f) => acc + (ReStyleStore.calculateArea(f.dimensions) * f.availableQuantity) / 10000, 0);

    return {
      projects: {
        total: userProjects.length,
        planned: plannedCount,
        inProgress: inProgressCount,
        completed: completedCount,
        paused: pausedCount,
        abandoned: abandonedCount
      },
      time: {
        totalMinutes: totalCraftingMinutes,
        totalHours: Number(craftingHours),
        sessionsLogged: userSessions.length
      },
      fabric: {
        totalPieces: totalFabricPieces,
        availablePieces,
        reservedPieces,
        scrapsInStash: scrapsInInventory,
        scrapsAddedFromProjects: leftoverMovements,
        availableAreaSqM: Number(availableAreaSqM.toFixed(2)),
        confirmedConsumedAreaSqM: Number(confirmedConsumedAreaSqM.toFixed(2))
      },
      sustainability: {
        confirmedConsumedExplanation: `${confirmedConsumedAreaSqM.toFixed(2)} m² of textile scraps physically transformed across ${completedCount} completed project(s) based on your verified maker entries.`,
        scrapsRetainedExplanation: `${scrapsInInventory} scrap remnant(s) saved into stash rather than discarded.`,
        methodologyNotes: 'All metrics reflect deterministic measurements recorded by the maker. Zero fabricated landfill or carbon offset claims.'
      }
    };
  }

  getMovements(userId = 'default-maker', fabricId = null) {
    let list = this.data.movements.filter(m => m.userId === userId);
    if (fabricId) {
      list = list.filter(m => m.fabricId === fabricId);
    }
    return list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
}

export const store = new ReStyleStore();
export default store;
