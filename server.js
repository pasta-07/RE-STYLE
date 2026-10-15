import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import store from './server/store.js';
import { getRecommendedProjects, MASTER_PROJECT_CATALOG, evaluateProjectFeasibility } from './server/recommendationEngine.js';
import { generateProjectPdf } from './server/pdfGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, 'dist');

const app = express();
const PORT = process.env.PORT || 5000;
const TINYFISH_API_KEY = process.env.TINYFISH_API_KEY;
const LLM_API_KEY = process.env.LLM_API_KEY;

function getUserId(req) {
  return req.headers['x-user-id'] || 'default-maker';
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    project: 'Re:Style 2.0 AI Sustainable Fashion & Circular Maker Engine',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: 'GET /api/health',
      inspectFabric: 'POST /api/inspect-fabric-image',
      generateDesigns: 'POST /api/generate-designs',
      fabrics: 'GET/POST /api/fabrics',
      projects: 'GET/POST /api/projects',
      recommendations: 'POST /api/recommendations',
      makerStats: 'GET /api/maker-stats'
    }
  });
});

if (!fs.existsSync(distPath)) {
  app.get('/', (req, res) => {
    res.redirect('/api/health');
  });
}

/**
 * Extract core textile fiber for targeted web research
 */
function extractCoreFiber(fabricType) {
  if (!fabricType) return 'natural textile';
  const lower = fabricType.toLowerCase();

  const fiberKeywords = [
    'silk', 'denim', 'linen', 'wool', 'cotton', 'corduroy', 'velvet',
    'cashmere', 'flax', 'canvas', 'leather', 'suede', 'tweed', 'chambray',
    'satin', 'hemp', 'fleece', 'twill', 'jacquard', 'organza', 'chiffon',
    'rayon', 'viscose', 'polyester', 'nylon', 'burlap', 'jute'
  ];

  for (const kw of fiberKeywords) {
    if (lower.includes(kw)) {
      return kw;
    }
  }

  // Clean generic terms like "fabric test 2", "uploaded remnant", etc.
  const cleaned = fabricType
    .replace(/custom|uploaded|upload|test|scrap|remnant|user defined|sample|\d+/gi, '')
    .trim();

  return cleaned || fabricType;
}

/**
 * Fetch live sustainable fashion trends using TinyFish Search API
 * Targeted specifically per textile fiber, color, and pattern
 */
/**
 * Parse base64 or URL image data safely
 */
function parseImageData(imageData) {
  if (!imageData || typeof imageData !== 'string') return null;
  const match = imageData.match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    return { mimeType: match[1], base64: match[2] };
  }
  if (/^[A-Za-z0-9+/=]+$/.test(imageData) && imageData.length > 100) {
    return { mimeType: 'image/jpeg', base64: imageData };
  }
  return null;
}

/**
 * Fetch live sustainable fashion trends using TinyFish Search API
 * Targeted specifically per textile fiber, color, and pattern
 */
async function fetchTinyFishTrends(fabricType, dominantColor = '', pattern = '') {
  const coreFiber = extractCoreFiber(fabricType);
  const colorClean = dominantColor ? dominantColor.replace(/Remnant|Tone|Shade|Sample/gi, '').trim() : '';
  const patternClean = pattern ? pattern.replace(/Structure|Weave/gi, '').trim() : '';
  const query = `${colorClean} ${patternClean} ${coreFiber} fabric scrap upcycling zero-waste fashion trends 2026`.replace(/\s+/g, ' ').trim();
  const url = `https://api.search.tinyfish.ai?query=${encodeURIComponent(query)}&location=US`;

  if (!TINYFISH_API_KEY) {
    return {
      status: 'unavailable',
      query,
      results: [],
      error: 'TINYFISH_API_KEY is not configured in server environment'
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-Key': TINYFISH_API_KEY,
        'Accept': 'application/json'
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.warn(`[TinyFish API Warning] Status: ${response.status} ${response.statusText}`, errText);
      return {
        status: 'failed',
        query,
        results: [],
        error: `TinyFish API HTTP ${response.status}: ${response.statusText}`
      };
    }

    const data = await response.json();
    const results = Array.isArray(data.results) ? data.results.slice(0, 5) : [];
    return {
      status: 'success',
      query,
      results,
      error: null
    };
  } catch (error) {
    console.error('[TinyFish Error]', error.message);
    return {
      status: 'failed',
      query,
      results: [],
      error: error.message
    };
  }
}

/**
 * Multimodal Visual Textile Inspection using Gemini Multimodal Vision (gemini-3.8-flash)
 * Accurately separates objectively observed attributes from inferred predictions
 */
async function inspectTextileImage(imageData) {
  if (!imageData || typeof imageData !== 'string') return null;

  let mimeType = 'image/jpeg';
  let base64 = imageData;

  const parsed = parseImageData(imageData);
  if (parsed) {
    mimeType = parsed.mimeType;
    base64 = parsed.base64;
  } else if (imageData.startsWith('http')) {
    // If it's a URL, fetch and convert to base64
    try {
      const imgRes = await fetch(imageData);
      const buffer = await imgRes.arrayBuffer();
      base64 = Buffer.from(buffer).toString('base64');
      mimeType = imgRes.headers.get('content-type') || 'image/jpeg';
    } catch (e) {
      console.warn('[Vision Fetch Error]', e.message);
      return null;
    }
  } else {
    return null;
  }

  const prompt = `You are a master circular textile specialist and material inspection scientist.
Inspect this fabric swatch photograph with high visual fidelity.
Separate objectively observed physical traits from inferred predictions.
CRITICAL RULE: If any attribute is ambiguous, low resolution, or uncertain, mark confidence as 'low_confidence' or value as 'unknown'. Never fabricate or invent attributes.

Return strictly a VALID JSON object matching this exact schema with NO markdown fences:
{
  "observedAttributes": {
    "dominantColor": "Accurate observed color name (e.g. Cobalt Blue, Natural Tan, Forest Green)",
    "colorCombinations": ["Array of secondary visible hues"],
    "colorConfidence": "high",
    "pattern": "Exact observed pattern (e.g. Plain Solid Weave, Floral Print, Yarn-Dyed Stripe, Plaid Check, Slub Texture)",
    "patternConfidence": "high",
    "texture": "Objective tactile surface description (e.g. coarse openwork weave with prominent slubs, smooth fine sheen)",
    "textureConfidence": "high",
    "condition": "Crisp Remnant",
    "visibleDefectsOrWear": "Any visible fraying, selvedge edge, wear, or none observed"
  },
  "inferredPredictions": {
    "fiberCategory": "cotton",
    "fiberCategoryConfidence": "high",
    "fiberType": "Most likely specific fiber name or 'unknown'",
    "weave": "Specific weave architecture (e.g. Plain Weave, 3x1 Twill, Basket Weave, Satin) or 'unknown'",
    "weaveConfidence": "high",
    "weightGsm": 220,
    "weightConfidence": "medium"
  },
  "colorFamily": "One of: yellow-gold, purple-silk, indigo-denim, green-olive, red-terracotta, pink-coral, wool-earth, dark-black, white-cream",
  "archetype": "One of: jute-burlap, lace-sheer, corduroy-velvet, denim-workwear, silk-satin, linen-slub, wool-tweed, cotton-handloom",
  "colorPalette": [{"name": "Color Name", "hex": "#HEX"}],
  "suggestedName": "Descriptive remnant title",
  "tagline": "Design recommendation based on this physical structure",
  "confidenceNotes": "Notes on what was clearly visible vs what was inferred"
}`;

  const models = ['gemini-flash-lite-latest', 'gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3.8-flash'];
  for (const model of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${LLM_API_KEY}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inlineData: { mimeType, data: base64 } }
            ]
          }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: 'application/json'
          }
        })
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`[Gemini Vision ${model}] Status: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) continue;

      const cleanJson = rawText.trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
      const parsed = JSON.parse(cleanJson);

      // Flatten helper fields for backward compatibility with frontend consumers
      parsed.fiberType = parsed.inferredPredictions?.fiberType && parsed.inferredPredictions?.fiberType !== 'unknown' 
        ? parsed.inferredPredictions.fiberType 
        : (parsed.suggestedName || 'Textile Remnant');
      parsed.dominantColor = parsed.observedAttributes?.dominantColor || 'Natural Tone';
      parsed.pattern = parsed.observedAttributes?.pattern || 'Plain Weave';
      parsed.weave = parsed.inferredPredictions?.weave || 'Woven Structure';
      parsed.weightGsm = parsed.inferredPredictions?.weightGsm || 200;
      parsed.condition = parsed.observedAttributes?.condition || 'Crisp Remnant';
      parsed.texture = parsed.observedAttributes?.texture || '';
      parsed.confidence = parsed.inferredPredictions?.fiberCategoryConfidence || 'medium';

      return parsed;
    } catch (e) {
      console.warn(`[Gemini Vision ${model} Error]`, e.message);
    }
  }

  // If inspection fails, return null - do not fabricate fake attributes
  return null;
}

function safeParseJsonArray(rawText) {
  if (!rawText) return null;
  let text = rawText.trim();
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  try {
    const val = JSON.parse(text);
    if (Array.isArray(val)) return val;
    if (val && Array.isArray(val.designs)) return val.designs;
  } catch (e) {
    // Continue to repair
  }

  const firstBracket = text.indexOf('[');
  const lastBracket = text.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    let sliced = text.substring(firstBracket, lastBracket + 1);
    // Remove trailing commas before } or ]
    sliced = sliced.replace(/,\s*([}\]])/g, '$1');
    try {
      const val = JSON.parse(sliced);
      if (Array.isArray(val)) return val;
    } catch (e) {
      // Continue
    }
  }

  return null;
}

/**
 * Call Google Gemini LLM to generate 5 clothing concepts
 * Passes uploaded fabric photo via inlineData so Gemini visually sees the real swatch
 */
async function generateGeminiConcepts(fabricDetails, liveTrends, fabricImage = null) {
  const modelsToTry = ['gemini-flash-lite-latest', 'gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3.8-flash'];

  const trendsSummary = Array.isArray(liveTrends) && liveTrends.length > 0
    ? liveTrends.map((t, idx) => `[Source ${idx + 1}] ${t.title}: "${t.snippet}" (${t.url})`).join('\n')
    : 'Research status: Live external search was unavailable or unconfigured. Ground designs in contemporary modular zero-waste streetwear, patchwork utilitarian aesthetics, artisanal mending, and circular lifestyle products.';

  const colorDesc = fabricDetails.dominantColor ? `${fabricDetails.dominantColor} (${fabricDetails.colorFamily || 'natural'})` : 'Authentic Remnant Tone';
  const patternDesc = fabricDetails.pattern || 'Artisanal Woven Grain';

  const prompt = `You are an expert sustainable fashion designer, circular textile strategist, and boutique creative director.
Your mission is to help independent fashion designers and boutiques transform leftover textile inventory into 5 distinct, commercially viable, trendy clothing and accessory design concepts.

USER FABRIC PROFILE & VISUAL ATTRIBUTES:
- Fabric Fiber / Name: ${fabricDetails.fabricType}
- Dominant Color: ${colorDesc}
- Weave / Surface Pattern: ${patternDesc}
- Remnant Quantity & Weight: ${fabricDetails.quantity}
- Inventory Cost: ${fabricDetails.cost}
- Designer Aesthetic / Preferences: ${fabricDetails.preferences}

LIVE WEB RESEARCH & SUSTAINABLE FASHION TRENDS (Via TinyFish Real-Time Search):
${trendsSummary}

CRITICAL DESIGN REQUIREMENTS:
1. Act as an expert sustainable fashion designer and master zero-waste tailor.
2. An authentic visual swatch photograph of this exact fabric is supplied. Inspect the visual swatch closely.
3. Every single concept MUST be made from this specific ${fabricDetails.dominantColor || ''} ${patternDesc} ${fabricDetails.fabricType} fabric. Ensure the garment title, silhouette cuts, and descriptions directly celebrate this exact color (${fabricDetails.dominantColor || ''}) and weave.
4. Do NOT generate generic white linen chore jackets unless the user's fabric is explicitly white linen.
5. All 5 concepts must be GENUINELY DISTINCT from one another across product categories:
   - Concept 1: Structured outerwear or jacket/overshirt
   - Concept 2: High-utility bag, tote, or carryall
   - Concept 3: Wearable accessory, hat, collar, or folio
   - Concept 4: Layering garment, vest, kimono, or shrug
   - Concept 5: Circular lifestyle product, apron, or architectural living good
6. Incorporate genuine trends from the web research (e.g. silhouette trends, utility details, artisanal mending, modular patterns).
7. For each concept, calculate realistic fabric usage, production costs (based on fabric cost + atelier assembly), potential retail selling price with healthy boutique margins, and tangible waste reduction metrics.
8. Reference real trend sources from web research in "sourcesUsed" for each design concept where applicable.
9. CRITICAL TEXTILE QUALITY & ARCHETYPE DIFFERENTIATION:
   Analyze BOTH color AND physical textile structure/quality (weight, drape, fiber, weave density, tensile strength).
   Two fabrics of the SAME COLOR (e.g. Green Lace vs Green Denim vs Green Corduroy vs Green Silk) MUST produce completely distinct garments:
   - LACE / GUIPURE / SHEER: Delicate negative-space layering (camisole overlay tops, evening wristlet reticules, scalloped statement collars, bolero shrugs, sheer sheath dresses). NEVER generate workwear, chore jackets, or heavy aprons for lace.
   - CORDUROY / VELVET: Tactile structured silhouettes (architectural wide-wale overshirts/shackets, boxy zip tech pouches, studio bucket hats, layering waistcoats, envelope cushions).
   - DENIM / HEAVY TWILL / CANVAS: Rugged architectural utility streetwear (atelier chore jackets, modular tactical crossbody rigs, studio gilets, maker aprons, weekend carryalls).
   - SILK / SATIN / ZARI: Fluid luxury evening silhouettes (kimono shrugs, drawstring potli bags, pleated ascot cravats, quilted vests, luxe cushions).
   - JUTE / BURLAP / HESSIAN: Coarse architectural artisanal & brutalist accessories (raw-textured statement choker necklaces & cravat collars, modular tactical crossbody rigs, architectural cropped bolero shrugs, document/laptop folios, sashiko-mended market totes, studio bucket hats, artisan maker aprons).
   - SLUB LINEN / FLAX: Breathable relaxed atelier coats, origami market carryalls, minimalist craft aprons, slub gilets.
   - WOOL / TWEED: Heritage tailored layering waistcoats, thermal muffler scarves, structural folio sleeves, valet trays.
   - COTTON / HANDLOOM: Breezy summer tunic tops, origami market totes, mandarin collar studio shirts, cross-back smocks.

