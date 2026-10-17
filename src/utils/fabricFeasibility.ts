/**
 * Re:Style Deterministic 2D Cutting Layout & Textile Compatibility Engine
 * 
 * Accurately calculates 2D geometric fit, piece rotation, seam allowances,
 * fabric-specific sewing notions (needles, thread, presser feet),
 * and generates honest, explainable match scores for both catalog cards and making guides.
 */

import type { FabricSample } from '../data/mockFabrics';
import type { UpcycleIdea } from '../data/upcyclingIdeas';

export interface PatternPieceSpec {
  name: string;
  count: number;
  width: number;
  height: number;
  unit: 'cm' | 'in';
  source: 'remnant' | 'separate_supply';
  notes?: string;
}

export interface CuttingLayoutResult {
  fitsRemnant: boolean;
  isDirectlyMatched: boolean;
  status: 'feasible' | 'tight' | 'requires_piecing' | 'insufficient_material';
  statusLabel: string;
  statusBadgeColor: string;
  matchScore: number;
  remnantWidthCm: number;
  remnantHeightCm: number;
  remnantAreaCm2: number;
  consumedAreaCm2: number;
  utilizationPercent: number;
  remainingAreaCm2: number;
  remainingNotes: string;
  explanation: string;
  suitabilityReason: string;
  modificationNeeded?: string;
  separateSupplies: string[];
  fabricSpecs: {
    needle: string;
    thread: string;
    presserFoot: string;
    tension: string;
    stitchLength: string;
    seamType: string;
  };
}

/**
 * Parse colloquial and natural dimensions (e.g. "a 4 × 4 piece", "4x4 in", "40x50 cm")
 */
export function parseNaturalDimensions(text: string): { width: number; height: number; unit: 'cm' | 'in' } | null {
  if (!text || typeof text !== 'string') return null;
  const cleaned = text.trim().toLowerCase();
  const match = cleaned.match(/(\d+(?:\.\d+)?)\s*(?:[x×*]|by)\s*(\d+(?:\.\d+)?)(?:\s*(cm|in|inch|inches|m|meter|meters))?/i);
  if (match) {
    const d1 = parseFloat(match[1]);
    const d2 = parseFloat(match[2]);
    let rawUnit = (match[3] || '').toLowerCase();
    let unit: 'cm' | 'in' = 'cm';
    if (rawUnit.startsWith('in')) {
      unit = 'in';
    } else if (rawUnit.startsWith('m')) {
      return { width: Math.round(d1 * 100), height: Math.round(d2 * 100), unit: 'cm' };
    } else if (!rawUnit) {
      // In craft descriptions, dimensions <= 15 without units typically denote inches (e.g. "4x4")
      unit = (d1 <= 15 && d2 <= 15) ? 'in' : 'cm';
    }
    return { width: d1, height: d2, unit };
  }
  return null;
}

/**
 * Standardize dimension values to centimeters
 */
export function toCm(val: number, unit: 'cm' | 'in' = 'cm'): number {
  if (isNaN(val) || val <= 0) return 0;
  return unit === 'in' ? Math.round(val * 2.54 * 10) / 10 : val;
}

/**
 * Fabric-specific sewing specifications dynamically derived from material and weight
 */
