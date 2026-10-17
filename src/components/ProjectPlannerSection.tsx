import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Check, 
  AlertCircle, 
  Bookmark, 
  BookmarkCheck, 
  FileText,
  Upload,
  Palette,
  Shirt,
  Layers,
  Ruler,
  X
} from 'lucide-react';
import { 
  fetchProjectRecommendations, 
  saveProject, 
  type RecommendedProject, 
  type StashFabricItem 
} from '../api/reStyleApi';

interface ProjectPlannerSectionProps {
  stashFabrics: StashFabricItem[];
  selectedFabricFromStash?: StashFabricItem | null;
  onOpenBlueprint: (project: RecommendedProject, fabric: any) => void;
  onNavigateToProjects: () => void;
}

const COMMON_TOOLS = [
  'Fabric shears or rotary cutter',
  'Sewing machine',
  'Steam iron & pressing cloth',
  'Hand-sewing supplies',
  'Overlocker or serger',
  'Measuring tape & tailor chalk'
];

const TIME_OPTIONS = [
  { value: 'under 30 minutes', label: 'Under 30 min (Quick Make)' },
  { value: '30–60 minutes', label: '30–60 minutes (Single Session)' },
  { value: '1–3 hours', label: '1–3 hours (Afternoon Project)' },
  { value: '3–6 hours', label: '3–6 hours (Half Day)' },
  { value: 'multiple sessions', label: 'Multiple sessions (Atelier Garment)' }
];

const INTENDED_USES = [
  { value: 'all', label: 'All Categories' },
  { value: 'bags', label: 'Bags & Carry' },
  { value: 'clothing', label: 'Apparel & Garments' },
  { value: 'home', label: 'Home Goods & Living' },
  { value: 'accessories', label: 'Wearable Accessories' },
  { value: 'scraps', label: 'Scrap & Offcut Upcycling' },
  { value: 'gifts', label: 'Gifts & Smallwares' },
  { value: 'storage', label: 'Storage & Organisation' }
];

const QUICK_CLOTHING_PRESETS = [
  { label: '👖 Denim Jeans', type: 'Denim Jeans', material: 'denim', color: 'Deep Indigo', l: 85, w: 35, unit: 'cm', texture: 'Coarse Twill', condition: 'Distressed / Torn' },
  { label: '👔 Button-Down Shirt', type: 'Button-Down Shirt', material: 'cotton', color: 'Bone White', l: 75, w: 55, unit: 'cm', texture: 'Smooth Plain', condition: 'Vintage Worn' },
  { label: '🧥 Chore Jacket', type: 'Chore Jacket', material: 'canvas', color: 'Olive Drab', l: 75, w: 60, unit: 'cm', texture: 'Coarse Twill', condition: 'Gently Washed' },
  { label: '👗 Silk Dress / Scarf', type: 'Silk Scarf', material: 'silk', color: 'Royal Violet', l: 65, w: 35, unit: 'cm', texture: 'Sheer & Airy', condition: 'Crisp Remnant' },
  { label: '🧶 Knit Sweater', type: 'Waffle Sweater', material: 'cotton', color: 'Heather Oatmeal', l: 50, w: 40, unit: 'cm', texture: 'Plush / Velvety', condition: 'Vintage Worn' },
  { label: '🧺 Slub Linen Drapes', type: 'Linen Remnant', material: 'linen', color: 'Natural Flax', l: 60, w: 40, unit: 'cm', texture: 'Slub Weave', condition: 'Crisp Remnant' },
  { label: '🧵 Fabric Scrap', type: 'Remnant Offcut', material: 'corduroy', color: 'Spiced Terracotta', l: 35, w: 25, unit: 'cm', texture: 'Ribbed Wale', condition: 'Crisp Remnant' }
];

const COLOR_PALETTES = [
  { name: 'Indigo Blue', hex: '#253247' },
  { name: 'Terracotta', hex: '#C96F52' },
  { name: 'Golden Ochre', hex: '#D6AD64' },
  { name: 'Sage Green', hex: '#6A8E72' },
  { name: 'Olive Drab', hex: '#556B2F' },
  { name: 'Royal Violet', hex: '#6B3E82' },
  { name: 'Natural Ecru', hex: '#E8DFD0' },
  { name: 'Charcoal Black', hex: '#2E3440' },
  { name: 'Blush Rose', hex: '#DDA7A5' },
  { name: 'Wine Red', hex: '#722F37' }
];

