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
    status: 'feasible' | 'tight' | 'insufficient_material' | 'unknown';
    confidence?: string;
    notes: string;
  };
  image_validation?: {
    passed: boolean;
    confidence?: string;
    notes: string;
  };
  rawConcept?: any;
}

export const UPCYCLING_IDEAS: UpcycleIdea[] = [
  {
    id: 'idea-patchwork-tote',
    title: 'Origami Boro Patchwork Market Tote',
    subtitle: 'Reinforced dual-handle carryall with geometric remnant blocking',
    category: 'Bags & Carry',
    difficulty: 'Intermediate',
    timeEstimate: '2.5 Hours',
    fabricRequired: 'Approx. 40 x 30 cm remnant (or spliced strips)',
    suitabilityReason: 'The weight and weave provide ideal structural integrity for bag panels without requiring heavy fusible interfacing.',
    imageUrl: '/blueprints/belgian-slub-linen-weekend-carryall.jpg',
    matchScore: 98,
    tags: ['denim', 'cotton', 'sturdy', 'twill', 'durable'],
    materialsNeeded: [
      'Your uploaded textile remnant (main front & base panel)',
      'Contrasting linen or canvas offcut for lining (35 x 30 cm)',
      'Heavy-duty cotton thread (contrast ecru or terracotta)',
      '2x Cotton webbing straps (55 cm each) or self-fabric strips',
      'Magnetic brass snap closure (optional)',
    ],
    toolsNeeded: [
      'Fabric shears or rotary cutter',
      'Measuring tape and tailor’s chalk',
      'Sewing machine (denim needle size 90/14) or hand-sewing needle',
      'Steam iron for pressing seams',
      'Wonder clips or sewing pins',
    ],
    steps: [
      {
        step: 1,
        title: 'Square and press the remnant',
        description: 'Iron your scrap with gentle steam to release any storage creases. Trim edges cleanly using a rotary ruler to produce crisp rectilinear panels.',
        tip: 'Keep the selvedge edge intact if visible—it makes a gorgeous raw design detail along the pocket rim!'
      },
      {
        step: 2,
        title: 'Block and splice secondary pieces',
        description: 'If your scrap is smaller than 40cm, stitch complementary strips together using a flat-felled seam to form the composite front face.',
      },
      {
        step: 3,
        title: 'Affix handles and reinforcement box',
        description: 'Position handles 8cm from either side edge on the exterior. Stitch an "X in a square" box pattern across each handle anchor for lifetime durability.',
      },
      {
        step: 4,
        title: 'Join exterior to interior lining',
        description: 'Place lining right sides together with the outer body. Stitch around the top circumference with a 1cm seam allowance, leaving a 7cm gap for turning.',
      },
      {
        step: 5,
        title: 'Box the bottom corners and topstitch',
        description: 'Pinch base corners to create a 6cm gusset base. Turn the tote right-side out, press the rim cleanly, and edge-stitch 3mm from the top fold.',
        tip: 'A contrasting topstitch in terracotta thread highlights the handmade craftsmanship.'
      }
    ],
    patternNotes: 'Cutting blueprint: Cut 2 outer panels 38x32cm, 2 lining panels 38x32cm, 2 strap handles 55x3cm. Gusset depth is 5cm.',
  },
  {
    id: 'idea-quilted-sleeve',
    title: 'Sashiko Quilted Tablet / Document Pouch',
    subtitle: 'Wadded protective sleeve featuring traditional Japanese running stitches',
    category: 'Bags & Carry',
    difficulty: 'Beginner',
    timeEstimate: '1.5 Hours',
    fabricRequired: 'Approx. 35 x 25 cm scrap',
    suitabilityReason: 'Weave density holds sashiko thread firmly in place without puckering, creating beautiful shadow ridges.',
    imageUrl: '/blueprints/corduroy-zip-pouch.jpg',
    matchScore: 95,
    tags: ['denim', 'cotton', 'corduroy', 'protective'],
    materialsNeeded: [
      'Uploaded fabric piece (outer envelope)',
      'Organic cotton batting remnant or felt scrap (for padding)',
      'Soft inner lining scrap (muslin or cotton lawn)',
      'Sashiko thread or DMC embroidery floss (#8 or #12)',
      'Elastic cord loop and coconut shell or wooden button',
    ],
    toolsNeeded: [
      'Long sashiko needle or embroidery needle',
      'Hera marker or chalk pencil for grid lines',
      'Sewing machine or hand thimble',
      'Iron & pressing cloth',
    ],
    steps: [
      {
        step: 1,
        title: 'Mark the sashiko geometric grid',
        description: 'Using chalk or a water-soluble pen, rule gentle diagonal guidelines at 1.5cm spacing across your main outer panel.',
      },
      {
        step: 2,
        title: 'Quilt the three layers together',
        description: 'Sandwich batting between outer scrap and backing. Work even running stitches through all layers, pulling thread smoothly without puckering.',
        tip: 'Stitch 4–6 stitches onto the needle at once before pulling through for rhythm and straightness.'
      },
      {
        step: 3,
        title: 'Fold envelope and insert elastic closure',
        description: 'Fold the quilted sandwich into a sleeve shape, centering an elastic loop at the top front flap.',
      },
      {
        step: 4,
        title: 'Bind edges with bias scrap or French seams',
        description: 'Stitch sides with clean enclosed seams. Secure the wooden button at the front panel aligned with the loop.',
      }
    ],
    patternNotes: 'Sleeve size is easily adjustable to any device by adding 2.5cm ease around your tablet or notebook.',
  },
  {
    id: 'idea-scrunchie-trio',
    title: 'Zero-Waste Fluted Scrunchie & Headband Set',
    subtitle: 'Curated hair accessory suite utilizing narrow strip remnants',
    category: 'Accessories',
    difficulty: 'Beginner',
    timeEstimate: '45 Minutes',
    fabricRequired: 'Approx. 10 x 50 cm narrow scrap strip',
    suitabilityReason: 'The natural softness and grain catch light elegantly, making small ruffled accessories feel luxurious.',
    imageUrl: '/blueprints/purple-silk-origami-scarf.jpg',
    matchScore: 92,
    tags: ['linen', 'corduroy', 'cotton', 'small scraps', 'quick'],
    materialsNeeded: [
      'Fabric strip offcut (10 x 48 cm)',
      '18 cm of 0.8cm wide braided elastic',
      'Matching all-purpose thread',
      'Safety pin for threading elastic',
    ],
    toolsNeeded: [
      'Fabric scissors',
      'Pins or sewing clips',
      'Iron',
      'Sewing machine or simple hand needle',
    ],
    steps: [
      {
        step: 1,
        title: 'Fold strip lengthwise and stitch tube',
        description: 'Fold fabric right sides facing lengthwise. Stitch with a 0.8cm seam allowance, leaving both ends open.',
      },
      {
        step: 2,
        title: 'Turn right side out',
        description: 'Attach a safety pin to one edge and feed it gently through the interior tube to flip it right side out.',
        tip: 'Press the seam flat with an iron before inserting elastic for a crisp atelier finish.'
      },
      {
        step: 3,
        title: 'Thread and knot elastic core',
        description: 'Feed elastic through the casing, overlap ends by 1.5cm, and stitch firmly with a zig-zag or secure double knot.',
      },
      {
        step: 4,
        title: 'Invisible slip-stitch closure',
        description: 'Tuck 1cm of raw edge into the other tube end. Hand-stitch closed with an invisible ladder stitch.',
      }
    ],
    patternNotes: 'Zero waste calculation: Even strips as small as 8 x 35 cm yield charming mini hair ties.',
  },
  {
    id: 'idea-cushion-cover',
    title: 'Flax & Twill Colorblock Pillow Cover',
    subtitle: 'Architectural envelope-back accent cushion with framed mitred border',
    category: 'Home Goods',
    difficulty: 'Intermediate',
    timeEstimate: '2 Hours',
    fabricRequired: 'Approx. 45 x 45 cm (or two 45 x 25 cm remnants)',
    suitabilityReason: 'Textile slub and matte finish lend an organic, tactile presence to living room sofas and reading nooks.',
    imageUrl: '/blueprints/yellow-cotton-envelope-cushion.jpg',
    matchScore: 94,
    tags: ['linen', 'cotton', 'decorative', 'home'],
    materialsNeeded: [
      'Main uploaded textile scrap (front hero panel)',
      'Two envelope backing fabric pieces (45 x 32 cm each)',
      'Matching or contrast terracotta sewing thread',
      'Standard 40x40 cm cushion insert',
    ],
    toolsNeeded: [
      'Iron with steam setting',
      'Measuring grid & chalk',
      'Sewing machine',
      'Pins',
    ],
    steps: [
      {
        step: 1,
        title: 'Prepare the front focal square',
        description: 'Square your scrap to 42 x 42 cm. If piecing multiple scraps, arrange them with an asymmetric 1/3-2/3 horizon line for an editorial modern look.',
      },
      {
        step: 2,
        title: 'Hem the envelope back flaps',
        description: 'Fold long edge of back pieces under by 1.5cm twice to enclose raw edges. Stitch down cleanly.',
      },
      {
        step: 3,
        title: 'Assemble envelope sandwich',
        description: 'Lay front piece right side up. Lay hemmed backing pieces right side down, overlapping in the center by 10cm.',
      },
      {
        step: 4,
        title: 'Stitch perimeter & clip corners',
        description: 'Stitch 1cm around all 4 outer edges. Clip excess corner fabric at a 45-degree angle to ensure sharp, crisp corners when turned.',
      }
    ],
    patternNotes: 'No zipper required! The generous 10cm envelope overlap ensures the inner cushion never peeks through.',
  },
  {
    id: 'idea-wall-hanging',
    title: 'Abstract Botanical Textile Wall Tapestry',
    subtitle: 'Raw-edged dimensional wall art mounted on a fallen drift-branch',
    category: 'Art & Living',
    difficulty: 'Beginner',
    timeEstimate: '1 Hour',
    fabricRequired: 'Approx. 30 x 40 cm scrap (or varied collage scraps)',
    suitabilityReason: 'Natural frayed edges and artisanal textures transform beautifully into gallery-worthy interior wall art.',
    imageUrl: '/blueprints/belgian-slub-linen-kimono-gilet.jpg',
    matchScore: 91,
    tags: ['linen', 'cotton', 'art', 'decor', 'frayed'],
    materialsNeeded: [
      'Assorted fabric remnants with interesting fray or print',
      'Smooth wooden dowel or natural branch (35–45 cm)',
      'Hemp twine or jute cord for hanging',
      'Embroidery floss in denim, paper, and coral',
    ],
    toolsNeeded: [
      'Fabric shears',
      'Tapestry needle',
      'Fray-check or clear craft glue (optional)',
    ],
    steps: [
      {
        step: 1,
        title: 'Curate the composition',
        description: 'Lay your scrap onto a neutral backing. Intentionally pull 3–4 weft threads from the edges to celebrate the organic raw fringe.',
      },
      {
        step: 2,
        title: 'Baste layers with loose kantha stitches',
        description: 'Use contrasting thread to make long, rhythmic hand stitches anchoring smaller scrap geometric shapes onto the base.',
      },
      {
        step: 3,
        title: 'Form top mounting sleeve',
        description: 'Fold the top 4cm over to create a tunnel. Hand-stitch in place and slide your wooden dowel through.',
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
    fabricRequired: 'Approx. 25 x 25 cm scrap (yields 4 mini squares)',
    suitabilityReason: 'Absorbent weave catches mug moisture while withstanding regular washing.',
    imageUrl: '/blueprints/green-lace-pouch.jpg',
    matchScore: 96,
    tags: ['linen', 'cotton', 'small scraps', 'easy'],
    materialsNeeded: [
      '4x 12cm outer fabric squares from your scrap',
      '4x 12cm backing squares (flax or denim)',
      'Cotton fleece or flannel scrap for heat insulation',
      'White or golden sashiko thread',
    ],
    toolsNeeded: [
      'Rotary cutter or shears',
      'Needle & thimble',
      'Iron',
    ],
    steps: [
      {
        step: 1,
        title: 'Cut 12x12 cm squares',
        description: 'Subdivide your scrap into 4 matching or coordinated squares.',
      },
      {
        step: 2,
        title: 'Sandwich with flannel interlining',
        description: 'Layer flannel between top and backing squares with right sides outwards.',
      },
      {
        step: 3,
        title: 'Stitch concentric diamond motifs',
        description: 'Hand stitch simple geometric cross or diamond paths through all three layers.',
      },
      {
        step: 4,
        title: 'Fringe or edge-stitch border',
        description: 'Run a zig-zag stitch 6mm from edge, then fray outer threads to create a delicate 5mm fringe border.',
      }
    ],
    patternNotes: 'Superb project for remnants under 20cm that are too small for pouches or tote bags.',
  },
  {
    id: 'idea-corduroy-cardholder',
    title: 'Minimalist Origami Cardholder & Key Lanyard',
    subtitle: 'Slimline accordion wallet with brass eyelet and swivel snap',
    category: 'Accessories',
    difficulty: 'Intermediate',
    timeEstimate: '1 Hour',
    fabricRequired: 'Approx. 20 x 15 cm small scrap',
    suitabilityReason: 'Structured fabric holds crisp folded edges and resists daily pocket friction.',
    imageUrl: '/blueprints/denim-crossbody-rig.jpg',
    matchScore: 90,
    tags: ['corduroy', 'denim', 'accessories', 'pocket'],
    materialsNeeded: [
      'Uploaded sturdy scrap (18 x 12 cm)',
      'Thin lining scrap (cotton lawn)',
      '1x Antique brass snap button or prong fastener',
      '1x Brass key split ring',
    ],
    toolsNeeded: [
      'Snap setter or heavy mallet',
      'Sharp needle and strong thread',
      'Iron and pressing wood',
    ],
    steps: [
      {
        step: 1,
        title: 'Fold accordion card pockets',
        description: 'Press fabric into a tri-fold origami pocket that holds 4-6 credit cards snugly.',
      },
      {
        step: 2,
        title: 'Stitch side gusset seams',
        description: 'Topstitch side edges through all folded layers using a 3mm heavy-duty stitch.',
      },
      {
        step: 3,
        title: 'Install brass snap fastener',
        description: 'Punch holes for snap hardware on front flap and body, then hammer brass components securely into place.',
      }
    ],
    patternNotes: 'Finished dimensions: 10 x 7 cm. Slips effortlessly into any pocket.',
  }
];