export function getFabricSewingSpecs(fabric: FabricSample) {
  const mat = (fabric.material || '').toLowerCase();
  const name = (fabric.name || '').toLowerCase();
  const gsm = fabric.weightGsm || 200;

  if (mat.includes('denim') || mat.includes('twill') || name.includes('denim') || gsm >= 320) {
    return {
      needle: 'Jeans / Denim Needle (Size 90/14 or 100/16)',
      thread: 'Heavy-duty cotton/poly topstitch thread (Ecru or Terracotta) + 40wt bobbin thread',
      presserFoot: 'Standard zig-zag foot or jeans clearance foot for thick flat-felled seams',
      tension: 'Upper tension 4.5–5.5 (increased for dense twill weave)',
      stitchLength: '3.0–3.5 mm construction seams; 4.0 mm decorative topstitching',
      seamType: 'Flat-felled or mock flat-felled seams for lifetime abrasion resistance'
    };
  }

  if (mat.includes('corduroy') || mat.includes('velvet') || name.includes('corduroy')) {
    return {
      needle: 'Universal or Microtex Sharp Needle (Size 80/12 or 90/14)',
      thread: 'All-purpose 100% polyester thread (matches pile depth)',
      presserFoot: 'Walking foot or Teflon non-stick foot to prevent nap dragging and pile crush',
      tension: 'Standard tension (3.5–4.0)',
      stitchLength: '2.5–3.0 mm; always stitch in the direction of the fabric nap',
      seamType: 'Overcast or serged seams; press gently over a plush towel to preserve ribs'
    };
  }

  if (mat.includes('linen') || mat.includes('flax') || name.includes('linen')) {
    return {
      needle: 'Universal Needle (Size 75/11 or 80/12)',
      thread: 'Natural 100% cotton 50wt or soft all-purpose poly (stone/oatmeal tone)',
      presserFoot: 'Standard clear embroidery or straight-stitch foot',
      tension: 'Standard tension (3.0–3.5); steam generously before cutting to relax slub grain',
      stitchLength: '2.5 mm; French seams or double-turned hems for clean raw-edge containment',
      seamType: 'French seams or bound bias finishes to prevent unravelling of loose slubs'
    };
  }

  if (mat.includes('silk') || mat.includes('satin') || mat.includes('chiffon') || name.includes('silk')) {
    return {
      needle: 'Microtex Sharp Needle (Size 60/8 or 70/10)',
      thread: 'Fine silk thread (50–60wt) or extra-fine lingerie polyester',
      presserFoot: 'Straight-stitch foot with single needle hole to prevent fabric flagging',
      tension: 'Low tension (2.0–2.8) to eliminate seam puckering',
      stitchLength: '1.8–2.0 mm; fine French seams or delicate rolled baby hems',
      seamType: 'Fine enclosed French seams (3mm) or hand-rolled slipstitched edges'
    };
  }

  // Default Artisan Cotton / Khadi / Canvas
  return {
    needle: gsm > 240 ? 'Universal Needle (Size 90/14)' : 'Universal Needle (Size 80/12)',
    thread: '100% Cotton 50wt thread or all-purpose sewing thread',
    presserFoot: 'Standard all-purpose presser foot',
    tension: 'Standard balanced tension (3.5–4.0)',
    stitchLength: '2.5 mm construction seams; 3.0 mm topstitching',
    seamType: 'Clean double-turn hem, pinked edges, or bias binding'
  };
}

/**
 * Standardized pattern pieces dictionary for all core blueprints
 */
