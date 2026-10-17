/**
 * Re:Style Deterministic Project Recommendation & Feasibility Engine
 * Evaluates physical fabric feasibility, required tools, maker skills, time budget, and scrap utilization
 * with 100% deterministic arithmetic and structured engineering.
 */

export const MASTER_PROJECT_CATALOG = [
  // --- BAGS & CARRY ---
  {
    id: 'rec-origami-tote',
    blueprintId: 'idea-patchwork-tote',
    title: 'Origami Boro Geometric Market Tote',
    subtitle: 'Reinforced dual-handle carryall engineered with tessellated zero-waste cutting',
    category: 'Bags & Carry',
    difficulty: 'Intermediate',
    timeEstimate: '1–3 hours',
    timeMinutes: 120,
    minDimensions: { length: 56, width: 34, unit: 'cm' },
    minAreaCm2: 1904,
    requiredTools: ['Fabric shears or rotary cutter', 'Sewing machine', 'Steam iron & pressing cloth'],
    optionalTools: ['Tailor chalk & clear acrylic ruler', 'Wonder clips'],
    materialsNeeded: [
      { name: 'Main textile remnant: 2 outer panels (28×34 cm)', required: true },
      { name: 'Lining panels: 2x 28×34 cm from separate cotton supply', required: false },
      { name: 'Heavy-duty cotton or poly thread', required: true },
      { name: 'Cotton webbing straps or self-fabric strips (2x 45 cm)', required: true }
    ],
    suitableFibers: ['denim', 'cotton', 'canvas', 'linen', 'twill', 'corduroy', 'wool', 'blend'],
    incompatibleFibers: ['silk', 'chiffon', 'lace'],
    suitableConditions: ['new', 'good', 'worn'],
    intendedUses: ['bags', 'gifts', 'storage', 'clothing'],
    imageUrl: '/blueprints/belgian-slub-linen-weekend-carryall.jpg',
    cuttingPlan: {
      patternPieces: [
        { name: 'Main Body Outer Panel (Front)', count: 1, width: 28, height: 34, unit: 'cm', notes: 'Grain parallel to warp' },
        { name: 'Main Body Outer Panel (Back)', count: 1, width: 28, height: 34, unit: 'cm', notes: 'Grain parallel to warp' },
        { name: 'Interior Drop Pocket', count: 1, width: 14, height: 12, unit: 'cm', notes: 'Cut from leftover corner' },
        { name: 'Reinforced Handle Straps', count: 2, width: 38, height: 4, unit: 'cm', notes: 'Fold four-fold & edge-stitch' }
      ],
      seamAllowance: '1.0 cm (3/8 in) included on all edges',
      grainline: 'Parallel to selvedge or warp weave',
      cuttingOrder: ['1. Square remnant edges', '2. Cut 2x main body panels (28×34 cm)', '3. Slice strap lengths from edge strip', '4. Cut interior pocket from corner remainder'],
      remainingFabricNotes: 'Zero-waste grid: side-by-side layout utilizes full width of 60×40 cm remnants.'
    },
    steps: [
      { step: 1, title: 'Square & press remnant', description: 'Align weave grainline against cutting mat and release fold creases with steam.', tip: 'Use tailor chalk to establish a true 90-degree right angle before cutting.' },
      { step: 2, title: 'Geometric cutting layout', description: 'Cut two 28×34 cm outer panels, then slice strap strips from the remaining length.', tip: 'Keep selvedge edges intact where possible for clean self-finished seams.' },
      { step: 3, title: 'Assemble drop pocket & straps', description: 'Double-fold pocket hem and stitch to interior panel; fold strap edges inward and topstitch.', tip: 'Reinforce strap attachment with a secure box-X stitch.' },
      { step: 4, title: 'Join side & base seams', description: 'Stitch sides and lower edge using French seams or mock-overlock for durable raw-edge enclosure.', tip: 'Box the bottom corners 4 cm to give the tote three-dimensional standing volume.' },
      { step: 5, title: 'Hem top rim & steam finish', description: 'Fold top rim 2.5 cm to the inside enclosing strap ends, edge-stitch, and press thoroughly.' }
    ]
  },
  {
    id: 'rec-crossbody-utility-rig',
    blueprintId: 'idea-tactical-crossbody',
    title: 'Architectural Modular Crossbody Rig',
    subtitle: 'Tactical studio pouch with origami accordion gussets and exterior tool sleeve',
    category: 'Bags & Carry',
    difficulty: 'Intermediate',
    timeEstimate: '1–3 hours',
    timeMinutes: 150,
    minDimensions: { length: 35, width: 25, unit: 'cm' },
    minAreaCm2: 875,
    requiredTools: ['Fabric shears or rotary cutter', 'Sewing machine', 'Steam iron & pressing cloth'],
    optionalTools: ['Zipper foot', 'Awl'],
    materialsNeeded: [
      { name: 'Structured textile remnant (denim, corduroy, canvas)', required: true },
      { name: 'Metal or nylon coil zipper (20 cm)', required: true },
      { name: 'Paracord or webbing strap (120 cm)', required: true },
      { name: 'Matching polyester thread', required: true }
    ],
    suitableFibers: ['denim', 'corduroy', 'canvas', 'wool', 'twill', 'linen', 'blend'],
    incompatibleFibers: ['silk', 'lace', 'chiffon'],
    suitableConditions: ['new', 'good', 'worn'],
    intendedUses: ['bags', 'gifts', 'storage', 'clothing'],
    imageUrl: '/blueprints/denim-crossbody-rig.jpg',
    cuttingPlan: {
      patternPieces: [
        { name: 'Exterior Front Shell', count: 1, width: 22, height: 16, unit: 'cm' },
        { name: 'Exterior Back Shell', count: 1, width: 22, height: 16, unit: 'cm' },
        { name: 'Slip Pocket Fascia', count: 1, width: 22, height: 11, unit: 'cm' },
        { name: 'Side & Base Gusset Strip', count: 1, width: 48, height: 5, unit: 'cm' }
      ],
      seamAllowance: '0.8 cm (5/16 in) included',
      grainline: 'Perpendicular or parallel to warp',
      cuttingOrder: ['1. Cut main front & back shells', '2. Cut gusset strip from remaining length', '3. Cut slip pocket'],
      remainingFabricNotes: 'Leaves narrow perimeter strips ideal for zipper pull tabs and cord anchors.'
    },
    steps: [
      { step: 1, title: 'Cut panels and press folds', description: 'Cut front, back, and gusset strip cleanly with sharp shears.' },
      { step: 2, title: 'Install zipper top opening', description: 'Sandwich zipper tape between shell and fold, edge-stitching with zipper foot.' },
      { step: 3, title: 'Assemble accordion gusset', description: 'Attach long gusset strip around three sides of back shell, then join front.' },
      { step: 4, title: 'Insert strap anchor loops', description: 'Baste webbing anchor tabs into upper side seams before final stitching.' },
      { step: 5, title: 'Turn through & press', description: 'Turn right side out through open zipper, push corners with wooden point-turner, and steam.' }
    ]
  },

  // --- ACCESSORIES ---
  {
    id: 'rec-bucket-hat',
    blueprintId: 'idea-studio-bucket-hat',
    title: 'Zero-Waste Modular Studio Bucket Hat',
    subtitle: 'Reversible structured headwear crafted from interlocking arc segments',
    category: 'Accessories',
    difficulty: 'Intermediate',
    timeEstimate: '1–3 hours',
    timeMinutes: 90,
    minDimensions: { length: 35, width: 30, unit: 'cm' },
    minAreaCm2: 1050,
    requiredTools: ['Fabric shears or rotary cutter', 'Sewing machine', 'Steam iron & pressing cloth'],
    optionalTools: ['Tailor ham for pressing curves', 'Chalk wheel'],
    materialsNeeded: [
      { name: 'Outer fabric piece (denim, corduroy, linen, cotton)', required: true },
      { name: 'Lining remnant scrap', required: false },
      { name: 'Matching color thread', required: true }
    ],
    suitableFibers: ['denim', 'corduroy', 'cotton', 'linen', 'canvas', 'wool', 'blend'],
    incompatibleFibers: ['silk', 'lace'],
    suitableConditions: ['new', 'good', 'worn'],
    intendedUses: ['clothing', 'gifts', 'decorative'],
    imageUrl: '/blueprints/denim-bucket-hat.jpg',
    cuttingPlan: {
      patternPieces: [
        { name: 'Crown Circular Top', count: 1, width: 18, height: 18, unit: 'cm', notes: 'Circle diameter 17 cm + 1 cm allowance' },
        { name: 'Crown Side Wall Arcs', count: 2, width: 30, height: 9, unit: 'cm', notes: 'Tapered curve pieces' },
        { name: 'Angled Brim Halves', count: 2, width: 36, height: 8, unit: 'cm', notes: 'Concentric curve segments' }
      ],
      seamAllowance: '1.0 cm included',
      grainline: 'Crown wall on bias for smooth compound curve conform',
      cuttingOrder: ['1. Trace crown disc in corner', '2. Cut brim arcs along grain', '3. Cut crown walls'],
      remainingFabricNotes: 'Center ring remainder can be cut into 2x coasters or cable ties.'
    },
    steps: [
      { step: 1, title: 'Mark arc templates', description: 'Trace crown top disc, two crown wall arcs, and two brim semicircles.' },
      { step: 2, title: 'Stitch crown cylinder', description: 'Join wall pieces at side seams, then pin circular top evenly easing around perimeter.' },
      { step: 3, title: 'Prepare & reinforce brim', description: 'Stitch brim halves together, add parallel concentric topstitching rows for structural stiffness.' },
      { step: 4, title: 'Join brim to crown', description: 'Pin brim to crown cylinder matching side seams, stitch with 1 cm seam allowance.' },
      { step: 5, title: 'Topstitch and press over ham', description: 'Press seam upward into crown and topstitch 3 mm from edge for clean couture silhouette.' }
    ]
  },
  {
    id: 'rec-statement-cravat-collar',
    blueprintId: 'idea-ascot-cravat',
    title: 'Artisanal Pleated Ascot Cravat & Scarf',
    subtitle: 'Architectural neckwear celebrating fabric drape with bias cut edges',
    category: 'Accessories',
    difficulty: 'Beginner',
    timeEstimate: '30–60 minutes',
    timeMinutes: 45,
    minDimensions: { length: 45, width: 18, unit: 'cm' },
    minAreaCm2: 700,
    requiredTools: ['Fabric shears or rotary cutter', 'Hand-sewing supplies', 'Steam iron & pressing cloth'],
    optionalTools: ['Sewing machine'],
    materialsNeeded: [
      { name: 'Silk, linen, light cotton, or wool remnant', required: true },
      { name: 'Fine hand-sewing thread', required: true },
      { name: 'Vintage button or closure hook', required: false }
    ],
    suitableFibers: ['silk', 'linen', 'cotton', 'wool', 'chiffon', 'satin', 'blend'],
    incompatibleFibers: [],
    suitableConditions: ['new', 'good', 'worn'],
    intendedUses: ['clothing', 'gifts', 'decorative'],
    imageUrl: '/blueprints/purple-silk-origami-scarf.jpg',
    cuttingPlan: {
      patternPieces: [
        { name: 'Cravat Main Body Blade', count: 1, width: 44, height: 16, unit: 'cm', notes: 'Cut on 45-degree true bias if possible' },
        { name: 'Pleated Neck Band', count: 1, width: 34, height: 5, unit: 'cm', notes: 'Straight grain' }
      ],
      seamAllowance: '0.6 cm baby rolled hem',
      grainline: 'Bias 45° for fluid drape',
      cuttingOrder: ['1. Cut main blade', '2. Cut neck loop band from edge strip'],
      remainingFabricNotes: 'Leaves almost zero waste when cut diagonally across scrap.'
    },
    steps: [
      { step: 1, title: 'Cut on diagonal bias', description: 'Mark diagonal 45-degree angle across fabric piece to maximize natural fluid drape.' },
      { step: 2, title: 'Press rolled baby hem', description: 'Finger-press edges inward 3 mm, then roll a second turn and steam.' },
      { step: 3, title: 'Hand-sew rolled hem', description: 'Use delicate slip-stitch or fine machine edge-stitch along all exterior contours.' },
      { step: 4, title: 'Fold and stitch neck band pleats', description: 'Gather center into two micro accordion pleats and secure inside neck band.' },
      { step: 5, title: 'Final couture pressing', description: 'Lightly steam using pressing cloth to preserve roll softness without flattening pleat loft.' }
    ]
  },

  // --- HOME GOODS & LIVING ---
  {
    id: 'rec-linen-bento-wrap',
    blueprintId: 'idea-bento-tea-wrap',
    title: 'Minimalist Slow-Living Bento Wrap & Placemat',
    subtitle: 'Zero-waste traditional Japanese azuma origami envelope for conscious daily rituals',
    category: 'Home Goods',
    difficulty: 'Beginner',
    timeEstimate: 'Under 30 minutes',
    timeMinutes: 25,
    minDimensions: { length: 30, width: 30, unit: 'cm' },
    minAreaCm2: 900,
    requiredTools: ['Fabric shears or rotary cutter', 'Sewing machine', 'Steam iron & pressing cloth'],
    optionalTools: ['Hand-sewing needle'],
    materialsNeeded: [
      { name: 'Linen, cotton, or blend textile square', required: true },
      { name: 'Contrast or tone-on-tone cotton thread', required: true }
    ],
    suitableFibers: ['linen', 'cotton', 'hemp', 'denim', 'blend'],
    incompatibleFibers: [],
    suitableConditions: ['new', 'good', 'worn'],
    intendedUses: ['home', 'gifts', 'storage'],
    imageUrl: '/blueprints/belgian-slub-linen-maker-apron.jpg',
    cuttingPlan: {
      patternPieces: [
        { name: 'Main Square Panel', count: 1, width: 30, height: 30, unit: 'cm', notes: 'Exact square' },
        { name: 'Tie Ribbon Scrap Strip', count: 1, width: 28, height: 2.5, unit: 'cm', notes: 'Cut from edge' }
      ],
      seamAllowance: '0.8 cm mitered corner hem included',
      grainline: 'Straight warp/weft square',
      cuttingOrder: ['1. Square main piece to exact equal sides', '2. Slice tie ribbon'],
      remainingFabricNotes: '100% fabric utilization with zero leftover offcut.'
    },
    steps: [
      { step: 1, title: 'Cut a true square', description: 'Fold diagonally to check true square geometry, trimming any irregular edge.' },
      { step: 2, title: 'Miter corners', description: 'Fold corner points at 45 degrees, clip excess, and fold hems inward for clean flat atelier corners.' },
      { step: 3, title: 'Topstitch perimeter', description: 'Stitch 2 mm from folded edge continuously around all four sides, pivoting at corners.' },
      { step: 4, title: 'Attach ribbon tie', description: 'Fold and stitch narrow tie strip, anchoring securely to one corner point with reinforcement stitch.' },
      { step: 5, title: 'Final pressing', description: 'Steam press flat with linen setting.' }
    ]
  },
  {
    id: 'rec-valet-tray',
    blueprintId: 'idea-architectural-valet-tray',
    title: 'Architectural Geometric Valet Tray',
    subtitle: 'Folded origami desk dish for pens, watches, and studio smallwares',
    category: 'Home Goods',
    difficulty: 'Beginner',
    timeEstimate: 'Under 30 minutes',
    timeMinutes: 25,
    minDimensions: { length: 22, width: 22, unit: 'cm' },
    minAreaCm2: 484,
    requiredTools: ['Fabric shears or rotary cutter', 'Hand-sewing supplies', 'Steam iron & pressing cloth'],
    optionalTools: ['Heavy craft card or interfacing', 'Sewing machine'],
    materialsNeeded: [
      { name: 'Textile remnant square (corduroy, denim, wool, canvas)', required: true },
      { name: 'Stiff card or heavy fusible scrap for structure', required: false },
      { name: '4x Metal snaps, buttons, or hand-sewn tacking thread', required: true }
    ],
    suitableFibers: ['denim', 'corduroy', 'wool', 'canvas', 'cotton', 'leather', 'blend'],
    incompatibleFibers: ['silk', 'chiffon'],
    suitableConditions: ['new', 'good', 'worn'],
    intendedUses: ['home', 'storage', 'gifts', 'decorative'],
    imageUrl: '/blueprints/jute-document-folio.jpg',
    cuttingPlan: {
      patternPieces: [
        { name: 'Outer Tray Shell', count: 1, width: 20, height: 20, unit: 'cm' },
        { name: 'Inner Contrast Shell', count: 1, width: 20, height: 20, unit: 'cm' }
      ],
      seamAllowance: '0.8 cm included',
      grainline: 'Straight square',
      cuttingOrder: ['1. Cut two identical squares'],
      remainingFabricNotes: 'Tiny perimeter offcuts can be saved for stuffing or patch appliqué.'
    },
    steps: [
      { step: 1, title: 'Cut identical squares', description: 'Cut 20×20 cm outer and inner square fabric panels.' },
      { step: 2, title: 'Sew perimeter', description: 'Place right sides together, stitch edges with 0.8 cm seam, leaving 4 cm turning gap.' },
      { step: 3, title: 'Turn right side out & press', description: 'Clip corner bulk, turn right side out, press edges crisp, slip-stitch gap closed.' },
      { step: 4, title: 'Pinch and stitch corners', description: 'Pinch each corner 3 cm diagonally and stitch or snap to form 3D vertical standing walls.' },
      { step: 5, title: 'Final steam setting', description: 'Steam corners thoroughly to set tray posture.' }
    ]
  },

  // --- LEFTOVER & SCRAP PROJECTS (Use My Leftovers flow) ---
  {
    id: 'rec-scrunchie-duo',
    blueprintId: 'idea-silk-scrunchie',
    title: 'Artisan Cloud Scrunchie Duo',
    subtitle: 'Zero-waste luxury hair accessory utilizing narrow remnant strips',
    category: 'Accessories',
    difficulty: 'Beginner',
    timeEstimate: 'Under 30 minutes',
    timeMinutes: 20,
    minDimensions: { length: 30, width: 10, unit: 'cm' },
    minAreaCm2: 300,
    requiredTools: ['Fabric shears or rotary cutter', 'Hand-sewing supplies', 'Safety pin for threading'],
    optionalTools: ['Sewing machine', 'Steam iron & pressing cloth'],
    materialsNeeded: [
      { name: 'Narrow fabric strip offcut (silk, cotton, linen, corduroy)', required: true },
      { name: 'Braided elastic cord (approx 18–20 cm per scrunchie)', required: true },
      { name: 'Matching color thread', required: true }
    ],
    suitableFibers: ['silk', 'cotton', 'linen', 'corduroy', 'velvet', 'satin', 'blend', 'wool'],
    incompatibleFibers: [],
    suitableConditions: ['new', 'good', 'worn', 'damaged', 'needs_repair'],
    intendedUses: ['scraps', 'accessories', 'gifts', 'decorative'],
    imageUrl: '/blueprints/purple-silk-evening-pouch.jpg',
    cuttingPlan: {
      patternPieces: [
        { name: 'Scrunchie Tube Strip', count: 1, width: 30, height: 9, unit: 'cm', notes: 'Straight narrow rectangle' }
      ],
      seamAllowance: '0.6 cm included',
      grainline: 'Any grain direction acceptable',
      cuttingOrder: ['1. Slice narrow strip from scrap edge'],
      remainingFabricNotes: 'Ideal for 100% scrap diversion down to the last centimeter.'
    },
    steps: [
      { step: 1, title: 'Cut narrow strip', description: 'Cut a 30×9 cm strip from available scrap.' },
      { step: 2, title: 'Fold & stitch lengthwise tube', description: 'Fold right sides together lengthwise, stitch long seam with 0.6 cm allowance leaving ends open.' },
      { step: 3, title: 'Turn right side out', description: 'Attach a safety pin to one end and guide it through the tube to turn right side out.' },
      { step: 4, title: 'Thread elastic & tie knot', description: 'Thread 18 cm elastic through tube with safety pin, overlap ends 1 cm and stitch securely.' },
      { step: 5, title: 'Close opening with blind slip stitch', description: 'Tuck raw tube ends inward 6 mm and slip-stitch closed with hand needle.' }
    ]
  },
  {
    id: 'rec-patchwork-coasters',
    blueprintId: 'idea-tea-coasters',
    title: 'Sashiko Boro Patchwork Coaster Quartet',
    subtitle: 'Quilted table mats assembled from joined irregular scraps with functional reinforcement stitches',
    category: 'Home Goods',
    difficulty: 'Beginner',
    timeEstimate: '30–60 minutes',
    timeMinutes: 40,
    minDimensions: { length: 20, width: 20, unit: 'cm' },
    minAreaCm2: 400,
    requiredTools: ['Fabric shears or rotary cutter', 'Hand-sewing supplies', 'Steam iron & pressing cloth'],
    optionalTools: ['Sewing machine'],
    materialsNeeded: [
      { name: 'Small leftover fabric scraps (denim, linen, cotton)', required: true },
      { name: 'Scrap cotton batting or denim inner layer', required: false },
      { name: 'Contrast thick embroidery/sashiko thread', required: true }
    ],
    suitableFibers: ['denim', 'linen', 'cotton', 'wool', 'corduroy', 'canvas', 'blend'],
    incompatibleFibers: [],
    suitableConditions: ['new', 'good', 'worn', 'damaged', 'needs_repair'],
    intendedUses: ['scraps', 'home', 'gifts', 'decorative'],
    imageUrl: '/blueprints/yellow-cotton-envelope-cushion.jpg',
    cuttingPlan: {
      patternPieces: [
        { name: 'Coaster Face Panels (can be patchwork)', count: 4, width: 10, height: 10, unit: 'cm' },
        { name: 'Coaster Backing Panels', count: 4, width: 10, height: 10, unit: 'cm' }
      ],
      seamAllowance: '0.8 cm included',
      grainline: 'Multi-directional scrap piecing',
      cuttingOrder: ['1. Splice scraps into 10×10 cm squares', '2. Cut 4 backing pieces'],
      remainingFabricNotes: 'Consumes even the smallest 3×3 cm remnants.'
    },
    steps: [
      { step: 1, title: 'Piece scraps together', description: 'Sew small scrap strips together with 6 mm seams and press flat to create four 10×10 cm squares.' },
      { step: 2, title: 'Layer face and backing', description: 'Place backing and pieced face right sides together.' },
      { step: 3, title: 'Stitch perimeter', description: 'Sew around perimeter leaving 3 cm opening on one side.' },
      { step: 4, title: 'Turn and press flat', description: 'Clip corners, turn right side out, press edges thoroughly, tucking raw opening inward.' },
      { step: 5, title: 'Hand-stitch sashiko grid', description: 'Use sashiko thread to quilt geometric grid lines across coaster, closing the opening simultaneously.' }
    ]
  },
  {
    id: 'rec-cable-tie-wraps',
    blueprintId: 'idea-cord-organizers',
    title: 'Snap Tech Cord Organizers (Set of 3)',
    subtitle: 'Slim utility tabs with brass snaps to tame studio charging cords and cables',
    category: 'Accessories',
    difficulty: 'Beginner',
    timeEstimate: 'Under 30 minutes',
    timeMinutes: 15,
    minDimensions: { length: 10, width: 10, unit: 'cm' },
    minAreaCm2: 90,
    requiredTools: ['Fabric shears or rotary cutter', 'Hand-sewing supplies'],
    optionalTools: ['Sewing machine', 'Snap pliers'],
    materialsNeeded: [
      { name: 'Small scrap strip of sturdy fabric (denim, canvas, corduroy)', required: true },
      { name: '3x Metal snap fasteners or hook-and-loop velcro scraps', required: true }
    ],
    suitableFibers: ['denim', 'corduroy', 'canvas', 'wool', 'twill', 'blend'],
    incompatibleFibers: ['lace', 'chiffon'],
    suitableConditions: ['new', 'good', 'worn', 'damaged', 'needs_repair'],
    intendedUses: ['scraps', 'storage', 'accessories', 'gifts'],
    imageUrl: '/blueprints/corduroy-zip-pouch.jpg',
    cuttingPlan: {
      patternPieces: [
        { name: 'Cord Wrap Tabs', count: 3, width: 10, height: 3, unit: 'cm' }
      ],
      seamAllowance: '0.5 cm',
      grainline: 'Any',
      cuttingOrder: ['1. Cut 3x strips 12×3 cm'],
      remainingFabricNotes: 'Uses tiny edge offcuts.'
    },
    steps: [
      { step: 1, title: 'Cut 3 narrow tabs', description: 'Cut three 12×3 cm rectangles from scrap remnants.' },
      { step: 2, title: 'Fold edges and topstitch', description: 'Fold raw edges inward 5 mm and topstitch around perimeter.' },
      { step: 3, title: 'Install snap fasteners', description: 'Attach snap socket to one end and snap stud to the opposite end.' },
      { step: 4, title: 'Test snap closure', description: 'Ensure snap clicks firmly around rolled cords.' }
    ]
  },
  {
    id: 'rec-lavender-sachet',
    blueprintId: 'idea-wardrobe-sachet',
    title: 'Artisan Wardrobe Lavender Sachet & Pocket',
    subtitle: 'Aromatic closet hanger utilizing natural breathable textile offcuts',
    category: 'Home Goods',
    difficulty: 'Beginner',
    timeEstimate: 'Under 30 minutes',
    timeMinutes: 20,
    minDimensions: { length: 16, width: 12, unit: 'cm' },
    minAreaCm2: 192,
    requiredTools: ['Fabric shears or rotary cutter', 'Hand-sewing supplies'],
    optionalTools: ['Sewing machine', 'Steam iron & pressing cloth'],
    materialsNeeded: [
      { name: 'Breathable textile remnant (linen, cotton, raw silk)', required: true },
      { name: 'Dried botanical lavender, cedar shavings, or rice filler', required: true },
      { name: 'Hanging ribbon or twine (15 cm)', required: true }
    ],
    suitableFibers: ['linen', 'cotton', 'silk', 'wool', 'blend'],
    incompatibleFibers: [],
    suitableConditions: ['new', 'good', 'worn', 'damaged'],
    intendedUses: ['scraps', 'home', 'gifts', 'decorative'],
    imageUrl: '/blueprints/green-lace-pouch.jpg',
    cuttingPlan: {
      patternPieces: [
        { name: 'Sachet Pouch Front & Back', count: 2, width: 10, height: 12, unit: 'cm' }
      ],
      seamAllowance: '0.8 cm included',
      grainline: 'Straight grain',
      cuttingOrder: ['1. Cut 2 rectangles 10×12 cm'],
      remainingFabricNotes: 'Consumes small offcuts.'
    },
    steps: [
      { step: 1, title: 'Cut 2 rectangles', description: 'Cut two 10×12 cm pieces.' },
      { step: 2, title: 'Position hanger ribbon', description: 'Loop hanging ribbon inward between top edges.' },
      { step: 3, title: 'Stitch 3 sides', description: 'Sew around 3 sides, leaving top rim open.' },
      { step: 4, title: 'Fill with dried botanicals', description: 'Turn right side out, press, and spoon in dried lavender.' },
      { step: 5, title: 'Close top seam', description: 'Fold raw edges inward 8 mm and topstitch closed across top.' }
    ]
  },

  // --- APPAREL & GARMENTS ---
  {
    id: 'rec-kimono-vest',
    blueprintId: 'idea-kimono-gilet',
    title: 'Zero-Waste Modular Kimono Vest & Smock',
    subtitle: 'Flowing layering piece engineered with rectilinear Japanese haori cuts',
    category: 'Apparel & Garments',
    difficulty: 'Advanced',
    timeEstimate: '3–6 hours',
    timeMinutes: 210,
    minDimensions: { length: 80, width: 60, unit: 'cm' },
    minAreaCm2: 4800,
    requiredTools: ['Fabric shears or rotary cutter', 'Sewing machine', 'Steam iron & pressing cloth', 'Tailor chalk & clear acrylic ruler'],
    optionalTools: ['Overlocker or serger'],
    materialsNeeded: [
      { name: 'Substantial textile piece (linen, wool, denim, cotton, silk)', required: true },
      { name: 'Matching polyester or silk thread', required: true },
      { name: 'Optional contrast bias binding (2 m)', required: false }
    ],
    suitableFibers: ['linen', 'wool', 'cotton', 'denim', 'silk', 'blend'],
    incompatibleFibers: [],
    suitableConditions: ['new', 'good'],
    intendedUses: ['clothing', 'gifts'],
    imageUrl: '/blueprints/belgian-slub-linen-kimono-gilet.jpg',
    cuttingPlan: {
      patternPieces: [
        { name: 'Back Panel Body', count: 1, width: 55, height: 75, unit: 'cm' },
        { name: 'Front Left Panel', count: 1, width: 28, height: 75, unit: 'cm' },
        { name: 'Front Right Panel', count: 1, width: 28, height: 75, unit: 'cm' },
        { name: 'Neckband Collar Strip', count: 1, width: 85, height: 8, unit: 'cm' }
      ],
      seamAllowance: '1.2 cm included',
      grainline: 'Straight warp parallel to length',
      cuttingOrder: ['1. Cut full length back panel', '2. Cut front left and right panels', '3. Cut collar strip along selvedge'],
      remainingFabricNotes: 'Clean rectangular zero-waste layout with minimal edge trimmings.'
    },
    steps: [
      { step: 1, title: 'Rectilinear fabric breakdown', description: 'Measure and slice back, front panels, and neckband with zero diagonal waste.' },
      { step: 2, title: 'Join shoulder seams', description: 'Stitch front panels to back panel at shoulders with durable flat-felled seam.' },
      { step: 3, title: 'Attach collar neckband', description: 'Fold collar band in half, pin around neck and front edges, stitch and press.' },
      { step: 4, title: 'Sew side seams & armholes', description: 'Leave 24 cm open for armhole depth, stitch side seams down to hem.' },
      { step: 5, title: 'Double-turn hems & steam', description: 'Hem lower edge and armholes with 1 cm double-turned hem and steam thoroughly.' }
    ]
  }
];