const CONDITION_OPTIONS = [
  'Crisp Remnant',
  'Gently Washed',
  'Vintage Worn',
  'Frayed Scrap',
  'Distressed / Torn',
  'Stained / Flawed'
];

const TEXTURE_OPTIONS = [
  'Smooth Plain',
  'Ribbed Wale',
  'Coarse Twill',
  'Slub Weave',
  'Plush / Velvety',
  'Sheer & Airy'
];

const PATTERN_OPTIONS = [
  'Solid Color',
  'Striped',
  'Plaid / Tartan',
  'Floral / Botanical',
  'Twill Weave',
  'Distressed Wash'
];

const SAMPLE_PHOTO_SWATCHES = [
  { label: 'Raw Indigo', url: 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80' },
  { label: 'Natural Flax', url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80' },
  { label: 'Terracotta Cord', url: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=800&q=80' },
  { label: 'Block Cotton', url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80' }
];

function parseNaturalDimensions(text: string): { length: number; width: number; unit: 'cm' | 'in' } | null {
  if (!text || typeof text !== 'string') return null;
  const cleaned = text.trim().toLowerCase();

  // Pattern like "a 4 x 4 piece" or "4x4" or "4 × 4 in" or "4 by 4"
  const match = cleaned.match(/(\d+(?:\.\d+)?)\s*(?:[x×*]|by)\s*(\d+(?:\.\d+)?)(?:\s*(cm|in|inch|inches|centimeter|centimeters|m|meter))?/i);
  if (match) {
    let l = parseFloat(match[1]);
    let w = parseFloat(match[2]);
    let unit: 'cm' | 'in' = 'cm';
    const rawUnit = (match[3] || '').toLowerCase();
    if (rawUnit.startsWith('in')) {
      unit = 'in';
    } else if (rawUnit.startsWith('m') && !rawUnit.startsWith('cm')) {
      l = Math.round(l * 100);
      w = Math.round(w * 100);
      unit = 'cm';
    } else if (rawUnit.startsWith('cm')) {
      unit = 'cm';
    } else {
      if (l <= 18 && w <= 18) {
        unit = 'in';
      } else {
        unit = 'cm';
      }
    }
    return { length: l, width: w, unit };
  }

  if (cleaned.includes('fat quarter')) return { length: 56, width: 46, unit: 'cm' };
  if (cleaned.includes('half meter') || cleaned.includes('0.5 meter') || cleaned.includes('0.5m')) return { length: 50, width: 110, unit: 'cm' };
  if (cleaned.includes('yard') || cleaned.includes('1 yard')) return { length: 36, width: 44, unit: 'in' };
  if (cleaned.includes('meter') || cleaned.includes('1 meter') || cleaned.includes('1m')) return { length: 100, width: 110, unit: 'cm' };

  return null;
}

export const ProjectPlannerSection: React.FC<ProjectPlannerSectionProps> = ({
  stashFabrics,
  selectedFabricFromStash,
  onOpenBlueprint,
  onNavigateToProjects,
}) => {
  // Input Mode: 'custom' (Describe My Own Fabric/Garment) or 'stash' (Choose from Library & Stash)
  const [activeInputMode, setActiveInputMode] = useState<'custom' | 'stash'>('custom');

  // Custom Fabric & Garment Description state
  const [clothingType, setClothingType] = useState('Denim Jeans');
  const [material, setMaterial] = useState('denim');
  const [dimensionsText, setDimensionsText] = useState('85 × 35 cm');
  const [customLength, setCustomLength] = useState<number | ''>(85);
  const [customWidth, setCustomWidth] = useState<number | ''>(35);
  const [customUnit, setCustomUnit] = useState<'cm' | 'in'>('cm');
  const [dominantColor, setDominantColor] = useState('Deep Indigo');
  const [condition, setCondition] = useState('Distressed / Torn');
  const [texture, setTexture] = useState('Coarse Twill');
  const [pattern, setPattern] = useState('Distressed Wash');
  const [notes, setNotes] = useState('Intact back pocket and outer selvedge seam');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  // Stash Library Selection state
  const [selectedStashFabricId, setSelectedStashFabricId] = useState<string>(
    selectedFabricFromStash?.id || (stashFabrics[0]?.id ?? '')
  );

  // Maker Preferences
  const [skill, setSkill] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [selectedTools, setSelectedTools] = useState<string[]>([
    'Fabric shears or rotary cutter',
    'Sewing machine',
    'Steam iron & pressing cloth'
  ]);
  const [customToolInput, setCustomToolInput] = useState('');
  const [timeAvailable, setTimeAvailable] = useState('1–3 hours');
  const [intendedUse, setIntendedUse] = useState('all');

  // Engine state
  const [recommendations, setRecommendations] = useState<RecommendedProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [savedProjectIds, setSavedProjectIds] = useState<Set<string>>(new Set());

  // Update selected stash fabric if parent prop changes
  useEffect(() => {
    if (selectedFabricFromStash) {
      setSelectedStashFabricId(selectedFabricFromStash.id);
      setActiveInputMode('stash');
    }
  }, [selectedFabricFromStash]);

  // Synchronize colloquial dimensions input
  const handleDimensionsTextChange = (text: string) => {
    setDimensionsText(text);
    const parsed = parseNaturalDimensions(text);
    if (parsed) {
      setCustomLength(parsed.length);
      setCustomWidth(parsed.width);
      setCustomUnit(parsed.unit);
    }
  };

  const handleNumericDimensionChange = (l: number | '', w: number | '', u: 'cm' | 'in') => {
    setCustomLength(l);
    setCustomWidth(w);
    setCustomUnit(u);
    if (l !== '' && w !== '') {
      setDimensionsText(`${l} × ${w} ${u}`);
    }
  };

  const handleApplyClothingPreset = (preset: typeof QUICK_CLOTHING_PRESETS[0]) => {
    setClothingType(preset.type);
    setMaterial(preset.material);
    setDominantColor(preset.color);
    setCustomLength(preset.l);
    setCustomWidth(preset.w);
    setCustomUnit(preset.unit as any);
    setDimensionsText(`${preset.l} × ${preset.w} ${preset.unit}`);
    setTexture(preset.texture);
    setCondition(preset.condition);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Compile active fabric payload for the recommendation engine
  const activeFabric = activeInputMode === 'custom'
    ? {
        name: clothingType ? `${clothingType} (${material})` : `Custom ${material}`,
        clothingType,
        material,
        dominantColor,
        colorFamily: dominantColor,
        condition,
        texture,
        pattern,
        notes,
        dimensionsText,
        imageUrl: photoUrl || 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80',
        dimensions: { 
          length: Number(customLength) || 0, 
          width: Number(customWidth) || 0, 
          unit: customUnit 
        }
      }
    : stashFabrics.find(f => f.id === selectedStashFabricId) || stashFabrics[0];

  const handleToolToggle = (tool: string) => {
    if (selectedTools.includes(tool)) {
      setSelectedTools(selectedTools.filter(t => t !== tool));
    } else {
      setSelectedTools([...selectedTools, tool]);
    }
  };

  const handleAddCustomTool = () => {
    if (!customToolInput.trim()) return;
    const trimmed = customToolInput.trim();
    if (!selectedTools.includes(trimmed)) {
      setSelectedTools([...selectedTools, trimmed]);
    }
    setCustomToolInput('');
  };

  const runRecommendationEngine = async () => {
    if (!activeFabric) return;

    try {
      setLoading(true);
      const results = await fetchProjectRecommendations({
        fabricId: activeInputMode === 'stash' ? selectedStashFabricId : undefined,
        fabric: activeInputMode === 'custom' ? activeFabric : undefined,
        preferences: {
          skill,
          tools: selectedTools,
          time: timeAvailable,
          intendedUse
        }
      });
      setRecommendations(results);
    } catch (err) {
      console.error('[Planner] Recommendation error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runRecommendationEngine();
  }, [
    activeInputMode,
    selectedStashFabricId, 
    clothingType,
    material, 
    customLength, 
    customWidth, 
    customUnit, 
    dominantColor,
    condition,
    texture,
    pattern,
    skill, 
    selectedTools, 
    timeAvailable, 
    intendedUse
  ]);

  const handleSaveToMyProjects = async (rec: RecommendedProject) => {
    try {
      await saveProject({
        blueprintId: rec.blueprintId || rec.id,
        title: rec.title,
        subtitle: rec.subtitle,
        category: rec.category,
        difficulty: rec.difficulty,
        timeEstimate: rec.timeEstimate,
        imageUrl: rec.imageUrl,
        fabricId: activeInputMode === 'stash' ? selectedStashFabricId : null,
        status: 'planned',
        isFavourite: false,
        materialsNeeded: rec.materialsNeeded,
        toolsNeeded: rec.requiredTools,
        steps: rec.steps,
        cuttingPlan: rec.cuttingPlan,
        suitabilityReason: rec.suitabilityReason,
        matchScore: rec.matchScore
      });

      setSavedProjectIds(prev => new Set([...prev, rec.id]));
    } catch (err: any) {
      alert(err.message || 'Failed to save project');
    }
  };

  const handleCopyStashToCustom = (fabric: StashFabricItem) => {
    setClothingType(fabric.clothingType || fabric.name);
    setMaterial(fabric.material);
    setDominantColor(fabric.dominantColor || 'Artisanal Natural');
    setCustomLength(fabric.dimensions.length);
    setCustomWidth(fabric.dimensions.width);
    setCustomUnit(fabric.dimensions.unit);
    setDimensionsText(`${fabric.dimensions.length} × ${fabric.dimensions.width} ${fabric.dimensions.unit}`);
    setCondition(fabric.conditionLabel || fabric.condition || 'Crisp Remnant');
    setPattern(fabric.pattern || 'Solid Remnant');
    if (fabric.imageUrl) setPhotoUrl(fabric.imageUrl);
    setActiveInputMode('custom');
  };

  return (
    <section id="planner-section" className="py-16 sm:py-24 bg-paper-100 border-t border-navy/10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bluegray text-navy text-xs font-semibold uppercase tracking-wider mb-3 border border-bluegray-200">
              <Compass className="w-3.5 h-3.5 text-coral" />
              <span>Adaptive Project & Pattern Matcher</span>
            </div>
            <h2 className="font-serif-title text-3xl sm:text-4xl lg:text-5xl text-navy font-bold leading-tight">
              Find My Next Project.
            </h2>
            <p className="mt-3 text-base sm:text-lg text-charcoal-muted leading-relaxed">
              Describe your specific clothing item or fabric remnant. Our recommendation engine mathematically calculates geometric cutting feasibility, verifies tools and skills, and customizes zero-waste blueprints for your exact textile.
            </p>
          </div>
          <button
            onClick={onNavigateToProjects}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-navy/20 bg-surface text-navy text-xs font-semibold hover:bg-navy/5 shadow-2xs whitespace-nowrap self-start sm:self-auto"
          >
            <Bookmark className="w-3.5 h-3.5 text-coral" />
            <span>View Saved Projects</span>
          </button>
        </div>

        {/* Workspace: 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Preferences & Rich Fabric Input (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-surface rounded-3xl p-6 sm:p-7 border border-navy/15 shadow-warm space-y-6">
              
              {/* 1. Target Fabric Remnant & Garment Input Area */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold font-mono uppercase text-navy flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-coral"></span>
                    1. Target Fabric or Clothing Item
                  </label>
                  <span className="text-[11px] font-mono text-charcoal-muted">
                    {activeInputMode === 'custom' ? 'Custom Description' : `${stashFabrics.length} in Library`}
                  </span>
                </div>

                {/* Segmented Mode Switcher */}
                <div className="grid grid-cols-2 p-1 bg-paper border border-navy/15 rounded-2xl mb-4 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setActiveInputMode('custom')}
                    className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      activeInputMode === 'custom'
                        ? 'bg-navy text-paper shadow-xs'
                        : 'text-charcoal hover:text-navy'
                    }`}
                  >
                    <Shirt className="w-3.5 h-3.5 text-coral" />
                    <span>Describe My Item</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveInputMode('stash')}
                    className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      activeInputMode === 'stash'
                        ? 'bg-navy text-paper shadow-xs'
                        : 'text-charcoal hover:text-navy'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-coral" />
                    <span>Choose from Stash ({stashFabrics.length})</span>
                  </button>
                </div>

                {/* MODE A: Describe My Own Fabric or Garment */}
                {activeInputMode === 'custom' && (
                  <div className="space-y-4 p-4 rounded-2xl bg-paper border border-navy/10">
                    
                    {/* Quick Preset Pills */}
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-charcoal-muted block mb-1.5">
                        Quick Item Presets
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {QUICK_CLOTHING_PRESETS.map((p) => (
                          <button
                            key={p.label}
                            type="button"
                            onClick={() => handleApplyClothingPreset(p)}
                            className="text-[11px] px-2.5 py-1 rounded-lg border border-navy/15 bg-surface text-navy font-medium hover:bg-navy/5 hover:border-coral transition-colors"
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Clothing Type & Fiber */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-mono text-navy font-semibold block mb-1">
                          Garment / Item Type
                        </label>
                        <input
                          type="text"
                          value={clothingType}
                          onChange={(e) => setClothingType(e.target.value)}
                          placeholder="e.g. Denim Jeans, Linen Shirt, Silk Scarf"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-navy/15 bg-surface text-navy font-medium focus:outline-none focus:ring-1 focus:ring-navy/30"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-mono text-navy font-semibold block mb-1">
                          Material / Fiber
                        </label>
                        <select
                          value={material}
                          onChange={(e) => setMaterial(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-navy/15 bg-surface text-navy font-medium focus:outline-none"
                        >
                          <option value="denim">Denim / Twill</option>
                          <option value="linen">Linen / Flax</option>
                          <option value="cotton">Cotton / Canvas</option>
                          <option value="silk">Silk / Satin</option>
                          <option value="corduroy">Corduroy</option>
                          <option value="wool">Wool / Tweed</option>
                          <option value="lace">Lace / Openwork</option>
                          <option value="canvas">Heavy Canvas</option>
                          <option value="jute">Jute / Burlap</option>
                          <option value="blend">Blended Textile</option>
                        </select>
                      </div>
                    </div>

                    {/* Dimensions & Amount */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-mono text-navy font-semibold flex items-center gap-1">
                          <Ruler className="w-3 h-3 text-coral" />
                          <span>Dimensions or Amount</span>
                        </label>
                        <span className="text-[10px] font-mono text-charcoal-muted">
                          Supports &quot;a 4 × 4 piece&quot; or numeric L×W
                        </span>
                      </div>
                      <input
                        type="text"
                        value={dimensionsText}
                        onChange={(e) => handleDimensionsTextChange(e.target.value)}
                        placeholder="e.g. a 4 × 4 piece, 85 × 35 cm, fat quarter"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-navy/15 bg-surface text-navy font-medium focus:outline-none focus:ring-1 focus:ring-navy/30 mb-2"
                      />
                      
                      {/* Numeric dimension inputs synced */}
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <span className="text-[9px] font-mono text-charcoal-muted uppercase block">Length</span>
                          <input
                            type="number"
                            value={customLength}
                            onChange={(e) => handleNumericDimensionChange(e.target.value ? Number(e.target.value) : '', customWidth, customUnit)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-navy/15 bg-surface text-navy font-mono"
                          />
                        </div>
                        <div>
                          <span className="text-[9px] font-mono text-charcoal-muted uppercase block">Width</span>
                          <input
                            type="number"
                            value={customWidth}
                            onChange={(e) => handleNumericDimensionChange(customLength, e.target.value ? Number(e.target.value) : '', customUnit)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-navy/15 bg-surface text-navy font-mono"
                          />
                        </div>
                        <div>
                          <span className="text-[9px] font-mono text-charcoal-muted uppercase block">Unit</span>
                          <select
                            value={customUnit}
                            onChange={(e) => handleNumericDimensionChange(customLength, customWidth, e.target.value as any)}
                            className="w-full px-2 py-1.5 text-xs rounded-lg border border-navy/15 bg-surface text-navy font-mono"
                          >
                            <option value="cm">cm</option>
                            <option value="in">inches</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Dominant Color with Palette Swatches */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-mono text-navy font-semibold flex items-center gap-1">
                          <Palette className="w-3 h-3 text-coral" />
                          <span>Dominant Color</span>
                        </label>
                        <span className="text-[10px] font-mono text-coral font-medium">{dominantColor}</span>
                      </div>
                      <input
                        type="text"
                        value={dominantColor}
                        onChange={(e) => setDominantColor(e.target.value)}
                        placeholder="e.g. Deep Indigo, Terracotta Amber, Sage Green"
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-navy/15 bg-surface text-navy font-medium focus:outline-none mb-2"
                      />
                      <div className="flex flex-wrap gap-1.5">
                        {COLOR_PALETTES.map((c) => (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => setDominantColor(c.name)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-mono flex items-center gap-1.5 border transition-all ${
                              dominantColor.toLowerCase().includes(c.name.toLowerCase().split(' ')[0])
                                ? 'border-navy bg-navy text-paper shadow-2xs'
                                : 'border-navy/15 bg-surface text-charcoal hover:bg-paper'
                            }`}
                          >
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 border border-black/10" style={{ backgroundColor: c.hex }} />
                            <span>{c.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Garment Condition */}
                    <div>
                      <label className="text-[11px] font-mono text-navy font-semibold block mb-1">
                        Garment / Fabric Condition
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                        {CONDITION_OPTIONS.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setCondition(c)}
                            className={`px-2 py-1.5 rounded-lg text-[10px] font-medium border text-left transition-all ${
                              condition === c
                                ? 'bg-navy text-paper border-navy shadow-2xs'
                                : 'bg-surface text-charcoal border-navy/15 hover:bg-paper'
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Texture & Pattern */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-mono text-navy font-semibold block mb-1">
                          Weave Texture
                        </label>
                        <select
                          value={texture}
                          onChange={(e) => setTexture(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-navy/15 bg-surface text-navy font-medium"
                        >
                          {TEXTURE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-mono text-navy font-semibold block mb-1">
                          Surface Pattern
                        </label>
                        <select
                          value={pattern}
                          onChange={(e) => setPattern(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-navy/15 bg-surface text-navy font-medium"
                        >
                          {PATTERN_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Notes & Special Features */}
                    <div>
                      <label className="text-[11px] font-mono text-navy font-semibold block mb-1">
                        Salvageable Features & Notes (Optional)
                      </label>
                      <input
                        type="text"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. Has back pockets, bronze buttons, outer selvedge"
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-navy/15 bg-surface text-navy placeholder:text-charcoal-muted/60"
                      />
                    </div>

                    {/* Photo Upload & Presets */}
                    <div>
                      <span className="text-[11px] font-mono text-navy font-semibold block mb-1.5 flex items-center gap-1">
                        <Upload className="w-3 h-3 text-coral" />
                        <span>Textile Photo (Optional)</span>
                      </span>
                      {photoUrl ? (
                        <div className="relative p-2 rounded-xl bg-surface border border-navy/15 flex items-center gap-3">
                          <img src={photoUrl} alt="" aria-hidden="true" className="w-12 h-12 rounded-lg object-cover border border-navy/15" />
                          <div className="min-w-0 flex-grow text-xs">
                            <span className="font-mono text-emerald-800 font-semibold block">Photo Attached</span>
                            <span className="text-[10px] text-charcoal-muted truncate block">Ready for pattern analysis</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPhotoUrl(null)}
                            className="p-1.5 rounded-lg hover:bg-coral/10 text-coral"
                            title="Remove photo"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-navy/20 bg-surface hover:bg-paper cursor-pointer text-xs text-charcoal-muted transition-colors">
                            <Upload className="w-4 h-4 text-coral" />
                            <span>Click to upload swatch or garment photo</span>
                            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                          </label>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-mono text-charcoal-muted uppercase">Sample:</span>
                            {SAMPLE_PHOTO_SWATCHES.map((sw) => (
                              <button
                                key={sw.label}
                                type="button"
                                onClick={() => setPhotoUrl(sw.url)}
                                className="text-[10px] px-2 py-0.5 rounded-md border border-navy/10 bg-surface hover:border-coral text-charcoal"
                              >
                                {sw.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {/* MODE B: Choose from Stash & Studio Library */}
                {activeInputMode === 'stash' && (
                  <div className="space-y-3">
                    <p className="text-xs text-charcoal-muted">
                      Select any fabric specimen or garment from your library. All {stashFabrics.length} pieces are verified for zero-waste cutting feasibility:
                    </p>

                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {stashFabrics.map((fabric) => {
                        const isSelected = fabric.id === selectedStashFabricId;
                        return (
                          <div
                            key={fabric.id}
                            onClick={() => setSelectedStashFabricId(fabric.id)}
                            className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                              isSelected
                                ? 'bg-bluegray/70 border-navy shadow-2xs'
                                : 'bg-paper border-navy/10 hover:border-navy/30 hover:bg-surface'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={fabric.imageUrl || 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80'}
                                alt=""
                                aria-hidden="true"
                                className="w-12 h-12 rounded-xl object-cover border border-navy/15 flex-shrink-0"
                              />
                              <div className="min-w-0 text-xs">
                                <p className="font-serif font-bold text-navy truncate">{fabric.name}</p>
                                <p className="font-mono text-charcoal-muted text-[11px]">
                                  {fabric.dimensions.length}×{fabric.dimensions.width} {fabric.dimensions.unit} • {fabric.material}
                                </p>
                                <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-mono bg-surface border border-navy/10 text-charcoal">
                                  {fabric.dominantColor || fabric.conditionLabel || 'Studio Specimen'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyStashToCustom(fabric);
                                }}
                                title="Customize dimensions & details in form"
                                className="p-1.5 rounded-lg border border-navy/15 bg-surface hover:bg-navy/5 text-navy text-[10px] font-mono"
                              >
                                Edit Details
                              </button>
                              {isSelected && (
                                <span className="w-5 h-5 rounded-full bg-navy text-paper flex items-center justify-center">
                                  <Check className="w-3 h-3 text-coral" />
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Maker Skill Level */}
              <div>
                <label className="block text-xs font-bold font-mono uppercase text-navy mb-2">
                  2. Sewing & Crafting Skill
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSkill(lvl)}
                      className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all text-center ${
                        skill === lvl 
                          ? 'bg-navy text-paper border-navy shadow-xs' 
                          : 'bg-paper text-charcoal border-navy/15 hover:bg-paper-50'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Available Tools Checklist */}
              <div>
                <label className="block text-xs font-bold font-mono uppercase text-navy mb-2">
                  3. Available Tools (Do you own these?)
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {COMMON_TOOLS.map((tool) => {
                    const isChecked = selectedTools.includes(tool);
                    return (
                      <label 
                        key={tool}
                        className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                          isChecked ? 'bg-bluegray/50 border-navy/20 font-medium text-navy' : 'bg-paper border-navy/10 text-charcoal-muted'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToolToggle(tool)}
                          className="w-3.5 h-3.5 rounded border-navy/20 text-navy focus:ring-0"
                        />
                        <span>{tool}</span>
                      </label>
                    );
                  })}
                </div>

                {/* Add Custom Tool */}
                <div className="mt-2.5 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add other tool (e.g. Snap pliers)..."
                    value={customToolInput}
                    onChange={(e) => setCustomToolInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTool())}
                    className="flex-grow px-3 py-1.5 text-xs rounded-xl border border-navy/15 bg-paper text-navy placeholder:text-charcoal-muted/60"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomTool}
                    className="px-3 py-1.5 rounded-xl bg-navy text-paper text-xs font-semibold hover:bg-navy/90"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* 4. Time Budget */}
              <div>
                <label className="block text-xs font-bold font-mono uppercase text-navy mb-1.5">
                  4. Available Time Window
                </label>
                <select
                  value={timeAvailable}
                  onChange={(e) => setTimeAvailable(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-navy/15 text-xs sm:text-sm bg-paper text-navy focus:outline-none"
                >
                  {TIME_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* 5. Intended Use Category */}
              <div>
                <label className="block text-xs font-bold font-mono uppercase text-navy mb-1.5">
                  5. Intended Use / Category
                </label>
                <select
                  value={intendedUse}
                  onChange={(e) => setIntendedUse(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-navy/15 text-xs sm:text-sm bg-paper text-navy focus:outline-none"
                >
                  {INTENDED_USES.map((u) => (
                    <option key={u.value} value={u.value}>{u.label}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* Right Column: Ranked Recommendations Gallery (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Header info */}
            <div className="flex items-center justify-between pb-3 border-b border-navy/10">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-navy">
                {recommendations.length} Feasible Projects Ranked
              </span>
              <span className="text-xs text-charcoal-muted font-mono">
                Physical Feasibility Tested
              </span>
            </div>

            {loading && (
              <div className="text-center py-16">
                <Compass className="w-8 h-8 text-coral animate-spin mx-auto mb-2" />
                <p className="text-xs font-mono text-charcoal-muted">Calculating geometric cutting feasibility for your {activeFabric?.clothingType || activeFabric?.material || 'textile'}...</p>
              </div>
            )}

            {!loading && recommendations.length === 0 && (
              <div className="text-center py-16 px-4 bg-surface rounded-3xl border border-navy/10">
                <AlertCircle className="w-10 h-10 text-coral mx-auto mb-2 opacity-80" />
                <h4 className="font-serif text-lg font-bold text-navy">No Matching Projects Found</h4>
                <p className="text-xs text-charcoal-muted max-w-sm mx-auto mt-1">
                  Try broadening your tool selection or adjusting your category filter to discover feasible patterns.
                </p>
              </div>
            )}

            {/* Recommendation Cards */}
            <div className="space-y-5">
              {recommendations.map((project) => {
                const isSaved = savedProjectIds.has(project.id);
                const feasibility = project.feasibility?.status || 'feasible';

                let badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                let badgeText = 'Feasible Fit';
                if (feasibility === 'tight') {
                  badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
                  badgeText = 'Tight Remnant Fit';
                } else if (feasibility === 'insufficient_material') {
                  badgeColor = 'bg-coral/20 text-coral-dark border-coral/30';
                  badgeText = 'Fabric Too Small';
                } else if (feasibility === 'unknown') {
                  badgeColor = 'bg-bluegray text-navy border-bluegray-300';
                  badgeText = 'Dimensions Unverified';
                }

                return (
                  <div
                    key={project.id}
                    className="p-5 sm:p-6 rounded-3xl bg-surface border border-navy/15 shadow-sm hover:shadow-warm transition-all flex flex-col md:flex-row gap-5"
                  >
                    {/* Visual Reference with unique tailored image */}
                    <div className="w-full md:w-48 aspect-[4/3] md:aspect-square rounded-2xl overflow-hidden bg-paper-200 relative flex-shrink-0 border border-navy/10">
                      <img
                        src={project.imageUrl}
                        alt=""
                        aria-hidden="true"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80';
                        }}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-navy text-paper shadow">
                        {project.matchScore}% Match
                      </span>
                      {project.isGenericReference && (
                        <span 
                          className="absolute bottom-2 left-2 right-2 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-amber-950/85 text-amber-200 border border-amber-400/40 backdrop-blur-md shadow text-center truncate"
                          title={project.imageNote || "Illustration is a generic styling reference and does not depict your exact fabric"}
                        >
                          {project.imageLabel || 'Generic Reference'}
                        </span>
                      )}
                    </div>

                    {/* Blueprint Details */}
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        {/* Status & Tailoring Pills */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${badgeColor}`}>
                            {badgeText}
                          </span>
                          <span className="text-[11px] font-mono text-coral font-semibold">
                            {project.difficulty} • {project.timeEstimate}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-paper border border-navy/10 text-[10px] font-mono text-charcoal">
                            {project.category}
                          </span>
                          {project.tailoredBadge && (
                            <span className="px-2 py-0.5 rounded-md bg-bluegray text-navy text-[10px] font-mono font-semibold border border-bluegray-300">
                              ✨ {project.tailoredBadge}
                            </span>
                          )}
                        </div>

                        <h3 className="font-serif text-lg sm:text-xl font-bold text-navy leading-snug">
                          {project.title}
                        </h3>
                        <p className="text-xs text-charcoal-muted mt-0.5 italic">
                          {project.subtitle}
                        </p>

                        {/* Suitability Explanations */}
                        <div className="mt-3 p-2.5 rounded-xl bg-bluegray/50 border border-bluegray-200 space-y-1">
                          {project.explanations?.map((exp, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-xs text-navy font-mono">
                              <Check className="w-3.5 h-3.5 text-coral flex-shrink-0" />
                              <span>{exp}</span>
                            </div>
                          ))}
                        </div>

                        {/* Dimensions & Leftovers */}
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-mono text-charcoal-muted">
                          <div>
                            <span className="text-[10px] uppercase block">Usage:</span>
                            <span className="text-navy font-semibold">{project.consumptionEstimate || 'Calculated from pattern'}</span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase block">Leftovers:</span>
                            <span className="text-navy font-semibold">{project.leftoverEstimate || 'Minimal offcuts'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="mt-5 pt-3 border-t border-navy/10 flex items-center justify-between gap-3">
                        <button
                          onClick={() => onOpenBlueprint(project, activeFabric)}
                          className="flex-grow inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-navy text-paper text-xs font-semibold hover:bg-navy/90 transition-colors shadow-2xs"
                        >
                          <FileText className="w-3.5 h-3.5 text-coral" />
                          <span>View Full Blueprint</span>
                        </button>

                        <button
                          onClick={() => handleSaveToMyProjects(project)}
                          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                            isSaved 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                              : 'bg-paper text-navy border-navy/20 hover:bg-paper-50'
                          }`}
                        >
                          {isSaved ? <BookmarkCheck className="w-4 h-4 text-emerald-700" /> : <Bookmark className="w-4 h-4 text-coral" />}
                          <span>{isSaved ? 'Saved' : 'Save'}</span>
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