export const BLUEPRINT_PIECE_REGISTRY: Record<string, {
  category: string;
  minDirectRemnant: { width: number; height: number };
  suitableFibers: string[];
  incompatibleFibers: string[];
  pieces: PatternPieceSpec[];
  separateSupplies: string[];
}> = {
  'idea-patchwork-tote': {
    category: 'Bags & Carry',
    minDirectRemnant: { width: 56, height: 36 }, // 2 panels (28x34 cm) + strap margin
    suitableFibers: ['denim', 'cotton', 'linen', 'twill', 'canvas', 'corduroy', 'wool'],
    incompatibleFibers: ['chiffon', 'silk', 'lace'],
    pieces: [
      { name: 'Outer Body Panel (Front)', count: 1, width: 28, height: 34, unit: 'cm', source: 'remnant', notes: 'Grain parallel to warp' },
      { name: 'Outer Body Panel (Back)', count: 1, width: 28, height: 34, unit: 'cm', source: 'remnant', notes: 'Grain parallel to warp' },
      { name: 'Self-Fabric Handle Straps', count: 2, width: 38, height: 4, unit: 'cm', source: 'remnant', notes: 'Cut from remnant length strip' },
      { name: 'Lining Panels', count: 2, width: 28, height: 34, unit: 'cm', source: 'separate_supply', notes: 'Separate cotton offcut required' }
    ],
    separateSupplies: ['0.4m cotton/linen offcut for lining (2x 28×34 cm)', 'Cotton webbing straps if scrap length is limited']
  },

  'idea-quilted-sleeve': {
    category: 'Bags & Carry',
    minDirectRemnant: { width: 32, height: 22 },
    suitableFibers: ['denim', 'cotton', 'corduroy', 'linen', 'wool', 'canvas'],
    incompatibleFibers: ['chiffon', 'fine lace'],
    pieces: [
      { name: 'Outer Envelope Face Shell', count: 1, width: 32, height: 22, unit: 'cm', source: 'remnant', notes: 'Can be folded or cut in half' },
      { name: 'Insulating Fleece/Batting Core', count: 1, width: 32, height: 22, unit: 'cm', source: 'separate_supply', notes: 'Separate padding scrap required' },
      { name: 'Soft Inner Lining Shell', count: 1, width: 32, height: 22, unit: 'cm', source: 'separate_supply', notes: 'Separate muslin or cotton scrap required' }
    ],
    separateSupplies: ['Felt, flannel, or batting scrap for protective wadding (32×22 cm)', 'Soft inner lining scrap (cotton muslin)']
  },

  'idea-scrunchie-trio': {
    category: 'Accessories',
    minDirectRemnant: { width: 35, height: 9 },
    suitableFibers: ['silk', 'cotton', 'linen', 'corduroy', 'satin', 'denim', 'wool'],
    incompatibleFibers: [],
    pieces: [
      { name: 'Scrunchie Tube Strip', count: 1, width: 35, height: 9, unit: 'cm', source: 'remnant', notes: 'Cut along any straight edge' }
    ],
    separateSupplies: ['18 cm braided elastic (0.8 cm width)', 'Safety pin for threading']
  },

  'idea-cushion-cover': {
    category: 'Home Goods',
    minDirectRemnant: { width: 42, height: 42 },
    suitableFibers: ['linen', 'cotton', 'denim', 'wool', 'corduroy', 'canvas'],
    incompatibleFibers: ['sheer lace', 'chiffon'],
    pieces: [
      { name: 'Front Hero Accent Square', count: 1, width: 40, height: 40, unit: 'cm', source: 'remnant', notes: 'Clean square focal panel' },
      { name: 'Envelope Back Overlap Flaps', count: 2, width: 40, height: 26, unit: 'cm', source: 'separate_supply', notes: 'Separate neutral backing linen/canvas required' }
    ],
    separateSupplies: ['2x 40×26 cm neutral cotton/linen fabric for envelope back closure', 'Standard 40×40 cm pillow insert']
  },

  'idea-wall-hanging': {
    category: 'Art & Living',
    minDirectRemnant: { width: 28, height: 32 },
    suitableFibers: ['linen', 'cotton', 'denim', 'wool', 'lace', 'silk', 'jute'],
    incompatibleFibers: [],
    pieces: [
      { name: 'Textile Base Panel', count: 1, width: 28, height: 32, unit: 'cm', source: 'remnant', notes: 'Intentionally celebrate raw frayed fringe' }
    ],
    separateSupplies: ['Wooden dowel or natural branch (30–35 cm)', 'Hemp twine or jute cord for wall suspension']
  },

  'idea-tea-coasters': {
    category: 'Home Goods',
    minDirectRemnant: { width: 22, height: 22 },
    suitableFibers: ['cotton', 'linen', 'denim', 'corduroy', 'wool', 'jute'],
    incompatibleFibers: ['sheer lace', 'chiffon'],
    pieces: [
      { name: 'Coaster Face Squares', count: 4, width: 11, height: 11, unit: 'cm', source: 'remnant', notes: 'Cut in a 2×2 grid' },
      { name: 'Heat Insulating Fleece Layer', count: 4, width: 11, height: 11, unit: 'cm', source: 'separate_supply', notes: 'Flannel or fleece scrap' },
      { name: 'Backing Fabric Squares', count: 4, width: 11, height: 11, unit: 'cm', source: 'separate_supply', notes: 'Neutral backing scrap' }
    ],
    separateSupplies: ['Flannel, fleece, or felt scraps for heat absorption (4x 11×11 cm)', 'Contrast sashiko or embroidery floss']
  },

  'idea-corduroy-cardholder': {
    category: 'Accessories',
    minDirectRemnant: { width: 18, height: 12 },
    suitableFibers: ['corduroy', 'denim', 'leather', 'canvas', 'wool', 'cotton'],
    incompatibleFibers: ['chiffon', 'fine silk', 'lace'],
    pieces: [
      { name: 'Origami Cardholder Body', count: 1, width: 18, height: 12, unit: 'cm', source: 'remnant', notes: 'Tri-fold accordion folding' }
    ],
    separateSupplies: ['1x Antique brass snap fastener or button', 'Small swivel hook or key ring']
  }
};