/**
 * Standardize dimension units to metric cm
 */
export function normalizeToCm(val, unit = 'cm') {
  const num = Number(val);
  if (isNaN(num) || num <= 0) return 0;
  if (unit === 'in') return num * 2.54;
  return num;
}

/**
 * Intelligently parse natural dimension expressions like "a 4 × 4 piece", "4x4", "10x15 in", "50x60 cm"
 */
export function parseNaturalDimensions(text) {
  if (!text || typeof text !== 'string') return null;
  const match = text.match(/(\d+(?:\.\d+)?)\s*(?:[x×by*]|and)\s*(\d+(?:\.\d+)?)\s*(cm|in|inch|inches|meters|m)?/i);
  if (match) {
    const d1 = parseFloat(match[1]);
    const d2 = parseFloat(match[2]);
    let rawUnit = (match[3] || '').toLowerCase();
    let unit = 'cm';
    if (rawUnit.startsWith('in')) {
      unit = 'in';
    } else if (rawUnit.startsWith('m')) {
      return { length: d1 * 100, width: d2 * 100, unit: 'cm' };
    } else if (!rawUnit) {
      // Numbers <= 15 with no unit typically refer to inches in colloquial maker descriptions
      unit = (d1 <= 15 && d2 <= 15) ? 'in' : 'cm';
    }
    return { length: d1, width: d2, unit };
  }
  return null;
}