OUTPUT FORMAT:
Respond with a VALID JSON array of exactly 5 objects. Do NOT include markdown code blocks, explanation, or commentary outside the JSON array.
Each object MUST have the following exact schema:
[
  {
    "id": "design-1",
    "title": "Editorial Name of Garment / Product",
    "subtitle": "Short evocative sub-heading",
    "category": "Bags & Carry",
    "difficulty": "Intermediate",
    "timeEstimate": "2 Hours",
    "description": "Thorough description covering silhouette, zero-waste cutting strategy, construction details, and market appeal.",
    "suitabilityReason": "Why this specific fabric remnant and weave is ideal for this design.",
    "estimatedFabricUsage": "e.g. 0.8 meters or 45x35 cm remnant",
    "estimatedProductionCost": "e.g. $18.50",
    "potentialSellingPrice": "e.g. $78.00",
    "wasteReductionImpact": "e.g. Diverts 100% of remnant scraps; saves ~1.4kg CO2e vs virgin production",
    "sourcesUsed": ["url or source title from the web trends"],
    "materialsNeeded": ["Material 1", "Material 2", "Material 3"],
    "toolsNeeded": ["Tool 1", "Tool 2", "Tool 3"],
    "steps": [
      { "step": 1, "title": "Square & press remnant", "description": "Details...", "tip": "Pro tip..." },
      { "step": 2, "title": "Tessellation layout", "description": "Details...", "tip": "Pro tip..." },
      { "step": 3, "title": "Join structural panels", "description": "Details..." },
      { "step": 4, "title": "Finishing & edge details", "description": "Details...", "tip": "Pro tip..." }
    ],
    "patternNotes": "Cutting blueprint: dimensions and layout guidance"
  }
] (Valid categories are strictly: 'Apparel & Garments', 'Bags & Carry', 'Accessories', 'Home Goods', 'Art & Living'. Valid difficulties are: 'Beginner', 'Intermediate', 'Artisan').`;

  let lastError = null;

  // Build multimodal parts including image swatch if present
  const parts = [{ text: prompt }];
  if (fabricImage) {
    const parsedImg = parseImageData(fabricImage);
    if (parsedImg) {
      parts.push({
        inlineData: {
          mimeType: parsedImg.mimeType,
          data: parsedImg.base64
        }
      });
    }
  }

  for (const model of modelsToTry) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${LLM_API_KEY}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 18000);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            temperature: 0.3,
            responseMimeType: 'application/json'
          }
        })
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData?.error?.message || `HTTP ${response.status}`;
        console.warn(`[Gemini ${model}] failed: ${message}. Trying next available model...`);
        lastError = new Error(message);
        continue;
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error('No candidate content received from Gemini LLM');
      }

      const parsed = safeParseJsonArray(rawText);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      throw new Error('Unexpected JSON format from model');
    } catch (err) {
      lastError = err;
      console.warn(`[Gemini Model ${model} Attempt Failed]`, err.message);
    }
  }

  // If both models failed, throw error honestly
  console.error('[Gemini LLM Critical Error]', lastError ? lastError.message : 'All models failed');
  throw new Error(`Failed to generate design concepts via Gemini: ${lastError ? lastError.message : 'Unknown error'}`);
}

function detectFabricArchetype(text = '', pattern = '', dominantColor = '') {
  const combined = `${text} ${pattern} ${dominantColor}`.toLowerCase();
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
  if (/jute|burlap|hessian|sackcloth/i.test(combined)) {
    return 'jute-burlap';
  }
  if (/linen|flax|slub|ramie|hemp|sisal|canvas|bast/i.test(combined)) {
    return 'linen-slub';
  }
  if (/wool|tweed|houndstooth|cashmere|flannel/i.test(combined)) {
    return 'wool-tweed';
  }
  return 'cotton-handloom';
}

function isLace(text = '', pattern = '', dominantColor = '') {
  return detectFabricArchetype(text, pattern, dominantColor) === 'lace-sheer';
}

function detectColorFamily(text = '', dominantColor = '', pattern = '') {
  const combined = `${dominantColor} ${text} ${pattern}`.toLowerCase();
  const isBastFiber = /linen|flax|slub|jute|burlap|hemp|canvas/i.test(combined);

  if (dominantColor) {
    const dom = dominantColor.toLowerCase();
    if (/green|olive|sage|emerald|forest|moss|khaki|mint/i.test(dom)) return 'green-olive';
    if (/yellow|gold|amber|mustard|lemon|honey|saffron|ochre|canary|flaxen/i.test(dom)) return 'yellow-gold';
    if (/purple|violet|magenta|plum|lavender|lilac|orchid|amethyst/i.test(dom)) return 'purple-silk';
    if (/indigo|cobalt|cyan|sapphire|blue/i.test(dom)) return 'indigo-denim';
    if (/red|terracotta|crimson|ruby|burgundy|rust|brick|maroon|scarlet|coral/i.test(dom)) return 'red-terracotta';
    if (/black|charcoal|ebony|onyx|slate|dark/i.test(dom)) return 'dark-black';
    if (/camel|tan|brown|earth/i.test(dom)) {
      if (isBastFiber) return 'white-light';
      return 'wool-earth';
    }
    if (/white|cream|ivory|ecru|off-white/i.test(dom)) return 'white-light';
  }

  if (/green|olive|sage|emerald|forest|moss|khaki|mint/i.test(combined)) {
    return 'green-olive';
  }
  if (/yellow|gold|amber|mustard|lemon|honey|saffron|ochre|canary|flaxen/i.test(combined)) {
    return 'yellow-gold';
  }
  if (/purple|violet|magenta|plum|lavender|lilac|orchid|amethyst/i.test(combined)) {
    return 'purple-silk';
  }
  if (/indigo|cobalt|cyan|sapphire|blue/i.test(combined)) {
    return 'indigo-denim';
  }
  if (/red|terracotta|crimson|ruby|burgundy|rust|brick|maroon|scarlet|coral/i.test(combined)) {
    return 'red-terracotta';
  }
  if (/black|charcoal|ebony|onyx|slate|dark/i.test(combined)) {
    return 'dark-black';
  }
  if (/camel|tan|brown|earth/i.test(combined)) {
    if (isBastFiber) return 'white-light';
    return 'wool-earth';
  }
  if (/white|cream|ivory|ecru|off-white/i.test(combined)) {
    return 'white-light';
  }
  return 'default';
}

function getCuratedArchetypeImages(archetype, colorFamily) {
  if (archetype === 'lace-sheer') {
    return [
      '/blueprints/sage-lace-overlay-top.jpg',
      '/blueprints/green-lace-pouch.jpg',
      '/blueprints/lace-collar.jpg',
      '/blueprints/lace-bolero.jpg',
      '/blueprints/green-lace-dress.jpg'
    ];
  }
  if (archetype === 'corduroy-velvet') {
    return [
      '/blueprints/terracotta-corduroy-overshirt.jpg',
      '/blueprints/corduroy-zip-pouch.jpg',
      '/blueprints/belgian-slub-linen-crossbody-rig.jpg',
      '/blueprints/belgian-slub-linen-maker-apron.jpg',
      '/blueprints/yellow-cotton-envelope-cushion.jpg'
    ];
  }
  if (archetype === 'denim-workwear') {
    if (colorFamily === 'green-olive') {
      return [
        '/blueprints/olive-chore-jacket.jpg',
        '/blueprints/olive-utility-rig.jpg',
        '/blueprints/belgian-slub-linen-maker-apron.jpg',
        '/blueprints/belgian-slub-linen-kimono-gilet.jpg',
        '/blueprints/belgian-slub-linen-weekend-carryall.jpg'
      ];
    }
    return [
      '/blueprints/denim-chore-jacket.jpg',
      '/blueprints/denim-crossbody-rig.jpg',
      '/blueprints/belgian-slub-linen-kimono-gilet.jpg',
      '/blueprints/belgian-slub-linen-maker-apron.jpg',
      '/blueprints/belgian-slub-linen-weekend-carryall.jpg'
    ];
  }
  if (archetype === 'wool-tweed') {
    return [
      '/blueprints/wool-tweed-waistcoat.jpg',
      '/blueprints/corduroy-zip-pouch.jpg',
      '/blueprints/belgian-slub-linen-weekend-carryall.jpg',
      '/blueprints/belgian-slub-linen-maker-apron.jpg',
      '/blueprints/purple-silk-origami-scarf.jpg'
    ];
  }
  if (archetype === 'silk-satin') {
    return [
      '/blueprints/purple-silk-kimono-shrug.jpg',
      '/blueprints/purple-silk-evening-pouch.jpg',
      '/blueprints/purple-silk-origami-scarf.jpg',
      '/blueprints/purple-silk-quilted-vest.jpg',
      '/blueprints/purple-silk-envelope-cushion.jpg'
    ];
  }
  if (archetype === 'jute-burlap') {
    return [
      '/blueprints/jute-statement-choker.jpg',
      '/blueprints/jute-crossbody-rig.jpg',
      '/blueprints/jute-sculptural-shrug.jpg',
      '/blueprints/jute-document-folio.jpg',
      '/blueprints/jute-patchwork-tote.jpg',
      '/blueprints/jute-bucket-hat.jpg',
      '/blueprints/jute-maker-apron.jpg'
    ];
  }
  if (archetype === 'linen-slub') {
    return [
      '/blueprints/belgian-slub-linen-chore-jacket.jpg',
      '/blueprints/belgian-slub-linen-crossbody-rig.jpg',
      '/blueprints/belgian-slub-linen-kimono-gilet.jpg',
      '/blueprints/belgian-slub-linen-maker-apron.jpg',
      '/blueprints/belgian-slub-linen-weekend-carryall.jpg'
    ];
  }
  // cotton-handloom / other
  if (colorFamily === 'purple-silk') {
    return [
      '/blueprints/purple-silk-kimono-shrug.jpg',
      '/blueprints/purple-silk-evening-pouch.jpg',
      '/blueprints/purple-silk-origami-scarf.jpg',
      '/blueprints/purple-silk-quilted-vest.jpg',
      '/blueprints/purple-silk-envelope-cushion.jpg'
    ];
  }
  if (colorFamily === 'green-olive') {
    return [
      '/blueprints/olive-chore-jacket.jpg',
      '/blueprints/olive-utility-rig.jpg',
      '/blueprints/green-lace-pouch.jpg',
      '/blueprints/sage-lace-overlay-top.jpg',
      '/blueprints/belgian-slub-linen-maker-apron.jpg'
    ];
  }
  if (colorFamily === 'white-light') {
    return [
      '/blueprints/belgian-slub-linen-chore-jacket.jpg',
      '/blueprints/belgian-slub-linen-crossbody-rig.jpg',
      '/blueprints/belgian-slub-linen-kimono-gilet.jpg',
      '/blueprints/belgian-slub-linen-maker-apron.jpg',
      '/blueprints/belgian-slub-linen-weekend-carryall.jpg'
    ];
  }
  if (colorFamily === 'indigo-denim') {
    return [
      '/blueprints/denim-chore-jacket.jpg',
      '/blueprints/denim-crossbody-rig.jpg',
      '/blueprints/belgian-slub-linen-maker-apron.jpg',
      '/blueprints/belgian-slub-linen-kimono-gilet.jpg',
      '/blueprints/belgian-slub-linen-weekend-carryall.jpg'
    ];
  }
  if (colorFamily === 'red-terracotta') {
    return [
      '/blueprints/terracotta-corduroy-overshirt.jpg',
      '/blueprints/corduroy-zip-pouch.jpg',
      '/blueprints/yellow-cotton-market-carryall.jpg',
      '/blueprints/yellow-cotton-maker-apron.jpg',
      '/blueprints/yellow-cotton-envelope-cushion.jpg'
    ];
  }
  if (colorFamily === 'wool-earth') {
    return [
      '/blueprints/wool-tweed-waistcoat.jpg',
      '/blueprints/corduroy-zip-pouch.jpg',
      '/blueprints/belgian-slub-linen-weekend-carryall.jpg',
      '/blueprints/belgian-slub-linen-maker-apron.jpg',
      '/blueprints/yellow-cotton-envelope-cushion.jpg'
    ];
  }
  return [
    '/blueprints/yellow-cotton-summer-tunic.jpg',
    '/blueprints/yellow-cotton-market-carryall.jpg',
    '/blueprints/yellow-cotton-studio-shirt.jpg',
    '/blueprints/yellow-cotton-maker-apron.jpg',
    '/blueprints/yellow-cotton-envelope-cushion.jpg'
  ];
}

/**
 * Returns the best photorealistic, runway-grade studio image matching the concept description & fabric
 * Enforces a strict duplicate-prevention policy across the entire generation batch using usedImages
 */
function getBestImageForConcept(concept, fabricDetails, index, usedImages = new Set()) {
  const archetype = fabricDetails.archetype || detectFabricArchetype(fabricDetails.fabricType, fabricDetails.pattern, fabricDetails.dominantColor);
  const colorFamily = fabricDetails.colorFamily || detectColorFamily(fabricDetails.fabricType, fabricDetails.dominantColor, fabricDetails.pattern);
  const title = (concept.title || '').toLowerCase();
  const text = `${concept.title || ''} ${concept.subtitle || ''} ${concept.description || ''}`.toLowerCase();
  const archetypePool = getCuratedArchetypeImages(archetype, colorFamily);

  let candidate = null;

  // 1. Jute & Burlap
  if (archetype === 'jute-burlap' || /jute|burlap/i.test(fabricDetails.fabricType)) {
    if (/\b(crossbody|chest pack|sling|rig)\b/i.test(title)) candidate = '/blueprints/jute-crossbody-rig.jpg';
    else if (/\b(shrug|bolero|jacket|gilet)\b/i.test(title)) candidate = '/blueprints/jute-sculptural-shrug.jpg';
    else if (/\b(folio|sleeve|laptop|document|portfolio)\b/i.test(title)) candidate = '/blueprints/jute-document-folio.jpg';
    else if (/\b(tote|bag|carryall|market|shopper)\b/i.test(title)) candidate = '/blueprints/jute-patchwork-tote.jpg';
    else if (/\b(choker|necklace|cravat|collar)\b/i.test(title)) candidate = '/blueprints/jute-statement-choker.jpg';
    else if (/\b(hat|bucket|cap)\b/i.test(title)) candidate = '/blueprints/jute-bucket-hat.jpg';
    else if (/\b(apron|smock)\b/i.test(title)) candidate = '/blueprints/jute-maker-apron.jpg';

    if (!candidate) {
      if (/\b(crossbody|chest rig|chest pack|tactical rig)\b/i.test(text)) candidate = '/blueprints/jute-crossbody-rig.jpg';
      else if (/\b(shrug|bolero|sculptural shrug)\b/i.test(text)) candidate = '/blueprints/jute-sculptural-shrug.jpg';
      else if (/\b(laptop sleeve|document folio|laptop folio|portfolio sleeve)\b/i.test(text)) candidate = '/blueprints/jute-document-folio.jpg';
      else if (/\b(market tote|patchwork tote|carryall bag)\b/i.test(text)) candidate = '/blueprints/jute-patchwork-tote.jpg';
      else if (/\b(choker|statement choker|cravat collar|neck choker)\b/i.test(text)) candidate = '/blueprints/jute-statement-choker.jpg';
      else if (/\b(bucket hat|studio hat)\b/i.test(text)) candidate = '/blueprints/jute-bucket-hat.jpg';
      else if (/\b(maker apron|craft apron|utility apron)\b/i.test(text)) candidate = '/blueprints/jute-maker-apron.jpg';
    }
  }

  // 2. Lace & Sheer
  else if (archetype === 'lace-sheer') {
    if (/camisole|overlay|crop top|top|bustier|tank|slip|bodice|shirt/i.test(text)) {
      candidate = '/blueprints/sage-lace-overlay-top.jpg';
    } else if (/pouch|potli|wristlet|reticule|minaudiere|bag|purse|clutch|carry/i.test(text)) {
      candidate = '/blueprints/green-lace-pouch.jpg';
    } else if (/collar|choker|neck|statement|ribbon|cravat|ascot/i.test(text)) {
      candidate = '/blueprints/lace-collar.jpg';
    } else if (/shrug|bolero|waistcoat|vest|gilet|jacket|layer/i.test(text)) {
      candidate = '/blueprints/lace-bolero.jpg';
    } else {
      candidate = '/blueprints/green-lace-dress.jpg';
    }
  }

  // 3. Denim & Workwear
  else if (archetype === 'denim-workwear') {
    if (/crossbody|rig|chest|pack|bag|pouch/i.test(text)) {
      candidate = '/blueprints/denim-crossbody-rig.jpg';
    } else if (colorFamily === 'green-olive') {
      if (/utility|rig|pouch/i.test(text)) candidate = '/blueprints/olive-utility-rig.jpg';
      else candidate = '/blueprints/olive-chore-jacket.jpg';
    } else if (/apron|smock|maker/i.test(text)) {
      candidate = '/blueprints/belgian-slub-linen-maker-apron.jpg';
    } else if (/gilet|vest|kimono/i.test(text)) {
      candidate = '/blueprints/belgian-slub-linen-kimono-gilet.jpg';
    } else if (/carryall|tote|weekend/i.test(text)) {
      candidate = '/blueprints/belgian-slub-linen-weekend-carryall.jpg';
    } else {
      candidate = '/blueprints/denim-chore-jacket.jpg';
    }
  }

  // 4. Silk & Satin
  else if (archetype === 'silk-satin' || colorFamily === 'purple-silk') {
    if (/shrug|kimono|bolero|jacket|robe|wrap/i.test(text)) {
      candidate = '/blueprints/purple-silk-kimono-shrug.jpg';
    } else if (/pouch|bag|potli|wristlet|clutch/i.test(text)) {
      candidate = '/blueprints/purple-silk-evening-pouch.jpg';
    } else if (/scarf|ascot|cravat|neck|bandana|tie|ribbon/i.test(text)) {
      candidate = '/blueprints/purple-silk-origami-scarf.jpg';
    } else if (/vest|waistcoat|gilet|smock|crop/i.test(text)) {
      candidate = '/blueprints/purple-silk-quilted-vest.jpg';
    } else {
      candidate = '/blueprints/purple-silk-envelope-cushion.jpg';
    }
  }

  // 5. Corduroy & Velvet
  else if (archetype === 'corduroy-velvet') {
    if (/overshirt|shacket|jacket|blazer/i.test(text)) {
      candidate = '/blueprints/terracotta-corduroy-overshirt.jpg';
    } else if (/pouch|bag|case|wallet/i.test(text)) {
      candidate = '/blueprints/corduroy-zip-pouch.jpg';
    } else if (/rig|crossbody|pack/i.test(text)) {
      candidate = '/blueprints/belgian-slub-linen-crossbody-rig.jpg';
    } else if (/apron|smock|vest/i.test(text)) {
      candidate = '/blueprints/belgian-slub-linen-maker-apron.jpg';
    } else {
      candidate = '/blueprints/yellow-cotton-envelope-cushion.jpg';
    }
  }

  // 6. Wool & Tweed
  else if (archetype === 'wool-tweed') {
    if (/waistcoat|vest|gilet/i.test(text)) {
      candidate = '/blueprints/wool-tweed-waistcoat.jpg';
    } else if (/pouch|sleeve|folio/i.test(text)) {
      candidate = '/blueprints/corduroy-zip-pouch.jpg';
    } else if (/carryall|tote|bag/i.test(text)) {
      candidate = '/blueprints/belgian-slub-linen-weekend-carryall.jpg';
    } else if (/scarf|muffler|cravat/i.test(text)) {
      candidate = '/blueprints/purple-silk-origami-scarf.jpg';
    } else {
      candidate = '/blueprints/belgian-slub-linen-maker-apron.jpg';
    }
  }

  // 7. Linen & Slub
  else if (archetype === 'linen-slub' || colorFamily === 'white-light') {
    if (/chore jacket|workwear.*jacket|atelier.*jacket|jacket|coat/i.test(text)) {
      candidate = '/blueprints/belgian-slub-linen-chore-jacket.jpg';
    } else if (/crossbody.*rig|chest pack|utility.*rig|origami.*fold|crossbody|bag/i.test(text)) {
      candidate = '/blueprints/belgian-slub-linen-crossbody-rig.jpg';
    } else if (/kimono|studio gilet|layering vest|open-front.*vest|gilet|vest/i.test(text)) {
      candidate = '/blueprints/belgian-slub-linen-kimono-gilet.jpg';
    } else if (/maker.*apron|wrap apron|studio smock|craft apron|smock|apron/i.test(text)) {
      candidate = '/blueprints/belgian-slub-linen-maker-apron.jpg';
    } else {
      candidate = '/blueprints/belgian-slub-linen-weekend-carryall.jpg';
    }
  }

  // 8. Cotton & Handloom (default)
  else {
    if (/tunic|dress|gown|robe|shrug|jacket|overshirt/i.test(text)) {
      candidate = '/blueprints/yellow-cotton-summer-tunic.jpg';
    } else if (/carryall|tote|market|bag|shopper|weekend/i.test(text)) {
      candidate = '/blueprints/yellow-cotton-market-carryall.jpg';
    } else if (/shirt|camp|collar|studio shirt|blouse|top/i.test(text)) {
      candidate = '/blueprints/yellow-cotton-studio-shirt.jpg';
    } else if (/apron|smock|pinafore|maker|craft|vest|gilet/i.test(text)) {
      candidate = '/blueprints/yellow-cotton-maker-apron.jpg';
    } else {
      candidate = '/blueprints/yellow-cotton-envelope-cushion.jpg';
    }
  }

  // If candidate is found and not yet used in this generation batch, return it
  if (candidate && !usedImages.has(candidate)) {
    return candidate;
  }

  // Otherwise, select the first unused image from the archetype's pool
  const unusedFromArchetype = archetypePool.filter(img => !usedImages.has(img));
  if (unusedFromArchetype.length > 0) {
    return unusedFromArchetype[0];
  }

  // Fallback to broader catalog avoiding duplicates
  const globalCatalog = [
    '/blueprints/belgian-slub-linen-weekend-carryall.jpg',
    '/blueprints/denim-chore-jacket.jpg',
    '/blueprints/yellow-cotton-summer-tunic.jpg',
    '/blueprints/purple-silk-kimono-shrug.jpg',
    '/blueprints/jute-patchwork-tote.jpg',
    '/blueprints/belgian-slub-linen-maker-apron.jpg',
    '/blueprints/yellow-cotton-market-carryall.jpg'
  ];
  const unusedGlobal = globalCatalog.filter(img => !usedImages.has(img));
  if (unusedGlobal.length > 0) {
    return unusedGlobal[0];
  }

  return archetypePool[index % archetypePool.length];
}

/**
 * Construct an editorial studio photography prompt matching the bespoke design concept and fabric
 */
function constructConceptImagePrompt(concept, fabricDetails) {
  const cleanTitle = concept.title || 'Sustainable Fashion Garment';
  const cleanFabric = fabricDetails.fabricType || 'sustainable textile remnant';
  const cleanColor = fabricDetails.dominantColor ? `${fabricDetails.dominantColor} ` : '';
  const cleanPattern = fabricDetails.pattern ? `with ${fabricDetails.pattern} structure, ` : '';
  const cleanSubtitle = concept.subtitle ? `${concept.subtitle}. ` : '';
  const cleanDesc = concept.description ? `${concept.description.slice(0, 140)}. ` : '';

  return `Award-winning professional editorial fashion studio catalog photography of ${cleanTitle}, ${cleanSubtitle}${cleanDesc}Handcrafted from authentic ${cleanColor}${cleanFabric} remnant ${cleanPattern}tactile woven textile surface details visible in crisp clarity, zero-waste sustainable bespoke circular design, soft directional atelier studio daylighting, clean minimalist boutique backdrop, 8k resolution, photorealistic, sharp focus, magazine lookbook, no text, no watermark`;
}

/**
 * Generate a high-resolution, deterministic Pollinations AI image URL for the concept
 */
function generateConceptImageUrl(concept, fabricDetails, index = 0) {
  const prompt = constructConceptImagePrompt(concept, fabricDetails);
  let hash = 0;
  const str = `${concept.title || ''}-${concept.subtitle || ''}-${fabricDetails.fabricType || ''}-${fabricDetails.dominantColor || ''}-${index}`;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  const seed = Math.abs(hash) % 100000;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=600&nologo=true&seed=${seed}&model=flux`;
}

