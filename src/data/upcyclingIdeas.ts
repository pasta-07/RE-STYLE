export interface StepInstruction {
  step: number;
  title: string;
  description: string;
  tip?: string;
}

export type BlueprintCategory = 'Apparel & Garments' | 'Bags & Carry' | 'Accessories' | 'Home Goods' | 'Art & Living';

export interface UpcycleIdea {
  id: string;
  design_id?: string;
  title: string;
  subtitle: string;
  product_type?: string;
  category: BlueprintCategory;
  difficulty: 'Beginner' | 'Intermediate' | 'Artisan';
  timeEstimate: string;
  fabricRequired: string;
  fabric_requirements?: {
    fabric_type?: string;
    colour?: string;
    pattern?: string;
    quantity_required_meters?: string;
  };
  suitabilityReason: string;
  design_rationale?: string;
  imageUrl: string;
  image_url?: string;
  image_status?: 'pending' | 'success' | 'failed' | 'needs_review';
  generation_status?: 'pending' | 'success' | 'failed' | 'needs_review';
  fallbackImageUrl?: string;
  matchScore: number;
  tags: string[];
  materialsNeeded: string[];
  toolsNeeded: string[];
  steps: StepInstruction[];
  patternNotes: string;
  isAiGenerated?: boolean;
  productionCost?: string;
  sellingPrice?: string;
  wasteReductionImpact?: string;
  sourcesUsed?: string[];
  trend_evidence?: string[];
  feasibility?: {
    status: 'feasible' | 'tight' | 'requires_piecing' | 'insufficient_material' | 'unknown';
    confidence?: string;
    notes: string;
  };
  image_validation?: {
    passed: boolean;
    confidence?: string;
    notes: string;
    isGenericReference?: boolean;
  };
  isGenericReference?: boolean;
  imageLabel?: string;
  imageNote?: string;
  rawConcept?: any;
  cuttingPlan?: {
    patternPieces: Array<{
      name: string;
      count: number;
      width: number;
      height: number;
      unit: string;
      source?: 'remnant' | 'separate_supply';
      notes?: string;
    }>;
    seamAllowance: string;
    grainline: string;
    cuttingOrder: string[];
    remainingFabricNotes: string;
  };
}