/**
 * Deterministically evaluate project feasibility against user fabric and tools
 */
export function evaluateProjectFeasibility(project, userFabric, userPreferences = {}) {
  let fabricLength = Number(userFabric?.dimensions?.length || userFabric?.length || 0);
  let fabricWidth = Number(userFabric?.dimensions?.width || userFabric?.width || 0);
  let fabricUnit = userFabric?.dimensions?.unit || userFabric?.unit || 'cm';

  // Fallback to parsing natural dimensions text (e.g. "a 4 × 4 piece" or "35x45 cm")
  if (fabricLength <= 0 || fabricWidth <= 0) {
    const candidateText = userFabric?.dimensionsText || userFabric?.quantity || userFabric?.name || '';
    const parsed = parseNaturalDimensions(candidateText);
    if (parsed) {
      fabricLength = parsed.length;
      fabricWidth = parsed.width;
      fabricUnit = parsed.unit;
    }
  }

  const fabricMaterial = (userFabric?.material || '').toLowerCase();
  const fabricClothingType = (userFabric?.clothingType || userFabric?.garmentType || '').toLowerCase();
  const fabricCondition = (userFabric?.condition || 'good').toLowerCase();

  const userTools = Array.isArray(userPreferences.tools) ? userPreferences.tools.map(t => t.toLowerCase()) : [];
  const userSkill = (userPreferences.skill || 'Intermediate').toLowerCase();
  const userTime = userPreferences.time || '1–3 hours';
  const userIntendedUse = (userPreferences.intendedUse || 'all').toLowerCase();

  // 1. Dimensions & Area Feasibility
  let dimensionStatus = 'feasible';
  let dimensionNotes = '';
  let consumptionEstimate = '';
  let leftoverEstimate = '';

  const lengthCm = normalizeToCm(fabricLength, fabricUnit);
  const widthCm = normalizeToCm(fabricWidth, fabricUnit);
  const userAreaCm2 = lengthCm * widthCm;

  const minLenCm = normalizeToCm(project.minDimensions.length, project.minDimensions.unit);
  const minWidCm = normalizeToCm(project.minDimensions.width, project.minDimensions.unit);
  const minAreaCm2 = project.minAreaCm2;

  // Unknown dimensions handling
  if (lengthCm <= 0 || widthCm <= 0) {
    dimensionStatus = 'unknown';
    dimensionNotes = 'Fabric dimensions not fully specified. Please confirm remnant length and width to verify cutting feasibility.';
    consumptionEstimate = `Approx. ${project.minDimensions.length}×${project.minDimensions.width} ${project.minDimensions.unit} required`;
    leftoverEstimate = 'Unknown until fabric dimensions are confirmed';
  } else {
    // Check if fabric satisfies min area AND fits either normal or rotated orientation
    const fitsDirect = (lengthCm >= minLenCm && widthCm >= minWidCm);
    const fitsRotated = (lengthCm >= minWidCm && widthCm >= minLenCm);
    const fitsArea = userAreaCm2 >= minAreaCm2;

    if (!fitsArea || (!fitsDirect && !fitsRotated)) {
      dimensionStatus = 'insufficient_material';
      dimensionNotes = `Fabric remnant (${Math.round(lengthCm)}×${Math.round(widthCm)} cm = ${Math.round(userAreaCm2)} cm²) is smaller than the required cutting blueprint minimum (${Math.round(minLenCm)}×${Math.round(minWidCm)} cm = ${minAreaCm2} cm²).`;
      consumptionEstimate = `Exceeds available fabric (needs ${minLenCm}×${minWidCm} cm)`;
      leftoverEstimate = 'None (fabric shortage)';
    } else {
      const areaRatio = userAreaCm2 / minAreaCm2;
      const consumedArea = Math.min(minAreaCm2, userAreaCm2);
      const remainingArea = Math.max(0, userAreaCm2 - consumedArea);
      const consumedPercent = Math.min(100, Math.round((consumedArea / userAreaCm2) * 100));
      const leftoverPercent = Math.max(0, 100 - consumedPercent);

      if (areaRatio < 1.15) {
        dimensionStatus = 'tight';
        dimensionNotes = `Remnant fits closely (uses ~${consumedPercent}% of fabric). Precise measuring required with minimal margin for cutting errors.`;
      } else {
        dimensionStatus = 'feasible';
        dimensionNotes = `Remnant comfortably accommodates all pattern pieces (uses ~${consumedPercent}% of available fabric).`;
      }

      consumptionEstimate = `Uses ~${Math.round(minAreaCm2)} cm² (~${consumedPercent}% of your remnant)`;
      leftoverEstimate = `Approx. ~${Math.round(remainingArea)} cm² (~${leftoverPercent}%) remaining for secondary scrap projects`;
    }
  }

  // 2. Fiber / Material & Clothing Type Compatibility
  let materialMatch = true;
  let materialNotes = '';
  if (fabricMaterial) {
    if (project.incompatibleFibers.some(f => fabricMaterial.includes(f))) {
      materialMatch = false;
      materialNotes = `${project.title} requires structured textile; ${fabricMaterial} lacks the necessary tensile rigidity.`;
    } else if (project.suitableFibers.some(f => fabricMaterial.includes(f))) {
      materialNotes = `Ideal structure: ${fabricMaterial} naturally complements this zero-waste pattern.`;
    } else {
      materialNotes = `Acceptable textile structure for this design.`;
    }
  }

  // Specific garment deconstruction alignment
  if (fabricClothingType) {
    if (fabricClothingType.includes('jean') || fabricClothingType.includes('trouser') || fabricClothingType.includes('pant')) {
      if (project.category === 'Bags & Carry' || project.id.includes('crossbody') || project.id.includes('cardholder')) {
        materialNotes += ` Excellent match for deconstructed trousers: back pockets & leg panels repurpose cleanly.`;
      }
    } else if (fabricClothingType.includes('shirt') || fabricClothingType.includes('blouse')) {
      if (project.category === 'Apparel & Garments' || project.category === 'Accessories') {
        materialNotes += ` Placket and collar buttons can be preserved as functional design elements.`;
      }
    }
  }

  // 3. Tool Ownership Checks
  const missingTools = [];
  if (userTools.length > 0) {
    for (const reqTool of project.requiredTools) {
      const hasTool = userTools.some(ut => {
        const r = reqTool.toLowerCase();
        if (r.includes('shears') || r.includes('scissor')) return ut.includes('scissor') || ut.includes('shear');
        if (r.includes('machine')) return ut.includes('machine');
        if (r.includes('iron')) return ut.includes('iron');
        if (r.includes('hand-sewing') || r.includes('hand sewing')) return ut.includes('hand') || ut.includes('needle');
        if (r.includes('overlock') || r.includes('serger')) return ut.includes('overlock') || ut.includes('serger');
        return ut.includes(r);
      });
      if (!hasTool) {
        missingTools.push(reqTool);
      }
    }
  }

  // 4. Skill Suitability
  let skillMatchScore = 1.0;
  const projectDifficulty = project.difficulty.toLowerCase();
  if (userSkill === 'beginner') {
    if (projectDifficulty === 'beginner') skillMatchScore = 1.0;
    else if (projectDifficulty === 'intermediate') skillMatchScore = 0.75;
    else skillMatchScore = 0.4;
  } else if (userSkill === 'intermediate') {
    if (projectDifficulty === 'intermediate') skillMatchScore = 1.0;
    else if (projectDifficulty === 'beginner') skillMatchScore = 0.9;
    else skillMatchScore = 0.75;
  } else {
    // Advanced
    skillMatchScore = 1.0;
  }

  // 5. Time Budget Match
  let timeMatch = true;
  if (userTime === 'under 30 minutes' || userTime === '<30m') {
    timeMatch = project.timeMinutes <= 30;
  } else if (userTime === '30–60 minutes' || userTime === '30-60m') {
    timeMatch = project.timeMinutes <= 60;
  } else if (userTime === '1–3 hours' || userTime === '1-3h') {
    timeMatch = project.timeMinutes <= 180;
  }

  // 6. Intended Use Match
  let useMatch = true;
  if (userIntendedUse && userIntendedUse !== 'all' && userIntendedUse !== 'other') {
    useMatch = project.intendedUses.includes(userIntendedUse) || 
      (userIntendedUse === 'scraps' && project.category === 'Accessories') ||
      (userIntendedUse === 'clothing' && project.category === 'Apparel & Garments') ||
      (userIntendedUse === 'bags' && project.category === 'Bags & Carry') ||
      (userIntendedUse === 'home' && project.category === 'Home Goods');
  }

  // 7. Calculate Deterministic Match Score (0 - 100)
  let score = 70; // baseline

  if (dimensionStatus === 'feasible') score += 15;
  else if (dimensionStatus === 'tight') score += 8;
  else if (dimensionStatus === 'insufficient_material') score -= 50; // Heavily penalize infeasible dimensions
  else if (dimensionStatus === 'unknown') score += 0;

  if (materialMatch) score += 10;
  else score -= 25;

  if (missingTools.length === 0) score += 10;
  else score -= (missingTools.length * 8);

  score = Math.round(score * skillMatchScore);
  if (timeMatch) score += 5;
  if (useMatch) score += 10;

  // Clamp score between 10 and 99, capping physically insufficient material projects at 45
  let finalScore = Math.max(10, Math.min(99, score));
  if (dimensionStatus === 'insufficient_material') {
    finalScore = Math.min(45, finalScore);
  }

  // Build clear, honest explanation points
  const matchExplanations = [];
  if (dimensionStatus === 'feasible') {
    matchExplanations.push(`Fits your fabric dimensions (${Math.round(lengthCm)}×${Math.round(widthCm)} ${fabricUnit}).`);
  } else if (dimensionStatus === 'tight') {
    matchExplanations.push(`Fits snugly within your fabric dimensions.`);
  } else if (dimensionStatus === 'insufficient_material') {
    matchExplanations.push(`⚠️ Fabric is too small for full-scale blueprint.`);
  } else {
    matchExplanations.push(`Dimensions unverified; verify remnant measurements.`);
  }

  if (missingTools.length === 0 && userTools.length > 0) {
    matchExplanations.push(`Requires only tools you currently own.`);
  } else if (missingTools.length > 0) {
    matchExplanations.push(`Requires additional tool: ${missingTools[0]}.`);
  }

  if (skillMatchScore >= 0.9) {
    matchExplanations.push(`Well-aligned with your ${userPreferences.skill || 'Intermediate'} skill level.`);
  }

  if (timeMatch) {
    matchExplanations.push(`Can be completed within your available time window.`);
  }

  return {
    matchScore: finalScore,
    feasibility: {
      status: dimensionStatus,
      confidence: dimensionStatus === 'unknown' ? 'low' : 'high',
      notes: dimensionNotes
    },
    consumptionEstimate,
    leftoverEstimate,
    materialMatch,
    materialNotes,
    missingTools,
    timeMatch,
    useMatch,
    explanations: matchExplanations
  };
}