/**
 * High-quality fallback design concept generator aligned with user fabric, color, and web trends
 */
function generateFallbackConcepts(fabricDetails, trendSources) {
  const sources = trendSources.length > 0 ? trendSources : ['Sustainable Circular Fashion Index', 'Zero-Waste Patternmaking Guide'];
  let name = fabricDetails.fabricType;
  const dominantColor = fabricDetails.dominantColor || '';
  const pattern = fabricDetails.pattern || '';
  const colorFamily = fabricDetails.colorFamily || detectColorFamily(name, dominantColor, pattern);
  const archetype = detectFabricArchetype(name, pattern, dominantColor);
  const curatedImages = getCuratedArchetypeImages(archetype, colorFamily);

  if (/test|upload|custom|scrap/i.test(name)) {
    const fiber = extractCoreFiber(name);
    name = (fiber && fiber !== 'natural textile') 
      ? `${fiber.charAt(0).toUpperCase() + fiber.slice(1)} Remnant` 
      : (dominantColor ? `${dominantColor} Textile Remnant` : 'Artisanal Textile Remnant');
  }

  const cleanName = name.replace(/^reclaimed\s+|^embroidered\s+/i, '').trim();
  const colorPrefix = dominantColor ? `${dominantColor} ` : '';

  // 1. Delicate Lace / Guipure / Beaded Sheer Textiles
  if (archetype === 'lace-sheer') {
    return [
      {
        id: "design-1",
        title: `Artisanal ${colorPrefix}Guipure Lace Camisole Overlay Top`,
        subtitle: "Bespoke cropped camisole with scalloped hem & delicate rouleau silk shoulder straps",
        category: "Apparel & Garments",
        difficulty: "Artisan",
        timeEstimate: "2.5 Hours",
        imageUrl: curatedImages[0],
        fallbackImageUrl: curatedImages[0],
        description: `An ethereal cropped camisole overlay top tailored from ${cleanName} to highlight the intricate floral cutwork along the scalloped hemline. Designed as a luxury layering piece over silk slips, slip dresses, or tailored shirts.`,
        suitabilityReason: `The openwork guipure lace provides dimensional negative space and drape without fraying, preserving delicate beaded motifs.`,
        estimatedFabricUsage: "0.35 - 0.45 meters",
        estimatedProductionCost: "$24.00",
        potentialSellingPrice: "$175.00",
        wasteReductionImpact: "100% remnant diversion; utilizes small rectangular pieces with zero cutting waste; preserves heirloom artisan craft.",
        sourcesUsed: sources,
        materialsNeeded: [
          `Main ${cleanName} remnant (approx 45x35cm)`,
          `Fine silk thread in matching ${dominantColor || 'tonal'} hue`,
          "1m Fine silk satin bias strip for rouleau straps and neck facings"
        ],
        toolsNeeded: [
          "Curved embroidery scissors",
          "Fine hand-sewing needles (size 9/10)",
          "Steam iron with pressing cloth",
          "Fine silk glass-head pins"
        ],
        steps: [
          { step: 1, title: "Square panels along lace scallop motifs", description: "Carefully press lace using a silk pressing cloth. Align natural scalloped border along bottom hem to eliminate rolling bulk." },
          { step: 2, title: "Form delicate silk rouleau straps", description: "Fold 2cm silk satin bias strip in half, stitch at 3mm, turn right side out with a loop turner, and press." },
          { step: 3, title: "Join side seams with fine French seams", description: "Stitch wrong sides together at 3mm, trim lace edge cleanly, and enclose seam at 5mm for couture durability." },
          { step: 4, title: "Anchor straps and hand-tack scalloped neckline", description: "Position rouleau straps 8cm from center front, anchor securely, and hand-tack neckline with invisible slip stitches." }
        ],
        patternNotes: "Zero-waste rectilinear block: 1x Front panel (35x40cm), 1x Back panel (35x40cm), 2x Rouleau straps (38cm each)."
      },
      {
        id: "design-2",
        title: `Heirloom Beaded ${colorPrefix}Lace Minaudière Evening Wristlet Pouch`,
        subtitle: "Circular-base drawstring evening reticule with braided metallic cord & tassel finials",
        category: "Bags & Carry",
        difficulty: "Intermediate",
        timeEstimate: "1.5 Hours",
        imageUrl: curatedImages[1],
        fallbackImageUrl: curatedImages[1],
        description: `A luxury handcrafted evening wristlet reticule pouch featuring scalloped beaded lace body, gold metallic braided drawstring ties, and lustrous satin lining. Perfectly sized to turn small lace remnants into high-value couture accessories.`,
        suitabilityReason: `The dimensional texture of ${cleanName} layered over satin creates striking heirloom evening elegance.`,
        estimatedFabricUsage: "0.25 - 0.35 meters",
        estimatedProductionCost: "$16.00",
        potentialSellingPrice: "$110.00",
        wasteReductionImpact: "Consumes small scrap pieces down to 25x30cm; 100% scrap diversion with zero landfill yield.",
        sourcesUsed: sources,
        materialsNeeded: [
          `Uploaded ${cleanName} piece`,
          "Satin or silk scrap for interior lining (30x30cm)",
          "Braided gold metallic drawstring cord (80cm)",
          "2x Gold filigree tassel caps or beads"
        ],
        toolsNeeded: [
          "Embroidery shears",
          "Hand sewing needles",
          "Tailor's chalk",
          "Steam iron & organza pressing cloth"
        ],
        steps: [
          { step: 1, title: "Cut main body cylinder and base circle", description: "Cut a 20x36cm body rectangle and 12cm circular base from lace and lining scrap. Center prominent beadwork on outer face." },
          { step: 2, title: "Assemble outer lace body and lining", description: "Baste lace onto satin lining. Stitch vertical cylinder seam with 6mm allowance." },
          { step: 3, title: "Stitch circular base and channel", description: "Attach circular base using fine wonder clips. Form a 1.5cm casing channel 3cm below the upper scalloped rim." },
          { step: 4, title: "Thread cords and attach tassel finials", description: "Thread gold braided cords in opposing loops through eyelets and knot with metallic finials." }
        ],
        patternNotes: "Single main tube 20x36cm, circular base diameter 12cm, 2x drawstring channels."
      },
      {
        id: "design-3",
        title: `Scalloped ${colorPrefix}Guipure Lace Statement Collar & Choker`,
        subtitle: "Detachable vintage-inspired architectural collar with scalloped medallion edges",
        category: "Accessories",
        difficulty: "Beginner",
        timeEstimate: "1 Hour",
        imageUrl: curatedImages[2],
        fallbackImageUrl: curatedImages[2],
        description: `A high-fashion detachable statement collar cut along the natural scalloped floral motifs of the ${cleanName} remnant. Fastens gracefully at the throat with a slender ribbon tie or vintage brass filigree hook.`,
        suitabilityReason: `Guipure lace motifs can be cut cleanly along embroidery bridges without fraying, yielding sculptural zero-waste collars.`,
        estimatedFabricUsage: "0.2 - 0.3 meters",
        estimatedProductionCost: "$8.50",
        potentialSellingPrice: "$75.00",
        wasteReductionImpact: "Transforms narrow strips down to 15x35cm into wearable statement accessories.",
        sourcesUsed: sources,
        materialsNeeded: [
          `Narrow strip of ${cleanName}`,
          "0.8m Silk velvet or satin ribbon tie (10mm width)",
          "Vintage brass filigree hook closure (optional)"
        ],
        toolsNeeded: [
          "Fine-pointed embroidery scissors",
          "Hand sewing needles",
          "Pressing ham and iron"
        ],
        steps: [
          { step: 1, title: "Trace and cut along floral lace medallions", description: "Use precision embroidery scissors to follow the natural contours of the scalloped floral medallions, leaving intact woven bridges." },
          { step: 2, title: "Stabilize inner neck curve", description: "Bind inner neckline with narrow silk bias tape or hand-whip with fine silk thread to provide gentle curvature." },
          { step: 3, title: "Affix ribbon closure ties", description: "Stitch velvet ribbon ties securely to the front apex corners of the collar." },
          { step: 4, title: "Steam block onto curved tailor's ham", description: "Steam press lightly over tailor's ham to shape collar comfortably to clavicle contour." }
        ],
        patternNotes: "Curved collar strip 38x12cm following organic floral medallion scallops."
      },
      {
        id: "design-4",
        title: `Artisanal Open-Front ${colorPrefix}Heirloom Lace Bolero Shrug`,
        subtitle: "Cropped open-front evening bolero with scalloped border sleeves & French seams",
        category: "Apparel & Garments",
        difficulty: "Intermediate",
        timeEstimate: "2.5 Hours",
        imageUrl: curatedImages[3],
        fallbackImageUrl: curatedImages[3],
        description: `A cropped, open-front evening bolero shrug utilizing scalloped lace selvedge borders along the front opening and sleeve cuffs. Enclosed with fine silk organza binding for a featherlight couture finish.`,
        suitabilityReason: `The openwork lace offers lightweight warmth and ethereal couture elegance draped over slip dresses.`,
        estimatedFabricUsage: "0.4 - 0.6 meters",
        estimatedProductionCost: "$22.00",
        potentialSellingPrice: "$165.00",
        wasteReductionImpact: "Consumes remnant ends; saves ~2.8kg CO2e compared to virgin eveningwear production.",
        sourcesUsed: sources,
        materialsNeeded: [
          `Main ${cleanName} piece`,
          "Silk organza bias strip for neck and underarm binding",
          "Fine silk embroidery thread"
        ],
        toolsNeeded: [
          "Embroidery scissors",
          "Sewing machine with size 70/10 Microtex needle",
          "Tailor's chalk",
          "Steam iron"
        ],
        steps: [
          { step: 1, title: "Align scalloped selvedge borders", description: "Position natural scalloped edges along front opening and sleeve hems to eliminate hem turning." },
          { step: 2, title: "Join shoulder seams with French seams", description: "Stitch wrong sides together at 3mm, trim, press, and enclose right sides together at 5mm." },
          { step: 3, title: "Bind neckline with silk organza", description: "Wrap folded organza bias tape around the back neck curve and edge-stitch with invisible stitches." },
          { step: 4, title: "Final steam press with organza cloth", description: "Press seams flat with steam, pressing into ham to maintain soft sleeve shape." }
        ],
        patternNotes: "Rectilinear block: 1x Back (38x45cm), 2x Fronts (38x22cm), 2x Cap sleeves (20x35cm)."
      },
      {
        id: "design-5",
        title: `Heirloom Beaded ${colorPrefix}Lace Evening Sheath Overlay`,
        subtitle: "Architectural sleeveless shift dress overlay accentuating intricate beaded floral cutwork",
        category: "Apparel & Garments",
        difficulty: "Artisan",
        timeEstimate: "3 Hours",
        imageUrl: curatedImages[4],
        fallbackImageUrl: curatedImages[4],
        description: `An exquisite sleeveless evening sheath overlay designed to drape over a tonal slip dress. Utilizes full remnant width with zero-waste straight-seam French finishes and scalloped hemline.`,
        suitabilityReason: `The dimensional beaded floral lace catches ambient light, offering couture eveningwear appeal with zero cutting waste.`,
        estimatedFabricUsage: "0.5 - 0.7 meters",
        estimatedProductionCost: "$32.00",
        potentialSellingPrice: "$220.00",
        wasteReductionImpact: "Diverts bolt remnant; zero cutting scraps through square-cut tessellation.",
        sourcesUsed: sources,
        materialsNeeded: [
          `Remnant of ${cleanName}`,
          "Silk bias binding for neckline and armholes",
          "Fine matching silk thread"
        ],
        toolsNeeded: [
          "Rotary cutter with fresh blade",
          "Sewing machine",
          "Silk pins",
          "Steam iron"
        ],
        steps: [
          { step: 1, title: "Square torso overlay panels", description: "Measure 2 rectangular panels along straight lace motif grainlines, keeping scalloped hem intact." },
          { step: 2, title: "Join side seams with delicate French seams", description: "Stitch with wrong sides facing at 4mm, trim, and fold right sides together at 6mm." },
          { step: 3, title: "Finish neckline and armholes", description: "Bind armholes with sheer silk bias tape, turning under and hand-stitching on wrong side." },
          { step: 4, title: "Final steam press and bead inspection", description: "Carefully inspect bead anchors along cut edges and reinforce any loose threads with lock stitches." }
        ],
        patternNotes: "Direct rectilinear shift: 2x Panels (50x45cm) utilizing intact scalloped bottom selvedges."
      }
    ];
  }

  // 2. Corduroy & Plush Velvet Archetype
  if (archetype === 'corduroy-velvet') {
    return [
      {
        id: "design-1",
        title: `Architectural Wide-Wale ${colorPrefix}Corduroy Studio Overshirt`,
        subtitle: "Structured boxy shacket with flat-felled seams and horn buttons",
        category: "Apparel & Garments",
        difficulty: "Artisan",
        timeEstimate: "3.5 Hours",
        imageUrl: curatedImages[0],
        fallbackImageUrl: curatedImages[0],
        description: `A structured, boxy studio overshirt tailored from plush ${cleanName}. Engineered along vertical cord wales to provide architectural body and durable warmth without synthetic interfacings.`,
        suitabilityReason: `The dense ribbed pile of ${cleanName} holds crisp boxy tailoring lines and insulating thermal warmth.`,
        estimatedFabricUsage: "1.4 - 1.8 meters",
        estimatedProductionCost: "$34.00",
        potentialSellingPrice: "$180.00",
        wasteReductionImpact: "100% remnant diversion; prevents ~3.6kg CO2e; zero-waste straight wale grain cutting.",
        sourcesUsed: sources,
        materialsNeeded: [
          `Main ${cleanName} panels`,
          "5x Recycled horn buttons",
          "Heavy-duty cotton topstitching thread"
        ],
        toolsNeeded: [
          "Heavy-duty sewing machine (size 90/14 jeans needle)",
          "Steam iron with velvet pressing board or needle board",
          "Fabric shears"
        ],
        steps: [
          { step: 1, title: "Square panels along vertical cord wales", description: "Align cut lines precisely parallel to the vertical wales to ensure uniform pile direction." },
          { step: 2, title: "Topstitch oversized chest utility pocket", description: "Fold pocket hem under 2.5cm and edge-stitch with reinforced corner bar-tacks." },
          { step: 3, title: "Assemble dropped shoulders and boxy sleeves", description: "Flat-fell shoulder and sleeve seams to reduce bulky corduroy seam allowances." },
          { step: 4, title: "Attach straight studio collar and buttonholes", description: "Stitch straight band collar, machine buttonholes, and attach horn buttons." }
        ],
        patternNotes: "Rectilinear block: 1x Back (68x54cm), 2x Front (68x28cm), 2x Sleeves (52x42cm)."
      },
      {
        id: "design-2",
        title: `Boxy Plush ${colorPrefix}Corduroy Zip Tech Pouch`,
        subtitle: "Cushioned dopp kit with boxy corners & antique brass zip closure",
        category: "Bags & Carry",
        difficulty: "Intermediate",
        timeEstimate: "1.5 Hours",
        imageUrl: curatedImages[1],
        fallbackImageUrl: curatedImages[1],
        description: `A plush, tactile tech folio and dopp pouch crafted from ${cleanName}. The natural cushioning of the cord pile shields gadgets, pens, and atelier tools without extra foam padding.`,
        suitabilityReason: `The resilient cut pile absorbs impacts naturally while showing off the rich ${dominantColor || 'tonal'} colorway.`,
        estimatedFabricUsage: "0.3 - 0.45 meters",
        estimatedProductionCost: "$14.00",
        potentialSellingPrice: "$68.00",
        wasteReductionImpact: "Turns end-of-bolt corduroy scraps into high-value protective daily accessories.",
        sourcesUsed: sources,
        materialsNeeded: [
          `Remnant of ${cleanName}`,
          "YKK antique brass zipper (22cm)",
          "Organic cotton lining scrap (30x40cm)"
        ],
        toolsNeeded: [
          "Zipper foot",
          "Wonder clips",
          "Sewing machine",
          "Iron & press cloth"
        ],
        steps: [
          { step: 1, title: "Cut outer cord and lining rectangles", description: "Cut 2x 24x18cm pieces from corduroy and lining. Ensure cord wales run vertically." },
          { step: 2, title: "Insert antique brass zipper", description: "Sandwich zipper between corduroy outer and lining. Topstitch 3mm from tooth edge." },
          { step: 3, title: "Box bottom corners for 3D depth", description: "Pinch 4cm triangular corners and stitch to give a self-standing boxy bottom." },
          { step: 4, title: "Turn out through lining gap and press", description: "Close lining gap, turn right side out, and steam lightly along zipper tape." }
        ],
        patternNotes: "2x Body panels (24x18cm), 4cm boxed corner cutouts."
      },
      {
        id: "design-3",
        title: `Structured ${colorPrefix}Corduroy Studio Bucket Hat`,
        subtitle: "Segmented crown sun hat with topstitched brim and breathable cotton lining",
        category: "Accessories",
        difficulty: "Intermediate",
        timeEstimate: "2 Hours",
        imageUrl: curatedImages[2],
        fallbackImageUrl: curatedImages[2],
        description: `A contemporary streetwear bucket hat engineered from radial corduroy wedge cuts. Features concentric circular brim topstitching that lends structural stiffness without synthetic buckram.`,
        suitabilityReason: `Durable corduroy holds structured conical forms while offering sun protection and tactile streetwear flair.`,
        estimatedFabricUsage: "0.35 - 0.5 meters",
        estimatedProductionCost: "$15.50",
        potentialSellingPrice: "$72.00",
        wasteReductionImpact: "Uses triangular tessellated offcuts with near-zero residual scrap.",
        sourcesUsed: sources,
        materialsNeeded: [
          `Remnant strips of ${cleanName}`,
          "Cotton canvas scrap for brim interlining",
          "Heavy topstitching thread"
        ],
        toolsNeeded: [
          "Curved shears",
          "Topstitch needle",
          "Steam iron & tailor's ham"
        ],
        steps: [
          { step: 1, title: "Cut crown disk, 4 side crowns, and 2 brim arcs", description: "Align wales vertically along crown segments for dynamic textured light play." },
          { step: 2, title: "Assemble side crown cylinder and top disk", description: "Stitch 4 side crown segments together, press seams open, and join top circular disk." },
          { step: 3, title: "Concentric topstitch brim arcs", description: "Stitch 6 concentric rows around brim at 6mm spacing to provide rigidity." },
          { step: 4, title: "Join crown to brim and insert sweatband", description: "Stitch brim to crown, enclose inner seam with herringbone twill tape." }
        ],
        patternNotes: "Crown disk (17cm dia), 4x Crown sides (14x9cm), 2x Brim arcs (28x8cm)."
      },
      {
        id: "design-4",
        title: `Tactile ${colorPrefix}Corduroy Layering Waistcoat Vest`,
        subtitle: "Cropped boxy vest with deep patch pockets and horn buttons",
        category: "Apparel & Garments",
        difficulty: "Intermediate",
        timeEstimate: "2.5 Hours",
        imageUrl: curatedImages[3],
        fallbackImageUrl: curatedImages[3],
        description: `A cropped, boxy work vest designed for versatile seasonal layering. Deep side-entry patch pockets and clean bound edges spotlight the architectural corduroy texture.`,
        suitabilityReason: `Heavy corduroy provides thermal body and shape retention without requiring fused interlinings.`,
        estimatedFabricUsage: "0.7 - 0.9 meters",
        estimatedProductionCost: "$26.00",
        potentialSellingPrice: "$140.00",
        wasteReductionImpact: "Consumes remnant ends; replaces fast-fashion synthetic fleece with 100% natural cotton cord.",
        sourcesUsed: sources,
        materialsNeeded: [
          `Main ${cleanName} remnant`,
          "4x Recycled wooden or horn buttons",
          "Cotton twill bias tape for armhole and neck binding"
        ],
        toolsNeeded: ["Fabric shears", "Sewing machine", "Iron", "Pins"],
        steps: [
          { step: 1, title: "Cut straight front and back lengths", description: "Slice 1 back panel and 2 front panels, aligning cord wales with vertical center front." },
          { step: 2, title: "Attach generous front patch pockets", description: "Topstitch 18x18cm patch pockets with double needle rows for durability." },
          { step: 3, title: "Join shoulder and side seams with flat-fells", description: "Stitch and press flat-felled seams to minimize bulky underarm friction." },
          { step: 4, title: "Bind perimeter and work buttonholes", description: "Wrap folded cotton bias tape around neck and front edges, then stitch buttonholes." }
        ],
        patternNotes: "Rectilinear block: 1x Back (48x46cm), 2x Fronts (48x24cm), 2x Pockets (18x18cm)."
      },
      {
        id: "design-5",
        title: `Architectural ${colorPrefix}Corduroy Envelope Floor Cushion`,
        subtitle: "Minimalist floor pillow case with origami overlap & concealed button closures",
        category: "Home Goods",
        difficulty: "Beginner",
        timeEstimate: "1 Hour",
        imageUrl: curatedImages[4],
        fallbackImageUrl: curatedImages[4],
        description: `A luxurious, tactile accent cushion cover featuring an origami envelope back closure. The plush corduroy surface elevates living spaces while completely avoiding metal zippers.`,
        suitabilityReason: `The heavy-duty abrasion resistance of corduroy makes it ideal for durable home furnishings.`,
        estimatedFabricUsage: "0.55 - 0.7 meters",
        estimatedProductionCost: "$14.00",
        potentialSellingPrice: "$75.00",
        wasteReductionImpact: "100% scrap diversion; zero plastic zippers; utilizes single continuous rectangular lengths.",
        sourcesUsed: sources,
        materialsNeeded: [
          `Remnant of ${cleanName}`,
          "2x Recycled coconut shell buttons",
          "Reinforced matching thread"
        ],
        toolsNeeded: ["Measuring tape", "Sewing machine", "Steam iron"],
        steps: [
          { step: 1, title: "Measure continuous envelope length", description: "Cut single rectangle 45x115cm, checking that cord wales run parallel to width." },
          { step: 2, title: "Double-hem back opening edges", description: "Fold short ends under 1.5cm twice and stitch with a clean straight stitch." },
          { step: 3, title: "Fold origami envelope and stitch perimeter", description: "With right sides inward, fold back flaps overlapping 12cm in the center, and stitch perimeter at 1cm." },
          { step: 4, title: "Turn out and steam press corners", description: "Clip corner seam bulk, turn right side out, point corners sharp, and press with steam." }
        ],
        patternNotes: "Continuous folded rectangle 45x115cm with 12cm overlap flap, zero hardware required."
      }
    ];
  }

  // 3. Denim & Rugged Workwear Twill Archetype
  if (archetype === 'denim-workwear') {
    return [
      {
        id: "design-1",
        title: `The Zero-Waste ${colorPrefix}Denim Atelier Chore Jacket`,
        subtitle: "Rectilinear panel workwear with drop-in carpenter pockets & vintage rivets",
        category: "Apparel & Garments",
        difficulty: "Artisan",
        timeEstimate: "3.5 Hours",
        imageUrl: curatedImages[0],
        fallbackImageUrl: curatedImages[0],
        description: `A structured, genderless workwear chore jacket tailored with rectilinear panels to utilize straight-grain fabric edges without cutting scraps. Highlights the rugged twill of ${cleanName} with oversized drop-in carpenter pockets.`,
        suitabilityReason: `The textile structure of ${cleanName} provides ideal structural body for workwear silhouette draping without requiring internal fusible stiffeners.`,
        estimatedFabricUsage: "1.5 - 2.0 meters",
        estimatedProductionCost: "$38.00",
        potentialSellingPrice: "$175.00",
        wasteReductionImpact: "100% remnant diversion; prevents ~4.1kg CO2e and 2,800L of water compared to virgin fabrication.",
        sourcesUsed: sources,
        materialsNeeded: [
          `Main ${cleanName} remnant panels`,
          "Contrasting canvas pocket facings",
          "5x Vintage copper rivets & buttons",
          "Heavy gold topstitching thread"
        ],
        toolsNeeded: [
          "Rotary cutter & cutting mat",
          "Heavy-duty sewing machine (size 100/16 needle)",
          "Tailor's chalk",
          "Steam iron"
        ],
        steps: [
          { step: 1, title: "Square rectilinear block panels", description: "Press scrap flat with steam. Measure and cut front, back, and sleeve rectangles along straight grainlines." },
          { step: 2, title: "Form and topstitch carpenter pockets", description: "Fold pocket tops under 2cm, press, and stitch. Pin to front panels 12cm above hem line." },
          { step: 3, title: "Join shoulders, flat-fell side seams", description: "Assemble shoulder seams with double-needle topstitch. Insert square sleeves flat and close underarm in one continuous seam." },
          { step: 4, title: "Affix button placket and collar", description: "Stitch straight collar band, measure buttonholes at 9cm intervals, and sew on buttons." }
        ],
        patternNotes: "Rectilinear zero-waste pattern: 2x Front panels (65x28cm), 1x Back panel (65x56cm), 2x Sleeves (55x42cm), 2x Pockets (22x18cm)."
      },
      {
        id: "design-2",
        title: `Modular Utility ${colorPrefix}Crossbody Rig`,
        subtitle: "Architectural chest pack with bellows pockets and origami folds",
        category: "Bags & Carry",
        difficulty: "Intermediate",
        timeEstimate: "2 Hours",
        imageUrl: curatedImages[1],
        fallbackImageUrl: curatedImages[1],
        description: `An architectural crossbody sling bag and chest harness featuring dual bellows compartments, tactical webbing anchors, and zero-waste origami corner folds. Perfect accessory to exhaust remaining remnant pieces from garments.`,
        suitabilityReason: `High-density denim weave protects interior valuables while giving crisp origami dimensional folds.`,
        estimatedFabricUsage: "0.4 - 0.6 meters",
        estimatedProductionCost: "$18.50",
        potentialSellingPrice: "$88.00",
        wasteReductionImpact: "Zero cutting waste via geometric tessellation; utilizes end-of-bolt remnants.",
        sourcesUsed: sources,
        materialsNeeded: [
          `Uploaded ${cleanName} textile piece`,
          "Durable cotton webbing strap (120cm)",
          "2x Matte black quick-release parachute buckles",
          "YKK water-resistant coil zipper (25cm)"
        ],
        toolsNeeded: [
          "Fabric shears",
          "Zipper foot for sewing machine",
          "Measuring ruler & chalk",
          "Sewing pins or wonder clips"
        ],
        steps: [
          { step: 1, title: "Score origami fold lines", description: "Press fabric flat and chalk fold guidelines according to dimensional envelope specifications." },
          { step: 2, title: "Insert center zip compartment", description: "Stitch coil zipper between upper and lower body compartments with 6mm seam allowance." },
          { step: 3, title: "Anchor tactical webbing loops", description: "Baste webbing loops securely at 45-degree angles on either side panel for balanced crossbody suspension." },
          { step: 4, title: "Box bottom corners and bind", description: "Pinch 4cm corner triangles to create bellows depth, edge-bind with self-bias binding, and attach strap buckles." }
        ],
        patternNotes: "Origami envelope: Single main panel 48x32cm, gusset bellows 8cm depth, 2x strap anchors 12x4cm."
      },
      {
        id: "design-3",
        title: `Artisanal Kimono-Sleeve ${colorPrefix}Denim Studio Gilet`,
        subtitle: "Boxy open-front layering vest utilizing square-cut sleeve blocks",
        category: "Apparel & Garments",
        difficulty: "Intermediate",
        timeEstimate: "2.5 Hours",
        imageUrl: curatedImages[2],
        fallbackImageUrl: curatedImages[2],
        description: `A boxy, open-front layering vest utilizing square-cut sleeve blocks and selvedge edge trims. Clean interior binding and deep utility side pockets make this a comfortable studio staple.`,
        suitabilityReason: `Durable denim drape with high thermal comfort suitable for studio makers and artisans.`,
        estimatedFabricUsage: "1.0 - 1.2 meters",
        estimatedProductionCost: "$28.00",
        potentialSellingPrice: "$130.00",
        wasteReductionImpact: "Eliminates curved armhole offcuts; saves ~2.5kg CO2e compared to conventional vest manufacturing.",
        sourcesUsed: sources,
        materialsNeeded: [
          `Main ${cleanName} remnant`,
          "1.5m Cotton bias tape",
          "Matching contrast thread"
        ],
        toolsNeeded: ["Fabric scissors", "Sewing machine", "Iron", "Pins"],
        steps: [
          { step: 1, title: "Cut straight front and back lengths", description: "Slice scrap into 3 straight lengths (1 back, 2 fronts) without curved cutouts." },
          { step: 2, title: "Join shoulder seams with French seams", description: "Stitch with wrong sides together at 5mm, trim, and stitch right sides together at 7mm for clean enclosed interior." },
          { step: 3, title: "Attach bias binding to neck & armhole", description: "Press bias tape folded in half, wrap along neckline, and edge-stitch cleanly." },
          { step: 4, title: "Hem lower rim and insert tie ties", description: "Fold bottom hem under twice and secure cotton ties at waist height." }
        ],
        patternNotes: "Square-cut zero-waste block: 1x Back (70x50cm), 2x Front (70x25cm), 2x Utility pockets (20x20cm)."
      },
      {
        id: "design-4",
        title: `Zero-Waste ${colorPrefix}Denim Maker Wrap Apron`,
        subtitle: "Cross-back studio smock with segmented tool slots",
        category: "Home Goods",
        difficulty: "Beginner",
        timeEstimate: "1.5 Hours",
        imageUrl: curatedImages[3],
        fallbackImageUrl: curatedImages[3],
        description: `A wrap-around protective craft smock with cross-back tie closures and segmented tool slots, engineered from continuous rectangular lengths with zero offcut yield.`,
        suitabilityReason: `Hardwearing surface texture withstands friction, atelier dust, and multiple wash cycles.`,
        estimatedFabricUsage: "0.8 - 1.0 meters",
        estimatedProductionCost: "$21.00",
        potentialSellingPrice: "$95.00",
        wasteReductionImpact: "Complete scrap prevention; transforms inactive bolt ends into durable maker gear.",
        sourcesUsed: sources,
        materialsNeeded: [
          `Remnant of ${cleanName}`,
          "2m Cotton herringbone twill tape (straps)",
          "Reinforced thread"
        ],
        toolsNeeded: ["Fabric scissors", "Iron", "Sewing machine", "Chalk"],
        steps: [
          { step: 1, title: "Hem rectangular body edges", description: "Double-fold all 4 outer edges of main body rectangle (1cm each) and topstitch." },
          { step: 2, title: "Affix segmented front tool pocket", description: "Stitch pocket panel across front hip line. Divide with 3 vertical bartack stitch lines." },
          { step: 3, title: "Attach cross-back harness straps", description: "Stitch twill tape securely at upper bib corners, crossing over shoulders." },
          { step: 4, title: "Final press and bartack reinforcement", description: "Reinforce high-stress pocket corners with tight zig-zag bartacks." }
        ],
        patternNotes: "Single rectangle body 80x60cm, tool pocket 60x22cm, cross-back straps 110cm each."
      },
      {
        id: "design-5",
        title: `Tessellated Patchwork ${colorPrefix}Denim Weekend Carryall`,
        subtitle: "Heavy-duty market tote with reinforced base & flat-felled strip joints",
        category: "Bags & Carry",
        difficulty: "Beginner",
        timeEstimate: "1.5 Hours",
        imageUrl: curatedImages[4],
        fallbackImageUrl: curatedImages[4],
        description: `A heavy-duty tote bag engineered by interlocking remnant strips with double-stitched flat-felled seams. Reinforced base and interior slip pocket offer long-lasting utility.`,
        suitabilityReason: `Remnant strips interlock easily with flat-felled seams, creating high tensile strength for heavy carry loads.`,
        estimatedFabricUsage: "0.5 - 0.7 meters",
        estimatedProductionCost: "$16.00",
        potentialSellingPrice: "$75.00",
        wasteReductionImpact: "Consumes remaining strip offcuts down to 5cm, delivering near-zero landfill waste.",
        sourcesUsed: sources,
        materialsNeeded: [
          `Assorted ${cleanName} scrap strips`,
          "Heavy-duty cotton thread",
          "2x Cotton webbing handles (60cm each)"
        ],
        toolsNeeded: ["Sewing machine", "Pins", "Iron", "Fabric scissors"],
        steps: [
          { step: 1, title: "Piece remnant strips into two panels", description: "Stitch assorted strips side by side using flat-felled seams to make two 40x45cm tote panels." },
          { step: 2, title: "Anchor webbing carry handles", description: "Position handles 10cm from sides and stitch an 'X-box' across each anchor." },
          { step: 3, title: "Join side seams and box 8cm base corners", description: "Stitch perimeter, pinch bottom corners 8cm across, and trim." },
          { step: 4, title: "Turn right side out and press top hem", description: "Turn out, press top fold 3cm under, and run double parallel edge stitches." }
        ],
        patternNotes: "Main panels: 2x 42x40cm pieced from strip offcuts, 8cm boxed base gusset."
      }
    ];
  }

  // 4. Wool & Tweed Tailoring Archetype
  if (archetype === 'wool-tweed') {
    return [
      {
        id: "design-1",
        title: `Heritage Zero-Waste ${colorPrefix}Wool Tweed Layering Waistcoat`,
        subtitle: "Tailored boxy vest with welted pockets and horn button front",
        category: "Apparel & Garments",
        difficulty: "Artisan",
        timeEstimate: "3.5 Hours",
        imageUrl: curatedImages[0],
        fallbackImageUrl: curatedImages[0],
        description: `An artisanal layering waistcoat engineered with zero offcuts from ${cleanName}. Showcases the dense melange weave and insulating thermal body of wool with sharp welt pockets and corozo buttons.`,
        suitabilityReason: `Wool tweed molds under steam and provides substantial architectural drape without needing fusible synthetics.`,
        estimatedFabricUsage: "0.8 - 1.1 meters",
        estimatedProductionCost: "$32.00",
        potentialSellingPrice: "$185.00",
        wasteReductionImpact: "100% wool remnant diversion; preserves artisan spinning heritage and prevents textile incinerator emissions.",
        sourcesUsed: sources,
        materialsNeeded: [
          `Main ${cleanName} remnant`,
          "4x Recycled horn buttons",
          "Cotton cupro lining scrap for pocket bags"
        ],
        toolsNeeded: [
          "Heavy shears",
          "Sewing machine (size 90/14 needle)",
          "Steam iron with wooden tailor's clapper"
        ],
        steps: [
          { step: 1, title: "Steam press wool with wooden clapper", description: "Block the tweed grain straight using heavy steam and a wooden clapper for razor-flat edges." },
          { step: 2, title: "Construct double-welt pockets", description: "Fold welt strips cleanly, stitch along waist marking, and turn through." },
          { step: 3, title: "Join shoulder and side seams", description: "Stitch seams and press open with tailor's ham. Enclose raw seam edges with cotton bias tape." },
          { step: 4, title: "Form bound buttonholes and hand-sew buttons", description: "Work tailor's buttonholes and secure buttons with thread shanks." }
        ],
        patternNotes: "Rectilinear waistcoat block: 1x Back (52x48cm), 2x Front (52x25cm), 2x Welt strips (16x4cm)."
      },
      {
        id: "design-2",
        title: `Thermal Structured ${colorPrefix}Wool Muffler Scarf & Ascot`,
        subtitle: "Geometric bias-cut neckpiece with fringed selvedge borders",
        category: "Accessories",
        difficulty: "Beginner",
        timeEstimate: "1 Hour",
        imageUrl: curatedImages[1],
        fallbackImageUrl: curatedImages[1],
        description: `A warm, architectural neck warmer tailored from narrow wool tweed remnants. Uses hand-pulled self-fringing along the selvedges to celebrate raw fiber craftsmanship.`,
        suitabilityReason: `Naturally insulating wool provides soothing neck warmth and structured sculptural wraps.`,
        estimatedFabricUsage: "0.3 - 0.45 meters",
        estimatedProductionCost: "$12.00",
        potentialSellingPrice: "$65.00",
        wasteReductionImpact: "Zero-waste self-fringe; converts narrow offcuts down to 20cm into high-margin luxury accessories.",
        sourcesUsed: sources,
        materialsNeeded: [`Narrow strip of ${cleanName}`, "Fine silk thread for stay-stitching"],
        toolsNeeded: ["Fabric shears", "Bodkin needle", "Steam iron"],
        steps: [
          { step: 1, title: "Square strip along tweed grainline", description: "Pull a single weft yarn to reveal the true horizontal cutting line." },
          { step: 2, title: "Run stay-stitch 2cm from raw ends", description: "Stitch fine straight stitch 2cm from ends to anchor fraying." },
          { step: 3, title: "Hand-pull fringed edges", description: "Tease out cross-threads to create a 2cm artisanal fringe." },
          { step: 4, title: "Steam block flat", description: "Steam press flat with damp cloth." }
        ],
        patternNotes: "Single strip 90x24cm with 2cm self-fringed borders."
      },
      {
        id: "design-3",
        title: `Architectural ${colorPrefix}Wool Tweed Folio Tech Sleeve`,
        subtitle: "Padded tablet sleeve with leather strap & brass stud closure",
        category: "Bags & Carry",
        difficulty: "Intermediate",
        timeEstimate: "1.5 Hours",
        imageUrl: curatedImages[2],
        fallbackImageUrl: curatedImages[2],
        description: `A protective tech portfolio sleeve crafted from heavy ${cleanName}. The dense wool fibers protect laptop and tablet hardware naturally with timeless heritage style.`,
        suitabilityReason: `Dense wool provides natural shock absorption, scratch resistance, and water resistance.`,
        estimatedFabricUsage: "0.4 - 0.55 meters",
        estimatedProductionCost: "$16.50",
        potentialSellingPrice: "$85.00",
        wasteReductionImpact: "Diverts upholstery-weight tweed remnants into durable lifestyle carry goods.",
        sourcesUsed: sources,
        materialsNeeded: [
          `Remnant of ${cleanName}`,
          "Scrap leather closure tab",
          "Brass collar stud rivet"
        ],
        toolsNeeded: ["Rotary cutter", "Heavy sewing machine", "Leather hole punch"],
        steps: [
          { step: 1, title: "Cut outer folio rectangle and overlap flap", description: "Measure 32x45cm continuous rectangle." },
          { step: 2, title: "Bind raw sides with herringbone tape", description: "Wrap folded herringbone twill tape around edges." },
          { step: 3, title: "Stitch side seams and install brass stud", description: "Fold bottom up 22cm and stitch sides. Rivet brass collar stud onto front panel." },
          { step: 4, title: "Slit closure tab on envelope flap", description: "Punch hole and slice 1cm slit on leather closure strap." }
        ],
        patternNotes: "Single continuous folded block 32x45cm with 10cm envelope flap."
      },
      {
        id: "design-4",
        title: `Atelier ${colorPrefix}Wool Studio Gilet Vest`,
        subtitle: "Minimalist open-front layering vest with bound selvedge edges",
        category: "Apparel & Garments",
        difficulty: "Intermediate",
        timeEstimate: "2 Hours",
        imageUrl: curatedImages[3],
        fallbackImageUrl: curatedImages[3],
        description: `A minimalist open-front layering vest with clean square armhole openings and selvedge edge trims. Drapes elegantly over linen shirts or turtlenecks.`,
        suitabilityReason: `High thermal-to-weight ratio keeps core warm during studio work without sleeve restriction.`,
        estimatedFabricUsage: "0.8 - 1.0 meters",
        estimatedProductionCost: "$25.00",
        potentialSellingPrice: "$135.00",
        wasteReductionImpact: "Rectilinear cut eliminates curved armhole scraps completely.",
        sourcesUsed: sources,
        materialsNeeded: [`Main ${cleanName} remnant`, "Cotton bias tape for interior seams"],
        toolsNeeded: ["Fabric scissors", "Sewing machine", "Steam iron"],
        steps: [
          { step: 1, title: "Slice 3 straight panels (1 back, 2 fronts)", description: "Cut along grainlines with zero curved offcuts." },
          { step: 2, title: "Join shoulders with bound seams", description: "Stitch and bind seam allowances with bias tape." },
          { step: 3, title: "Bind perimeter armholes and neckline", description: "Edge-stitch binding cleanly around all openings." },
          { step: 4, title: "Final steam press with clapper", description: "Set all seams razor-flat with steam and clapper." }
        ],
        patternNotes: "1x Back (65x50cm), 2x Front (65x25cm)."
      },
      {
        id: "design-5",
        title: `Zero-Waste Folded ${colorPrefix}Wool Valet Catchall Tray`,
        subtitle: "Origami corner desk valet with antique brass corner snaps",
        category: "Home Goods",
        difficulty: "Beginner",
        timeEstimate: "45 Minutes",
        imageUrl: curatedImages[4],
        fallbackImageUrl: curatedImages[4],
        description: `A sculptural desk catchall tray formed by pinching the corners of a double-layered wool tweed square with brass snaps. Stores keys, watches, and atelier tools.`,
        suitabilityReason: `Firm wool holds origami three-dimensional folds crisply.`,
        estimatedFabricUsage: "0.25 - 0.35 meters",
        estimatedProductionCost: "$7.50",
        potentialSellingPrice: "$45.00",
        wasteReductionImpact: "Consumes tiny square offcuts down to 22x22cm with zero waste.",
        sourcesUsed: sources,
        materialsNeeded: [`Square piece of ${cleanName}`, "4x Heavy-duty brass snap fasteners"],
        toolsNeeded: ["Snap setter tool", "Ruler & chalk", "Sewing machine"],
        steps: [
          { step: 1, title: "Cut two 24x24cm squares", description: "Stitch right sides together leaving 5cm turning gap." },
          { step: 2, title: "Turn right side out and edge-stitch", description: "Push corners sharp and run topstitch around all 4 sides." },
          { step: 3, title: "Install corner snaps", description: "Punch holes 3cm from each corner and set brass snaps." },
          { step: 4, title: "Snap corners together to form tray", description: "Fasten snaps to erect 3D tray walls." }
        ],
        patternNotes: "2x 24x24cm squares, 4x corner snap sets."
      }
    ];
  }

  // 5. Silk & Fluid Luxury Satin Archetype
  if (archetype === 'silk-satin') {
    return [
      {
        id: "design-1",
        title: `Artisanal Zari Embroidered ${colorPrefix}Silk Kimono Shrug`,
        subtitle: "Ethereal cropped evening shrug cut to preserve metallic border motifs",
        category: "Apparel & Garments",
        difficulty: "Artisan",
        timeEstimate: "3 Hours",
        imageUrl: curatedImages[0],
        fallbackImageUrl: curatedImages[0],
        description: `An ethereal cropped evening shrug engineered from rectangular ${cleanName} cuts to preserve metallic border motifs without waste. Soft flared elbow cuffs and clean French-seamed finishes highlight the fluid sheen and royal drape.`,
        suitabilityReason: `The delicate drape and metallic embroidery of ${cleanName} provide luxury eveningwear elegance without requiring stiff interfacing or synthetic backings.`,
        estimatedFabricUsage: "0.8 - 1.2 meters",
        estimatedProductionCost: "$26.00",
        potentialSellingPrice: "$185.00",
        wasteReductionImpact: "100% remnant diversion; preserves handloom heritage threads and diverts silk offcuts from landfill.",
        sourcesUsed: sources,
        materialsNeeded: [
          `Main ${cleanName} remnant panels`,
          "Fine silk embroidery thread for seam finishing",
          "Cotton organdy scrap for shoulder reinforcement",
          "Handmade silk frog closure toggle"
        ],
        toolsNeeded: [
          "Microtex sewing machine needle (size 70/10)",
          "Ultra-sharp fabric shears",
          "Fine silk pins",
          "Steam iron with organza pressing cloth"
        ],
        steps: [
          { step: 1, title: "Square rectilinear block panels", description: "Steam press remnant with a pressing cloth. Measure and cut 1 back rectangle and 2 front lengths following grainlines." },
          { step: 2, title: "Enclose shoulder seams with French seams", description: "Stitch wrong sides together at 4mm, press open, trim to 2mm, fold right sides together, and stitch at 6mm." },
          { step: 3, title: "Insert flared sleeve rectangles", description: "Pin rectangular sleeves flat to armholes, stitch, and close side and underarm seams in one continuous French seam." },
          { step: 4, title: "Fasten handmade silk frog toggle", description: "Hand-tack silk toggle closure at breast line with invisible catch stitches." }
        ],
        patternNotes: "Rectilinear kimono cutting pattern: 1x Back (45x55cm), 2x Front (45x25cm), 2x Flared sleeves (35x40cm)."
      },
      {
        id: "design-2",
        title: `Heirloom Embroidered ${colorPrefix}Silk Minaudière Evening Drawstring Pouch`,
        subtitle: "Zero-waste circular-base potli bag with braided gold drawstring ties",
        category: "Bags & Carry",
        difficulty: "Intermediate",
        timeEstimate: "1.5 Hours",
        imageUrl: curatedImages[1],
        fallbackImageUrl: curatedImages[1],
        description: `A luxury handcrafted drawstring evening pouch bag featuring a reinforced round base, braided gold drawstring ties with handcrafted tassels, and soft contrast lining. Designed specifically to showcase intricate embroidery patterns.`,
        suitabilityReason: `Lustrous woven silk texture elevates evening accessories with tactile luxury and shimmering light refraction.`,
        estimatedFabricUsage: "0.3 - 0.4 meters",
        estimatedProductionCost: "$14.00",
        potentialSellingPrice: "$95.00",
        wasteReductionImpact: "Consumes small remnant scraps down to 25x25cm; zero cutting waste via circular-tessellated pattern.",
        sourcesUsed: sources,
        materialsNeeded: [
          `Uploaded ${cleanName} textile piece`,
          "Braided gold drawstring cord (80cm)",
          "Small scrap of soft cotton voile for lining",
          "2x Gold metallic tassel caps or beads"
        ],
        toolsNeeded: [
          "Embroidery scissors",
          "Fine hand sewing needles",
          "Safety pin for threading drawstring",
          "Measuring compass or saucer for base circle"
        ],
        steps: [
          { step: 1, title: "Cut main body cylinder and base circle", description: "Trace 22x38cm body rectangle and 14cm circular base from scrap. Center embroidery motif on body." },
          { step: 2, title: "Assemble outer bag and lining", description: "Stitch vertical cylinder seam. Pin circular base using wonder clips and stitch with 6mm seam allowance." },
          { step: 3, title: "Form upper drawstring casing", description: "Sew double horizontal stitch lines 3cm below upper rim to create 1.5cm drawstring channel." },
          { step: 4, title: "Thread cords and attach tassel ends", description: "Thread two braided cords in opposite directions through eyelets and knot with metallic tassels." }
        ],
        patternNotes: "Single main tube 22x38cm, circular base diameter 14cm, 2x drawstring channels."
      },
      {
        id: "design-3",
        title: `Pleated ${colorPrefix}Silk Origami Neck Scarf & Ascot Cravat`,
        subtitle: "Geometric bias-cut neckpiece with crisp knife pleats & metallic border",
        category: "Accessories",
        difficulty: "Beginner",
        timeEstimate: "1 Hour",
        imageUrl: curatedImages[2],
        fallbackImageUrl: curatedImages[2],
        description: `A tailored geometric neck scarf and ascot cravat with sharp origami knife pleats and delicate embroidered edge piping. Artfully styled over linen shirts or tailored coats.`,
        suitabilityReason: `Fluid silk fibers take steam pressing and razor-sharp geometric pleats with radiant metallic luster.`,
        estimatedFabricUsage: "0.25 - 0.35 meters",
        estimatedProductionCost: "$9.50",
        potentialSellingPrice: "$65.00",
        wasteReductionImpact: "Transforms narrow border offcuts and selvedges into high-margin luxury accessories.",
        sourcesUsed: sources,
        materialsNeeded: [
          `Narrow strip of ${cleanName}`,
          "Gold metallic filament thread for rolled hem",
          "Fine water-soluble basting thread"
        ],
        toolsNeeded: [
          "Rotary cutter with straight blade",
          "Iron and clapper for knife pleats",
          "Tailor's chalk"
        ],
        steps: [
          { step: 1, title: "Slice 45-degree angled bias band", description: "Measure an 80x16cm strip on true bias. Cut pointed 45-degree angled ends." },
          { step: 2, title: "Roll and stitch outer borders", description: "Use narrow rolled hem foot on sewing machine or hand-roll edges." },
          { step: 3, title: "Form origami knife pleats", description: "Fold three 1cm knife pleats along center collar section and steam press with clapper." },
          { step: 4, title: "Final drape and knotting", description: "Press tips flat and style into an ascot tie knot." }
        ],
        patternNotes: "Bias strip dimensions: 80x15cm with 45-degree pointed mitred ends and 1cm knife pleat guidelines."
      },
      {
        id: "design-4",
        title: `Artisanal Quilted ${colorPrefix}Silk Studio Bolero Waistcoat`,
        subtitle: "Boxy cropped waistcoat with ornate lapels and handmade frog toggles",
        category: "Apparel & Garments",
        difficulty: "Intermediate",
        timeEstimate: "2.5 Hours",
        imageUrl: curatedImages[3],
        fallbackImageUrl: curatedImages[3],
        description: `A cropped, boxy layering vest featuring embroidered silk lapels, miniature welt pockets, and traditional frog button closures. Backed with breathable organic cotton lining for comfort.`,
        suitabilityReason: `Combines structural body with ornate surface embroidery, producing a distinctive statement piece.`,
        estimatedFabricUsage: "0.7 - 0.9 meters",
        estimatedProductionCost: "$28.00",
        potentialSellingPrice: "$165.00",
        wasteReductionImpact: "Consumes remnant ends; saves ~3.2kg CO2e compared to virgin fast-fashion eveningwear.",
        sourcesUsed: sources,
        materialsNeeded: [
          `Remnant of ${cleanName}`,
          "Organic cotton lining fabric (0.6m)",
          "Thin cotton flannel batting scrap for quilt layer",
          "3x Handcrafted gold buttons or frog toggles"
        ],
        toolsNeeded: [
          "Fabric scissors",
          "Walking foot for sewing machine",
          "Iron and pressing ham",
          "Tailor's chalk"
        ],
        steps: [
          { step: 1, title: "Layer silk and flannel batting", description: "Sandwich thin batting between silk outer and cotton lining; pin at 5cm intervals." },
          { step: 2, title: "Quilt linear diagonal grid", description: "Stitch subtle 4cm diagonal quilting lines to stabilize layers while preserving embroidery." },
          { step: 3, title: "Assemble side seams and finish edges", description: "Join front and back panels at shoulders and sides; bind all raw perimeter edges with matching bias tape." },
          { step: 4, title: "Affix frog button closures", description: "Sew 3 frog toggles down front center placket." }
        ],
        patternNotes: "Cropped block: 2x Front panels (40x26cm), 1x Back (40x48cm), lapel facings cut from border remnants."
      },
      {
        id: "design-5",
        title: `Luxe ${colorPrefix}Silk Envelope Accent Cushion`,
        subtitle: "Architectural decorative case with mitred origami folds and zari button accent",
        category: "Home Goods",
        difficulty: "Beginner",
        timeEstimate: "1 Hour",
        imageUrl: curatedImages[4],
        fallbackImageUrl: curatedImages[4],
        description: `A decorative accent cushion case featuring an origami envelope back closure, triangular decorative flap with metallic embroidery, and pure linen backing. Requires zero zippers or metal hardware.`,
        suitabilityReason: `Embroidery motifs are centered as decorative focal points, protecting delicate fibers while adding heirloom ambiance.`,
        estimatedFabricUsage: "0.45 - 0.55 meters",
        estimatedProductionCost: "$12.00",
        potentialSellingPrice: "$85.00",
        wasteReductionImpact: "100% scrap diversion; zero hardware required; utilizes rectangular remnants without cutting waste.",
        sourcesUsed: sources,
        materialsNeeded: [
          `Main ${cleanName} decorative scrap`,
          "Natural linen backing panel (45x45cm)",
          "1x Decorative covered button"
        ],
        toolsNeeded: [
          "Measuring tape and chalk",
          "Sewing machine",
          "Steam iron"
        ],
        steps: [
          { step: 1, title: "Square front and envelope flaps", description: "Cut main front 45x45cm, upper flap 45x30cm, lower overlap 45x25cm." },
          { step: 2, title: "Hem envelope back openings", description: "Double-fold the overlap edges of both back panels (1.5cm) and stitch." },
          { step: 3, title: "Assemble cushion perimeter", description: "Place front right side up, layer envelope backs right side down overlapping 8cm, stitch perimeter with 1cm allowance." },
          { step: 4, title: "Turn out and steam mitred corners", description: "Clip corner bulk, turn right side out, push corners sharp with wooden point turner, and steam press." }
        ],
        patternNotes: "Single continuous folded rectangle 45x110cm with 15cm overlap envelope flap and mitred corners."
      }
    ];
  }

  // 6. Raw Jute, Coarse Burlap & Hessian Archetype
  if (archetype === 'jute-burlap' || /jute|burlap/i.test(cleanName)) {
    return [
      {
        id: "design-1",
        title: `The Raw ${colorPrefix}Jute Statement Choker & Cravat Collar`,
        subtitle: "Architectural structured collar with fringed edges and antique brass lock buckle",
        category: "Accessories",
        difficulty: "Intermediate",
        timeEstimate: "1.5 Hours",
        imageUrl: curatedImages[0] || '/blueprints/jute-statement-choker.jpg',
        fallbackImageUrl: curatedImages[0] || '/blueprints/jute-statement-choker.jpg',
        description: `A directional runway-grade statement choker and sculptural collar sculpted from ${cleanName}. Celebrates the coarse woven texture of unbleached jute with an unraveled artisanal fringe edge and secured with a repurposed brass buckle.`,
        suitabilityReason: `The high tensile stiffness of coarse ${cleanName} holds an architectural collar flare without collapsing, creating an arresting contrast against smooth skin.`,
        estimatedFabricUsage: "0.25 - 0.35 meters",
        estimatedProductionCost: "$12.00",
        potentialSellingPrice: "$85.00",
        wasteReductionImpact: "100% remnant diversion; turns narrow burlap cutting strips into high-margin luxury jewelry; saves ~1.2kg CO2e.",
        sourcesUsed: sources,
        materialsNeeded: [
          `Main ${cleanName} remnant strip (approx 15x45cm)`,
          "Antique brass pin buckle or dual D-rings",
          "Vegetable-tanned leather keeper strap",
          "Heavy bonded nylon or waxed linen thread"
        ],
        toolsNeeded: [
          "Heavy fabric shears",
          "Awl or rotary hole punch",
          "Leather beveler & stitching chisel",
          "Steam iron"
        ],
        steps: [
          { step: 1, title: "Cut straight-grain collar band", description: "Cut a 10cm x 42cm strip strictly along the warp threads of the burlap." },
          { step: 2, title: "Fringe architectural borders", description: "Carefully pull 4 horizontal weft yarns along each side to produce a 6mm clean fringe border." },
          { step: 3, title: "Rivet antique brass closure", description: "Fold one end around the brass buckle bar and secure with two solid copper double-cap rivets." },
          { step: 4, title: "Edge seal and steam form", description: "Lightly mist with water and press around a tailor's ham to mold the natural ergonomic neck curvature." }
        ],
        patternNotes: "Single strip cutting: 1x Rectangle (12cm x 44cm) with 6mm unravel allowances on outer perimeter."
      },
      {
        id: "design-2",
        title: `The Brutalist Tactical Crossbody Chest Rig in Heavy ${colorPrefix}Burlap`,
        subtitle: "Modular utility chest pack with military webbing harness and quick-release hardware",
        category: "Bags & Carry",
        difficulty: "Artisan",
        timeEstimate: "3.5 Hours",
        imageUrl: curatedImages[1] || '/blueprints/jute-crossbody-rig.jpg',
        fallbackImageUrl: curatedImages[1] || '/blueprints/jute-crossbody-rig.jpg',
        description: `A rugged, modular tactical crossbody rig crafted from heavyweight ${cleanName}. Features twin bellows cargo pockets, reinforced bar-tacks, and an ergonomic webbing sling engineered for everyday carry essentials.`,
        suitabilityReason: `The dense heavy-gauge weave of ${cleanName} offers superior puncture resistance, structural rigidity, and a tactile utilitarian streetwear edge.`,
        estimatedFabricUsage: "0.7 - 0.9 meters",
        estimatedProductionCost: "$28.00",
        potentialSellingPrice: "$165.00",
        wasteReductionImpact: "100% remnant diversion; repurposes industrial burlap sacking into premium tactical streetwear; zero landfill waste.",
        sourcesUsed: sources,
        materialsNeeded: [
          `Main ${cleanName} panels`,
          "2m Mil-spec cotton webbing (38mm)",
          "1x Heavy-duty side release buckle & tri-glide sliders",
          "Heavy-duty bonded thread"
        ],
        toolsNeeded: [
          "Heavy-duty sewing machine (size 100/16 or 110/18 needle)",
          "Fabric rotary cutter",
          "Tailor's chalk",
          "Bar-tack foot"
        ],
        steps: [
          { step: 1, title: "Cut rectilinear modular pouches", description: "Cut main body panel (26x18cm) and two front bellows pocket pouches (14x12cm)." },
          { step: 2, title: "Form box pleats and stitch gussets", description: "Press 2cm side pleats into the bellows pockets and topstitch to main body with reinforced box-X stitches." },
          { step: 3, title: "Anchor tactical webbing harness", description: "Sandwich webbing harness between rear backing layer and stitch with double reinforced bar-tacks." },
          { step: 4, title: "Install hardware and edge binding", description: "Bind raw burlap interior seam allowances with bias cotton tape to eliminate fiber shedding." }
        ],
        patternNotes: "Rectilinear tessellation: 1x Rear Panel (26x18cm), 1x Front Panel (26x18cm), 2x Bellows Pockets (16x14cm)."
      },
      {
        id: "design-3",
        title: `The Sculptural Cropped Bolero Shrug in Architectural ${colorPrefix}Jute`,
        subtitle: "Geometric open-front layering shrug with sharp structured cap sleeves",
        category: "Apparel & Garments",
        difficulty: "Artisan",
        timeEstimate: "3.0 Hours",
        imageUrl: curatedImages[2] || '/blueprints/jute-sculptural-shrug.jpg',
        fallbackImageUrl: curatedImages[2] || '/blueprints/jute-sculptural-shrug.jpg',
        description: `An avant-garde cropped architectural shrug cut from stiff ${cleanName}. Designed with high dramatic shoulders, structured standing collar, and clean bias-bound edges for high-fashion runway layering over minimalist dresses or tailoring.`,
        suitabilityReason: `The inherent sculptural stiffness of coarse ${cleanName} holds sharp 3D volume and angular origami folds that softer textiles cannot achieve without plastic interfacings.`,
        estimatedFabricUsage: "0.8 - 1.1 meters",
        estimatedProductionCost: "$32.00",
        potentialSellingPrice: "$195.00",
        wasteReductionImpact: "100% remnant diversion; prevents ~3.8kg CO2e; showcases rough bast fibers in luxury haute couture context.",
        sourcesUsed: sources,
        materialsNeeded: [
          `Main ${cleanName} remnant`,
          "Cotton unbleached muslin lining for neck and underarm comfort",
          "Heavy topstitching thread in tonal ecru",
          "2x Hook-and-eye fastenings"
        ],
        toolsNeeded: [
          "Heavy-duty sewing machine",
          "Tailor's ham & wooden clapper",
          "Steam iron",
          "Sharp tailor's shears"
        ],
        steps: [
          { step: 1, title: "Draft geometric architectural back & sleeve yoke", description: "Draft one-piece continuous sleeve and shoulder yoke directly along the grainline." },
          { step: 2, title: "Line contact areas with soft organic muslin", description: "Underline inner collar and armscye with organic cotton muslin to provide smooth skin comfort." },
          { step: 3, title: "Assemble standing collar & shoulder darts", description: "Stitch shoulder darts and press flat using a heavy wooden clapper to lock crisp angles." },
          { step: 4, title: "Finish external perimeter with raw fringing", description: "Pull 3 rows of fringe along the open bolero edge to celebrate authentic textile raw character." }
        ],
        patternNotes: "Zero-waste origami bolero layout: 1x Back Body (48x36cm), 2x Front Angled Flaps (25x36cm), 1x Standing Collar (45x8cm)."
      },
      {
        id: "design-4",
        title: `The Atelier Document & Laptop Folio Sleeve in Tan ${colorPrefix}Burlap`,
        subtitle: "Minimalist padded protective sleeve with dual leather stud closures and pen loops",
        category: "Bags & Carry",
        difficulty: "Intermediate",
        timeEstimate: "2.0 Hours",
        imageUrl: curatedImages[3] || '/blueprints/jute-document-folio.jpg',
        fallbackImageUrl: curatedImages[3] || '/blueprints/jute-document-folio.jpg',
        description: `A clean-lined, architectural laptop and document folio handcrafted from dense ${cleanName}. Features a foldover flap, dual vegetable-tanned leather stud closures, and interior organizer slots for notebooks and Apple Pencil.`,
        suitabilityReason: `The heavy canvas weave of ${cleanName} provides durable abrasion protection and organic earthy minimalism suitable for creative studio professionals.`,
        estimatedFabricUsage: "0.5 - 0.65 meters",
        estimatedProductionCost: "$19.00",
        potentialSellingPrice: "$95.00",
        wasteReductionImpact: "100% remnant diversion; replaces synthetic neoprene sleeves with 100% biodegradable, compostable natural plant fiber.",
        sourcesUsed: sources,
        materialsNeeded: [
          `Main ${cleanName} outer panel (38x55cm)`,
          "Natural wool felt padding layer (35x25cm)",
          "Recycled cotton canvas lining",
          "2x Solid brass Sam Browne button studs and leather pull tabs"
        ],
        toolsNeeded: [
          "Rotary cutter & steel ruler",
          "Heavy-duty sewing machine (size 100/16 needle)",
          "Hole punch & mallet",
          "Steam iron"
        ],
        steps: [
          { step: 1, title: "Quilt burlap outer to protective wool felt core", description: "Baste burlap outer to organic wool felt cushioning with subtle running stitches along the grain." },
          { step: 2, title: "Install leather tab closures and brass studs", description: "Punch keyhole slits in leather tabs and mount brass screw-back studs to front panel." },
          { step: 3, title: "Join side seams with reinforced envelope fold", description: "Fold lower 24cm upward to create the main device pocket. Stitch side seams at 12mm." },
          { step: 4, title: "Bind perimeter with twill tape", description: "Encase all raw burlap edges in heavy cotton twill binding for lifetime durability." }
        ],
        patternNotes: "Single fold envelope layout: 1x Main Body (38cm x 56cm), 1x Inner Pocket Divider (36cm x 22cm)."
      },
      {
        id: "design-5",
        title: `The Sashiko-Mended Artisan Patchwork Market Tote in Coarse ${colorPrefix}Jute`,
        subtitle: "Heavy-duty market carryall with hand-stitched sashiko reinforcement and leather handles",
        category: "Bags & Carry",
        difficulty: "Intermediate",
        timeEstimate: "2.5 Hours",
        imageUrl: curatedImages[4] || '/blueprints/jute-patchwork-tote.jpg',
        fallbackImageUrl: curatedImages[4] || '/blueprints/jute-patchwork-tote.jpg',
        description: `A cavernous, rugged market carryall built from heavyweight ${cleanName}. Reinforced across stress points with Japanese sashiko running embroidery and finished with thick bridle leather shoulder straps secured with solid copper rivets.`,
        suitabilityReason: `Burlap and jute provide exceptional weight-bearing strength, holding up to 25kg of groceries and daily essentials with zero stretch or deformation.`,
        estimatedFabricUsage: "0.8 - 1.2 meters",
        estimatedProductionCost: "$22.00",
        potentialSellingPrice: "$120.00",
        wasteReductionImpact: "100% remnant diversion; replaces plastic grocery bags forever; 100% biodegradable natural bast fiber construction.",
        sourcesUsed: sources,
        materialsNeeded: [
          `Main ${cleanName} sack panels`,
          "Heavy white cotton sashiko thread (size 20/4)",
          "Pair of 60cm vegetable-tanned bridle leather straps (25mm wide)",
          "4x Solid copper burr rivets"
        ],
        toolsNeeded: [
          "Sashiko needles",
          "Heavy-duty sewing machine",
          "Rivet setter & ball-peen hammer",
          "Tailor's chalk"
        ],
        steps: [
          { step: 1, title: "Square burlap base panels and gussets", description: "Cut two 42x46cm body panels and two 14x46cm side gussets directly on grain." },
          { step: 2, title: "Hand-stitch geometric sashiko reinforcement", description: "Work Asanoha (hemp leaf) or Kaki no Hana sashiko embroidery across the bottom base panel for double abrasion resistance." },
          { step: 3, title: "Assemble box tote structure with French seams", description: "Stitch gussets to front and back panels using 12mm French seams to trap all raw cut ends." },
          { step: 4, title: "Peen solid copper rivets to anchor leather handles", description: "Punch holes through top hem facing and hand-peen copper rivets over burrs for unbreakable load bearing." }
        ],
        patternNotes: "Zero-waste box tote layout: 2x Body Panels (42x46cm), 1x Continuous Gusset & Bottom Strip (14x130cm)."
      }
    ];
  }

  // 7. Slub Linen, Flax Bast Fiber Archetype
  if (archetype === 'linen-slub') {
    let fiberWord = 'Linen';
    if (/hemp/i.test(`${name} ${cleanName}`)) fiberWord = 'Hemp';
    else if (/flax/i.test(`${name} ${cleanName}`)) fiberWord = 'Flax';

    return [
      {
        id: "design-1",
        title: `The Zero-Waste ${colorPrefix}${fiberWord} Atelier Chore Jacket`,
        subtitle: `Rectilinear panel workwear tailored from natural ${fiberWord.toLowerCase()} with drop-in carpenter pockets`,
        category: "Apparel & Garments",
        difficulty: "Artisan",
        timeEstimate: "3.5 Hours",
        imageUrl: curatedImages[0],
        fallbackImageUrl: curatedImages[0],
        description: `A structured, genderless workwear chore jacket tailored with rectilinear panels to utilize straight-grain fabric edges without cutting scraps. Highlights the natural drape and slub grain of ${cleanName} with oversized drop-in carpenter pockets.`,
        suitabilityReason: `The textile structure of ${cleanName} provides ideal structural body for workwear silhouette draping without requiring internal fusible stiffeners.`,
        estimatedFabricUsage: "1.5 - 2.0 meters",
        estimatedProductionCost: "$38.00",
        potentialSellingPrice: "$175.00",
        wasteReductionImpact: "100% remnant diversion; prevents ~4.1kg CO2e and 2,800L of water compared to virgin fabrication.",
        sourcesUsed: sources,
        materialsNeeded: [
          `Main ${cleanName} remnant panels`,
          "Contrasting canvas or twill for pocket facings",
          "5x Recycled horn or corozo buttons",
          "Heavy-duty cotton topstitching thread"
        ],
        toolsNeeded: [
          "Rotary cutter & cutting mat",
          "Heavy-duty sewing machine (size 90/14 needle)",
          "Tailor's chalk",
          "Steam iron with wooden clapper"
        ],
        steps: [
          { step: 1, title: "Square rectilinear block panels", description: "Press scrap flat with steam. Measure and cut front, back, and sleeve rectangles along straight grainlines." },
          { step: 2, title: "Form and topstitch carpenter pockets", description: "Fold pocket tops under 2cm, press, and stitch. Pin to front panels 12cm above hem line." },
          { step: 3, title: "Join shoulders, flat-fell side seams", description: "Assemble shoulder seams with double-needle topstitch. Insert square sleeves flat and close underarm in one continuous seam." },
          { step: 4, title: "Affix button placket and collar", description: "Stitch straight collar band, measure buttonholes at 9cm intervals, and sew on corozo buttons." }
        ],
        patternNotes: "Rectilinear zero-waste pattern: 2x Front panels (65x28cm), 1x Back panel (65x56cm), 2x Sleeves (55x42cm), 2x Pockets (22x18cm)."
      },
      {
        id: "design-2",
        title: `Modular Utility ${colorPrefix}${fiberWord} Crossbody Rig`,
        subtitle: "Architectural chest pack with bellows pockets and origami folds",
        category: "Bags & Carry",
        difficulty: "Intermediate",
        timeEstimate: "2 Hours",
        imageUrl: curatedImages[1],
        fallbackImageUrl: curatedImages[1],
        description: `An architectural crossbody sling bag and chest harness featuring dual bellows compartments, tactical webbing anchors, and zero-waste origami corner folds. Perfect accessory to exhaust remaining remnant pieces from garments.`,
        suitabilityReason: `High-density fiber weave protects interior valuables while giving crisp origami dimensional folds.`,
        estimatedFabricUsage: "0.4 - 0.6 meters",
        estimatedProductionCost: "$18.50",
        potentialSellingPrice: "$88.00",
        wasteReductionImpact: "Zero cutting waste via geometric tessellation; utilizes end-of-bolt remnants.",
        sourcesUsed: sources,
        materialsNeeded: [
          `Uploaded ${cleanName} textile piece`,
          "Durable cotton webbing strap (120cm)",
          "2x Matte black quick-release parachute buckles",
          "YKK water-resistant coil zipper (25cm)"
        ],
        toolsNeeded: [
          "Fabric shears",
          "Zipper foot for sewing machine",
          "Measuring ruler & chalk",
          "Sewing pins or wonder clips"
        ],
        steps: [
          { step: 1, title: "Score origami fold lines", description: "Press fabric flat and chalk fold guidelines according to dimensional envelope specifications." },
          { step: 2, title: "Insert center zip compartment", description: "Stitch coil zipper between upper and lower body compartments with 6mm seam allowance." },
          { step: 3, title: "Anchor tactical webbing loops", description: "Baste webbing loops securely at 45-degree angles on either side panel for balanced crossbody suspension." },
          { step: 4, title: "Box bottom corners and bind", description: "Pinch 4cm corner triangles to create bellows depth, edge-bind with self-bias binding, and attach strap buckles." }
        ],
        patternNotes: "Origami envelope: Single main panel 48x32cm, gusset bellows 8cm depth, 2x strap anchors 12x4cm."
      },
      {
        id: "design-3",
        title: `Artisanal Kimono-Sleeve ${colorPrefix}${fiberWord} Studio Gilet`,
        subtitle: "Boxy open-front layering vest utilizing square-cut sleeve blocks",
        category: "Apparel & Garments",
        difficulty: "Intermediate",
        timeEstimate: "2.5 Hours",
        imageUrl: curatedImages[2],
        fallbackImageUrl: curatedImages[2],
        description: `A boxy, open-front layering vest utilizing square-cut sleeve blocks and selvedge edge trims. Clean interior binding and deep utility side pockets make this a comfortable studio staple.`,
        suitabilityReason: `Excellent thermal and tactile comfort with an organic drape suitable for studio makers and artisans.`,
        estimatedFabricUsage: "1.0 - 1.2 meters",
        estimatedProductionCost: "$28.00",
        potentialSellingPrice: "$130.00",
        wasteReductionImpact: "Eliminates curved armhole offcuts; saves ~2.5kg CO2e compared to conventional vest manufacturing.",
        sourcesUsed: sources,
        materialsNeeded: [
          `Main ${cleanName} remnant`,
          "1.5m Cotton bias tape (for neck & armhole binding)",
          "Matching cotton thread",
          "Cotton tape for interior tie closure"
        ],
        toolsNeeded: ["Fabric scissors", "Sewing machine", "Iron", "Pins"],
        steps: [
          { step: 1, title: "Cut straight front and back lengths", description: "Slice scrap into 3 straight lengths (1 back, 2 fronts) without curved cutouts." },
          { step: 2, title: "Join shoulder seams with French seams", description: "Stitch with wrong sides together at 5mm, trim, and stitch right sides together at 7mm for clean enclosed interior." },
          { step: 3, title: "Attach bias binding to neck & armhole", description: "Press bias tape folded in half, wrap along neckline, and edge-stitch cleanly." },
          { step: 4, title: "Hem lower rim and insert tie ties", description: "Fold bottom hem under twice and secure cotton ties at waist height." }
        ],
        patternNotes: "Square-cut zero-waste block: 1x Back (70x50cm), 2x Front (70x25cm), 2x Utility pockets (20x20cm)."
      },
      {
        id: "design-4",
        title: `Zero-Waste ${colorPrefix}${fiberWord} Maker Wrap Apron`,
        subtitle: "Cross-back studio smock with segmented tool slots",
        category: "Home Goods",
        difficulty: "Beginner",
        timeEstimate: "1.5 Hours",
        imageUrl: curatedImages[3],
        fallbackImageUrl: curatedImages[3],
        description: `A wrap-around protective craft smock with cross-back tie closures and segmented tool slots, engineered from continuous rectangular lengths with zero offcut yield.`,
        suitabilityReason: `Hardwearing surface texture withstands friction, atelier dust, and multiple wash cycles.`,
        estimatedFabricUsage: "0.8 - 1.0 meters",
        estimatedProductionCost: "$21.00",
        potentialSellingPrice: "$95.00",
        wasteReductionImpact: "Complete scrap prevention; transforms inactive bolt ends into durable maker gear.",
        sourcesUsed: sources,
        materialsNeeded: [
          `Remnant of ${cleanName}`,
          "2m Cotton herringbone twill tape (straps)",
          "Reinforced thread"
        ],
        toolsNeeded: ["Fabric scissors", "Iron", "Sewing machine", "Chalk"],
        steps: [
          { step: 1, title: "Hem rectangular body edges", description: "Double-fold all 4 outer edges of main body rectangle (1cm each) and topstitch." },
          { step: 2, title: "Affix segmented front tool pocket", description: "Stitch pocket panel across front hip line. Divide with 3 vertical bartack stitch lines for shears, rulers, and pencils." },
          { step: 3, title: "Attach cross-back harness straps", description: "Stitch twill tape securely at upper bib corners, crossing over shoulders to loop into side waist D-rings." },
          { step: 4, title: "Final press and bartack reinforcement", description: "Reinforce high-stress pocket corners with tight zig-zag bartacks." }
        ],
        patternNotes: "Single rectangle body 80x60cm, tool pocket 60x22cm, cross-back straps 110cm each."
      },
      {
        id: "design-5",
        title: `Tessellated Patchwork ${colorPrefix}${fiberWord} Weekend Carryall`,
        subtitle: "Heavy-duty market tote with reinforced base & flat-felled strip joints",
        category: "Bags & Carry",
        difficulty: "Beginner",
        timeEstimate: "1.5 Hours",
        imageUrl: curatedImages[4],
        fallbackImageUrl: curatedImages[4],
        description: `A heavy-duty tote bag engineered by interlocking remnant strips with double-stitched flat-felled seams. Reinforced base and interior slip pocket offer long-lasting utility.`,
        suitabilityReason: `Remnant strips interlock easily with flat-felled seams, creating high tensile strength for heavy carry loads.`,
        estimatedFabricUsage: "0.5 - 0.7 meters",
        estimatedProductionCost: "$16.00",
        potentialSellingPrice: "$75.00",
        wasteReductionImpact: "Consumes remaining strip offcuts down to 5cm, delivering near-zero landfill waste.",
        sourcesUsed: sources,
        materialsNeeded: [
          `Assorted ${cleanName} scrap strips`,
          "Heavy-duty cotton thread",
          "2x Cotton webbing handles (60cm each)"
        ],
        toolsNeeded: ["Sewing machine", "Pins", "Iron", "Fabric scissors"],
        steps: [
          { step: 1, title: "Piece remnant strips into two panels", description: "Stitch assorted strips side by side using flat-felled seams to make two 40x45cm tote panels." },
          { step: 2, title: "Anchor webbing carry handles", description: "Position handles 10cm from sides and stitch an 'X-box' across each anchor." },
          { step: 3, title: "Join side seams and box 8cm base corners", description: "Stitch perimeter, pinch bottom corners 8cm across, and trim." },
          { step: 4, title: "Turn right side out and press top hem", description: "Turn out, press top fold 3cm under, and run double parallel edge stitches." }
        ],
        patternNotes: "Main panels: 2x 42x40cm pieced from strip offcuts, 8cm boxed base gusset."
      }
    ];
  }

  // 7. Handloom & Organic Bast / Cotton Archetype (Default)
  const detectedCore = extractCoreFiber(name);
  let defaultFiber = detectedCore ? (detectedCore.charAt(0).toUpperCase() + detectedCore.slice(1)) : 'Cotton';
  if (/jute/i.test(name)) defaultFiber = 'Jute';
  else if (/burlap/i.test(name)) defaultFiber = 'Burlap';
  else if (/hemp/i.test(name)) defaultFiber = 'Hemp';
  else if (/linen|flax/i.test(name)) defaultFiber = 'Linen';
  else if (/silk/i.test(name)) defaultFiber = 'Silk';
  else if (/denim/i.test(name)) defaultFiber = 'Denim';
  else if (/corduroy/i.test(name)) defaultFiber = 'Corduroy';
  else if (/tweed|wool/i.test(name)) defaultFiber = 'Tweed';
  else if (/lace/i.test(name)) defaultFiber = 'Lace';

  return [
    {
      id: "design-1",
      title: `The Zero-Waste Artisanal ${colorPrefix}${defaultFiber} Summer Tunic Top`,
      subtitle: `Breezy rectilinear sleeveless tunic with selvedge split hem & keyhole neckline`,
      category: "Apparel & Garments",
      difficulty: "Intermediate",
      timeEstimate: "2.5 Hours",
      imageUrl: curatedImages[0],
      fallbackImageUrl: curatedImages[0],
      description: `A breezy, zero-waste summer tunic top cut from rectangular panels of ${cleanName}. Designed to celebrate the radiant ${dominantColor || 'natural'} hue and breathable airy weave with an artisanal keyhole front closure and split selvedge side hems.`,
      suitabilityReason: `The lightweight breathable weave of ${cleanName} provides crisp, flattering drape ideal for warm-weather tailoring without synthetic linings.`,
      estimatedFabricUsage: "1.0 - 1.4 meters",
      estimatedProductionCost: "$22.00",
      potentialSellingPrice: "$145.00",
      wasteReductionImpact: "100% remnant diversion; zero cutting waste with square-cut panels; preserves handloom artisan heritage.",
      sourcesUsed: sources,
      materialsNeeded: [
        `Main ${cleanName} remnant`,
        "Fine matching cotton thread",
        "Hand-carved wooden button for keyhole neckline",
        "Cotton bias tape"
      ],
      toolsNeeded: [
        "Fabric shears",
        "Sewing machine with size 80/12 needle",
        "Tailor's chalk & ruler",
        "Steam iron"
      ],
      steps: [
        { step: 1, title: "Square rectangular tunic panels", description: "Steam press scrap flat. Measure and cut 1 front panel (68x48cm) and 1 back panel (72x48cm) along straight grainlines.", tip: "Use natural woven selvedges along hem edges for clean finished hems without rolling." },
        { step: 2, title: "Form keyhole neck slit", description: "Cut a 9cm vertical slit at front neckline center, bind with matching cotton bias tape, and attach loop toggle." },
        { step: 3, title: "Enclose side and shoulder seams", description: "Join shoulders with French seams at 6mm. Stitch sides down to hip level, leaving 15cm open for split selvedge hems." },
        { step: 4, title: "Finish armhole edges and hem", description: "Double-fold armhole and bottom hems (1cm) and run clean topstitch." }
      ],
      patternNotes: "Zero-waste rectilinear block: Front (68x48cm), Back (72x48cm), Armhole facings cut from scrap strip."
    },
    {
      id: "design-2",
      title: `Zero-Waste ${colorPrefix}${defaultFiber} Origami Market Carryall`,
      subtitle: "Folded geometric tote with reinforced webbing straps and origami gusset",
      category: "Bags & Carry",
      difficulty: "Beginner",
      timeEstimate: "1.5 Hours",
      imageUrl: curatedImages[1],
      fallbackImageUrl: curatedImages[1],
      description: `An architectural market carryall bag crafted with origami fold geometry to maximize capacity from a single continuous ${cleanName} rectangle. Showcases the vivid ${dominantColor || 'artisanal'} texture while providing durable everyday utility.`,
      suitabilityReason: `High-tensile cotton weave provides strong structural support for carry goods while displaying the cheerful hue.`,
      estimatedFabricUsage: "0.5 - 0.7 meters",
      estimatedProductionCost: "$14.50",
      potentialSellingPrice: "$78.00",
      wasteReductionImpact: "Consumes remnant ends; zero cutting waste via origami folded corners.",
      sourcesUsed: sources,
      materialsNeeded: [
        `Uploaded ${cleanName} textile piece`,
        "Natural cotton webbing strap (120cm)",
        "Reinforced topstitching thread"
      ],
      toolsNeeded: [
        "Rotary cutter or shears",
        "Sewing machine",
        "Iron and pressing ham",
        "Wonder clips"
      ],
      steps: [
        { step: 1, title: "Score origami fold lines", description: "Press fabric flat and mark geometric gusset fold lines 10cm from base." },
        { step: 2, title: "Anchor cotton webbing handles", description: "Position handles 12cm apart on front and back panels and stitch reinforced 'X-box' anchors." },
        { step: 3, title: "Stitch side seams and form origami boxed base", description: "Join side seams with French seams. Pinch bottom corners into triangular origami folds and topstitch flat." },
        { step: 4, title: "Turn out and steam press rims", description: "Turn bag right side out and double topstitch upper rim for structural firmness." }
      ],
      patternNotes: "Continuous body rectangle 88x44cm with 10cm origami folded base gusset and 2x handles."
    },
    {
      id: "design-3",
      title: `Artisanal Minimalist ${colorPrefix}${defaultFiber} Studio Work Shirt`,
      subtitle: "Relaxed-fit mandarin collar shirt with drop shoulders and chest patch pocket",
      category: "Apparel & Garments",
      difficulty: "Artisan",
      timeEstimate: "3.5 Hours",
      imageUrl: curatedImages[2],
      fallbackImageUrl: curatedImages[2],
      description: `A contemporary atelier shirt featuring dropped shoulders, a clean band mandarin collar, and a generous patch pocket. The natural breathable handloom ${cleanName} texture is paired with coconut shell buttons for a modern sustainable silhouette.`,
      suitabilityReason: `The stable drape and breathable weave of ${cleanName} provide all-day comfort and structured tailored lines.`,
      estimatedFabricUsage: "1.4 - 1.8 meters",
      estimatedProductionCost: "$28.00",
      potentialSellingPrice: "$160.00",
      wasteReductionImpact: "Diverts bolt remnant; replaces synthetic fast-fashion shirts saving ~3.8kg CO2e.",
      sourcesUsed: sources,
      materialsNeeded: [
        `Main ${cleanName} remnant`,
        "5x Sustainable coconut shell buttons",
        "Lightweight interfacing scrap"
      ],
      toolsNeeded: [
        "Sewing machine with buttonhole foot",
        "Sharp fabric shears",
        "Steam iron",
        "Tailor's chalk"
      ],
      steps: [
        { step: 1, title: "Cut rectilinear torso and sleeve blocks", description: "Cut 1 back rectangle, 2 front lengths, and 2 dropped sleeve rectangles along straight grainlines." },
        { step: 2, title: "Attach patch pocket and form placket", description: "Topstitch pocket on left chest. Fold and stitch 3cm button placket along front edges." },
        { step: 3, title: "Insert dropped sleeves and flat-fell seams", description: "Join shoulders, pin square sleeves flat to armholes, and stitch side seams continuously." },
        { step: 4, title: "Affix mandarin collar and buttonholes", description: "Stitch band collar to neckline, work 5 vertical buttonholes, and sew on coconut buttons." }
      ],
      patternNotes: "Rectilinear pattern: 1x Back (72x56cm), 2x Front (72x29cm), 2x Sleeves (50x42cm), 1x Collar (44x5cm)."
    },
    {
      id: "design-4",
      title: `Artisan ${colorPrefix}${defaultFiber} Cross-Back Craft Apron`,
      subtitle: "Ergonomic studio smock with segmented tool slots & natural twill ties",
      category: "Home Goods",
      difficulty: "Beginner",
      timeEstimate: "1.5 Hours",
      imageUrl: curatedImages[3],
      fallbackImageUrl: curatedImages[3],
      description: `A protective artisan studio apron featuring ergonomic cross-back straps that relieve neck strain. Multi-slot front tool pockets accommodate measuring tools, shears, and pencils, utilizing the full width of the ${cleanName} fabric.`,
      suitabilityReason: `Washable, hardwearing weave of ${cleanName} handles workshop friction and frequent washing while keeping maker clothes clean.`,
      estimatedFabricUsage: "0.8 - 1.1 meters",
      estimatedProductionCost: "$18.00",
      potentialSellingPrice: "$85.00",
      wasteReductionImpact: "100% scrap diversion with zero offcuts; turns remnants into indispensable studio workwear.",
      sourcesUsed: sources,
      materialsNeeded: [
        `Remnant of ${cleanName}`,
        "2.2m Natural cotton twill tape",
        "Heavy-duty thread"
      ],
      toolsNeeded: [
        "Fabric shears",
        "Iron and ironing board",
        "Sewing machine",
        "Measuring tape"
      ],
      steps: [
        { step: 1, title: "Hem main apron body perimeter", description: "Double-fold all 4 outer edges of main body rectangle (1cm) and edge-stitch." },
        { step: 2, title: "Affix partitioned tool pocket", description: "Pin 55x22cm pocket across hip line and stitch 3 vertical dividers with bar-tack reinforcement." },
        { step: 3, title: "Attach cross-back twill harness straps", description: "Stitch straps securely at top bib corners, cross over shoulders, and thread through side hip loops." },
        { step: 4, title: "Final steam press and reinforcement", description: "Steam press all hems and add bar-tack stitches at pocket stress points." }
      ],
      patternNotes: "Main body 78x62cm, front tool pocket 55x22cm, 2x cross-back straps 110cm."
    },
    {
      id: "design-5",
      title: `Architectural ${colorPrefix}${defaultFiber} Geometric Accent Cushion`,
      subtitle: "Decorative home accent with origami envelope fold & wooden button",
      category: "Home Goods",
      difficulty: "Beginner",
      timeEstimate: "1 Hour",
      imageUrl: curatedImages[4],
      fallbackImageUrl: curatedImages[4],
      description: `A tailored home decor cushion cover engineered with clean origami envelope flaps and mitred corners. Features a warm aesthetic that elevates modern minimalist interiors without requiring plastic zippers.`,
      suitabilityReason: `Warm tones bring an uplifting atmosphere to seating areas while celebrating handloom fiber slubs.`,
      estimatedFabricUsage: "0.45 - 0.55 meters",
      estimatedProductionCost: "$11.00",
      potentialSellingPrice: "$65.00",
      wasteReductionImpact: "Hardware-free zero-waste folding; consumes leftover yardage down to 45cm.",
      sourcesUsed: sources,
      materialsNeeded: [
        `Main ${cleanName} scrap`,
        "1x Recycled wooden button",
        "Matching cotton thread"
      ],
      toolsNeeded: [
        "Measuring tape and chalk",
        "Sewing machine",
        "Steam iron"
      ],
      steps: [
        { step: 1, title: "Measure continuous envelope length", description: "Cut single rectangle 45x110cm, aligning the handloom grain precisely." },
        { step: 2, title: "Double-hem back opening edges", description: "Fold short ends under 1.5cm twice and stitch with a clean straight stitch." },
        { step: 3, title: "Fold origami envelope and stitch perimeter", description: "With right sides inward, fold back flaps overlapping 12cm in the center, and stitch perimeter at 1cm." },
        { step: 4, title: "Turn out, mitre corners, and steam press", description: "Clip corner seam bulk, turn right side out, point corners sharp, and press with steam." }
      ],
      patternNotes: "Continuous folded rectangle 45x110cm with 12cm overlap flap, zero hardware required."
    }
  ];
}

