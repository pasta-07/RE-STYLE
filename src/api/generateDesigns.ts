export interface FabricDesignRequest {
  fabricType: string;
  clothingType?: string;
  quantity: string;
  cost: string;
  preferences: string;
  image?: string;
  dominantColor?: string;
  colorFamily?: string;
  pattern?: string;
  condition?: string;
  texture?: string;
  notes?: string;
  dimensionsText?: string;
  colorPalette?: Array<{ name: string; hex: string } | string>;
  structuralBody?: string;
  tensileDrape?: string;
  archetype?: string;
  userConfirmedColor?: boolean;
  userConfirmedMaterial?: boolean;
}

export interface DesignConcept {
  id: string;
  design_id?: string;
  title: string;
  product_type?: string;
  description: string;
  design_description?: string;
  fabric_requirements?: {
    fabric_type?: string;
    colour?: string;
    pattern?: string;
    quantity_required_meters?: string;
  };
  design_rationale?: string;
  image_url?: string;
  image_status?: 'pending' | 'success' | 'failed' | 'needs_review';
  estimated_material_cost?: string;
  estimated_selling_price?: string;
  trend_evidence?: string[];
  generation_status?: 'pending' | 'success' | 'failed' | 'needs_review';
  feasibility?: {
    status: 'feasible' | 'tight' | 'insufficient_material' | 'unknown';
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
  estimatedFabricUsage: string;
  estimatedProductionCost: string;
  potentialSellingPrice: string;
  wasteReductionImpact: string;
  sourcesUsed: string[];
  subtitle?: string;
  category?: 'Apparel & Garments' | 'Bags & Carry' | 'Accessories' | 'Home Goods' | 'Art & Living';
  difficulty?: 'Beginner' | 'Intermediate' | 'Artisan';
  timeEstimate?: string;
  fabricRequired?: string;
  suitabilityReason?: string;
  imageUrl?: string;
  fallbackImageUrl?: string;
  matchScore?: number;
  tags?: string[];
  materialsNeeded?: string[];
  toolsNeeded?: string[];
  steps?: Array<{
    step: number;
    title: string;
    description: string;
    tip?: string;
  }>;
  patternNotes?: string;
}

export interface GenerateDesignsResponse {
  success: boolean;
  noReliableMatch?: boolean;
  conflict?: string;
  requestId?: string;
  pipelineDurationMs?: number;
  fabric: FabricDesignRequest;
  researchStatus?: string;
  researchError?: string | null;
  trendsCount: number;
  trends: Array<{
    title: string;
    snippet: string;
    url: string;
  }>;
  designs: DesignConcept[];
  error?: string;
  details?: string;
}

export interface FabricInspectionResult {
  success: boolean;
  inspection?: {
    fiberType: string;
    weave?: string;
    weightGsm?: number;
    texture?: string;
    condition?: 'Crisp Remnant' | 'Gently Washed' | 'Vintage Worn' | 'Frayed Scrap';
    suggestedName?: string;
    tagline?: string;
    dominantColor?: string;
    colorFamily?: string;
    pattern?: string;
    colorPalette?: Array<{ name: string; hex: string } | string>;
    recommendedGarments?: string[];
    structuralBody?: string;
    tensileDrape?: string;
    archetype?: string;
    confidence?: string;
    uncertaintyNotice?: string;
  };
  error?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Calls Gemini Multimodal Vision on backend to inspect textile swatch image
 */
export async function inspectFabricImage(imageData: string): Promise<FabricInspectionResult> {
  const response = await fetch(`${API_BASE_URL}/api/inspect-fabric-image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ image: imageData }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.details || errorBody.error || `HTTP ${response.status}`
    );
  }

  return response.json();
}

/**
 * Calls the Re:Style backend to retrieve live TinyFish trend-backed Gemini design concepts
 */
export async function generateDesigns(
  data: FabricDesignRequest
): Promise<GenerateDesignsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/generate-designs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fabricType: data.fabricType,
      'fabric type': data.fabricType,
      clothingType: data.clothingType,
      quantity: data.quantity,
      dimensionsText: data.dimensionsText,
      condition: data.condition,
      texture: data.texture,
      notes: data.notes,
      cost: data.cost,
      preferences: data.preferences,
      image: data.image,
      dominantColor: data.dominantColor,
      colorFamily: data.colorFamily,
      archetype: data.archetype,
      pattern: data.pattern,
      colorPalette: data.colorPalette,
      structuralBody: data.structuralBody,
      tensileDrape: data.tensileDrape,
      userConfirmedColor: data.userConfirmedColor,
      userConfirmedMaterial: data.userConfirmedMaterial,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.details || errorBody.error || `HTTP ${response.status}`
    );
  }

    return response.json();
}

/**
 * Regenerates an individual design concept's image without affecting other designs
 */
export async function regenerateDesignImage(data: {
  design_id?: string;
  concept: DesignConcept;
  fabricDetails: any;
  excludedImages?: string[];
}): Promise<{
  success: boolean;
  design_id: string;
  image_url: string;
  imageUrl: string;
  image_status: string;
  image_validation?: { passed: boolean; confidence?: string; notes: string };
}> {
  const response = await fetch(`${API_BASE_URL}/api/regenerate-design-image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.details || errorBody.error || `HTTP ${response.status}`
    );
  }

  return response.json();
}

export interface ProjectPreviewResult {
  success: boolean;
  previewUrl: string | null;
  imageUrl?: string | null;
  isPhotoConditioned: boolean;
  provider?: string;
  label?: string;
  disclaimer?: string;
  colorPreserved?: boolean;
  error?: string;
  message?: string;
  requiresSetup?: boolean;
  setupInstructions?: any;
  promptConstraints?: any;
  constraintsEnforced?: any;
}

/**
 * Requests an authentic fabric-conditioned project preview using the uploaded fabric photo
 */
export async function generateProjectPreview(data: {
  fabricImage: string;
  fabricDetails?: any;
  projectDetails?: any;
  fabricColor?: string;
  fabricMaterial?: string;
  fabricDimensions?: string;
  projectTitle?: string;
  projectDescription?: string;
  category?: string;
  testMode?: boolean;
}): Promise<ProjectPreviewResult> {
  const response = await fetch(`${API_BASE_URL}/api/generate-project-preview`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    return {
      success: false,
      previewUrl: null,
      imageUrl: null,
      isPhotoConditioned: false,
      error: errorBody.error || errorBody.details || `HTTP ${response.status}`,
      message: errorBody.message,
      requiresSetup: errorBody.requiresSetup,
      setupInstructions: errorBody.setupInstructions
    };
  }

  const json = await response.json();
  const effectiveUrl = json.imageUrl || json.previewUrl || null;
  return {
    ...json,
    imageUrl: effectiveUrl,
    previewUrl: effectiveUrl
  };
}
