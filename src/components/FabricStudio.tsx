import React, { useState, useRef } from 'react';
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
  Eye,
  AlertCircle,
  Layers
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

export const FabricStudio: React.FC<FabricStudioProps> = ({
  currentFabric,
  onFabricChange,
  onAnalyze,
  isAnalyzing,
  selectedCategory,
  onCategoryChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isInspectingImage, setIsInspectingImage] = useState(false);
  const [inspectionBadge, setInspectionBadge] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeUploadIdRef = useRef<string | null>(null);

  // Directly derive values from currentFabric as the single source of truth
  const width = currentFabric.dimensions.width;
  const height = currentFabric.dimensions.height;
  const unit = currentFabric.dimensions.unit;
  const condition = currentFabric.condition;

  // Dynamic Pattern Engine Strategy derived from current fabric metrics and matching catalog projects
  const strategySummary = React.useMemo(() => {
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

    let strategy = `Calculated 2D layout for ${currentFabric.name} (${w}×${h} ${u}, ~${gsm} GSM): `;
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

  // Handle unit conversion correctly preserving physical dimension
  const handleUnitToggle = (newUnit: 'cm' | 'in') => {
    if (newUnit === unit) return;

    if (newUnit === 'in') {
      // CM -> INCH
      const convertedWidth = Math.max(1, Math.round(width / 2.54));
      const convertedHeight = Math.max(1, Math.round(height / 2.54));
      onFabricChange({
        ...currentFabric,
        dimensions: { width: convertedWidth, height: convertedHeight, unit: 'in' },
      });
    } else {
      // INCH -> CM
      const convertedWidth = Math.round(width * 2.54);
      const convertedHeight = Math.round(height * 2.54);
      onFabricChange({
        ...currentFabric,
        dimensions: { width: convertedWidth, height: convertedHeight, unit: 'cm' },
      });
    }
  };

  // Dimension validation
  const maxDimension = unit === 'cm' ? 400 : 160;
  const isWidthValid = !isNaN(width) && width >= 2 && width <= maxDimension;
  const isHeightValid = !isNaN(height) && height >= 2 && height <= maxDimension;
  const isDimensionsValid = isWidthValid && isHeightValid;

  const getDimensionErrorMessage = () => {
    if (!isWidthValid || !isHeightValid) {
      return `Please enter positive dimensions between 2 and ${maxDimension} ${unit}.`;
    }
    return null;
  };

  // Supported image types and size limit (8 MB)
  const SUPPORTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

  const processUploadedFile = (file: File) => {
    setUploadError(null);

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
      
      // Step 1: Immediate client-side canvas pixel & textile grain analysis (directional anisotropy, openwork, variance)
      const colorProfile = await extractColorsFromDataUrl(result, file.name);

      if (activeUploadIdRef.current !== uploadId) return;

      const customSample: FabricSample = {
        id: `custom-upload-${Date.now()}`,
        name: `${colorProfile.dominantColor} ${colorProfile.fiberType} Remnant`,
        material: colorProfile.fiberType,
        weave: colorProfile.weave,
        weightGsm: colorProfile.weightGsm,
        condition: condition,
        dimensions: { width, height, unit },
        dominantColor: colorProfile.dominantColor,
        colorFamily: colorProfile.colorFamily,
        pattern: colorProfile.pattern,
        colorPalette: colorProfile.colorPalette,
        texture: `${colorProfile.structuralBody} with ${colorProfile.tensileDrape}`,
        imageUrl: result,
        tagline: `Authentic ${colorProfile.dominantColor} ${colorProfile.fiberType} (~${colorProfile.weightGsm} GSM) optimized for ${colorProfile.archetype} zero-waste blueprints.`,
        structuralBody: colorProfile.structuralBody,
        tensileDrape: colorProfile.tensileDrape,
        archetype: colorProfile.archetype,
      };
      onFabricChange(customSample);

      setIsInspectingImage(true);
      setInspectionBadge(`Analyzing textile architecture (${colorProfile.fiberType}, ${colorProfile.weightGsm} GSM, ${colorProfile.dominantColor}) with Gemini Vision...`);

      try {
        const res = await inspectFabricImage(result);
        if (activeUploadIdRef.current !== uploadId) return;

        if (res.success && res.inspection) {
          const insp = res.inspection;
          const validConditions = ['Crisp Remnant', 'Gently Washed', 'Vintage Worn', 'Frayed Scrap'] as const;
          const finalCond = validConditions.includes(insp.condition as any)
            ? (insp.condition as typeof validConditions[number])
            : condition;

          const formattedColors = Array.isArray(insp.colorPalette) && insp.colorPalette.length > 0
            ? insp.colorPalette.map((c: any, i: number) => {
                if (typeof c === 'string') return { name: `Tone ${i + 1}`, hex: c };
                return { name: c.name || `Tone ${i + 1}`, hex: c.hex || colorProfile.colorPalette[i]?.hex || '#253247' };
              })
            : colorProfile.colorPalette;

          const detectedFiber = insp.fiberType || colorProfile.fiberType;
          const detectedColor = insp.dominantColor || colorProfile.dominantColor;
          const detectedPattern = insp.pattern || colorProfile.pattern;
          const detectedFamily = (insp.colorFamily as any) || colorProfile.colorFamily;
          const detectedGsm = insp.weightGsm || colorProfile.weightGsm;
          const detectedWeave = insp.weave || colorProfile.weave;
          const detectedBody = insp.structuralBody || colorProfile.structuralBody;
          const detectedDrape = insp.tensileDrape || colorProfile.tensileDrape;
          const detectedArchetype = (insp.archetype as any) || colorProfile.archetype;

          const updatedSample: FabricSample = {
            ...customSample,
            name: insp.suggestedName || `${detectedColor} ${detectedFiber} Remnant`,
            material: detectedFiber,
            weave: detectedWeave,
            weightGsm: detectedGsm,
            condition: finalCond,
            texture: detectedBody ? `${detectedBody} • ${detectedDrape}` : (insp.texture || customSample.texture),
            tagline: insp.tagline || customSample.tagline,
            dominantColor: detectedColor,
            colorFamily: detectedFamily,
            pattern: detectedPattern,
            colorPalette: formattedColors,
            structuralBody: detectedBody,
            tensileDrape: detectedDrape,
            archetype: detectedArchetype,
          };
          onFabricChange(updatedSample);
          setInspectionBadge(`✨ AI Verified: ${detectedColor} ${detectedFiber} • ${detectedWeave} • ~${detectedGsm} GSM • ${detectedArchetype}`);
          onAnalyze(updatedSample);
        } else {
          const fallbackSample: FabricSample = {
            ...customSample,
            name: `${colorProfile.dominantColor} ${colorProfile.fiberType} Remnant`,
            material: colorProfile.fiberType,
          };
          onFabricChange(fallbackSample);
          setInspectionBadge(`🎨 Identified: ${colorProfile.dominantColor} ${colorProfile.fiberType} • ${colorProfile.weave} • ~${colorProfile.weightGsm} GSM`);
          onAnalyze(fallbackSample);
        }
      } catch (err) {
        if (activeUploadIdRef.current !== uploadId) return;
        console.warn('[Vision Inspection Notice]', err);
        const fallbackSample: FabricSample = {
          ...customSample,
          name: `${colorProfile.dominantColor} ${colorProfile.fiberType} Remnant`,
          material: colorProfile.fiberType,
        };
        onFabricChange(fallbackSample);
        setInspectionBadge(`🎨 Identified: ${colorProfile.dominantColor} ${colorProfile.fiberType} • ${colorProfile.weave} • ~${colorProfile.weightGsm} GSM`);
        onAnalyze(fallbackSample);
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
    onFabricChange(sample);
  };

  const handleTriggerAnalysis = () => {
    if (!isDimensionsValid || isInspectingImage) return;
    onAnalyze(currentFabric);
  };

  return (
    <section id="studio-section" className="py-20 lg:py-28 bg-paper-100 border-y border-navy/10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bluegray text-navy text-xs font-semibold uppercase tracking-wider mb-3 border border-bluegray-200">
            <Scan className="w-3.5 h-3.5 text-coral" />
            <span>Interactive Fabric Studio</span>
          </div>
          <h2 className="font-serif-title text-3xl sm:text-4xl lg:text-5xl text-navy font-semibold leading-tight">
            Feed the studio with your scraps.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-charcoal-muted leading-relaxed">
            Drop an image of your textile remnant or test instantly using curated studio specimens. Our pattern engine simulates cutting layouts and calculates zero-waste blueprints based on your scrap dimensions.
          </p>
        </div>

        {/* Quick Test Samples Bar */}
        <div className="mb-10 p-5 rounded-2xl bg-surface border border-navy/15 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4 pb-3 border-b border-navy/10">
            <div>
              <h3 className="font-serif text-lg font-bold text-navy">
                Try Evaluator Scraps <span className="text-sm font-sans font-normal text-charcoal-muted">(1-Click Test)</span>
              </h3>
              <p className="text-xs text-charcoal-muted mt-0.5">
                Click any specimen below to immediately load authentic fabric data & imagery into the studio.
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

        {/* Main Studio Interactive Workspace: 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Drag & Drop Dropzone + Live Preview */}
          <div className="lg:col-span-7">
            <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-navy/15 shadow-warm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase font-mono tracking-wider text-navy font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-coral"></span>
                  Active Fabric Remnant
                </span>
                {currentFabric && (
                  <span className="text-xs text-charcoal-muted font-medium font-mono">
                    {width} × {height} {unit}
                  </span>
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
                aria-label="Upload fabric scrap image"
                className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 min-h-[300px] sm:min-h-[360px] flex flex-col items-center justify-center border-2 border-dashed focus:outline-none focus-visible:ring-2 focus-visible:ring-denim ${
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
                  <div className="relative w-full h-full min-h-[320px] sm:min-h-[360px] group">
                    <img
                      src={currentFabric.imageUrl}
                      alt={currentFabric.name}
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80';
                      }}
                      className="w-full h-full object-cover min-h-[320px] sm:min-h-[360px]"
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
                          handleSelectSample(SAMPLE_FABRICS[0]);
                        }}
                        className="px-4 py-2 rounded-full bg-coral text-paper text-xs font-semibold flex items-center gap-1.5 shadow hover:bg-coral-dark transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Reset Specimen
                      </button>
                    </div>

                    {/* Bottom metadata chip */}
                    <div className="absolute bottom-3 left-3 right-3 bg-paper/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-navy/10 flex items-center justify-between text-xs text-charcoal">
                      <span className="font-serif font-bold text-navy truncate">{currentFabric.name}</span>
                      <span className="font-mono text-[11px] text-coral font-semibold uppercase">{condition}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center max-w-sm space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-bluegray text-navy mx-auto flex items-center justify-center">
                      <UploadCloud className="w-7 h-7 text-coral" />
                    </div>
                    <p className="font-serif text-lg font-bold text-navy">
                      Drop your fabric scrap photo here
                    </p>
                    <p className="text-xs text-charcoal-muted leading-relaxed">
                      Supports JPG, PNG, WEBP (max 8MB). Lay your remnant flat for best visual preview.
                    </p>
                    <span className="inline-block px-4 py-2 rounded-full bg-navy text-paper text-xs font-medium mt-2">
                      Browse Files
                    </span>
                  </div>
                )}
              </div>

              {/* Uploaded swatch workflow transparency */}
              <div className="mt-4 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-charcoal-muted bg-paper-100 p-3 rounded-xl border border-navy/10">
                  <div className="flex items-center gap-1.5 text-navy font-medium">
                    <Eye className="w-3.5 h-3.5 text-coral" />
                    <span>Photo Analyzed: Visual Swatch, Color Palette & Weave Grain</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-navy hover:text-coral font-bold transition-colors underline focus:outline-none text-xs self-start sm:self-auto"
                  >
                    Upload Custom Photo
                  </button>
                </div>
                <p className="text-[10px] text-charcoal-muted leading-tight px-1">
                  Note: Camera photos provide color and texture extraction. Physical remnant dimensions (width × length) must be confirmed in the Textile Parameters panel to calculate cutting fit.
                </p>
              </div>

            </div>
          </div>

          {/* Right: Specimen Parameters & Analysis Trigger */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-navy/15 shadow-warm space-y-6">
              
              <div className="border-b border-navy/10 pb-4">
                <h3 className="font-serif text-xl font-bold text-navy flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-coral" />
                  Textile Parameters
                </h3>
                <p className="text-xs text-charcoal-muted mt-1">
                  Adjust physical metrics to filter and size suitable zero-waste cutting patterns.
                </p>
              </div>

              {/* Fiber & Material Profile (Supports AI Vision & Quick-Select) */}
              <div className="p-4 rounded-2xl bg-paper-100 border border-navy/15 space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="fabric-material-input" className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <Layers className="w-3.5 h-3.5 text-coral" />
                    Fiber Composition & Type
                  </label>
                  {isInspectingImage && (
                    <span className="text-[10px] font-mono font-bold text-coral flex items-center gap-1 animate-pulse">
                      <Sparkles className="w-3 h-3 animate-spin" />
                      Gemini Vision Active
                    </span>
                  )}
                </div>

                {/* AI Detection Banner */}
                {inspectionBadge && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-fadeIn">
                    <span className="font-mono text-[11px] leading-tight font-medium">
                      {inspectionBadge}
                    </span>
                    {!isInspectingImage && (
                      <button
                        type="button"
                        onClick={handleTriggerAnalysis}
                        disabled={isAnalyzing}
                        className="self-start sm:self-auto px-3 py-1 rounded-lg bg-emerald-700 text-white font-sans text-xs font-semibold hover:bg-emerald-800 transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-2xs cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                        <span>Run TinyFish Simulation</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Editable Material Input */}
                <div>
                  <input
                    id="fabric-material-input"
                    type="text"
                    value={currentFabric.material}
                    onChange={(e) => {
                      onFabricChange({
                        ...currentFabric,
                        material: e.target.value,
                        name: currentFabric.name.includes('Remnant') ? `${e.target.value} Remnant` : currentFabric.name,
                      });
                    }}
                    placeholder="e.g. Mulberry Silk, Raw Indigo Denim, Washed Linen..."
                    className="w-full bg-paper border border-navy/20 rounded-xl px-3.5 py-2 text-xs font-serif font-bold text-navy focus:outline-none focus:ring-2 focus:ring-navy/30"
                  />
                  <span className="text-[10px] text-charcoal-muted mt-1 block">
                    Type your specific fiber or click a preset below to tailor zero-waste patterns & live research.
                  </span>
                </div>

                {/* Quick Fiber Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    { name: 'Embroidered Guipure Lace', gsm: 140, weave: 'Openwork Guipure Floral', archetype: 'lace-sheer', body: 'Openwork Delicate Floral Lace', drape: 'Fluid delicate sheer drape with scalloped border' },
                    { name: 'Raw Indigo Denim', gsm: 380, weave: '3/1 Right-Hand Twill', archetype: 'denim-workwear', body: 'Rigid Heavyweight Twill', drape: 'High structural rigidity and boxy crease retention' },
                    { name: 'Wide-Wale Corduroy', gsm: 340, weave: 'Wale Ribbed Velvet', archetype: 'corduroy-velvet', body: 'Structured Wale Ribbing', drape: 'Tactile plush drape with directional perpendicular ridge' },
                    { name: 'Mulberry Silk', gsm: 95, weave: 'High-Lustre Satin Weave', archetype: 'silk-satin', body: 'Ultra-Fine Lustrous Filament', drape: 'Liquid high-fluidity cascading bias drape' },
                    { name: 'Washed Linen', gsm: 210, weave: 'Plain Slub Weave', archetype: 'linen-slub', body: 'Airy Breathable Slub', drape: 'Crisp organic structure with natural rumpled recovery' },
                    { name: 'Merino Wool Tweed', gsm: 420, weave: 'Heavy Plain Tweed Weave', archetype: 'wool-tweed', body: 'Coarse Lofty Wool Blend', drape: 'Firm tailoring resilience with thermal loft' },
                    { name: 'Organic Cotton', gsm: 180, weave: 'Balanced Plain Weave', archetype: 'cotton-handloom', body: 'Soft Breathable Plain Weave', drape: 'Gentle relaxed drape with malleable fold lines' },
                    { name: 'Heavy Canvas', gsm: 400, weave: 'Tight Duck Canvas', archetype: 'denim-workwear', body: 'Ultra-Durable Canvas', drape: 'Extra-rigid load-bearing structure' },
                  ].map((preset) => {
                    const isCurrent = currentFabric.material.toLowerCase().includes(preset.name.toLowerCase().split(' ').pop() || '');
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          onFabricChange({
                            ...currentFabric,
                            material: preset.name,
                            name: `${currentFabric.dominantColor} ${preset.name} Remnant`,
                            weightGsm: preset.gsm,
                            weave: preset.weave,
                            structuralBody: preset.body,
                            tensileDrape: preset.drape,
                            archetype: preset.archetype as any,
                            texture: `${preset.body} • ${preset.drape}`,
                            tagline: `Authentic ${currentFabric.dominantColor} ${preset.name} (~${preset.gsm} GSM) optimized for ${preset.archetype} zero-waste blueprints.`,
                          });
                          setInspectionBadge(`✨ Configured: ${currentFabric.dominantColor} ${preset.name} (~${preset.gsm} GSM • ${preset.archetype})`);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all ${
                          isCurrent
                            ? 'bg-navy text-paper font-bold shadow-xs'
                            : 'bg-paper border border-navy/15 text-charcoal hover:border-coral hover:text-coral'
                        }`}
                      >
                        {preset.name}
                      </button>
                    );
                  })}
                </div>

                {/* AI Textile Quality & Structural Analysis Diagnostic Card */}
                <div className="mt-3 p-3.5 rounded-xl bg-navy/5 border border-navy/15 space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-navy/10 pb-2">
                    <span className="font-mono uppercase font-bold text-navy flex items-center gap-1.5 text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-coral" />
                      Textile Quality & Structural Profile
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-navy text-paper font-mono text-[10px] font-bold uppercase tracking-wider">
                      {currentFabric.archetype || 'Custom Fiber'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                    <div className="bg-paper p-2 rounded-lg border border-navy/10">
                      <span className="text-charcoal-muted text-[10px] block uppercase font-sans font-semibold">Fiber Architecture</span>
                      <span className="text-navy font-bold truncate block">{currentFabric.material}</span>
                    </div>
                    <div className="bg-paper p-2 rounded-lg border border-navy/10">
                      <span className="text-charcoal-muted text-[10px] block uppercase font-sans font-semibold">Weave Structure</span>
                      <span className="text-navy font-bold truncate block">{currentFabric.weave}</span>
                    </div>
                    <div className="bg-paper p-2 rounded-lg border border-navy/10">
                      <span className="text-charcoal-muted text-[10px] block uppercase font-sans font-semibold">Weight & Density</span>
                      <span className="text-navy font-bold truncate block">~{currentFabric.weightGsm} GSM ({currentFabric.weightGsm >= 300 ? 'Heavyweight' : currentFabric.weightGsm >= 180 ? 'Midweight' : 'Lightweight'})</span>
                    </div>
                    <div className="bg-paper p-2 rounded-lg border border-navy/10">
                      <span className="text-charcoal-muted text-[10px] block uppercase font-sans font-semibold">Tensile Drape</span>
                      <span className="text-navy font-bold truncate block">{currentFabric.tensileDrape || (currentFabric.weightGsm >= 300 ? 'Structured Rigid' : 'Fluid Drape')}</span>
                    </div>
                  </div>

                  <div className="bg-coral/5 border border-coral/20 rounded-lg p-2.5 text-[11px] text-navy">
                    <span className="font-semibold text-coral-dark">Pattern Engine Strategy: </span>
                    <span className="text-charcoal leading-relaxed">{strategySummary}</span>
                  </div>
                </div>
              </div>

              {/* Dimensions Input with Unit Toggle */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="fabric-width-input" className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-1.5">
                    <Ruler className="w-3.5 h-3.5 text-coral" />
                    Remnant Dimensions
                  </label>
                  
                  {/* Unit switcher with conversion */}
                  <div className="flex bg-paper-200 rounded-lg p-0.5 border border-navy/15 text-xs">
                    <button
                      type="button"
                      onClick={() => handleUnitToggle('cm')}
                      className={`px-2.5 py-0.5 rounded-md font-mono text-[11px] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-denim ${
                        unit === 'cm' ? 'bg-navy text-paper font-bold' : 'text-charcoal-muted hover:text-navy'
                      }`}
                    >
                      CM
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUnitToggle('in')}
                      className={`px-2.5 py-0.5 rounded-md font-mono text-[11px] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-denim ${
                        unit === 'in' ? 'bg-navy text-paper font-bold' : 'text-charcoal-muted hover:text-navy'
                      }`}
                    >
                      INCH
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-charcoal-muted block mb-1">Width</span>
                    <div className="relative">
                      <input
                        id="fabric-width-input"
                        type="number"
                        min="2"
                        max={maxDimension}
                        value={width}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          onFabricChange({
                            ...currentFabric,
                            dimensions: { ...currentFabric.dimensions, width: val },
                          });
                        }}
                        className={`w-full bg-paper-50 border rounded-xl px-3.5 py-2.5 text-sm font-mono text-charcoal focus:outline-none focus:ring-2 ${
                          isWidthValid ? 'border-navy/20 focus:ring-navy/30' : 'border-coral focus:ring-coral/30'
                        }`}
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-charcoal-muted font-mono">{unit}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[11px] text-charcoal-muted block mb-1">Length / Height</span>
                    <div className="relative">
                      <input
                        id="fabric-height-input"
                        type="number"
                        min="2"
                        max={maxDimension}
                        value={height}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          onFabricChange({
                            ...currentFabric,
                            dimensions: { ...currentFabric.dimensions, height: val },
                          });
                        }}
                        className={`w-full bg-paper-50 border rounded-xl px-3.5 py-2.5 text-sm font-mono text-charcoal focus:outline-none focus:ring-2 ${
                          isHeightValid ? 'border-navy/20 focus:ring-navy/30' : 'border-coral focus:ring-coral/30'
                        }`}
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-charcoal-muted font-mono">{unit}</span>
                    </div>
                  </div>
                </div>

                {/* Validation error display */}
                {!isDimensionsValid && (
                  <p className="text-[11px] text-coral mt-1.5 flex items-center gap-1 animate-fadeIn">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{getDimensionErrorMessage()}</span>
                  </p>
                )}
              </div>

              {/* Fabric Condition Selector */}
              <div>
                <label className="text-xs font-bold text-navy uppercase tracking-wider block mb-2">
                  Remnant Condition
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Crisp Remnant', 'Gently Washed', 'Vintage Worn', 'Frayed Scrap'] as const).map((cond) => (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => {
                        onFabricChange({
                          ...currentFabric,
                          condition: cond,
                        });
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-colors flex items-center justify-between focus:outline-none focus-visible:ring-1 focus-visible:ring-denim ${
                        condition === cond
                          ? 'border-navy bg-navy text-paper font-semibold'
                          : 'border-navy/20 bg-paper-50 text-charcoal hover:border-navy/40'
                      }`}
                    >
                      <span>{cond}</span>
                      {condition === cond && <Check className="w-3.5 h-3.5 text-coral" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Intended Project Goal (Affects Blueprint Gallery Category) */}
              <div>
                <label htmlFor="intended-category-select" className="text-xs font-bold text-navy uppercase tracking-wider block mb-2">
                  Intended Project Goal <span className="text-charcoal-muted font-normal lowercase">(syncs catalog filter)</span>
                </label>
                <select
                  id="intended-category-select"
                  value={selectedCategory}
                  onChange={(e) => onCategoryChange(e.target.value)}
                  className="w-full bg-paper-50 border border-navy/20 rounded-xl px-3.5 py-2.5 text-xs font-medium text-charcoal focus:outline-none focus:ring-2 focus:ring-navy/30"
                >
                  <option value="All">All Categories (Explore Everything)</option>
                  <option value="Apparel & Garments">Jackets, Vests & Studio Garments</option>
                  <option value="Bags & Carry">Bags, Sleeves & Market Totes</option>
                  <option value="Accessories">Small Hair & Pocket Accessories</option>
                  <option value="Home Goods">Cushions, Mats & Table Goods</option>
                  <option value="Art & Living">Wall Tapestry & Textile Artwork</option>
                </select>
              </div>

              {/* Color Swatch Preview from Fabric */}
              <div>
                <span className="text-[11px] font-bold text-navy uppercase tracking-wider block mb-1.5">
                  Atelier Chromatic Tones <span className="text-charcoal-muted font-normal lowercase">(illustrative)</span>
                </span>
                <div className="flex items-center gap-2">
                  {currentFabric.colorPalette.map((col, idx) => (
                    <div key={idx} className="flex-1 group relative">
                      <div 
                        className="h-7 rounded-lg border border-navy/15 shadow-2xs cursor-pointer transition-transform group-hover:scale-105" 
                        style={{ backgroundColor: col.hex }}
                        title={`${col.name} (${col.hex})`}
                      />
                      <span className="text-[9px] font-mono block text-center mt-1 text-charcoal-muted truncate">
                        {col.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Big Discover Possibilities CTA */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleTriggerAnalysis}
                  disabled={isAnalyzing || isInspectingImage || !isDimensionsValid}
                  className="w-full relative group overflow-hidden py-4 px-6 rounded-2xl bg-navy text-paper text-base font-semibold shadow-warm hover:bg-navy-700 hover:shadow-warm-lg active:scale-98 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-denim"
                >
                  <Sparkles className="w-5 h-5 text-coral animate-spin" style={{ animationDuration: '4s' }} />
                  <span>
                    {isAnalyzing
                      ? 'Simulating Zero-Waste Patterns...'
                      : isInspectingImage
                      ? 'AI Vision Inspecting Swatch...'
                      : 'Discover Possibilities'}
                  </span>
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none" />
                </button>

                <p className="text-[11px] text-charcoal-muted text-center mt-2.5 flex items-center justify-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-denim" />
                  <span>Interactive demonstration: tests cutting geometry with your dimensions</span>
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