/**
 * Evaluates whether a candidate image genuinely matches the fabric's actual color and material.
 */
export function isImageAssociatedWithFabric(imageUrl = '', userFabric = {}) {
  if (!imageUrl || typeof imageUrl !== 'string') return false;
  const img = imageUrl.toLowerCase();
  const userColor = (userFabric.dominantColor || userFabric.colorFamily || '').toLowerCase();
  const mat = (userFabric.material || userFabric.name || '').toLowerCase();

  const isBlue = /blue|indigo|cobalt|navy|cyan|sapphire|denim/i.test(userColor);
  const isGreen = /green|olive|sage|emerald|forest|mint/i.test(userColor);
  const isPurple = /purple|violet|magenta|plum|lavender|amethyst/i.test(userColor);
  const isYellow = /yellow|gold|mustard|ochre|amber/i.test(userColor);
  const isRed = /red|terracotta|rust|crimson|burgundy/i.test(userColor);
  const isNeutral = /white|cream|ivory|ecru|linen|slub/i.test(userColor);

  if (isBlue) {
    if (img.includes('purple-silk') || img.includes('terracotta-corduroy') || img.includes('yellow-cotton') || img.includes('green-lace') || img.includes('olive') || img.includes('jute')) {
      return false;
    }
    if (img.includes('denim')) return true;
  }

  if (isGreen) {
    if (img.includes('purple-silk') || img.includes('terracotta-corduroy') || img.includes('yellow-cotton') || img.includes('denim')) {
      return false;
    }
    if (img.includes('olive') || img.includes('green') || img.includes('sage')) return true;
  }

  if (isPurple) {
    if (img.includes('terracotta') || img.includes('yellow-cotton') || img.includes('olive') || img.includes('denim')) {
      return false;
    }
    if (img.includes('purple-silk')) return true;
  }

  if (isYellow) {
    if (img.includes('purple-silk') || img.includes('terracotta') || img.includes('olive') || img.includes('denim')) {
      return false;
    }
    if (img.includes('yellow-cotton')) return true;
  }

  if (isRed) {
    if (img.includes('purple-silk') || img.includes('yellow-cotton') || img.includes('olive') || img.includes('denim')) {
      return false;
    }
    if (img.includes('terracotta')) return true;
  }

  if (/lace/i.test(mat) && !img.includes('lace')) return false;
  if (/jute|burlap/i.test(mat) && !img.includes('jute')) return false;
  if (/corduroy/i.test(mat) && !img.includes('corduroy')) return false;

  if (img.includes('belgian-slub-linen')) {
    return isNeutral || /linen|flax|bast/i.test(mat);
  }

  return false;
}