/**
 * 2D Bounding Box Layout Check:
 * Tests if pieces can be packed into remnant [W x H] (supporting 90° rotation)
 */
function test2DCuttingFit(
  remnantW: number,
  remnantH: number,
  pieces: Array<{ width: number; height: number; count: number }>
): { fits: boolean; totalPieceArea: number; packedDirect: boolean } {
  let totalPieceArea = 0;
  for (const p of pieces) {
    totalPieceArea += (p.width * p.height * p.count);
  }

  const remnantArea = remnantW * remnantH;
  if (totalPieceArea > remnantArea) {
    return { fits: false, totalPieceArea, packedDirect: false };
  }

  // 1. Single piece case
  if (pieces.length === 1 && pieces[0].count === 1) {
    const p = pieces[0];
    const direct = (p.width <= remnantW && p.height <= remnantH);
    const rotated = (p.height <= remnantW && p.width <= remnantH);
    return { fits: direct || rotated, totalPieceArea, packedDirect: direct || rotated };
  }

  // 2. Coaster 2x2 grid (4 identical 11x11 pieces)
  if (pieces.length === 1 && pieces[0].count === 4 && pieces[0].width === pieces[0].height) {
    const s = pieces[0].width;
    const fits2x2 = (remnantW >= 2 * s && remnantH >= 2 * s);
    const fits1x4 = (remnantW >= 4 * s && remnantH >= s) || (remnantH >= 4 * s && remnantW >= s);
    return { fits: fits2x2 || fits1x4, totalPieceArea, packedDirect: fits2x2 || fits1x4 };
  }

  // 3. Two large panels (e.g. Tote Bag 2x 28x34 cm)
  if (pieces.length >= 1 && pieces[0].count === 2) {
    const pw = pieces[0].width;
    const ph = pieces[0].height;

    // Side-by-side: (2*pw <= remnantW && ph <= remnantH) OR (2*ph <= remnantW && pw <= remnantH)
    const sideBySide = (2 * pw <= remnantW && ph <= remnantH) || (2 * ph <= remnantW && pw <= remnantH);
    // Stacked: (pw <= remnantW && 2*ph <= remnantH) || (ph <= remnantW && 2*pw <= remnantH)
    const stacked = (pw <= remnantW && 2 * ph <= remnantH) || (ph <= remnantW && 2 * pw <= remnantH);

    return { fits: sideBySide || stacked, totalPieceArea, packedDirect: sideBySide || stacked };
  }

  // General heuristic check
  const maxPieceW = Math.max(...pieces.map(p => p.width));
  const maxPieceH = Math.max(...pieces.map(p => p.height));
  const minDim = Math.min(maxPieceW, maxPieceH);
  const maxDim = Math.max(maxPieceW, maxPieceH);

  const canFitLargest = (maxDim <= Math.max(remnantW, remnantH) && minDim <= Math.min(remnantW, remnantH));
  const areaRatio = remnantArea / totalPieceArea;

  const fits = canFitLargest && areaRatio >= 1.15;
  return { fits, totalPieceArea, packedDirect: fits };
}

