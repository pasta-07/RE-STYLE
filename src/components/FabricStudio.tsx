import React, { useState, useRef, useMemo } from 'react';
import { 
  UploadCloud, 
  Trash2, 
  RefreshCw, 
  Sparkles, 
  Sliders, 
  Ruler, 
  Check, 
  Scan, 
  HelpCircle,
  AlertCircle,
  Layers,
  Palette,
  Scissors,
  FileText,
  Tag,
  CheckCircle2,
  X
} from 'lucide-react';
import { SAMPLE_FABRICS } from '../data/mockFabrics';
import type { FabricSample } from '../data/mockFabrics';
import { inspectFabricImage } from '../api/generateDesigns';
import { extractColorsFromDataUrl } from '../utils/colorExtractor';
import { UPCYCLING_IDEAS } from '../data/upcyclingIdeas';
import { evaluateFabricFeasibility } from '../utils/fabricFeasibility';

interface FabricStudioProps {
  currentFabric: FabricSample;
  onFabricChange: (fabric: FabricSample) => void;
  onAnalyze: (fabric: FabricSample) => void;
  isAnalyzing: boolean;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

// Quick suggested clothing and textile types
const CLOTHING_SUGGESTIONS = [
  { label: 'Denim Jeans / Jacket', fiber: 'Raw Indigo Denim', gsm: 360, archetype: 'denim-workwear', body: 'Rigid Heavy Twill', drape: 'Structured boxy crease' },
  { label: 'Linen Button-Up Shirt', fiber: 'Washed European Linen', gsm: 185, archetype: 'linen-slub', body: 'Airy Slub Weave', drape: 'Soft breathable relaxed drape' },
  { label: 'Corduroy Trousers', fiber: 'Wide-Wale Corduroy', gsm: 320, archetype: 'corduroy-velvet', body: 'Wale Ribbed Velvet', drape: 'Tactile plush structured drape' },
  { label: 'Cotton Bedsheet / Scrap', fiber: 'Handloom Cotton', gsm: 160, archetype: 'cotton-handloom', body: 'Breathable Plain Weave', drape: 'Malleable gentle fold lines' },
  { label: 'Wool Knit / Coat', fiber: 'Merino Wool Tweed', gsm: 400, archetype: 'wool-tweed', body: 'Lofty Coarse Wool', drape: 'Firm tailoring resilience' },
  { label: 'Silk Blouse / Scarf', fiber: 'Mulberry Silk Satin', gsm: 95, archetype: 'silk-satin', body: 'Ultra-Fine Lustrous Filament', drape: 'Liquid high-fluidity cascading drape' },
  { label: 'Lace Curtain / Trim', fiber: 'Embroidered Guipure Lace', gsm: 140, archetype: 'lace-sheer', body: 'Openwork Floral Lace', drape: 'Fluid delicate sheer drape' },
];

// Curated chromatic palette swatches
const COLOR_PRESETS = [
  { name: 'Deep Indigo', hex: '#253247', family: 'indigo-denim' },
  { name: 'Washed Denim', hex: '#496E8A', family: 'indigo-denim' },
  { name: 'Natural Flax', hex: '#D5CBB9', family: 'white-light' },
  { name: 'Warm Terracotta', hex: '#C96F52', family: 'red-terracotta' },
  { name: 'Golden Marigold', hex: '#D6AD64', family: 'yellow-gold' },
  { name: 'Forest Olive', hex: '#2D4A3E', family: 'green-olive' },
  { name: 'Plum Heather', hex: '#5A3D5C', family: 'purple-silk' },
  { name: 'Crisp Ecru', hex: '#F7F4EE', family: 'white-light' },
  { name: 'Charcoal Black', hex: '#1E232A', family: 'dark-black' },
];

// Condition definitions
const CONDITION_OPTIONS = [
  { label: 'Crisp Remnant', desc: 'Unused factory or bolt offcut' },
  { label: 'Gently Washed', desc: 'Clean, softened pre-loved garment' },
  { label: 'Vintage Worn', desc: 'Authentic patina with softened fold lines' },
  { label: 'Frayed Scrap', desc: 'Small offcut with raw or frayed edges' },
  { label: 'Stained / Distressed', desc: 'Flawed areas to cut around or mend' },
  { label: 'Thrifted Garment', desc: 'Whole piece ready for deconstruction' },
];

// Tactile texture options
const TEXTURE_OPTIONS = [
  'Sturdy & Structured',
  'Soft & Drapey',
  'Ribbed & Corded',
  'Sheer & Openwork',
  'Lofty & Warm',
  'Crisp Slub Weave',
];

// Surface pattern options
const PATTERN_OPTIONS = [
  'Solid Plain',
  'Yarn-Dyed Stripe',
  'Plaid / Tartan Check',
  'Floral Motifs',
  'Geometric / Quilted',
  'Printed Graphic',
];

/**
 * Intelligent natural language dimension parser
 * Supports inputs like "a 4 × 4 piece", "4x4", "10x15 in", "35x45 cm", "1.5 meters"
 */
function parseNaturalDimensions(text: string): { width: number; height: number; unit: 'cm' | 'in' } | null {
  if (!text || typeof text !== 'string') return null;
  const match = text.match(/(\d+(?:\.\d+)?)\s*(?:[x×by*]|and)\s*(\d+(?:\.\d+)?)\s*(cm|in|inch|inches|meters|m)?/i);
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
      unit = (d1 <= 15 && d2 <= 15) ? 'in' : 'cm';
    }
    return { width: d1, height: d2, unit };
  }
  return null;
}