/**
 * Pick a tailored, non-duplicated blueprint visual reflecting the user's textile and color
 */
function getTailoredProjectImage(projectId, userFabric, usedImages) {
  const mat = (userFabric?.material || userFabric?.name || '').toLowerCase();
  const color = (userFabric?.dominantColor || userFabric?.colorFamily || '').toLowerCase();
  const clothing = (userFabric?.clothingType || '').toLowerCase();

  let candidate = null;
  switch (projectId) {
    case 'rec-origami-tote':
      if (color.includes('yellow') || color.includes('gold') || mat.includes('cotton')) candidate = '/blueprints/yellow-cotton-market-carryall.jpg';
      else if (mat.includes('jute') || mat.includes('burlap')) candidate = '/blueprints/jute-patchwork-tote.jpg';
      else if (mat.includes('denim') || color.includes('indigo') || color.includes('blue') || clothing.includes('jean')) candidate = '/blueprints/denim-chore-jacket.jpg';
      else candidate = '/blueprints/belgian-slub-linen-weekend-carryall.jpg';
      break;

    case 'rec-crossbody-utility-rig':
      if (mat.includes('denim') || color.includes('indigo') || color.includes('blue') || clothing.includes('jean')) candidate = '/blueprints/denim-crossbody-rig.jpg';
      else if (color.includes('green') || color.includes('olive') || color.includes('sage')) candidate = '/blueprints/olive-utility-rig.jpg';
      else if (mat.includes('jute') || mat.includes('burlap')) candidate = '/blueprints/jute-crossbody-rig.jpg';
      else candidate = '/blueprints/belgian-slub-linen-crossbody-rig.jpg';
      break;

    case 'rec-bucket-hat':
      if (mat.includes('jute') || mat.includes('burlap') || color.includes('brown')) candidate = '/blueprints/jute-bucket-hat.jpg';
      else if (color.includes('green') || color.includes('olive') || color.includes('sage')) candidate = '/blueprints/olive-utility-rig.jpg';
      else if (color.includes('blue') || color.includes('indigo') || mat.includes('denim')) candidate = '/blueprints/denim-crossbody-rig.jpg';
      else candidate = '/blueprints/jute-bucket-hat.jpg';
      break;

    case 'rec-statement-cravat-collar':
      if (mat.includes('lace') || color.includes('green') || color.includes('sage')) candidate = '/blueprints/lace-collar.jpg';
      else if (mat.includes('silk') || color.includes('purple') || color.includes('violet') || color.includes('pink')) candidate = '/blueprints/purple-silk-origami-scarf.jpg';
      else if (mat.includes('jute') || mat.includes('burlap')) candidate = '/blueprints/jute-statement-choker.jpg';
      else if (color.includes('blue') || color.includes('indigo') || mat.includes('denim')) candidate = '/blueprints/denim-crossbody-rig.jpg';
      else candidate = '/blueprints/purple-silk-origami-scarf.jpg';
      break;

    case 'rec-linen-bento-wrap':
      if (color.includes('yellow') || color.includes('gold') || mat.includes('cotton')) candidate = '/blueprints/yellow-cotton-maker-apron.jpg';
      else if (mat.includes('jute') || mat.includes('burlap')) candidate = '/blueprints/jute-maker-apron.jpg';
      else candidate = '/blueprints/belgian-slub-linen-maker-apron.jpg';
      break;

    case 'rec-valet-tray':
      if (mat.includes('corduroy') || color.includes('terracotta') || color.includes('red') || color.includes('rust')) candidate = '/blueprints/corduroy-zip-pouch.jpg';
      else if (mat.includes('jute') || mat.includes('burlap')) candidate = '/blueprints/jute-document-folio.jpg';
      else if (color.includes('blue') || color.includes('indigo') || mat.includes('denim')) candidate = '/blueprints/denim-crossbody-rig.jpg';
      else candidate = '/blueprints/jute-document-folio.jpg';
      break;

    case 'rec-scrunchie-duo':
      if (color.includes('purple') || color.includes('violet') || mat.includes('silk')) candidate = '/blueprints/purple-silk-evening-pouch.jpg';
      else if (color.includes('green') || color.includes('olive') || mat.includes('lace')) candidate = '/blueprints/green-lace-pouch.jpg';
      else if (color.includes('blue') || color.includes('indigo') || mat.includes('denim')) candidate = '/blueprints/denim-crossbody-rig.jpg';
      else candidate = '/blueprints/purple-silk-evening-pouch.jpg';
      break;

    case 'rec-patchwork-coasters':
      if (color.includes('yellow') || color.includes('gold') || mat.includes('cotton')) candidate = '/blueprints/yellow-cotton-envelope-cushion.jpg';
      else if (color.includes('purple') || color.includes('violet') || mat.includes('silk')) candidate = '/blueprints/purple-silk-envelope-cushion.jpg';
      else candidate = '/blueprints/yellow-cotton-envelope-cushion.jpg';
      break;

    case 'rec-cable-tie-wraps':
      if (color.includes('green') || color.includes('olive')) candidate = '/blueprints/olive-utility-rig.jpg';
      else if (mat.includes('denim') || color.includes('indigo') || color.includes('blue')) candidate = '/blueprints/denim-chore-jacket.jpg';
      else candidate = '/blueprints/corduroy-zip-pouch.jpg';
      break;

    case 'rec-lavender-sachet':
      if (color.includes('purple') || color.includes('violet') || mat.includes('silk')) candidate = '/blueprints/purple-silk-envelope-cushion.jpg';
      else if (color.includes('yellow') || color.includes('gold')) candidate = '/blueprints/yellow-cotton-summer-tunic.jpg';
      else candidate = '/blueprints/green-lace-pouch.jpg';
      break;

    case 'rec-kimono-vest':
      if (mat.includes('wool') || mat.includes('tweed')) candidate = '/blueprints/wool-tweed-waistcoat.jpg';
      else if (mat.includes('silk') || color.includes('purple') || color.includes('violet')) candidate = '/blueprints/purple-silk-kimono-shrug.jpg';
      else if (color.includes('yellow') || color.includes('gold') || mat.includes('cotton')) candidate = '/blueprints/yellow-cotton-summer-tunic.jpg';
      else if (mat.includes('corduroy') || color.includes('terracotta') || color.includes('red')) candidate = '/blueprints/terracotta-corduroy-overshirt.jpg';
      else if (mat.includes('denim') || color.includes('indigo') || color.includes('blue')) candidate = '/blueprints/denim-chore-jacket.jpg';
      else candidate = '/blueprints/belgian-slub-linen-kimono-gilet.jpg';
      break;

    default:
      candidate = '/blueprints/belgian-slub-linen-weekend-carryall.jpg';
  }

  // Ensure candidate image is strictly unique within this recommendation batch
  if (usedImages.has(candidate)) {
    const alternates = [
      '/blueprints/belgian-slub-linen-weekend-carryall.jpg',
      '/blueprints/denim-crossbody-rig.jpg',
      '/blueprints/jute-bucket-hat.jpg',
      '/blueprints/purple-silk-origami-scarf.jpg',
      '/blueprints/belgian-slub-linen-maker-apron.jpg',
      '/blueprints/jute-document-folio.jpg',
      '/blueprints/purple-silk-evening-pouch.jpg',
      '/blueprints/yellow-cotton-envelope-cushion.jpg',
      '/blueprints/corduroy-zip-pouch.jpg',
      '/blueprints/green-lace-pouch.jpg',
      '/blueprints/belgian-slub-linen-kimono-gilet.jpg',
      '/blueprints/wool-tweed-waistcoat.jpg',
      '/blueprints/lace-collar.jpg',
      '/blueprints/olive-utility-rig.jpg',
      '/blueprints/yellow-cotton-market-carryall.jpg',
      '/blueprints/jute-patchwork-tote.jpg',
      '/blueprints/belgian-slub-linen-crossbody-rig.jpg',
      '/blueprints/jute-crossbody-rig.jpg',
      '/blueprints/purple-silk-envelope-cushion.jpg',
      '/blueprints/yellow-cotton-maker-apron.jpg',
      '/blueprints/jute-maker-apron.jpg',
      '/blueprints/terracotta-corduroy-overshirt.jpg',
      '/blueprints/denim-chore-jacket.jpg',
      '/blueprints/olive-chore-jacket.jpg',
      '/blueprints/purple-silk-kimono-shrug.jpg',
      '/blueprints/purple-silk-quilted-vest.jpg',
      '/blueprints/lace-bolero.jpg',
      '/blueprints/jute-statement-choker.jpg',
      '/blueprints/yellow-cotton-summer-tunic.jpg',
      '/blueprints/lace-collar.jpg'
    ];
    for (const alt of alternates) {
      if (!usedImages.has(alt)) {
        candidate = alt;
        break;
      }
    }
  }

  usedImages.add(candidate);
  return candidate;
}