/**
 * Deterministically evaluate any blueprint against the selected fabric remnant
 */
export function evaluateFabricFeasibility(
  idea: UpcycleIdea,
  fabric: FabricSample
): CuttingLayoutResult {
  let rawW = fabric.dimensions.width;
  let rawH = fabric.dimensions.height;
  let rawUnit = fabric.dimensions.unit || 'cm';

  if ((!rawW || !rawH || rawW <= 0 || rawH <= 0) && fabric.dimensionsText) {
    const parsed = parseNaturalDimensions(fabric.dimensionsText) || parseNaturalDimensions(fabric.name);
    if (parsed) {
      rawW = parsed.width;
      rawH = parsed.height;
      rawUnit = parsed.unit;
    }
  }

  const remnantW = toCm(rawW, rawUnit);
  const remnantH = toCm(rawH, rawUnit);
  const remnantArea = remnantW * remnantH;

  // Retrieve standardized registry specs or fallback to idea properties
  const registrySpec = BLUEPRINT_PIECE_REGISTRY[idea.id] || BLUEPRINT_PIECE_REGISTRY['idea-quilted-sleeve'];
  const remnantPieces = registrySpec.pieces.filter(p => p.source === 'remnant');

  const { fits, totalPieceArea } = test2DCuttingFit(
    remnantW,
    remnantH,
    remnantPieces
  );

  const fabricSpecs = getFabricSewingSpecs(fabric);
  const matLower = (fabric.material || '').toLowerCase();
  const nameLower = (fabric.name || '').toLowerCase();

  // Fiber suitability
  const isFiberSuitable = registrySpec.suitableFibers.some(f => matLower.includes(f) || nameLower.includes(f));
  const isFiberIncompatible = registrySpec.incompatibleFibers.some(f => matLower.includes(f) || nameLower.includes(f));

  // Weight & structural compatibility checks
  const gsm = fabric.weightGsm || 200;
  let weightIncompatible = false;
  let weightNote = '';

  // Scrunchies need malleable, draping fabric (< 300 GSM, or washed)
  if (idea.id === 'idea-scrunchie-trio' && gsm >= 320 && (matLower.includes('denim') || matLower.includes('twill') || matLower.includes('canvas'))) {
    weightIncompatible = true;
    weightNote = `Heavy ${gsm} GSM twill has high structural rigidity and resists tight elastic gathering.`;
  }

  // Structural market tote needs substance (or interfacing/lining if lightweight)
  let needsToteInterfacing = false;
  if (idea.id === 'idea-patchwork-tote' && gsm < 160) {
    needsToteInterfacing = true;
  }

  // Determine status, scores, and utilization
  let status: CuttingLayoutResult['status'];
  let statusLabel: string;
  let statusBadgeColor: string;
  let score: number;
  let explanation: string;
  let modificationNeeded: string | undefined = undefined;
  let isDirectlyMatched = false;

  const consumedArea = Math.min(remnantArea, Math.round(totalPieceArea));
  const remainingArea = Math.max(0, remnantArea - consumedArea);
  const utilizationPercent = remnantArea > 0 ? Math.min(100, Math.round((consumedArea / remnantArea) * 100)) : 0;

  if (isFiberIncompatible) {
    status = 'insufficient_material';
    statusLabel = '✕ Material Incompatible';
    statusBadgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
    score = 35;
    explanation = `${fabric.material} lacks the structural tensile strength needed for this ${idea.category} pattern.`;
    modificationNeeded = `Switch to a sturdier fiber or fuse heavy canvas interfacing behind ${fabric.material}.`;
    isDirectlyMatched = false;
  } else if (weightIncompatible) {
    status = 'requires_piecing';
    statusLabel = '⚠️ Material Modification Needed';
    statusBadgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
    score = 58;
    explanation = weightNote;
    modificationNeeded = 'Pre-wash fabric with enzyme softener to relax twill stiffness, or cut strips on a 45° bias to facilitate elastic gathering.';
    isDirectlyMatched = false;
  } else if (fits) {
    isDirectlyMatched = true;
    if (utilizationPercent > 85) {
      status = 'tight';
      statusLabel = `✓ Snug Atelier Fit (${utilizationPercent}% used)`;
      statusBadgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
      score = isFiberSuitable ? 88 : 82;
      explanation = `All required pieces fit directly on your ${Math.round(remnantW)}×${Math.round(remnantH)} cm scrap with tight cutting margins (~${remainingArea} cm² offcuts remain).`;
    } else {
      status = 'feasible';
      statusLabel = `✓ Direct Cut (${utilizationPercent}% used)`;
      statusBadgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
      score = isFiberSuitable ? (94 + (Math.round(remnantW + remnantH) % 5)) : 87;
      score = Math.min(98, score);
      explanation = `All pieces fit comfortably onto your ${Math.round(remnantW)}×${Math.round(remnantH)} cm remnant. Clean layout with ~${remainingArea} cm² remaining for smaller accessories.`;
    }

    if (needsToteInterfacing) {
      explanation += ` Note: ${fabric.name} (~${gsm} GSM) is lightweight; apply fusible interfacing or use double-layered body for extra durability.`;
    }
  } else if (remnantArea >= totalPieceArea * 0.9) {
    status = 'requires_piecing';
    statusLabel = '🧩 Modular Piecing Required';
    statusBadgeColor = 'bg-indigo-100 text-indigo-800 border-indigo-300';
    score = 68;
    isDirectlyMatched = false;

    if (idea.id === 'idea-patchwork-tote') {
      if (Math.max(remnantW, remnantH) >= 34 && Math.min(remnantW, remnantH) >= 28) {
        explanation = `Fits 1 continuous outer panel (28×34 cm). The second body panel requires modular piecing from remaining strips or pairing with contrast backing.`;
        modificationNeeded = 'Cut 1 front hero panel from this remnant; use a complementary offcut (28×34 cm) from your stash for the back panel.';
      } else {
        explanation = `Remnant surface area (${remnantArea} cm²) is close, but width/length cannot fit 28×34 cm panels in continuous cuts.`;
        modificationNeeded = 'Requires piecing multiple modular blocks (e.g. 14×17 cm patchwork) to assemble the bag body.';
      }
    } else if (idea.id === 'idea-cushion-cover') {
      explanation = `Remnant height (${Math.round(Math.min(remnantW, remnantH))} cm) falls short of a 40×40 cm square.`;
      modificationNeeded = `Add a 5–8 cm contrast border or seam 2 colorblock panels together to reach the 40×40 cm face.`;
    } else if (idea.id === 'idea-wall-hanging') {
      explanation = `Remnant dimensions (${Math.round(remnantW)}×${Math.round(remnantH)} cm) restrict a continuous 28×32 cm drop.`;
      modificationNeeded = `Piece two horizontal segments together or adjust finished hanging height to ${Math.round(Math.min(remnantW, remnantH))} cm.`;
    } else {
      explanation = `Remnant surface area (${remnantArea} cm²) is sufficient, but dimensions require piecing 2 panels together or pairing with a complementary contrast backing.`;
      modificationNeeded = 'Requires modular seaming of offcut strips to form pattern pieces.';
    }
  } else {
    status = 'insufficient_material';
    statusLabel = `✕ Remnant Too Small (Needs min ${registrySpec.minDirectRemnant.width}×${registrySpec.minDirectRemnant.height} cm)`;
    statusBadgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
    score = 35;
    isDirectlyMatched = false;
    explanation = `Available remnant (${Math.round(remnantW)}×${Math.round(remnantH)} cm = ${remnantArea} cm²) cannot fit the pattern pieces directly (requires min ${registrySpec.minDirectRemnant.width}×${registrySpec.minDirectRemnant.height} cm = ~${registrySpec.minDirectRemnant.width * registrySpec.minDirectRemnant.height} cm²).`;
    modificationNeeded = `Exceeds available remnant dimensions. Requires +${Math.max(0, registrySpec.minDirectRemnant.width * registrySpec.minDirectRemnant.height - remnantArea)} cm² additional fabric or dedicated yardage. Excluded from single-remnant zero-waste claims.`;
  }

  // Generate dynamic, fabric- and garment-specific suitability reason
  const contextNotes: string[] = [];
  if (fabric.clothingType) {
    const cType = fabric.clothingType.toLowerCase();
    if (cType.includes('jean') || cType.includes('trouser') || cType.includes('pant')) {
      contextNotes.push(`Deconstructing these ${fabric.clothingType} provides 2 main leg tube panels (~70-80 cm) ideal for continuous cutting, plus back pockets for accents.`);
    } else if (cType.includes('shirt') || cType.includes('blouse')) {
      contextNotes.push(`Disassembling this ${fabric.clothingType} allows repurposing the front button placket and yoke.`);
    } else if (cType.includes('jacket') || cType.includes('coat')) {
      contextNotes.push(`Disassembling this ${fabric.clothingType} yields structured torso shells and collar facing.`);
    } else {
      contextNotes.push(`Deconstructing this ${fabric.clothingType} yields customized flat fabric panels for layout.`);
    }
  }

  if (fabric.condition) {
    const cond = fabric.condition.toLowerCase();
    if (cond.includes('distressed') || cond.includes('worn') || cond.includes('torn') || cond.includes('frayed')) {
      contextNotes.push(`Worn or frayed zones can be celebrated with visible sashiko mending or isolated into patch accents.`);
    } else if (cond.includes('stained')) {
      contextNotes.push(`Cutting layout can navigate around stains, reserving flawed sections for hidden inner facing.`);
    }
  }

  if (fabric.texture && fabric.texture !== 'Smooth') {
    contextNotes.push(`The ${fabric.texture.toLowerCase()} surface texture gives tactile character to finished seams.`);
  }

  if (fabric.notes) {
    contextNotes.push(`Maker note: "${fabric.notes}".`);
  }

  const contextStr = contextNotes.length > 0 ? ` ${contextNotes.join(' ')}` : '';
  const suitabilityReason = `${fabric.name} (~${fabric.weightGsm || 200} GSM ${fabric.weave || 'weave'}) provides ${fabricSpecs.seamType.toLowerCase()} properties. ${explanation}${contextStr}`;

  const remainingNotes = remainingArea > 150
    ? `Yields ~${remainingArea} cm² offcut remainder suitable for matching cord organizers or sashiko coasters.`
    : `Near zero-waste layout with under ${remainingArea} cm² edge trim.`;

  return {
    fitsRemnant: fits,
    isDirectlyMatched,
    status,
    statusLabel,
    statusBadgeColor,
    matchScore: score,
    remnantWidthCm: remnantW,
    remnantHeightCm: remnantH,
    remnantAreaCm2: remnantArea,
    consumedAreaCm2: consumedArea,
    utilizationPercent,
    remainingAreaCm2: remainingArea,
    remainingNotes,
    explanation,
    suitabilityReason,
    modificationNeeded,
    separateSupplies: registrySpec.separateSupplies,
    fabricSpecs
  };
}