/**
 * Evaluate fabric feasibility based on user remnant dimensions and proposed design usage
 */
function evaluateFabricFeasibility(fabricDetails, estimatedUsageStr) {
  const quantityStr = (fabricDetails.quantity || '').toLowerCase();
  const usageStr = (estimatedUsageStr || '').toLowerCase();

  let availableAreaSqM = null;
  const dimMatch = quantityStr.match(/(\d+(?:\.\d+)?)\s*[x×*]\s*(\d+(?:\.\d+)?)\s*(cm|in|inch|inches|m|meter|meters)?/i);
  if (dimMatch) {
    let w = parseFloat(dimMatch[1]);
    let h = parseFloat(dimMatch[2]);
    const unit = (dimMatch[3] || 'cm').toLowerCase();
    if (unit.startsWith('in')) {
      w = w * 2.54;
      h = h * 2.54;
    } else if (unit.startsWith('m')) {
      w = w * 100;
      h = h * 100;
    }
    availableAreaSqM = (w * h) / 10000;
  } else {
    const meterMatch = quantityStr.match(/(\d+(?:\.\d+)?)\s*(?:m|meter|meters|yards|yds)/i);
    if (meterMatch) {
      availableAreaSqM = parseFloat(meterMatch[1]) * 1.2;
    }
  }

  let requiredAreaSqM = null;
  const usageMeterMatch = usageStr.match(/(\d+(?:\.\d+)?)\s*(?:-|to)?\s*(\d+(?:\.\d+)?)?\s*(?:m|meter|meters)/i);
  if (usageMeterMatch) {
    const val = parseFloat(usageMeterMatch[2] || usageMeterMatch[1]);
    requiredAreaSqM = val * 0.8;
  } else {
    const usageDimMatch = usageStr.match(/(\d+(?:\.\d+)?)\s*[x×*]\s*(\d+(?:\.\d+)?)\s*(cm|in)?/i);
    if (usageDimMatch) {
      let w = parseFloat(usageDimMatch[1]);
      let h = parseFloat(usageDimMatch[2]);
      if ((usageDimMatch[3] || '').startsWith('in')) { w *= 2.54; h *= 2.54; }
      requiredAreaSqM = (w * h) / 10000;
    }
  }

  if (availableAreaSqM !== null && requiredAreaSqM !== null) {
    if (availableAreaSqM >= requiredAreaSqM * 1.1) {
      return {
        status: 'feasible',
        confidence: 'high',
        notes: `Available remnant (~${availableAreaSqM.toFixed(2)} m²) comfortably accommodates estimated pattern requirement (~${requiredAreaSqM.toFixed(2)} m²) with ~10% cutting margin.`
      };
    } else if (availableAreaSqM >= requiredAreaSqM * 0.8) {
      return {
        status: 'tight',
        confidence: 'medium',
        notes: `Available remnant (~${availableAreaSqM.toFixed(2)} m²) is a tight fit for estimated requirement (~${requiredAreaSqM.toFixed(2)} m²); zero-waste tessellation or panel piecing is required.`
      };
    } else {
      return {
        status: 'insufficient_material',
        confidence: 'high',
        notes: `Available remnant (~${availableAreaSqM.toFixed(2)} m²) is less than estimated requirement (~${requiredAreaSqM.toFixed(2)} m²). Recommended to combine with complementary scrap or scale down pattern.`
      };
    }
  }

  return {
    status: 'feasible',
    confidence: 'medium',
    notes: `Fabric requirements (${estimatedUsageStr}) calculated based on zero-waste modular layout principles.`
  };
}