export const UPCYCLING_IDEAS: UpcycleIdea[] = [
  {
    id: 'idea-patchwork-tote',
    title: 'Origami Boro Patchwork Market Tote',
    subtitle: 'Reinforced dual-handle carryall engineered with tessellated zero-waste cutting',
    category: 'Bags & Carry',
    difficulty: 'Intermediate',
    timeEstimate: '2.5 Hours',
    fabricRequired: 'Min. 56 × 36 cm for 2-panel direct cut (or 35 × 30 cm for front panel with contrast backing)',
    suitabilityReason: 'The weight and weave provide ideal structural integrity for bag panels without requiring heavy fusible interfacing.',
    imageUrl: '/blueprints/belgian-slub-linen-weekend-carryall.jpg',
    matchScore: 92,
    tags: ['denim', 'cotton', 'sturdy', 'twill', 'durable', 'linen'],
    materialsNeeded: [
      'Main remnant: 2 outer panels (28 × 34 cm each) or 1 front hero panel if piecing',
      'Lining fabric: 2 panels (28 × 34 cm) from separate cotton/linen supply',
      'Matching or contrast heavy-duty sewing thread',
      'Straps: 2x 38 × 4 cm self-fabric strips (or 2x 50 cm cotton webbing from notions supply)',
      'Optional: Magnetic brass snap fastener',
    ],
    toolsNeeded: [
      'Fabric shears or rotary cutting wheel & mat',
      'Tailor chalk & clear acrylic ruler',
      'Sewing machine with fabric-appropriate needle (or hand-sewing needle)',
      'Steam iron & pressing cloth for crisp corner pressing',
      'Wonder clips or sewing pins',
    ],
    cuttingPlan: {
      patternPieces: [
        { name: 'Outer Body Panel (Front)', count: 1, width: 28, height: 34, unit: 'cm', source: 'remnant', notes: 'Grain parallel to warp' },
        { name: 'Outer Body Panel (Back)', count: 1, width: 28, height: 34, unit: 'cm', source: 'remnant', notes: 'Grain parallel to warp' },
        { name: 'Self-Fabric Handle Straps', count: 2, width: 38, height: 4, unit: 'cm', source: 'remnant', notes: 'Cut from remnant length strip' },
        { name: 'Lining Panels', count: 2, width: 28, height: 34, unit: 'cm', source: 'separate_supply', notes: 'Separate cotton offcut required' }
      ],
      seamAllowance: '1.0 cm (3/8 in) included on all edges',
      grainline: 'Parallel to selvedge or warp grain',
      cuttingOrder: ['1. Square remnant edges', '2. Cut 2x main outer panels (28×34 cm)', '3. Slice strap lengths from edge strip', '4. Cut lining from separate supply'],
      remainingFabricNotes: 'Zero-waste grid: side-by-side layout utilizes full width of 60×40 cm remnants.'
    },
    steps: [
      {
        step: 1,
        title: 'Square and press the remnant',
        description: 'Iron your scrap with gentle steam to release any storage creases. Trim edges cleanly using a rotary ruler to produce crisp rectilinear panels.',
        tip: 'Keep the selvedge edge intact if visible—it makes a gorgeous raw design detail along the pocket rim!'
      },
      {
        step: 2,
        title: 'Block and cut outer panels',
        description: 'Cut two 28 × 34 cm panels from your remnant. If working with a scrap under 56cm width, cut one hero front panel and source a complementary contrast back panel.',
      },
      {
        step: 3,
        title: 'Affix handles with box-X reinforcement',
        description: 'Position handles 7 cm from each side edge on the exterior. Stitch an "X in a square" box pattern across each handle anchor for permanent tensile strength.',
      },
      {
        step: 4,
        title: 'Join exterior to separate lining',
        description: 'Place lining pieces right sides together with outer body. Stitch around the top circumference with a 1 cm seam allowance, leaving a 7 cm opening for turning.',
      },
      {
        step: 5,
        title: 'Box bottom corners and topstitch rim',
        description: 'Pinch base corners 5 cm to form a flat gusset floor. Turn right-side out, press rim flat, and edge-stitch 3 mm from top fold.',
        tip: 'Contrasting topstitch in ecru or terracotta highlights the handmade craftsmanship.'
      }
    ],
    patternNotes: 'Cutting blueprint: Two outer panels 28×34 cm, two separate lining panels 28×34 cm, handles 38×4 cm. Finished bag: 26×30 cm with 5 cm base gusset.',
  },
  {
    id: 'idea-quilted-sleeve',
    title: 'Sashiko Quilted Tablet / Document Pouch',
    subtitle: 'Wadded protective sleeve featuring traditional Japanese running stitches',
    category: 'Bags & Carry',
    difficulty: 'Beginner',
    timeEstimate: '1.5 Hours',
    fabricRequired: 'Min. 32 × 22 cm remnant (fits 35×25 cm and larger remnants)',
    suitabilityReason: 'Weave density holds sashiko thread firmly in place without puckering, creating beautiful tactile protection.',
    imageUrl: '/blueprints/corduroy-zip-pouch.jpg',
    matchScore: 96,
    tags: ['denim', 'cotton', 'corduroy', 'protective', 'wool'],
    materialsNeeded: [
      'Uploaded remnant: 1 outer envelope face shell (32 × 22 cm)',
      'Protective core: Felt, flannel, or batting scrap (32 × 22 cm) from separate supply',
      'Inner lining: Soft cotton muslin or lawn scrap (32 × 22 cm) from separate supply',
      'Sashiko thread or DMC embroidery floss (#8 or #12)',
      '1x Wooden button or coconut shell button and 10 cm elastic cord loop',
    ],
    toolsNeeded: [
      'Long sashiko needle or embroidery crewel needle',
      'Hera marker or tailor’s chalk pencil for diagonal grid lines',
      'Sewing machine with fabric-appropriate needle (or hand thimble)',
      'Steam iron & pressing cloth',
    ],
    cuttingPlan: {
      patternPieces: [
        { name: 'Outer Envelope Face Shell', count: 1, width: 32, height: 22, unit: 'cm', source: 'remnant', notes: 'Single continuous outer piece' },
        { name: 'Insulating Fleece/Batting Core', count: 1, width: 32, height: 22, unit: 'cm', source: 'separate_supply', notes: 'Separate padding scrap required' },
        { name: 'Soft Inner Lining Shell', count: 1, width: 32, height: 22, unit: 'cm', source: 'separate_supply', notes: 'Separate muslin or cotton scrap required' }
      ],
      seamAllowance: '0.8 cm included',
      grainline: 'Straight warp grain',
      cuttingOrder: ['1. Cut outer envelope 32×22 cm from remnant', '2. Cut batting and lining to match'],
      remainingFabricNotes: 'Leaves perimeter offcuts ideal for cord ties or mini coasters.'
    },
    steps: [
      {
        step: 1,
        title: 'Mark the sashiko geometric grid',
        description: 'Using chalk or a water-soluble ruler, draw gentle diagonal guidelines at 1.5 cm spacing across your outer scrap panel.',
      },
      {
        step: 2,
        title: 'Quilt the three layers together',
        description: 'Sandwich batting between outer remnant and inner lining. Work even running stitches through all layers, pulling thread smoothly without puckering.',
        tip: 'Stitch 4–6 stitches onto the needle at once before pulling through for rhythm and straightness.'
      },
      {
        step: 3,
        title: 'Fold envelope and insert elastic closure',
        description: 'Fold the quilted sandwich into a sleeve shape with a 6 cm top flap, centering an elastic loop at the top front flap.',
      },
      {
        step: 4,
        title: 'Bind edges with bias scrap or French seams',
        description: 'Stitch sides with clean enclosed seams. Secure the button at the front panel aligned with the elastic loop.',
      }
    ],
    patternNotes: 'Cutting blueprint: Outer shell 32×22 cm. Finished sleeve: 20×15 cm, easily scaled to any tablet or notebook by adding 2 cm ease.',
  },
  {
    id: 'idea-scrunchie-trio',
    title: 'Zero-Waste Fluted Scrunchie & Hair Suite',
    subtitle: 'Curated hair accessory suite utilizing narrow strip remnants',
    category: 'Accessories',
    difficulty: 'Beginner',
    timeEstimate: '45 Minutes',
    fabricRequired: 'Min. 35 × 9 cm strip (fits long offcut edges of all specimens)',
    suitabilityReason: 'Natural softness and weave catch light elegantly, transforming small remnants into functional luxury accessories.',
    imageUrl: '/blueprints/purple-silk-origami-scarf.jpg',
    matchScore: 94,
    tags: ['silk', 'linen', 'corduroy', 'cotton', 'small scraps', 'quick'],
    materialsNeeded: [
      'Fabric strip from your remnant (35 × 9 cm for cloud scrunchie, or 45 × 10 cm for fluted)',
      '18 cm of 0.8 cm wide braided elastic from notions supply',
      'Matching all-purpose sewing thread',
      'Safety pin for threading elastic core',
    ],
    toolsNeeded: [
      'Fabric shears',
      'Pins or sewing clips',
      'Iron for pressing seam',
      'Sewing machine with fabric-appropriate needle (or hand needle)',
    ],
    cuttingPlan: {
      patternPieces: [
        { name: 'Scrunchie Tube Strip', count: 1, width: 35, height: 9, unit: 'cm', source: 'remnant', notes: 'Cut along any straight edge' }
      ],
      seamAllowance: '0.6 cm included',
      grainline: 'Any grain direction acceptable',
      cuttingOrder: ['1. Slice narrow strip from scrap edge'],
      remainingFabricNotes: '100% scrap diversion down to the narrowest edge offcut.'
    },
    steps: [
      {
        step: 1,
        title: 'Fold strip lengthwise and stitch tube',
        description: 'Fold fabric right sides facing lengthwise. Stitch with a 0.6 cm seam allowance, leaving both short ends open.',
      },
      {
        step: 2,
        title: 'Turn tube right side out',
        description: 'Attach a safety pin to one edge and feed it gently through the interior tube to flip it right side out.',
        tip: 'Press the seam flat with steam before inserting elastic for a crisp atelier finish.'
      },
      {
        step: 3,
        title: 'Thread and knot elastic core',
        description: 'Feed elastic through the casing, overlap ends by 1.5 cm, and stitch firmly with a zig-zag or secure double knot.',
      },
      {
        step: 4,
        title: 'Invisible slip-stitch closure',
        description: 'Tuck 1 cm of raw edge into the other tube end. Hand-stitch closed with an invisible ladder stitch.',
      }
    ],
    patternNotes: 'Zero-waste calculation: Even strips as small as 8 × 30 cm yield charming mini hair ties.',
  },
  {
    id: 'idea-cushion-cover',
    title: 'Flax & Twill Envelope Cushion Cover',
    subtitle: 'Architectural envelope-back accent cushion with clean mitred perimeter',
    category: 'Home Goods',
    difficulty: 'Intermediate',
    timeEstimate: '2 Hours',
    fabricRequired: 'Min. 42 × 42 cm square remnant (fits 50×50 cm and 60×40 cm specimens)',
    suitabilityReason: 'Textile slub and texture lend an organic presence to living room sofas and reading nooks.',
    imageUrl: '/blueprints/yellow-cotton-envelope-cushion.jpg',
    matchScore: 91,
    tags: ['linen', 'cotton', 'denim', 'decorative', 'home', 'canvas'],
    materialsNeeded: [
      'Main uploaded remnant: Front hero panel (40 × 40 cm)',
      'Two envelope backing fabric pieces (40 × 26 cm each) from separate cotton/canvas supply',
      'Matching or contrast terracotta sewing thread',
      'Standard 40 × 40 cm cushion insert',
    ],
    toolsNeeded: [
      'Steam iron with fabric-appropriate heat setting',
      'Measuring grid & tailor’s chalk',
      'Sewing machine with fabric-appropriate needle',
      'Sewing pins or wonder clips',
    ],
    cuttingPlan: {
      patternPieces: [
        { name: 'Front Hero Accent Square', count: 1, width: 40, height: 40, unit: 'cm', source: 'remnant', notes: 'Clean square focal panel' },
        { name: 'Envelope Back Overlap Flaps', count: 2, width: 40, height: 26, unit: 'cm', source: 'separate_supply', notes: 'Separate neutral backing linen/canvas required' }
      ],
      seamAllowance: '1.0 cm included',
      grainline: 'Straight warp square',
      cuttingOrder: ['1. Cut 40×40 cm front panel from remnant', '2. Cut 2 backing flaps from separate supply'],
      remainingFabricNotes: 'Leaves border offcuts suitable for piping or matching coasters.'
    },
    steps: [
      {
        step: 1,
        title: 'Prepare the front focal square',
        description: 'Square your remnant to 40 × 40 cm. If piecing multiple scraps, arrange them with an asymmetric 1/3-2/3 horizon line for an editorial modern look.',
      },
      {
        step: 2,
        title: 'Hem the envelope back flaps',
        description: 'Fold long edge of separate backing pieces under by 1.5 cm twice to enclose raw edges. Stitch down cleanly.',
      },
      {
        step: 3,
        title: 'Assemble envelope sandwich',
        description: 'Lay front piece right side up. Lay hemmed backing pieces right side down, overlapping in the center by 10 cm.',
      },
      {
        step: 4,
        title: 'Stitch perimeter & clip corners',
        description: 'Stitch 1 cm around all 4 outer edges. Clip excess corner fabric at a 45-degree angle to ensure sharp, crisp corners when turned.',
      }
    ],
    patternNotes: 'No zipper required! The generous 10 cm envelope overlap ensures the inner cushion never peeks through.',
  },
  {
    id: 'idea-wall-hanging',
    title: 'Abstract Botanical Textile Wall Tapestry',
    subtitle: 'Raw-edged dimensional wall art mounted on a fallen drift-branch',
    category: 'Art & Living',
    difficulty: 'Beginner',
    timeEstimate: '1 Hour',
    fabricRequired: 'Min. 28 × 32 cm remnant (or collage of irregular scraps)',
    suitabilityReason: 'Natural frayed edges and artisanal textures transform beautifully into gallery-worthy interior wall art.',
    imageUrl: '/blueprints/belgian-slub-linen-kimono-gilet.jpg',
    matchScore: 90,
    tags: ['linen', 'cotton', 'denim', 'art', 'decor', 'frayed', 'silk', 'jute'],
    materialsNeeded: [
      'Uploaded remnant panel (28 × 32 cm) or assorted scrap collage',
      'Smooth wooden dowel or natural branch (30–35 cm) from notions supply',
      'Hemp twine or jute cord for wall suspension',
      'Embroidery floss in contrast indigo, paper, or coral tones',
    ],
    toolsNeeded: [
      'Fabric shears',
      'Tapestry needle',
      'Steam iron',
    ],
    cuttingPlan: {
      patternPieces: [
        { name: 'Textile Base Panel', count: 1, width: 28, height: 32, unit: 'cm', source: 'remnant', notes: 'Celebrate raw fringe edges' }
      ],
      seamAllowance: 'Raw unhemmed fringe edges with 3 cm top hanging tunnel',
      grainline: 'Straight or diagonal collage',
      cuttingOrder: ['1. Cut 28×32 cm base panel from remnant', '2. Fray outer 5 mm edges intentionally'],
      remainingFabricNotes: 'Zero waste; raw fringe uses frayed threads as design elements.'
    },
    steps: [
      {
        step: 1,
        title: 'Curate the composition',
        description: 'Lay your scrap flat. Intentionally pull 3–4 weft threads from the edges to celebrate the organic raw fringe.',
      },
      {
        step: 2,
        title: 'Baste layers with loose kantha stitches',
        description: 'Use contrasting thread to make long, rhythmic hand stitches anchoring smaller scrap geometric shapes onto the base.',
      },
      {
        step: 3,
        title: 'Form top mounting sleeve',
        description: 'Fold the top 3.5 cm over to create a tunnel. Hand-stitch in place and slide your wooden dowel through.',
      },
      {
        step: 4,
        title: 'Knot hanging twine',
        description: 'Tie hemp twine securely to both dowel ends with a clove hitch knot. Trim and display with pride.',
      }
    ],
    patternNotes: 'Celebrates wabi-sabi philosophy: asymmetry, raw slubs, and visible hand stitches give each piece bespoke art value.',
  },
  {
    id: 'idea-tea-coasters',
    title: 'Sashiko-Stitched Tea Coasters (Set of 4)',
    subtitle: 'Square layered drink mats with insulated core and contrast binding',
    category: 'Home Goods',
    difficulty: 'Beginner',
    timeEstimate: '1 Hour',
    fabricRequired: 'Min. 22 × 22 cm remnant (yields four 11 × 11 cm squares)',
    suitabilityReason: 'Absorbent weave catches mug moisture while withstanding regular washing and daily studio use.',
    imageUrl: '/blueprints/green-lace-pouch.jpg',
    matchScore: 97,
    tags: ['linen', 'cotton', 'denim', 'corduroy', 'small scraps', 'easy'],
    materialsNeeded: [
      '4x 11 × 11 cm outer fabric squares cut from your remnant',
      '4x 11 × 11 cm backing squares from separate scrap supply',
      'Cotton fleece or flannel scrap for heat insulation (4x 11 × 11 cm)',
      'White or golden sashiko embroidery thread',
    ],
    toolsNeeded: [
      'Rotary cutter or shears',
      'Needle & hand thimble',
      'Steam iron',
    ],
    cuttingPlan: {
      patternPieces: [
        { name: 'Coaster Face Squares', count: 4, width: 11, height: 11, unit: 'cm', source: 'remnant', notes: 'Cut in a 2×2 grid' },
        { name: 'Heat Insulating Fleece Layer', count: 4, width: 11, height: 11, unit: 'cm', source: 'separate_supply', notes: 'Flannel or fleece scrap' },
        { name: 'Backing Fabric Squares', count: 4, width: 11, height: 11, unit: 'cm', source: 'separate_supply', notes: 'Neutral backing scrap' }
      ],
      seamAllowance: '0.8 cm included',
      grainline: 'Straight grain 2×2 layout',
      cuttingOrder: ['1. Subdivide remnant into four 11×11 cm squares', '2. Cut 4 backing & 4 fleece squares'],
      remainingFabricNotes: 'Consumes even small 22×22 cm scraps down to tiny edge ribbons.'
    },
    steps: [
      {
        step: 1,
        title: 'Cut 11 × 11 cm squares',
        description: 'Subdivide your scrap into 4 matching or coordinated 11 × 11 cm squares.',
      },
      {
        step: 2,
        title: 'Sandwich with flannel interlining',
        description: 'Layer flannel between top remnant square and backing with right sides outwards.',
      },
      {
        step: 3,
        title: 'Stitch concentric diamond motifs',
        description: 'Hand stitch simple geometric cross or diamond paths through all three layers.',
      },
      {
        step: 4,
        title: 'Fringe or edge-stitch border',
        description: 'Run a stitch 6 mm from edge, then fray outer threads to create a delicate 4 mm fringe border.',
      }
    ],
    patternNotes: 'Superb project for remnants under 25 cm that are too small for pouches or tote bags.',
  },
  {
    id: 'idea-corduroy-cardholder',
    title: 'Minimalist Origami Cardholder & Key Lanyard',
    subtitle: 'Slimline accordion wallet with brass eyelet and swivel snap',
    category: 'Accessories',
    difficulty: 'Intermediate',
    timeEstimate: '1 Hour',
    fabricRequired: 'Min. 18 × 12 cm remnant (fits compact scraps down to 20 × 15 cm)',
    suitabilityReason: 'Structured fabric holds crisp folded edges and resists daily pocket friction.',
    imageUrl: '/blueprints/denim-crossbody-rig.jpg',
    matchScore: 95,
    tags: ['corduroy', 'denim', 'accessories', 'pocket', 'cotton', 'leather'],
    materialsNeeded: [
      'Uploaded sturdy remnant: 1 rectangle (18 × 12 cm)',
      '1x Antique brass snap fastener or heavy button from notions supply',
      '1x Brass key split ring or swivel hook',
      'Matching heavy-duty sewing thread',
    ],
    toolsNeeded: [
      'Snap setter or mallet (or needle for button)',
      'Sharp fabric scissors',
      'Steam iron & pressing wood/block',
    ],
    cuttingPlan: {
      patternPieces: [
        { name: 'Origami Cardholder Body', count: 1, width: 18, height: 12, unit: 'cm', source: 'remnant', notes: 'Tri-fold accordion folding' }
      ],
      seamAllowance: '0.6 cm included on all edges',
      grainline: 'Parallel to warp or corduroy wale',
      cuttingOrder: ['1. Cut 18×12 cm rectangle cleanly', '2. Press tri-fold creases'],
      remainingFabricNotes: 'Near-zero waste on small offcuts.'
    },
    steps: [
      {
        step: 1,
        title: 'Fold accordion card pockets',
        description: 'Press fabric into a tri-fold origami pocket that holds 4–6 credit cards snugly.',
      },
      {
        step: 2,
        title: 'Stitch side gusset seams',
        description: 'Topstitch side edges through all folded layers using a 3 mm heavy-duty stitch.',
      },
      {
        step: 3,
        title: 'Install brass snap fastener',
        description: 'Punch holes for snap hardware on front flap and body, then hammer brass components securely into place.',
      }
    ],
    patternNotes: 'Finished dimensions: 10 × 7 cm. Slips effortlessly into any pocket.',
  }
];