export const FabricStudio: React.FC<FabricStudioProps> = ({
  currentFabric,
  onFabricChange,
  onAnalyze,
  isAnalyzing,
  selectedCategory,
  onCategoryChange,
}) => {
  const [studioMode, setStudioMode] = useState<'custom' | 'presets'>('custom');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isInspectingImage, setIsInspectingImage] = useState(false);
  const [inspectionBadge, setInspectionBadge] = useState<string | null>(null);
  const [uncertaintyNotice, setUncertaintyNotice] = useState<string | null>(currentFabric.uncertaintyNotice || null);
  const [dimensionsInputText, setDimensionsInputText] = useState<string>(
    currentFabric.dimensionsText || `${currentFabric.dimensions.width} × ${currentFabric.dimensions.height} ${currentFabric.dimensions.unit}`
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeUploadIdRef = useRef<string | null>(null);

  // Directly derive values from currentFabric as the single source of truth
  const width = currentFabric.dimensions.width;
  const height = currentFabric.dimensions.height;
  const unit = currentFabric.dimensions.unit;
  const condition = currentFabric.condition;

  // Dynamic Pattern Engine Strategy derived from current fabric metrics and matching catalog projects
  const strategySummary = useMemo(() => {
    const w = currentFabric.dimensions.width;
    const h = currentFabric.dimensions.height;
    const u = currentFabric.dimensions.unit;
    const gsm = currentFabric.weightGsm || 200;

    const evaluated = UPCYCLING_IDEAS.map(idea => ({
      title: idea.title,
      feasibility: evaluateFabricFeasibility(idea, currentFabric)
    }));

    const directlyMatched = evaluated.filter(e => e.feasibility.isDirectlyMatched).map(e => e.title);
    const requiresMod = evaluated.filter(e => !e.feasibility.isDirectlyMatched).map(e => e.title);

    const itemLabel = currentFabric.clothingType || currentFabric.name;
    let strategy = `Calculated 2D layout for ${itemLabel} (${w}×${h} ${u}, ~${gsm} GSM): `;
    if (directlyMatched.length > 0) {
      strategy += `${directlyMatched.length} project${directlyMatched.length === 1 ? '' : 's'} fit directly without extra yardage (${directlyMatched.slice(0, 3).join(', ')}${directlyMatched.length > 3 ? `, +${directlyMatched.length - 3} more` : ''}). `;
    } else {
      strategy += `No standard blueprints fit this remnant directly without piecing. `;
    }

    if (requiresMod.length > 0) {
      strategy += `${requiresMod.length} project${requiresMod.length === 1 ? '' : 's'} (${requiresMod.slice(0, 2).join(', ')}) require modular piecing or separate backing fabric.`;
    }

    return strategy;
  }, [currentFabric]);

  // Handle unit conversion preserving physical dimensions
  const handleUnitToggle = (newUnit: 'cm' | 'in') => {
    if (newUnit === unit) return;

    if (newUnit === 'in') {
      const convertedWidth = Math.max(1, Math.round(width / 2.54));
      const convertedHeight = Math.max(1, Math.round(height / 2.54));
      onFabricChange({
        ...currentFabric,
        dimensions: { width: convertedWidth, height: convertedHeight, unit: 'in' },
        dimensionsText: `${convertedWidth} × ${convertedHeight} in`,
      });
      setDimensionsInputText(`${convertedWidth} × ${convertedHeight} in`);
    } else {
      const convertedWidth = Math.round(width * 2.54);
      const convertedHeight = Math.round(height * 2.54);
      onFabricChange({
        ...currentFabric,
        dimensions: { width: convertedWidth, height: convertedHeight, unit: 'cm' },
        dimensionsText: `${convertedWidth} × ${convertedHeight} cm`,
      });
      setDimensionsInputText(`${convertedWidth} × ${convertedHeight} cm`);
    }
  };

  // Natural language dimensions input handler
  const handleDimensionsTextChange = (text: string) => {
    setDimensionsInputText(text);
    const parsed = parseNaturalDimensions(text);
    if (parsed) {
      onFabricChange({
        ...currentFabric,
        dimensions: { width: parsed.width, height: parsed.height, unit: parsed.unit },
        dimensionsText: text,
      });
    } else {
      onFabricChange({
        ...currentFabric,
        dimensionsText: text,
      });
    }
  };

  // Dimension validation
  const maxDimension = unit === 'cm' ? 400 : 160;
  const isWidthValid = !isNaN(width) && width >= 1 && width <= maxDimension;
  const isHeightValid = !isNaN(height) && height >= 1 && height <= maxDimension;
  const isDimensionsValid = isWidthValid && isHeightValid;

  const getDimensionErrorMessage = () => {
    if (!isWidthValid || !isHeightValid) {
      return `Please enter positive dimensions between 1 and ${maxDimension} ${unit} (e.g. "4 × 4 piece" or 35 × 45 cm).`;
    }
    return null;
  };

  // Supported image types and size limit (8 MB)
  const SUPPORTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

  const processUploadedFile = (file: File) => {
    setUploadError(null);
    setUncertaintyNotice(null);

    // Validate type
    if (!SUPPORTED_MIME_TYPES.includes(file.type)) {
      setUploadError('Unsupported format. Please upload a standard JPG, PNG, or WEBP image.');
      return;
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setUploadError(`File exceeds maximum size limit (8MB). Selected file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      setUploadError('Failed to read image file. Please try again or select another image.');
    };

    reader.onload = async (event) => {
      const result = event.target?.result as string;
      const uploadId = `upload-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      activeUploadIdRef.current = uploadId;
      
      // Step 1: Immediate client-side canvas pixel & textile grain analysis
      const colorProfile = await extractColorsFromDataUrl(result, file.name);

      // Check if user has explicitly confirmed their fabric color or material
      const userHasConfirmedColor = Boolean(
        currentFabric.userConfirmedColor || 
        (currentFabric.dominantColor && currentFabric.dominantColor !== 'Natural Fiber' && currentFabric.dominantColor !== 'Default' && currentFabric.dominantColor.trim() !== '')
      );
      const userConfirmedColorVal = currentFabric.dominantColor;
      const userConfirmedColorFamily = currentFabric.colorFamily;

      const userHasConfirmedMaterial = Boolean(
        currentFabric.userConfirmedMaterial || 
        (currentFabric.clothingType && currentFabric.clothingType.trim() !== '') ||
        (currentFabric.material && !/item|remnant|sample|test|fabric/i.test(currentFabric.material))
      );
      const userConfirmedMaterialVal = currentFabric.clothingType || currentFabric.material;

      // Determine effective color & fiber - preserve user constraints
      const effectiveColor = userHasConfirmedColor && userConfirmedColorVal ? userConfirmedColorVal : colorProfile.dominantColor;
      const effectiveColorFamily = userHasConfirmedColor && userConfirmedColorFamily ? userConfirmedColorFamily : colorProfile.colorFamily;
      const effectiveMaterial = userHasConfirmedMaterial && userConfirmedMaterialVal ? userConfirmedMaterialVal : colorProfile.fiberType;

      const customSample: FabricSample = {
        id: `custom-upload-${Date.now()}`,
        name: `${effectiveColor} ${effectiveMaterial} Item`,
        clothingType: currentFabric.clothingType || '',
        material: effectiveMaterial,
        weave: colorProfile.weave,
        weightGsm: colorProfile.weightGsm,
        condition: condition,
        dimensions: { width, height, unit },
        dimensionsText: dimensionsInputText,
        dominantColor: effectiveColor,
        colorFamily: effectiveColorFamily,
        pattern: colorProfile.pattern,
        colorPalette: colorProfile.colorPalette,
        texture: `${colorProfile.structuralBody} with ${colorProfile.tensileDrape}`,
        imageUrl: result,
        tagline: `Authentic ${effectiveColor} ${effectiveMaterial} (~${colorProfile.weightGsm} GSM) optimized for zero-waste blueprints.`,
        structuralBody: colorProfile.structuralBody,
        tensileDrape: colorProfile.tensileDrape,
        archetype: colorProfile.archetype,
        isCustomItem: true,
        userConfirmedColor: userHasConfirmedColor,
        userConfirmedMaterial: userHasConfirmedMaterial,
      };
      onFabricChange(customSample);

      setIsInspectingImage(true);
      setInspectionBadge(`Analyzing textile swatch (${effectiveMaterial}, ${effectiveColor}) with Gemini Vision...`);

      try {
        const res = await inspectFabricImage(result);
        if (activeUploadIdRef.current !== uploadId) return;

        if (res.success && res.inspection) {
          const insp = res.inspection;
          const formattedColors = Array.isArray(insp.colorPalette) && insp.colorPalette.length > 0
            ? insp.colorPalette.map((c: any, i: number) => {
                if (typeof c === 'string') return { name: `Tone ${i + 1}`, hex: c };
                return { name: c.name || `Tone ${i + 1}`, hex: c.hex || colorProfile.colorPalette[i]?.hex || '#253247' };
              })
            : colorProfile.colorPalette;

          // Never let uncertain photo analysis silently override user-confirmed color or material
          const detectedColor = userHasConfirmedColor && userConfirmedColorVal ? userConfirmedColorVal : (insp.dominantColor || colorProfile.dominantColor);
          const detectedFiber = userHasConfirmedMaterial && userConfirmedMaterialVal ? userConfirmedMaterialVal : (insp.fiberType || colorProfile.fiberType);
          const detectedPattern = insp.pattern || colorProfile.pattern;
          const detectedFamily = userHasConfirmedColor && userConfirmedColorFamily ? userConfirmedColorFamily : ((insp.colorFamily as any) || colorProfile.colorFamily);
          const detectedGsm = insp.weightGsm || colorProfile.weightGsm;
          const detectedWeave = insp.weave || colorProfile.weave;
          const detectedBody = insp.structuralBody || colorProfile.structuralBody;
          const detectedDrape = insp.tensileDrape || colorProfile.tensileDrape;
          const detectedArchetype = (insp.archetype as any) || colorProfile.archetype;

          // Check if visual confidence is low or uncertain, or if photo suggested different color
          const confidenceLevel = insp.confidence || 'medium';
          let notice: string | null = null;
          if (userHasConfirmedColor && userConfirmedColorVal && insp.dominantColor && insp.dominantColor.toLowerCase() !== userConfirmedColorVal.toLowerCase()) {
            notice = `Photo inspection detected ${insp.dominantColor}, but your confirmed color constraint (${userConfirmedColorVal}) was preserved.`;
            setUncertaintyNotice(notice);
          } else if (confidenceLevel === 'low' || detectedFiber === 'unknown' || detectedFiber === 'Textile Remnant') {
            notice = `Photo inspection has partial uncertainty: detected ${detectedColor}, but weave structure and fiber composition could not be confirmed definitively. Please verify or update your clothing type, dimensions, and texture below for accurate blueprint matching.`;
            setUncertaintyNotice(notice);
          }

          const updatedSample: FabricSample = {
            ...customSample,
            name: insp.suggestedName && !userHasConfirmedMaterial && !userHasConfirmedColor ? insp.suggestedName : `${detectedColor} ${detectedFiber} Item`,
            material: detectedFiber,
            weave: detectedWeave,
            weightGsm: detectedGsm,
            texture: detectedBody ? `${detectedBody} • ${detectedDrape}` : (insp.texture || customSample.texture),
            tagline: insp.tagline || customSample.tagline,
            dominantColor: detectedColor,
            colorFamily: detectedFamily,
            pattern: detectedPattern,
            colorPalette: formattedColors,
            structuralBody: detectedBody,
            tensileDrape: detectedDrape,
            archetype: detectedArchetype,
            uncertaintyNotice: notice,
            userConfirmedColor: userHasConfirmedColor,
            userConfirmedMaterial: userHasConfirmedMaterial,
          };
          onFabricChange(updatedSample);
          setInspectionBadge(`✨ AI Verified: ${detectedColor} ${detectedFiber} • ${detectedWeave} • ~${detectedGsm} GSM`);
        } else {
          setInspectionBadge(`🎨 Identified: ${effectiveColor} ${effectiveMaterial} • ${colorProfile.weave}`);
        }
      } catch (err) {
        if (activeUploadIdRef.current !== uploadId) return;
        console.warn('[Vision Inspection Notice]', err);
        setInspectionBadge(`🎨 Identified: ${effectiveColor} ${effectiveMaterial}`);
      } finally {
        if (activeUploadIdRef.current === uploadId) {
          setIsInspectingImage(false);
        }
      }
    };

    reader.readAsDataURL(file);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const handleSelectSample = (sample: FabricSample) => {
    setUploadError(null);
    setInspectionBadge(null);
    setUncertaintyNotice(null);
    setDimensionsInputText(`${sample.dimensions.width} × ${sample.dimensions.height} ${sample.dimensions.unit}`);
    onFabricChange(sample);
  };

  const handleRemovePhoto = () => {
    onFabricChange({
      ...currentFabric,
      imageUrl: '',
      isCustomItem: true,
    });
    setInspectionBadge(null);
    setUncertaintyNotice(null);
  };

  const handleTriggerAnalysis = () => {
    if (!isDimensionsValid || isInspectingImage) return;
    onAnalyze(currentFabric);
  };

  return (
    <section id="studio-section" className="py-20 lg:py-28 bg-paper-100 border-y border-navy/10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bluegray text-navy text-xs font-semibold uppercase tracking-wider mb-3 border border-bluegray-200">
            <Scan className="w-3.5 h-3.5 text-coral" />
            <span>Find My Project • Studio</span>
          </div>
          <h2 className="font-serif-title text-3xl sm:text-4xl lg:text-5xl text-navy font-semibold leading-tight">
            Describe your clothing or fabric.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-charcoal-muted leading-relaxed">
            Enter your own clothing or fabric details below—such as garment type, dimensions (e.g. &ldquo;a 4 × 4 piece&rdquo;), color, texture, and condition. We synthesize zero-waste blueprints specifically tailored to your item.
          </p>
        </div>

        {/* Mode Selector Tabs: Describe My Item vs Quick Sample Presets */}
        <div className="flex items-center gap-3 mb-8 p-1.5 bg-surface rounded-2xl border border-navy/15 max-w-fit shadow-xs">
          <button
            type="button"
            onClick={() => setStudioMode('custom')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              studioMode === 'custom'
                ? 'bg-navy text-paper shadow-sm'
                : 'text-charcoal-muted hover:text-navy hover:bg-paper-100'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-coral" />
            <span>Describe My Own Item (Find My Project)</span>
          </button>

          <button
            type="button"
            onClick={() => setStudioMode('presets')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              studioMode === 'presets'
                ? 'bg-navy text-paper shadow-sm'
                : 'text-charcoal-muted hover:text-navy hover:bg-paper-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-denim" />
            <span>Try Quick Presets ({SAMPLE_FABRICS.length} Samples)</span>
          </button>
        </div>

        {/* Preset Specimens Bar (Visible in presets mode or quick access) */}
        {studioMode === 'presets' && (
          <div className="mb-10 p-5 rounded-2xl bg-surface border border-navy/15 shadow-sm animate-fadeIn">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4 pb-3 border-b border-navy/10">
              <div>
                <h3 className="font-serif text-lg font-bold text-navy">
                  Try Evaluator Specimens <span className="text-sm font-sans font-normal text-charcoal-muted">(1-Click Test)</span>
                </h3>
                <p className="text-xs text-charcoal-muted mt-0.5">
                  Click any specimen to load real fabric metrics, dimensions, and swatch photo.
                </p>
              </div>
              <span className="text-xs font-mono text-coral bg-coral/10 px-2.5 py-1 rounded-full font-medium">
                {SAMPLE_FABRICS.length} Specimens Ready
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {SAMPLE_FABRICS.map((sample) => {
                const isSelected = currentFabric.id === sample.id;
                return (
                  <button
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    aria-label={`Select specimen ${sample.name}`}
                    className={`group text-left p-3 rounded-xl border transition-all duration-200 relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-denim ${
                      isSelected 
                        ? 'border-navy bg-bluegray/40 ring-2 ring-navy/20 shadow-md' 
                        : 'border-navy/15 bg-surface hover:border-navy/40 hover:bg-paper-50'
                    }`}
                  >
                    <div className="aspect-[4/3] rounded-lg overflow-hidden mb-2.5 bg-paper-200 relative">
                      <img 
                        src={sample.imageUrl} 
                        alt={sample.name} 
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-navy text-paper flex items-center justify-center shadow">
                          <Check className="w-3 h-3 text-paper" />
                        </div>
                      )}
                    </div>
                    <p className="font-serif text-sm font-bold text-navy truncate group-hover:text-coral transition-colors">
                      {sample.name}
                    </p>
                    <p className="text-[11px] text-charcoal-muted truncate mt-0.5">
                      {sample.material}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-mono text-navy/70">
                      <span>{sample.dimensions.width}×{sample.dimensions.height} {sample.dimensions.unit}</span>
                      <span>•</span>
                      <span>{sample.weightGsm} GSM</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Studio Interactive Workspace: 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Drag & Drop Dropzone + Live Preview */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-surface rounded-3xl p-6 sm:p-7 border border-navy/15 shadow-warm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase font-mono tracking-wider text-navy font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-coral"></span>
                  Visual Swatch or Item Photo
                </span>
                {currentFabric.imageUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="text-[11px] font-mono text-charcoal-muted hover:text-coral flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    <span>Clear Photo</span>
                  </button>
                )}
              </div>

              {/* Upload Error Alert */}
              {uploadError && (
                <div className="mb-4 p-3.5 rounded-xl bg-coral/10 border border-coral/30 text-xs text-coral-dark flex items-start justify-between gap-3 animate-fadeIn">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{uploadError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadError(null);
                      fileInputRef.current?.click();
                    }}
                    className="font-semibold underline hover:text-navy text-xs whitespace-nowrap"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Uncertainty Alert Banner */}
              {uncertaintyNotice && (
                <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-semibold block">Input Clarity Notice</span>
                    <span className="text-[11px] leading-relaxed block text-amber-800">{uncertaintyNotice}</span>
                  </div>
                </div>
              )}

              {/* Upload Drop Area */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label="Upload clothing or fabric photo"
                className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 min-h-[260px] sm:min-h-[300px] flex flex-col items-center justify-center border-2 border-dashed focus:outline-none focus-visible:ring-2 focus-visible:ring-denim ${
                  isDragging 
                    ? 'border-coral bg-coral/5 scale-[0.99]' 
                    : 'border-navy/25 hover:border-navy/50 bg-paper-50'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />

                {currentFabric.imageUrl ? (
                  <div className="relative w-full h-full min-h-[280px] group">
                    <img
                      src={currentFabric.imageUrl}
                      alt={currentFabric.name}
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80';
                      }}
                      className="w-full h-full object-cover min-h-[280px]"
                    />
                    
                    {/* Dark gradient overlay on hover */}
                    <div className="absolute inset-0 bg-navy/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-xs">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="px-4 py-2 rounded-full bg-paper text-navy text-xs font-semibold flex items-center gap-1.5 shadow hover:bg-navy hover:text-paper transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Replace Photo
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePhoto();
                        }}
                        className="px-4 py-2 rounded-full bg-coral text-paper text-xs font-semibold flex items-center gap-1.5 shadow hover:bg-coral-dark transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Clear Photo
                      </button>
                    </div>

                    {/* Bottom metadata chip */}
                    <div className="absolute bottom-3 left-3 right-3 bg-paper/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-navy/10 flex items-center justify-between text-xs text-charcoal">
                      <span className="font-serif font-bold text-navy truncate">
                        {currentFabric.clothingType || currentFabric.name}
                      </span>
                      <span className="font-mono text-[11px] text-coral font-semibold uppercase">{condition}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center max-w-sm space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-bluegray text-navy mx-auto flex items-center justify-center">
                      <UploadCloud className="w-7 h-7 text-coral" />
                    </div>
                    <p className="font-serif text-lg font-bold text-navy">
                      Drop an image of your item or fabric
                    </p>
                    <p className="text-xs text-charcoal-muted leading-relaxed">
                      Photo is optional. Lay your item or scrap flat for best color & weave detection, or describe it with text.
                    </p>
                    <span className="inline-block px-4 py-2 rounded-full bg-navy text-paper text-xs font-medium mt-2">
                      Browse Files
                    </span>
                  </div>
                )}
              </div>

              {/* Photo Analysis Badge & Status */}
              {inspectionBadge && (
                <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between gap-2 animate-fadeIn">
                  <span className="font-mono text-[11px] font-medium leading-tight">
                    {inspectionBadge}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                </div>
              )}

              {/* 2D Pattern Calculation Strategy Card */}
              <div className="mt-5 p-4 rounded-2xl bg-navy/5 border border-navy/15 space-y-2.5 text-xs">
                <span className="font-mono uppercase font-bold text-navy flex items-center gap-1.5 text-[11px]">
                  <Scissors className="w-3.5 h-3.5 text-coral" />
                  Live Geometric Fit Strategy
                </span>
                <p className="text-charcoal leading-relaxed text-[11px]">
                  {strategySummary}
                </p>
                <div className="flex items-center justify-between pt-1 font-mono text-[10px] text-charcoal-muted border-t border-navy/10">
                  <span>Surface: {width} × {height} {unit}</span>
                  <span>Total Area: ~{Math.round(unit === 'in' ? width * height * 6.45 : width * height)} cm²</span>
                </div>
              </div>

            </div>
          </div>

          {/* Right: Comprehensive "Find My Project" Item Details Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-navy/15 shadow-warm space-y-6">
              
              <div className="border-b border-navy/10 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-navy flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-coral" />
                    Item & Fabric Details
                  </h3>
                  <p className="text-xs text-charcoal-muted mt-1">
                    Describe your piece. Every detail dynamically shapes the generated blueprints.
                  </p>
                </div>
                {isInspectingImage && (
                  <span className="text-[11px] font-mono font-bold text-coral flex items-center gap-1 animate-pulse bg-coral/10 px-2.5 py-1 rounded-full">
                    <Sparkles className="w-3 h-3 animate-spin" />
                    Gemini Vision Active
                  </span>
                )}
              </div>

              {/* 1. Clothing or Fabric Type Input + Suggestions */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="item-type-input" className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <Tag className="w-3.5 h-3.5 text-coral" />
                    Clothing or Fabric Type
                  </label>
                  <span className="text-[10px] text-charcoal-muted font-mono">Custom or preset</span>
                </div>

                <input
                  id="item-type-input"
                  type="text"
                  value={currentFabric.clothingType || currentFabric.material || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    onFabricChange({
                      ...currentFabric,
                      clothingType: val,
                      material: val,
                      userConfirmedMaterial: true,
                      name: val ? `${currentFabric.dominantColor || ''} ${val}`.trim() : currentFabric.name,
                      isCustomItem: true,
                    });
                  }}
                  placeholder="e.g. Vintage Levi's Denim Jacket, Linen Button-Down, Wool Sweater, Cotton Bedsheet..."
                  className="w-full bg-paper border border-navy/20 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-navy focus:outline-none focus:ring-2 focus:ring-navy/30"
                />

                {/* Quick Suggestion Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {CLOTHING_SUGGESTIONS.map((sug) => {
                    const isSelected = (currentFabric.clothingType || currentFabric.material || '').toLowerCase().includes(sug.label.toLowerCase().split(' ')[0]);
                    return (
                      <button
                        key={sug.label}
                        type="button"
                        onClick={() => {
                          onFabricChange({
                            ...currentFabric,
                            clothingType: sug.label,
                            material: sug.fiber,
                            userConfirmedMaterial: true,
                            name: `${currentFabric.dominantColor || ''} ${sug.label}`.trim(),
                            weightGsm: sug.gsm,
                            archetype: sug.archetype as any,
                            structuralBody: sug.body,
                            tensileDrape: sug.drape,
                            texture: `${sug.body} • ${sug.drape}`,
                            isCustomItem: true,
                          });
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all ${
                          isSelected
                            ? 'bg-navy text-paper font-bold shadow-xs'
                            : 'bg-paper border border-navy/15 text-charcoal hover:border-coral hover:text-coral'
                        }`}
                      >
                        {sug.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Dimensions or Amount (Supports Natural Language like "a 4 × 4 piece" & Numerical W×H) */}
              <div className="space-y-3 p-4 rounded-2xl bg-paper-100 border border-navy/15">
                <div className="flex items-center justify-between">
                  <label htmlFor="natural-dimensions-input" className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <Ruler className="w-3.5 h-3.5 text-coral" />
                    Dimensions or Amount
                  </label>
                  
                  {/* Unit switcher with conversion */}
                  <div className="flex bg-paper-200 rounded-lg p-0.5 border border-navy/15 text-xs">
                    <button
                      type="button"
                      onClick={() => handleUnitToggle('cm')}
                      className={`px-2.5 py-0.5 rounded-md font-mono text-[11px] transition-colors focus:outline-none ${
                        unit === 'cm' ? 'bg-navy text-paper font-bold' : 'text-charcoal-muted hover:text-navy'
                      }`}
                    >
                      CM
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUnitToggle('in')}
                      className={`px-2.5 py-0.5 rounded-md font-mono text-[11px] transition-colors focus:outline-none ${
                        unit === 'in' ? 'bg-navy text-paper font-bold' : 'text-charcoal-muted hover:text-navy'
                      }`}
                    >
                      INCH
                    </button>
                  </div>
                </div>

                {/* Natural text entry */}
                <div>
                  <input
                    id="natural-dimensions-input"
                    type="text"
                    value={dimensionsInputText}
                    onChange={(e) => handleDimensionsTextChange(e.target.value)}
                    placeholder="e.g. a 4 × 4 piece, 1 large shirt, 45 × 35 cm, 1.5 yards..."
                    className="w-full bg-paper border border-navy/20 rounded-xl px-3.5 py-2 text-xs font-mono text-navy focus:outline-none focus:ring-2 focus:ring-navy/30"
                  />
                  <span className="text-[10px] text-charcoal-muted mt-1 block">
                    Type colloquial expressions like &ldquo;a 4 × 4 piece&rdquo; or specify length and width numbers below.
                  </span>
                </div>

                {/* Exact numbers */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[11px] text-charcoal-muted block mb-1">Width</span>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max={maxDimension}
                        value={width}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          onFabricChange({
                            ...currentFabric,
                            dimensions: { ...currentFabric.dimensions, width: val },
                            dimensionsText: `${val} × ${height} ${unit}`,
                          });
                          setDimensionsInputText(`${val} × ${height} ${unit}`);
                        }}
                        className={`w-full bg-paper border rounded-xl px-3.5 py-2 text-xs font-mono text-charcoal focus:outline-none focus:ring-2 ${
                          isWidthValid ? 'border-navy/20 focus:ring-navy/30' : 'border-coral focus:ring-coral/30'
                        }`}
                      />
                      <span className="absolute right-3 top-2 text-xs text-charcoal-muted font-mono">{unit}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-charcoal-muted block mb-1">Length / Height</span>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max={maxDimension}
                        value={height}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          onFabricChange({
                            ...currentFabric,
                            dimensions: { ...currentFabric.dimensions, height: val },
                            dimensionsText: `${width} × ${val} ${unit}`,
                          });
                          setDimensionsInputText(`${width} × ${val} ${unit}`);
                        }}
                        className={`w-full bg-paper border rounded-xl px-3.5 py-2 text-xs font-mono text-charcoal focus:outline-none focus:ring-2 ${
                          isHeightValid ? 'border-navy/20 focus:ring-navy/30' : 'border-coral focus:ring-coral/30'
                        }`}
                      />
                      <span className="absolute right-3 top-2 text-xs text-charcoal-muted font-mono">{unit}</span>
                    </div>
                  </div>
                </div>

                {!isDimensionsValid && (
                  <p className="text-[11px] text-coral mt-1 flex items-center gap-1 animate-fadeIn">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{getDimensionErrorMessage()}</span>
                  </p>
                )}
              </div>

              {/* 3. Dominant Color & Chromatic Palette */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="fabric-color-input" className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <Palette className="w-3.5 h-3.5 text-coral" />
                    Color & Palette
                  </label>
                  <span className="text-[10px] text-charcoal-muted font-mono">{currentFabric.dominantColor || 'Default'}</span>
                </div>

                <input
                  id="fabric-color-input"
                  type="text"
                  value={currentFabric.dominantColor || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    onFabricChange({
                      ...currentFabric,
                      dominantColor: val,
                      userConfirmedColor: true,
                      name: `${val} ${currentFabric.clothingType || currentFabric.material || 'Piece'}`.trim(),
                    });
                  }}
                  placeholder="e.g. Deep Indigo Blue, Sage Green, Terracotta Red..."
                  className="w-full bg-paper border border-navy/20 rounded-xl px-3.5 py-2 text-xs font-medium text-navy focus:outline-none focus:ring-2 focus:ring-navy/30"
                />

                {/* Quick Color Swatches */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        onFabricChange({
                          ...currentFabric,
                          dominantColor: preset.name,
                          colorFamily: preset.family,
                          userConfirmedColor: true,
                          colorPalette: [{ name: preset.name, hex: preset.hex }],
                          name: `${preset.name} ${currentFabric.clothingType || currentFabric.material || 'Piece'}`.trim(),
                        });
                      }}
                      className="group flex items-center gap-1.5 px-2 py-1 rounded-lg border border-navy/15 bg-paper hover:border-coral transition-all"
                      title={preset.name}
                    >
                      <span className="w-3.5 h-3.5 rounded-full border border-navy/20 shadow-2xs" style={{ backgroundColor: preset.hex }} />
                      <span className="text-[10px] font-mono text-charcoal">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Condition Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-navy uppercase tracking-wider block font-mono">
                  Remnant or Garment Condition
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CONDITION_OPTIONS.map((opt) => {
                    const isSelected = condition === opt.label;
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => {
                          onFabricChange({
                            ...currentFabric,
                            condition: opt.label,
                          });
                        }}
                        className={`p-2.5 rounded-xl text-left border transition-all ${
                          isSelected
                            ? 'border-navy bg-navy text-paper shadow-xs'
                            : 'border-navy/15 bg-paper text-charcoal hover:border-navy/30'
                        }`}
                      >
                        <span className="font-serif text-xs font-bold block truncate">{opt.label}</span>
                        <span className={`text-[10px] block mt-0.5 truncate ${isSelected ? 'text-paper/80' : 'text-charcoal-muted'}`}>
                          {opt.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Texture & Surface Pattern */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Texture */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-navy uppercase tracking-wider block font-mono">
                    Texture & Drape
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {TEXTURE_OPTIONS.map((tex) => {
                      const isSelected = (currentFabric.texture || '').includes(tex);
                      return (
                        <button
                          key={tex}
                          type="button"
                          onClick={() => {
                            onFabricChange({
                              ...currentFabric,
                              texture: tex,
                              structuralBody: tex,
                            });
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all ${
                            isSelected
                              ? 'bg-navy text-paper font-bold'
                              : 'bg-paper border border-navy/15 text-charcoal hover:border-coral'
                          }`}
                        >
                          {tex}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Pattern */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-navy uppercase tracking-wider block font-mono">
                    Surface Pattern
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {PATTERN_OPTIONS.map((pat) => {
                      const isSelected = (currentFabric.pattern || '').includes(pat.split(' ')[0]);
                      return (
                        <button
                          key={pat}
                          type="button"
                          onClick={() => {
                            onFabricChange({
                              ...currentFabric,
                              pattern: pat,
                              weave: pat,
                            });
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all ${
                            isSelected
                              ? 'bg-navy text-paper font-bold'
                              : 'bg-paper border border-navy/15 text-charcoal hover:border-coral'
                          }`}
                        >
                          {pat}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 6. Maker Notes & Special Details */}
              <div className="space-y-2">
                <label htmlFor="maker-notes-input" className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <FileText className="w-3.5 h-3.5 text-coral" />
                  Notes & Details <span className="text-charcoal-muted font-normal lowercase">(hardware, flaws, preferences)</span>
                </label>
                <textarea
                  id="maker-notes-input"
                  rows={2}
                  value={currentFabric.notes || ''}
                  onChange={(e) => {
                    onFabricChange({
                      ...currentFabric,
                      notes: e.target.value,
                    });
                  }}
                  placeholder="e.g. Has intact copper rivets and back pockets to preserve; looking for quick weekend gift ideas; cut around frayed hem..."
                  className="w-full bg-paper border border-navy/20 rounded-xl p-3 text-xs text-charcoal placeholder:text-charcoal-muted/60 focus:outline-none focus:ring-2 focus:ring-navy/30"
                />
              </div>

              {/* 7. Category Filter Sync */}
              <div className="flex items-center justify-between gap-4 pt-1">
                <div className="flex-1">
                  <label htmlFor="studio-category-select" className="text-xs font-bold text-navy uppercase tracking-wider block mb-1 font-mono">
                    Intended Project Category
                  </label>
                  <select
                    id="studio-category-select"
                    value={selectedCategory}
                    onChange={(e) => onCategoryChange(e.target.value)}
                    className="w-full bg-paper border border-navy/20 rounded-xl px-3.5 py-2 text-xs font-medium text-charcoal focus:outline-none focus:ring-2 focus:ring-navy/30"
                  >
                    <option value="All">All Categories (Explore Everything)</option>
                    <option value="Apparel & Garments">Apparel, Jackets & Studio Vests</option>
                    <option value="Bags & Carry">Bags, Crossbody Rigs & Market Totes</option>
                    <option value="Accessories">Accessories, Collars & Pocket Goods</option>
                    <option value="Home Goods">Home Goods, Cushions & Table Goods</option>
                    <option value="Art & Living">Wall Tapestry & Textile Artwork</option>
                  </select>
                </div>
              </div>

              {/* Multi-Step Loading State Overlay during Analysis */}
              {isAnalyzing && (
                <div className="p-4 rounded-2xl bg-navy/5 border border-navy/20 space-y-2 animate-fadeIn">
                  <div className="flex items-center gap-2 text-xs font-bold text-navy font-mono">
                    <Sparkles className="w-4 h-4 text-coral animate-spin" />
                    <span>Analyzing your {currentFabric.clothingType || currentFabric.material}...</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-charcoal-muted pl-6 font-mono">
                    <p className="flex items-center gap-1.5 text-navy font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Evaluating 2D cutting geometry ({width}×{height} {unit})
                    </p>
                    <p className="flex items-center gap-1.5 text-navy font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                      Scanning live sustainable fashion trend research
                    </p>
                    <p className="flex items-center gap-1.5 text-charcoal-muted">
                      <span className="w-1.5 h-1.5 rounded-full bg-navy/40"></span>
                      Synthesizing 5 distinct zero-waste cutting blueprints
                    </p>
                  </div>
                </div>
              )}

              {/* Big Discover Possibilities / Match Blueprints CTA */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleTriggerAnalysis}
                  disabled={isAnalyzing || isInspectingImage || !isDimensionsValid}
                  className="w-full relative group overflow-hidden py-4 px-6 rounded-2xl bg-navy text-paper text-base font-semibold shadow-warm hover:bg-navy-700 hover:shadow-warm-lg active:scale-98 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-denim cursor-pointer"
                >
                  <Sparkles className="w-5 h-5 text-coral animate-spin" style={{ animationDuration: '4s' }} />
                  <span>
                    {isAnalyzing
                      ? 'Simulating Zero-Waste Blueprints...'
                      : isInspectingImage
                      ? 'AI Vision Inspecting Swatch...'
                      : 'Discover Possibilities & Match Blueprints'}
                  </span>
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none" />
                </button>

                <p className="text-[11px] text-charcoal-muted text-center mt-2.5 flex items-center justify-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-denim" />
                  <span>Calculates cutting geometry specifically for your submitted dimensions & fabric</span>
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