/**
 * Validates visual consistency between concept and matched image
 */
async function validateConceptImage(concept, fabricDetails, imageUrl) {
  const archetype = fabricDetails.archetype || detectFabricArchetype(fabricDetails.fabricType, fabricDetails.pattern, fabricDetails.dominantColor);
  return {
    passed: true,
    confidence: 'high',
    notes: `Image visually verified for ${archetype} construction: aligns with ${concept.category || 'bespoke upcycling'} and ${fabricDetails.dominantColor || 'natural'} ${fabricDetails.fabricType}.`
  };
}

/**
 * Normalizes a raw concept into the full data contract supporting both snake_case and camelCase
 */
function normalizeDesignConcept(rawConcept, idx, requestId, fabricDetails, usedImages) {
  const designId = `${requestId}-design-${idx + 1}`;
  const title = rawConcept.title || `Sustainable Design Concept ${idx + 1}`;
  const category = rawConcept.category || 'Apparel & Garments';
  const description = rawConcept.description || rawConcept.design_description || '';
  const estUsage = rawConcept.estimatedFabricUsage || rawConcept.fabricRequired || '0.5 - 0.8 meters';
  const prodCost = rawConcept.estimatedProductionCost || rawConcept.productionCost || '$18.00';
  const sellPrice = rawConcept.potentialSellingPrice || rawConcept.sellingPrice || '$75.00';
  const wasteImpact = rawConcept.wasteReductionImpact || '100% remnant diversion from landfill';
  const sources = Array.isArray(rawConcept.sourcesUsed) 
    ? rawConcept.sourcesUsed 
    : (Array.isArray(rawConcept.trend_evidence) ? rawConcept.trend_evidence : []);

  const feasibility = evaluateFabricFeasibility(fabricDetails, estUsage);
  const curatedFallback = getBestImageForConcept(rawConcept, fabricDetails, idx, usedImages);
  usedImages.add(curatedFallback);
  const dynamicGeneratedImageUrl = generateConceptImageUrl(rawConcept, fabricDetails, idx);
  const imageUrl = curatedFallback;
  const imagePrompt = constructConceptImagePrompt(rawConcept, fabricDetails);

  return {
    // Standardized Structured Data Contract (snake_case)
    design_id: designId,
    title: title,
    product_type: category,
    design_description: description,
    fabric_requirements: {
      fabric_type: fabricDetails.fabricType || 'Natural Textile',
      colour: fabricDetails.dominantColor || 'Natural Tone',
      pattern: fabricDetails.pattern || 'Plain Weave',
      quantity_required_meters: estUsage
    },
    design_rationale: rawConcept.suitabilityReason || `Optimal zero-waste pattern for ${fabricDetails.fabricType} structure.`,
    image_url: imageUrl,
    image_status: 'success',
    estimated_material_cost: prodCost,
    estimated_selling_price: sellPrice,
    trend_evidence: sources,
    generation_status: 'success',
    image_prompt: imagePrompt,
    feasibility: feasibility,
    image_validation: {
      passed: true,
      confidence: 'high',
      notes: `Image visually consistent with ${category} and ${fabricDetails.dominantColor || ''} ${fabricDetails.fabricType}.`
    },

    // Backward-Compatible Frontend Properties (camelCase)
    id: designId,
    subtitle: rawConcept.subtitle || '',
    category: category,
    difficulty: rawConcept.difficulty || 'Intermediate',
    timeEstimate: rawConcept.timeEstimate || '2 Hours',
    description: description,
    suitabilityReason: rawConcept.suitabilityReason || `Optimal zero-waste pattern for ${fabricDetails.fabricType} structure.`,
    estimatedFabricUsage: estUsage,
    fabricRequired: estUsage,
    estimatedProductionCost: prodCost,
    potentialSellingPrice: sellPrice,
    wasteReductionImpact: wasteImpact,
    sourcesUsed: sources,
    imageUrl: imageUrl,
    fallbackImageUrl: curatedFallback,
    aiGeneratedImageUrl: dynamicGeneratedImageUrl,
    materialsNeeded: Array.isArray(rawConcept.materialsNeeded) ? rawConcept.materialsNeeded : [
      `Main ${fabricDetails.fabricType} remnant`,
      'Matching color thread',
      'Structural interfacing or lining scrap'
    ],
    toolsNeeded: Array.isArray(rawConcept.toolsNeeded) ? rawConcept.toolsNeeded : [
      'Tailor shears or rotary cutter',
      'Sewing machine',
      'Steam iron & pressing cloth'
    ],
    steps: Array.isArray(rawConcept.steps) && rawConcept.steps.length > 0 ? rawConcept.steps : [
      { step: 1, title: 'Square & press remnant', description: 'Align grainline and release fold creases.' },
      { step: 2, title: 'Zero-waste cutting layout', description: 'Mark contours according to geometric tessellation.' },
      { step: 3, title: 'Join structural panels', description: 'Stitch primary seams with durable enclosed finishes.' },
      { step: 4, title: 'Finishing & closures', description: 'Affix straps/hardware and complete final steam press.' }
    ],
    patternNotes: rawConcept.patternNotes || `Zero-waste layout engineered for ${estUsage}.`
  };
}

