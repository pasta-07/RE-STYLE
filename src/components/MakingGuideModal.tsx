import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Check, 
  Sparkles, 
  Scissors, 
  BookOpen, 
  ChevronRight, 
  ChevronLeft, 
  Printer, 
  Compass,
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { UpcycleIdea, StepInstruction } from '../data/upcyclingIdeas';
import type { FabricSample } from '../data/mockFabrics';
import { 
  downloadBlueprintPdf, 
  saveProject, 
  createFabric 
} from '../api/reStyleApi';

interface MakingGuideModalProps {
  idea: UpcycleIdea | any | null;
  fabric: FabricSample | any;
  onClose: () => void;
  onSaved?: () => void;
}

export const MakingGuideModal: React.FC<MakingGuideModalProps> = ({
  idea,
  fabric,
  onClose,
  onSaved
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [hasFinished, setHasFinished] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Leftover modal on finishing
  const [showLeftoverModal, setShowLeftoverModal] = useState(false);
  const [leftoverLength, setLeftoverLength] = useState<number | ''>(20);
  const [leftoverWidth, setLeftoverWidth] = useState<number | ''>(15);
  const [leftoverPieces, setLeftoverPieces] = useState(1);
  const [leftoverNotes, setLeftoverNotes] = useState('Scraps remaining from cutting layout');

  useEffect(() => {
    if (!idea) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [idea, onClose]);

  if (!idea) return null;

  const steps: StepInstruction[] = Array.isArray(idea.steps) ? idea.steps : [];
  const safeStepIndex = Math.min(Math.max(0, currentStepIndex), Math.max(0, steps.length - 1));
  const currentStep = steps[safeStepIndex];
  const isCurrentStepDone = completedSteps.includes(safeStepIndex);

  const toggleStepCompleted = (index: number) => {
    if (completedSteps.includes(index)) {
      const updated = completedSteps.filter((i) => i !== index);
      setCompletedSteps(updated);
      setHasFinished(false);
    } else {
      const updated = [...completedSteps, index];
      setCompletedSteps(updated);

      if (updated.length === steps.length) {
        setHasFinished(true);
        setShowLeftoverModal(true);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#253247', '#C96F52', '#D6AD64', '#E2EBF0'],
        });
      }
    }
  };

  const nextStep = () => {
    if (safeStepIndex < steps.length - 1) {
      setCurrentStepIndex(safeStepIndex + 1);
    }
  };

  const prevStep = () => {
    if (safeStepIndex > 0) {
      setCurrentStepIndex(safeStepIndex - 1);
    }
  };

  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true);
      const filename = `${idea.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_blueprint.pdf`;
      await downloadBlueprintPdf(idea, fabric, filename);
    } catch (err: any) {
      console.warn('[PDF Export Notice]', err);
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleSaveProject = async () => {
    try {
      await saveProject({
        blueprintId: idea.blueprintId || idea.id,
        title: idea.title,
        subtitle: idea.subtitle || '',
        category: idea.category || 'Accessories',
        difficulty: idea.difficulty || 'Intermediate',
        timeEstimate: idea.timeEstimate || '2 Hours',
        imageUrl: idea.imageUrl || fabric.imageUrl,
        fabricId: fabric.id?.startsWith('fabric-') ? fabric.id : null,
        fabricAllocated: {
          length: fabric.dimensions?.length || fabric.dimensions?.width || 45,
          width: fabric.dimensions?.width || fabric.dimensions?.height || 35,
          unit: fabric.dimensions?.unit || 'cm'
        },
        status: 'planned',
        isFavourite: false,
        materialsNeeded: idea.materialsNeeded?.map((m: any) => typeof m === 'string' ? { name: m, required: true } : m) || [],
        toolsNeeded: idea.toolsNeeded || [],
        steps: steps.map((s, idx) => ({
          step: s.step || idx + 1,
          title: s.title,
          description: s.description,
          tip: s.tip,
          completed: completedSteps.includes(idx)
        })),
        cuttingPlan: idea.cuttingPlan || {
          patternPieces: [],
          seamAllowance: '1.0 cm included',
          grainline: 'Straight warp grain',
          cuttingOrder: ['Main body', 'Accents'],
          remainingFabricNotes: idea.patternNotes || 'Zero-waste tessellation'
        },
        suitabilityReason: idea.suitabilityReason,
        matchScore: idea.matchScore || 90
      });

      setIsSaved(true);
      if (onSaved) onSaved();
    } catch (err: any) {
      alert(err.message || 'Failed to save project to library');
    }
  };

  const handleConfirmLeftoverScraps = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (leftoverLength && leftoverWidth) {
        await createFabric({
          name: `${fabric.name || 'Textile'} Offcut Scrap (${leftoverLength}×${leftoverWidth} ${fabric.dimensions?.unit || 'cm'})`,
          imageUrl: fabric.imageUrl || 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=800&q=80',
          material: fabric.material || 'cotton',
          dominantColor: fabric.dominantColor || 'Natural Tone',
          pattern: fabric.pattern || 'Offcut Weave',
          dimensions: {
            length: Number(leftoverLength),
            width: Number(leftoverWidth),
            unit: fabric.dimensions?.unit || 'cm'
          },
          totalQuantity: Number(leftoverPieces) || 1,
          condition: 'good',
          conditionLabel: 'Clean Scrap',
          source: 'scrap',
          notes: `Confirmed leftover from completing ${idea.title}`
        });
      }
      setShowLeftoverModal(false);
      alert('Leftover scraps recorded and added to My Fabric Stash!');
    } catch (err: any) {
      alert(err.message || 'Failed to record scraps');
    }
  };

  const cuttingPlan = idea.cuttingPlan;
  const patternPieces = cuttingPlan?.patternPieces || [];

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-navy-900/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-modal-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-4xl bg-paper rounded-3xl overflow-hidden border border-navy/20 shadow-2xl my-8 max-h-[92vh] flex flex-col"
      >
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy/10 bg-paper-100 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-navy font-semibold">
            <BookOpen className="w-4 h-4 text-coral" />
            <span id="guide-modal-title">Interactive Atelier Maker Blueprint // #{idea.id}</span>
            {hasFinished && (
              <span className="ml-2 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                ✓ 100% Complete
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveProject}
              title="Save to My Projects"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                isSaved ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-paper text-navy border-navy/20 hover:bg-navy/5'
              }`}
            >
              {isSaved ? <BookmarkCheck className="w-3.5 h-3.5 text-emerald-700" /> : <Bookmark className="w-3.5 h-3.5 text-coral" />}
              <span>{isSaved ? 'Saved to Projects' : 'Save Project'}</span>
            </button>

            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              title="Export Printable PDF Blueprint"
              aria-label="Export Printable PDF Blueprint"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-navy text-paper text-xs font-semibold hover:bg-navy/90 transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-coral" />
              <span>{isExportingPdf ? 'Exporting...' : 'Export PDF'}</span>
            </button>

            <button
              onClick={onClose}
              aria-label="Close making guide dialog"
              className="p-1.5 rounded-full text-charcoal-muted hover:text-navy hover:bg-navy/10 transition-colors focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-grow">
          
          {/* Top Title Banner */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-navy/10">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider bg-navy text-paper font-semibold">
                  {idea.category}
                </span>
                <span className="text-xs font-mono text-coral font-semibold">
                  {idea.difficulty} • {idea.timeEstimate}
                </span>
                {idea.matchScore && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {idea.matchScore}% Match
                  </span>
                )}
              </div>
              <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-navy">
                {idea.title}
              </h2>
              {idea.subtitle && (
                <p className="text-xs sm:text-sm text-charcoal-muted mt-1 italic">
                  {idea.subtitle}
                </p>
              )}

              <p className="text-xs sm:text-sm text-charcoal-muted mt-2 max-w-xl leading-relaxed">
                {idea.suitabilityReason}
              </p>
            </div>

            {/* Fabric Remnant & Finished Blueprint Companion Chips */}
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-surface border border-navy/10 sm:max-w-sm flex-shrink-0 shadow-2xs">
              <div className="relative flex-shrink-0">
                <img
                  src={idea.imageUrl && !idea.imageUrl.includes('pollinations.ai') ? idea.imageUrl : (idea.fallbackImageUrl || '/blueprints/jute-patchwork-tote.jpg')}
                  alt={idea.title}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (idea.fallbackImageUrl && target.src !== idea.fallbackImageUrl && !idea.fallbackImageUrl.includes('pollinations.ai')) {
                      target.src = idea.fallbackImageUrl;
                    } else {
                      target.src = fabric.imageUrl;
                    }
                  }}
                  className="w-13 h-13 rounded-xl object-cover border border-navy/15 shadow-inner"
                />
                <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-1 py-0.2 bg-navy text-[8px] font-mono font-bold text-white rounded shadow-2xs">
                  Design
                </span>
              </div>

              <div className="relative flex-shrink-0">
                <img
                  src={fabric.imageUrl}
                  alt={fabric.name}
                  className="w-13 h-13 rounded-xl object-cover border border-navy/15 shadow-inner"
                />
                <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-1 py-0.2 bg-coral text-[8px] font-mono font-bold text-white rounded shadow-2xs">
                  Fabric
                </span>
              </div>

              <div className="text-xs min-w-0 pl-1">
                <span className="text-[10px] uppercase font-mono text-charcoal-muted block">Remnant Source</span>
                <p className="font-serif font-bold text-navy truncate max-w-[130px]">{fabric.name}</p>
                <p className="text-[11px] text-coral font-mono">
                  {fabric.dimensions?.length || fabric.dimensions?.width}×{fabric.dimensions?.width || fabric.dimensions?.height} {fabric.dimensions?.unit || 'cm'}
                </p>
              </div>
            </div>
          </div>

          {/* Cutting Layout Blueprint Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-bluegray border border-bluegray-300 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-navy flex items-center gap-2">
                <Compass className="w-4 h-4 text-coral" />
                Zero-Waste Geometric Cutting Blueprint
              </h3>
              <span className="text-[11px] font-mono text-navy bg-paper px-2.5 py-0.5 rounded-full font-semibold border border-navy/10">
                Required: {idea.fabricRequired || 'Calculated from pattern'}
              </span>
            </div>
            
            <p className="text-xs text-charcoal leading-relaxed font-mono bg-paper p-3.5 rounded-xl border border-navy/10">
              📐 Pattern Plan: {idea.patternNotes || cuttingPlan?.remainingFabricNotes || 'Deterministic tessellation designed to minimize offcuts.'}
            </p>

            {/* Pattern Pieces Table */}
            {patternPieces.length > 0 && (
              <div className="overflow-x-auto bg-paper rounded-xl border border-navy/10 p-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-charcoal-muted block mb-2 font-bold">
                  Technical Pattern Pieces Layout
                </span>
                <table className="w-full text-xs font-mono text-left">
                  <thead>
                    <tr className="border-b border-navy/10 text-charcoal-muted text-[10px]">
                      <th className="py-1">Piece Name</th>
                      <th className="py-1">Qty</th>
                      <th className="py-1">Dimensions</th>
                      <th className="py-1">Orientation / Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy/5">
                    {patternPieces.map((p: any, idx: number) => (
                      <tr key={idx} className="hover:bg-paper-50">
                        <td className="py-1.5 font-bold text-navy">{p.name}</td>
                        <td className="py-1.5">{p.count}</td>
                        <td className="py-1.5">{p.width} × {p.height} {p.unit}</td>
                        <td className="py-1.5 text-charcoal-muted">{p.notes || 'Straight grain cut'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-2 text-[10px] text-charcoal-muted flex items-center justify-between">
                  <span>Seam Allowance: {cuttingPlan?.seamAllowance || '1.0 cm included'}</span>
                  <span>Grainline: {cuttingPlan?.grainline || 'Parallel to warp'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Required Tools & Materials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-surface border border-navy/10 shadow-2xs">
              <h4 className="text-xs font-bold text-navy uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-coral" />
                Required Tools
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {idea.toolsNeeded?.map((tool: string, idx: number) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-paper border border-navy/10 text-xs text-charcoal font-medium">
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-navy/10 shadow-2xs">
              <h4 className="text-xs font-bold text-navy uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                Materials & Notions
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {idea.materialsNeeded?.map((mat: any, idx: number) => {
                  const label = typeof mat === 'string' ? mat : `${mat.name}${mat.required === false ? ' (Optional)' : ''}`;
                  return (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-paper border border-navy/10 text-xs text-charcoal font-medium">
                      {label}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Step-by-Step Interactive Guide */}
          {steps.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-lg font-bold text-navy">
                  Step-by-Step Construction ({safeStepIndex + 1} of {steps.length})
                </h3>
                <div className="text-xs font-mono text-coral font-semibold">
                  {completedSteps.length} of {steps.length} Steps Completed
                </div>
              </div>

              {/* Stepper Progress Bar */}
              <div className="grid grid-cols-5 gap-2 mb-6" role="tablist">
                {steps.map((step: StepInstruction, idx: number) => {
                  const isCompleted = completedSteps.includes(idx);
                  const isCurrent = safeStepIndex === idx;

                  return (
                    <button
                      key={step.step || idx}
                      onClick={() => setCurrentStepIndex(idx)}
                      role="tab"
                      aria-selected={isCurrent}
                      className={`h-2 rounded-full transition-all duration-300 relative ${
                        isCompleted 
                          ? 'bg-navy' 
                          : isCurrent 
                          ? 'bg-coral' 
                          : 'bg-navy/20'
                      }`}
                      title={`Step ${step.step}: ${step.title}`}
                    />
                  );
                })}
              </div>

              {/* Current Step Card */}
              {currentStep && (
                <div className="p-6 rounded-2xl bg-surface border-2 border-navy/20 shadow-sm space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-navy text-paper font-serif font-bold text-sm flex items-center justify-center flex-shrink-0">
                        {currentStep.step || safeStepIndex + 1}
                      </span>
                      <div>
                        <h4 className="font-serif text-base sm:text-lg font-bold text-navy">
                          {currentStep.title}
                        </h4>
                        <span className="text-[11px] font-mono text-charcoal-muted">
                          Phase {currentStep.step || safeStepIndex + 1}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleStepCompleted(safeStepIndex)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        isCurrentStepDone
                          ? 'bg-navy text-paper'
                          : 'bg-paper border border-navy/30 text-navy hover:bg-navy/5'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isCurrentStepDone ? 'Completed' : 'Mark Done'}</span>
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-charcoal leading-relaxed pt-2 border-t border-navy/10">
                    {currentStep.description}
                  </p>

                  {/* Artisan Pro Tip */}
                  {currentStep.tip && (
                    <div className="p-3.5 rounded-xl bg-bluegray border border-bluegray-300 text-xs text-navy flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-coral flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Artisan Atelier Pro-Tip:</span>
                        <span className="text-charcoal-muted">{currentStep.tip}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step Navigation Controls */}
              <div className="flex items-center justify-between mt-6">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={safeStepIndex === 0}
                  className="px-4 py-2.5 rounded-xl border border-navy/20 text-xs font-semibold text-navy hover:bg-navy/5 disabled:opacity-40 flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Step</span>
                </button>

                <button
                  type="button"
                  onClick={nextStep}
                  disabled={safeStepIndex === steps.length - 1}
                  className="px-5 py-2.5 rounded-xl bg-navy text-paper text-xs font-semibold hover:bg-navy/90 disabled:opacity-40 flex items-center gap-1.5"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>

      </motion.div>

      {/* --- LEFTOVER RECORDING MODAL (Feature 5) --- */}
      {showLeftoverModal && (
        <div className="fixed inset-0 z-60 bg-navy/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-paper p-6 sm:p-7 rounded-3xl max-w-md w-full border border-navy/20 shadow-2xl space-y-4">
            <h3 className="font-serif text-xl font-bold text-navy flex items-center gap-2">
              <Scissors className="w-5 h-5 text-coral" />
              <span>Project Finished! Record Leftovers</span>
            </h3>
            <p className="text-xs text-charcoal-muted leading-relaxed">
              You’ve completed all steps for <strong>{idea.title}</strong>! 
              Enter remaining offcut dimensions to automatically store the scrap in My Fabric Stash for secondary projects.
            </p>

            <form onSubmit={handleConfirmLeftoverScraps} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-charcoal-muted uppercase">Length ({fabric.dimensions?.unit || 'cm'})</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={leftoverLength}
                    onChange={(e) => setLeftoverLength(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-1.5 rounded-lg border border-navy/15 text-xs bg-surface"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-charcoal-muted uppercase">Width ({fabric.dimensions?.unit || 'cm'})</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={leftoverWidth}
                    onChange={(e) => setLeftoverWidth(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-1.5 rounded-lg border border-navy/15 text-xs bg-surface"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-charcoal-muted uppercase">Number of Scrap Pieces</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={leftoverPieces}
                  onChange={(e) => setLeftoverPieces(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-1.5 rounded-lg border border-navy/15 text-xs bg-surface"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-charcoal-muted uppercase">Notes</label>
                <input
                  type="text"
                  value={leftoverNotes}
                  onChange={(e) => setLeftoverNotes(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-navy/15 text-xs bg-surface"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowLeftoverModal(false)}
                  className="text-xs font-mono text-charcoal-muted hover:underline"
                >
                  Skip
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-emerald-800 text-white text-xs font-semibold hover:bg-emerald-900 shadow-md"
                >
                  Add Scrap to Stash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