/**
 * Filter and rank project catalog recommendations deterministically
 */
export function getRecommendedProjects(userFabric, preferences = {}) {
  const usedImages = new Set();

  const results = MASTER_PROJECT_CATALOG.map(project => {
    const evalResult = evaluateProjectFeasibility(project, userFabric, preferences);
    const tailoredImage = getTailoredProjectImage(project.id, userFabric, usedImages);
    const isMatchingImage = isImageAssociatedWithFabric(tailoredImage, userFabric);
    const isGenericReference = !isMatchingImage;
    const imageLabel = isGenericReference ? 'Generic reference illustration' : 'Tailored swatch reference';
    const imageNote = isGenericReference 
      ? `Style reference only; does not depict your exact ${userFabric?.dominantColor ? userFabric.dominantColor + ' ' : ''}${userFabric?.material || 'fabric'}.`
      : `Tailored visual reference matching your ${userFabric?.dominantColor ? userFabric.dominantColor + ' ' : ''}${userFabric?.material || 'textile'}.`;

    // Adapt title & subtitle to the maker's actual clothing item, color, and condition
    let customizedTitle = project.title;
    let customizedSubtitle = project.subtitle;

    if (userFabric?.dominantColor && !customizedTitle.toLowerCase().includes(userFabric.dominantColor.toLowerCase())) {
      customizedTitle = `${userFabric.dominantColor} ${customizedTitle}`;
    }

    if (userFabric?.clothingType) {
      const ct = userFabric.clothingType.toLowerCase();
      if (ct.includes('jean') || ct.includes('trouser') || ct.includes('pant')) {
        if (project.id === 'rec-origami-tote') {
          customizedTitle = `${userFabric.dominantColor ? userFabric.dominantColor + ' ' : ''}Denim Jean Market Tote`;
          customizedSubtitle = 'Reinforced carryall cut from repurposed trouser leg panels & rear pocket hardware';
        } else if (project.id === 'rec-crossbody-utility-rig') {
          customizedTitle = `${userFabric.dominantColor ? userFabric.dominantColor + ' ' : ''}Jean Pocket Crossbody Rig`;
          customizedSubtitle = 'Tactical pouch utilizing deconstructed trouser back pockets and seams';
        } else if (project.id === 'rec-cable-tie-wraps') {
          customizedTitle = `${userFabric.dominantColor ? userFabric.dominantColor + ' ' : ''}Jean Seam Tech Cord Organizers`;
        }
      } else if (ct.includes('shirt') || ct.includes('blouse')) {
        if (project.id === 'rec-statement-cravat-collar') {
          customizedTitle = `${userFabric.dominantColor ? userFabric.dominantColor + ' ' : ''}Upcycled ${userFabric.material || 'Shirt'} Cravat & Collar`;
          customizedSubtitle = 'Crafted by preserving button placket and collar interfacing';
        } else if (project.id === 'rec-scrunchie-duo') {
          customizedTitle = `${userFabric.dominantColor ? userFabric.dominantColor + ' ' : ''}Gathered ${userFabric.material || 'Silk'} Scrunchie Set`;
          customizedSubtitle = `Cut from deconstructed ${userFabric.clothingType} sleeve strips`;
        }
      } else if (ct.includes('jacket') || ct.includes('coat')) {
        if (project.id === 'rec-origami-tote') {
          customizedTitle = `${userFabric.dominantColor ? userFabric.dominantColor + ' ' : ''}Structured ${userFabric.clothingType} Carryall Tote`;
        }
      }
    }

    if (userFabric?.condition) {
      const cond = userFabric.condition.toLowerCase();
      if (cond.includes('torn') || cond.includes('distressed') || cond.includes('frayed')) {
        if (!customizedSubtitle.includes('Sashiko')) {
          customizedSubtitle += ' • with Visible Sashiko Mending';
        }
      }
    }

    return {
      ...project,
      title: customizedTitle,
      subtitle: customizedSubtitle,
      imageUrl: tailoredImage,
      isGenericReference,
      imageLabel,
      imageNote,
      matchScore: evalResult.matchScore,
      feasibility: evalResult.feasibility,
      consumptionEstimate: evalResult.consumptionEstimate,
      leftoverEstimate: evalResult.leftoverEstimate,
      materialMatch: evalResult.materialMatch,
      materialNotes: evalResult.materialNotes,
      missingTools: evalResult.missingTools,
      suitabilityReason: evalResult.explanations.join(' '),
      explanations: evalResult.explanations,
      fabricRequired: `${project.minDimensions.length}×${project.minDimensions.width} ${project.minDimensions.unit} (${Math.round(project.minAreaCm2)} cm²)`,
      tailoredBadge: `Tailored for your ${userFabric?.dominantColor ? userFabric.dominantColor + ' ' : ''}${userFabric?.clothingType || userFabric?.material || 'textile'}`
    };
  });

  // Sort by match score descending, placing feasible projects first
  results.sort((a, b) => {
    // First priority: feasible vs insufficient material
    const aInfeasible = a.feasibility.status === 'insufficient_material';
    const bInfeasible = b.feasibility.status === 'insufficient_material';
    if (aInfeasible && !bInfeasible) return 1;
    if (!aInfeasible && bInfeasible) return -1;
    return b.matchScore - a.matchScore;
  });

  return results;
}