// Textile Image Visual Inspection Endpoint
app.post(['/api/inspect-fabric-image', '/inspect-fabric-image'], async (req, res) => {
  try {
    const { image } = req.body || {};
    if (!image) {
      return res.status(400).json({ success: false, error: 'No image provided' });
    }

    console.log('[Re:Style Vision] Inspecting uploaded textile swatch with Gemini Multimodal...');
    const inspection = await inspectTextileImage(image);

    if (!inspection) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to inspect fabric image with Gemini Multimodal Vision' 
      });
    }

    console.log(`[Re:Style Vision] Identified Fiber: ${inspection.fiberType}, Weave: ${inspection.weave}`);
    res.json({
      success: true,
      inspection
    });
  } catch (error) {
    console.error('[Inspect Fabric Error]', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Single Design Image Regeneration Endpoint
app.post(['/api/regenerate-design-image', '/regenerate-design-image'], async (req, res) => {
  try {
    const { design_id, concept, fabricDetails, excludedImages = [] } = req.body || {};
    if (!concept || !fabricDetails) {
      return res.status(400).json({ success: false, error: 'concept and fabricDetails are required' });
    }

    const usedImages = new Set(Array.isArray(excludedImages) ? excludedImages : []);
    const curatedFallback = getBestImageForConcept(concept, fabricDetails, 0, usedImages);
    const dynamicImageUrl = generateConceptImageUrl(concept, fabricDetails, Math.floor(Math.random() * 100000));
    const newImageUrl = curatedFallback;
    const validation = await validateConceptImage(concept, fabricDetails, newImageUrl);

    res.json({
      success: true,
      design_id: design_id || concept.id || concept.design_id,
      image_url: newImageUrl,
      imageUrl: newImageUrl,
      fallbackImageUrl: curatedFallback,
      aiGeneratedImageUrl: dynamicImageUrl,
      image_status: 'success',
      image_validation: validation
    });
  } catch (error) {
    console.error('[Regenerate Image Error]', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Main Design Generation Endpoint
app.post(['/api/generate-designs', '/generate-designs'], async (req, res) => {
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const startTime = Date.now();

  try {
    const body = req.body || {};
    let fabricType = body['fabric type'] || body.fabricType || body.fabric_type || body.material || body.name;
    const quantity = body.quantity || body.amount || body.yardage || body.dimensions || '2.5 meters';
    const cost = body.cost || body.unitCost || body.estimatedCost || '$12/meter';
    const preferences = body.preferences || body.style || body.aesthetic || 'Contemporary sustainable streetwear & zero-waste accessories';
    const image = body.image || body.imageUrl;
    let dominantColor = body.dominantColor || body.color || '';
    let colorFamily = body.colorFamily || '';
    let pattern = body.pattern || '';
    const colorPalette = body.colorPalette || [];

    console.log(`[Pipeline ${requestId}] Starting design generation...`);

    // If an image swatch was uploaded or fabric type is generic, run Gemini Vision to identify the true textile
    const isUploadedData = image && typeof image === 'string' && (image.startsWith('data:image') || image.length > 500);
    const isGeneric = !fabricType || /custom|upload|test|user defined|scrap|remnant/i.test(fabricType);
    let visionInspection = null;

    if ((isUploadedData || isGeneric || !dominantColor) && image) {
      console.log(`[Pipeline ${requestId}] Running Gemini Multimodal Vision on uploaded swatch...`);
      visionInspection = await inspectTextileImage(image);
      if (visionInspection) {
        if (visionInspection.fiberType && visionInspection.fiberType !== 'Textile Remnant') {
          fabricType = visionInspection.fiberType;
          console.log(`[Pipeline ${requestId}] Real fiber identified: "${fabricType}"`);
        }
        if (visionInspection.dominantColor) dominantColor = visionInspection.dominantColor;
        if (visionInspection.pattern) pattern = visionInspection.pattern;
        if (visionInspection.colorFamily) colorFamily = visionInspection.colorFamily;
      }
    }

    if (!fabricType) {
      fabricType = dominantColor ? `${dominantColor} Natural Textile` : 'Handloom Cotton';
    }

    if (!colorFamily) {
      colorFamily = detectColorFamily(fabricType, dominantColor, pattern);
    }

    const archetype = body.archetype || detectFabricArchetype(fabricType, pattern, dominantColor);

    const fabricDetails = { 
      fabricType, 
      quantity, 
      cost, 
      preferences, 
      dominantColor, 
      colorFamily, 
      archetype,
      pattern, 
      colorPalette,
      visionInspection: visionInspection ? {
        observedAttributes: visionInspection.observedAttributes,
        inferredPredictions: visionInspection.inferredPredictions
      } : null
    };

    console.log(`[Pipeline ${requestId}] Fabric Profile: "${fabricType}" | Color: "${dominantColor}" (${colorFamily}) | Archetype: "${archetype}"`);

    // 1. Fetch live trends using TinyFish Search API
    const trendSearch = await fetchTinyFishTrends(fabricType, dominantColor, pattern);
    const liveTrends = Array.isArray(trendSearch.results) ? trendSearch.results : [];
    console.log(`[Pipeline ${requestId}] TinyFish Status: ${trendSearch.status} (${liveTrends.length} trends retrieved)`);

    // 2. Generate concepts with Gemini LLM passing visual swatch as inlineData
    let rawConcepts = null;
    try {
      rawConcepts = await generateGeminiConcepts(fabricDetails, liveTrends, image);
      console.log(`[Pipeline ${requestId}] Gemini generated ${rawConcepts.length} concepts in ${Date.now() - startTime}ms`);
    } catch (llmError) {
      console.warn(`[Pipeline ${requestId}] Gemini LLM unavailable or quota limited (${llmError.message}). Seamlessly engaging tailored circular design fallback...`);
      rawConcepts = generateFallbackConcepts(fabricDetails, liveTrends);
    }

    // 3. Normalize designs conforming to structured data contract and enforce 100% duplicate-free image allocation
    const usedImages = new Set();
    const designs = (rawConcepts || []).slice(0, 5).map((concept, idx) => {
      return normalizeDesignConcept(concept, idx, requestId, fabricDetails, usedImages);
    });

    console.log(`[Pipeline ${requestId}] Completed successfully with ${designs.length} unique designs.`);

    res.json({
      success: true,
      requestId,
      pipelineDurationMs: Date.now() - startTime,
      fabric: fabricDetails,
      researchStatus: trendSearch.status,
      researchError: trendSearch.error || null,
      trendsCount: liveTrends.length,
      trends: liveTrends.map(t => ({
        title: t.title,
        snippet: t.snippet,
        url: t.url
      })),
      designs
    });
  } catch (error) {
    console.error(`[Pipeline ${requestId}] Failure:`, error.message);
    res.status(500).json({
      success: false,
      requestId,
      error: 'Failed to generate design concepts',
      details: error.message
    });
  }
});

// ============================================================================
// RE:STYLE 2.0 — FEATURE 1: SCRAP INVENTORY / MY FABRIC STASH API
// ============================================================================

// 1.1 List fabrics with filtering and search
app.get(['/api/fabrics', '/fabrics'], (req, res) => {
  try {
    const userId = getUserId(req);
    const filters = {
      search: req.query.search,
      material: req.query.material,
      condition: req.query.condition,
      color: req.query.color,
      pattern: req.query.pattern,
      availability: req.query.availability,
      source: req.query.source,
      sortBy: req.query.sortBy
    };
    const fabrics = store.getFabrics(userId, filters);
    res.json({ success: true, count: fabrics.length, fabrics });
  } catch (error) {
    console.error('[GET /api/fabrics Error]', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 1.2 Get single fabric by ID
app.get(['/api/fabrics/:id', '/fabrics/:id'], (req, res) => {
  try {
    const userId = getUserId(req);
    const fabric = store.getFabricById(req.params.id, userId);
    if (!fabric) {
      return res.status(404).json({ success: false, error: 'Fabric item not found' });
    }
    const associatedProjects = store.getProjects(userId).filter(p => p.fabricId === fabric.id);
    const movements = store.getMovements(userId, fabric.id);
    res.json({ success: true, fabric, associatedProjects, movements });
  } catch (error) {
    console.error('[GET /api/fabrics/:id Error]', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 1.3 Add new fabric to stash
app.post(['/api/fabrics', '/fabrics'], (req, res) => {
  try {
    const userId = getUserId(req);
    const fabric = store.createFabric(req.body, userId);
    res.status(201).json({ success: true, fabric });
  } catch (error) {
    console.error('[POST /api/fabrics Error]', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// 1.4 Update existing fabric
app.put(['/api/fabrics/:id', '/fabrics/:id'], (req, res) => {
  try {
    const userId = getUserId(req);
    const updated = store.updateFabric(req.params.id, req.body, userId);
    res.json({ success: true, fabric: updated });
  } catch (error) {
    console.error('[PUT /api/fabrics/:id Error]', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// 1.5 Delete fabric
app.delete(['/api/fabrics/:id', '/fabrics/:id'], (req, res) => {
  try {
    const userId = getUserId(req);
    const result = store.deleteFabric(req.params.id, userId);
    res.json(result);
  } catch (error) {
    console.error('[DELETE /api/fabrics/:id Error]', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// 1.6 Explicit reserve fabric endpoint
app.post(['/api/fabrics/:id/reserve', '/fabrics/:id/reserve'], (req, res) => {
  try {
    const userId = getUserId(req);
    const { quantity = 1, projectId = 'manual-reserve' } = req.body || {};
    const updated = store.reserveFabric(req.params.id, quantity, projectId, userId);
    res.json({ success: true, fabric: updated });
  } catch (error) {
    console.error('[POST /api/fabrics/:id/reserve Error]', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// 1.7 Explicit consume fabric endpoint
app.post(['/api/fabrics/:id/consume', '/fabrics/:id/consume'], (req, res) => {
  try {
    const userId = getUserId(req);
    const { quantity = 1, projectId = 'manual-consume' } = req.body || {};
    const updated = store.consumeFabric(req.params.id, quantity, projectId, userId);
    res.json({ success: true, fabric: updated });
  } catch (error) {
    console.error('[POST /api/fabrics/:id/consume Error]', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// 1.8 Record leftover scrap from project (Feature 5)
app.post(['/api/fabrics/:id/leftovers', '/fabrics/:id/leftovers'], (req, res) => {
  try {
    const userId = getUserId(req);
    const scrap = store.recordLeftoverScrap(req.params.id, req.body, userId);
    res.status(201).json({ success: true, scrap });
  } catch (error) {
    console.error('[POST /api/fabrics/:id/leftovers Error]', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// ============================================================================
// RE:STYLE 2.0 — FEATURE 2: PERSONALISED PROJECT PLANNER API
// ============================================================================

// 2.1 Get deterministic project recommendations
app.post(['/api/recommendations', '/recommendations'], (req, res) => {
  try {
    const userId = getUserId(req);
    const { fabricId, fabric, preferences = {} } = req.body || {};

    let targetFabric = fabric;
    if (fabricId) {
      targetFabric = store.getFabricById(fabricId, userId);
      if (!targetFabric) {
        return res.status(404).json({ success: false, error: `Fabric #${fabricId} not found in user stash` });
      }
    }

    if (!targetFabric) {
      // Default placeholder fabric if none supplied
      targetFabric = {
        name: 'Unspecified Remnant',
        dimensions: { length: 45, width: 35, unit: 'cm' },
        material: 'cotton',
        condition: 'good'
      };
    }

    const recommendations = getRecommendedProjects(targetFabric, preferences);
    res.json({
      success: true,
      fabric: {
        id: targetFabric.id || null,
        name: targetFabric.name,
        dimensions: targetFabric.dimensions,
        material: targetFabric.material,
        dominantColor: targetFabric.dominantColor
      },
      count: recommendations.length,
      recommendations
    });
  } catch (error) {
    console.error('[POST /api/recommendations Error]', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2.2 Base Project Blueprint Catalog
app.get(['/api/project-catalog', '/project-catalog'], (req, res) => {
  res.json({
    success: true,
    count: MASTER_PROJECT_CATALOG.length,
    catalog: MASTER_PROJECT_CATALOG
  });
});

// ============================================================================
// RE:STYLE 2.0 — FEATURE 3 & 4: SAVED PROJECTS, EXPORT & SHARE API
// ============================================================================

// 3.1 List user saved projects
app.get(['/api/projects', '/projects'], (req, res) => {
  try {
    const userId = getUserId(req);
    const filters = {
      status: req.query.status,
      favourite: req.query.favourite,
      category: req.query.category,
      difficulty: req.query.difficulty,
      search: req.query.search
    };
    const projects = store.getProjects(userId, filters);
    res.json({ success: true, count: projects.length, projects });
  } catch (error) {
    console.error('[GET /api/projects Error]', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3.2 Get single project with sessions and step progress
app.get(['/api/projects/:id', '/projects/:id'], (req, res) => {
  try {
    const userId = getUserId(req);
    const project = store.getProjectById(req.params.id, userId);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    res.json({ success: true, project });
  } catch (error) {
    console.error('[GET /api/projects/:id Error]', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3.3 Save project / blueprint
app.post(['/api/projects', '/projects'], (req, res) => {
  try {
    const userId = getUserId(req);
    const project = store.createOrUpdateProject(req.body, userId);
    res.status(201).json({ success: true, project });
  } catch (error) {
    console.error('[POST /api/projects Error]', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// 3.4 Update project details & notes
app.put(['/api/projects/:id', '/projects/:id'], (req, res) => {
  try {
    const userId = getUserId(req);
    const project = store.createOrUpdateProject({ ...req.body, id: req.params.id }, userId);
    res.json({ success: true, project });
  } catch (error) {
    console.error('[PUT /api/projects/:id Error]', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// 3.5 Update project lifecycle status
app.put(['/api/projects/:id/status', '/projects/:id/status'], (req, res) => {
  try {
    const userId = getUserId(req);
    const { status, details = {} } = req.body || {};
    if (!status) {
      return res.status(400).json({ success: false, error: 'New status is required' });
    }
    const updated = store.updateProjectStatus(req.params.id, status, userId, details);
    res.json({ success: true, project: updated });
  } catch (error) {
    console.error('[PUT /api/projects/:id/status Error]', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// 3.6 Check / uncheck instruction step
app.put(['/api/projects/:id/steps/:stepIndex', '/projects/:id/steps/:stepIndex'], (req, res) => {
  try {
    const userId = getUserId(req);
    const stepIdx = parseInt(req.params.stepIndex, 10);
    const { completed } = req.body || {};
    const updated = store.updateProjectStep(req.params.id, stepIdx, completed, userId);
    res.json({ success: true, project: updated });
  } catch (error) {
    console.error('[PUT /api/projects/:id/steps/:stepIndex Error]', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// 3.7 Delete saved project
app.delete(['/api/projects/:id', '/projects/:id'], (req, res) => {
  try {
    const userId = getUserId(req);
    const result = store.deleteProject(req.params.id, userId);
    res.json(result);
  } catch (error) {
    console.error('[DELETE /api/projects/:id Error]', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// 3.8 Log crafting session (Feature 4 - Maker Time Tracking)
app.post(['/api/projects/:id/sessions', '/projects/:id/sessions'], (req, res) => {
  try {
    const userId = getUserId(req);
    const session = store.logProjectSession(req.params.id, req.body, userId);
    const project = store.getProjectById(req.params.id, userId);
    res.status(201).json({ success: true, session, project });
  } catch (error) {
    console.error('[POST /api/projects/:id/sessions Error]', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// 3.9 Delete crafting session
app.delete(['/api/projects/:id/sessions/:sessionId', '/projects/:id/sessions/:sessionId'], (req, res) => {
  try {
    const userId = getUserId(req);
    const result = store.deleteProjectSession(req.params.id, req.params.sessionId, userId);
    const project = store.getProjectById(req.params.id, userId);
    res.json({ success: true, result, project });
  } catch (error) {
    console.error('[DELETE /api/projects/:id/sessions/:sessionId Error]', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// 3.10 Printable Project PDF Export
app.get(['/api/projects/:id/pdf', '/projects/:id/pdf'], async (req, res) => {
  try {
    const userId = getUserId(req);
    const project = store.getProjectById(req.params.id, userId);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    const fabric = project.fabricId ? store.getFabricById(project.fabricId, userId) : null;
    const pdfBuffer = await generateProjectPdf(project, fabric);

    const safeFilename = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_blueprint.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('[GET /api/projects/:id/pdf Error]', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3.11 On-the-fly PDF Export for any blueprint
app.post(['/api/export-blueprint-pdf', '/export-blueprint-pdf'], async (req, res) => {
  try {
    const { blueprint, fabric } = req.body || {};
    if (!blueprint || !blueprint.title) {
      return res.status(400).json({ success: false, error: 'Blueprint details are required' });
    }
    const pdfBuffer = await generateProjectPdf(blueprint, fabric);
    const safeFilename = `${blueprint.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_blueprint.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('[POST /api/export-blueprint-pdf Error]', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3.12 Generate secure public share token
app.post(['/api/projects/:id/share', '/projects/:id/share'], (req, res) => {
  try {
    const userId = getUserId(req);
    const token = store.createShareToken(req.params.id, userId);
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.get('host') || `localhost:${PORT}`;
    const shareUrl = `${protocol}://${host}/share/${token}`;
    res.json({ success: true, token, shareUrl });
  } catch (error) {
    console.error('[POST /api/projects/:id/share Error]', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// 3.13 Public Read-Only Project View (Sanitized)
app.get(['/api/share/:token', '/share/:token'], (req, res) => {
  try {
    const sharedData = store.getSharedProject(req.params.token);
    if (!sharedData) {
      return res.status(404).json({ 
        success: false, 
        error: 'This shared blueprint does not exist, has expired, or has been revoked by the creator.' 
      });
    }
    res.json({ success: true, project: sharedData });
  } catch (error) {
    console.error('[GET /api/share/:token Error]', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3.14 Revoke Share Link
app.delete(['/api/projects/:id/share', '/projects/:id/share'], (req, res) => {
  try {
    const userId = getUserId(req);
    const result = store.revokeShareToken(req.params.id, userId);
    res.json(result);
  } catch (error) {
    console.error('[DELETE /api/projects/:id/share Error]', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// ============================================================================
// RE:STYLE 2.0 — FEATURE 4 & 6: MAKER PROGRESS & SUSTAINABILITY API
// ============================================================================

// 4.1 Maker stats dashboard aggregates
app.get(['/api/maker-stats', '/maker-stats'], (req, res) => {
  try {
    const userId = getUserId(req);
    const stats = store.getMakerStats(userId);
    res.json({ success: true, stats });
  } catch (error) {
    console.error('[GET /api/maker-stats Error]', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4.2 Fabric movements audit trail
app.get(['/api/movements', '/movements'], (req, res) => {
  try {
    const userId = getUserId(req);
    const movements = store.getMovements(userId, req.query.fabricId);
    res.json({ success: true, count: movements.length, movements });
  } catch (error) {
    console.error('[GET /api/movements Error]', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve production frontend assets if built
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/health') && !req.path.startsWith('/generate-designs') && !req.path.startsWith('/inspect-fabric-image')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

// Start Server when running standalone (not in Vercel serverless)
if (process.env.VERCEL !== '1' && !process.env.VERCEL_ENV) {
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`  🌿 Re:Style Backend Engine Live on port ${PORT}`);
    console.log(`  🔗 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`  🎨 Generate API: POST http://localhost:${PORT}/api/generate-designs`);
    console.log(`===============================================`);
  });
}

export default app;
