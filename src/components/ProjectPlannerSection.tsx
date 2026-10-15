import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Check, 
  AlertCircle, 
  Bookmark, 
  BookmarkCheck, 
  FileText
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

export const ProjectPlannerSection: React.FC<ProjectPlannerSectionProps> = ({
  stashFabrics,
  selectedFabricFromStash,
  onOpenBlueprint,
  onNavigateToProjects,
}) => {
  // Selected Fabric Source: from stash or temporary custom
  const [selectedStashFabricId, setSelectedStashFabricId] = useState<string>(
    selectedFabricFromStash?.id || (stashFabrics[0]?.id ?? '')
  );

  const [useCustomFabric, setUseCustomFabric] = useState(false);
  const [customLength, setCustomLength] = useState<number | ''>(45);
  const [customWidth, setCustomWidth] = useState<number | ''>(35);
  const [customUnit, setCustomUnit] = useState<'cm' | 'in'>('cm');
  const [customMaterial, setCustomMaterial] = useState('denim');

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
      setUseCustomFabric(false);
    }
  }, [selectedFabricFromStash]);

  const activeFabric = useCustomFabric 
    ? {
        name: `Custom ${customMaterial} (${customLength}×${customWidth} ${customUnit})`,
        material: customMaterial,
        dominantColor: 'Artisanal Natural',
        pattern: 'Solid Remnant',
        imageUrl: 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80',
        dimensions: { length: Number(customLength) || 0, width: Number(customWidth) || 0, unit: customUnit }
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
        fabricId: useCustomFabric ? undefined : selectedStashFabricId,
        fabric: useCustomFabric ? activeFabric : undefined,
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
  }, [selectedStashFabricId, useCustomFabric, customLength, customWidth, customUnit, customMaterial, skill, selectedTools, timeAvailable, intendedUse]);

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
        fabricId: useCustomFabric ? null : selectedStashFabricId,
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

  return (
    <section id="planner-section" className="py-16 sm:py-24 bg-paper-100 border-t border-navy/10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bluegray text-navy text-xs font-semibold uppercase tracking-wider mb-3 border border-bluegray-200">
              <Compass className="w-3.5 h-3.5 text-coral" />
              <span>Deterministic Project Matcher</span>
            </div>
            <h2 className="font-serif-title text-3xl sm:text-4xl lg:text-5xl text-navy font-bold leading-tight">
              Find My Next Project.
            </h2>
            <p className="mt-3 text-base sm:text-lg text-charcoal-muted leading-relaxed">
              Specify your available textile, tools, time, and skills. Our recommendation engine mathematically verifies dimensional feasibility and generates zero-waste cutting blueprints.
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
          
          {/* Left Column: Preferences & Fabric Selection (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-surface rounded-3xl p-6 sm:p-7 border border-navy/15 shadow-warm space-y-6">
              
              {/* 1. Fabric Remnant Picker */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold font-mono uppercase text-navy flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-coral"></span>
                    1. Target Fabric Remnant
                  </label>
                  <button
                    type="button"
                    onClick={() => setUseCustomFabric(!useCustomFabric)}
                    className="text-xs font-mono text-coral hover:underline"
                  >
                    {useCustomFabric ? '← Choose from Stash' : '+ Enter Ad-hoc Dimensions'}
                  </button>
                </div>

                {!useCustomFabric ? (
                  <div>
                    {stashFabrics.length > 0 ? (
                      <select
                        value={selectedStashFabricId}
                        onChange={(e) => setSelectedStashFabricId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-navy/15 text-xs sm:text-sm bg-paper text-navy font-medium focus:outline-none focus:ring-2 focus:ring-navy/20"
                      >
                        {stashFabrics.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name} — {f.dimensions.length}×{f.dimensions.width} {f.dimensions.unit} ({f.material})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-xs text-coral">Your stash is currently empty. Add fabric in My Fabric Stash or use custom dimensions.</p>
                    )}

                    {activeFabric && (
                      <div className="mt-2.5 p-3 rounded-xl bg-paper border border-navy/10 flex items-center gap-3">
                        <img 
                          src={activeFabric.imageUrl || 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80'} 
                          alt={activeFabric.name}
                          className="w-12 h-12 rounded-lg object-cover border border-navy/15 flex-shrink-0" 
                        />
                        <div className="min-w-0 text-xs">
                          <p className="font-serif font-bold text-navy truncate">{activeFabric.name}</p>
                          <p className="font-mono text-charcoal-muted">
                            {activeFabric.dimensions.length}×{activeFabric.dimensions.width} {activeFabric.dimensions.unit} • {activeFabric.material}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-paper border border-navy/10 space-y-3">
                    <span className="text-[11px] font-mono text-charcoal-muted uppercase block">Ad-hoc Unsaved Remnant</span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] font-mono text-charcoal-muted">Length</span>
                        <input
                          type="number"
                          value={customLength}
                          onChange={(e) => setCustomLength(e.target.value ? Number(e.target.value) : '')}
                          className="w-full px-3 py-1.5 rounded-lg border border-navy/15 text-xs bg-surface"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-charcoal-muted">Width</span>
                        <input
                          type="number"
                          value={customWidth}
                          onChange={(e) => setCustomWidth(e.target.value ? Number(e.target.value) : '')}
                          className="w-full px-3 py-1.5 rounded-lg border border-navy/15 text-xs bg-surface"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] font-mono text-charcoal-muted">Unit</span>
                        <select
                          value={customUnit}
                          onChange={(e) => setCustomUnit(e.target.value as any)}
                          className="w-full px-3 py-1.5 rounded-lg border border-navy/15 text-xs bg-surface"
                        >
                          <option value="cm">Centimeters (cm)</option>
                          <option value="in">Inches (in)</option>
                        </select>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-charcoal-muted">Material</span>
                        <select
                          value={customMaterial}
                          onChange={(e) => setCustomMaterial(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-navy/15 text-xs bg-surface"
                        >
                          <option value="denim">Denim</option>
                          <option value="cotton">Cotton</option>
                          <option value="linen">Linen</option>
                          <option value="silk">Silk</option>
                          <option value="corduroy">Corduroy</option>
                          <option value="wool">Wool</option>
                        </select>
                      </div>
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
                <p className="text-xs font-mono text-charcoal-muted">Calculating geometric cutting feasibility...</p>
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
                    {/* Visual Reference */}
                    <div className="w-full md:w-44 aspect-[4/3] md:aspect-square rounded-2xl overflow-hidden bg-paper-200 relative flex-shrink-0 border border-navy/10">
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80';
                        }}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-navy text-paper shadow">
                        {project.matchScore}% Match
                      </span>
                    </div>

                    {/* Blueprint Details */}
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        {/* Status Pills */}
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
