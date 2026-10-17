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
  BookmarkCheck,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { UpcycleIdea, StepInstruction } from '../data/upcyclingIdeas';
import type { FabricSample } from '../data/mockFabrics';
import { 
  downloadBlueprintPdf, 
  saveProject, 
  createFabric 
} from '../api/reStyleApi';
import { evaluateFabricFeasibility, type CuttingLayoutResult, BLUEPRINT_PIECE_REGISTRY } from '../utils/fabricFeasibility';
import { generateProjectPreview } from '../api/generateDesigns';

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

  // Photo-conditioned preview states
  const [previewImageUrl, setPreviewImageUrl] = useState<string>(() => {
    return idea?.imageUrl && !idea.imageUrl.includes('pollinations.ai')
      ? idea.imageUrl
      : (idea?.fallbackImageUrl || '/blueprints/jute-patchwork-tote.jpg');
  });
  const [isPhotoConditioned, setIsPhotoConditioned] = useState<boolean>(Boolean(idea?.isPhotoConditioned));
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewRequiresSetup, setPreviewRequiresSetup] = useState(false);

  // Leftover modal on finishing
  const [showLeftoverModal, setShowLeftoverModal] = useState(false);
  const [leftoverLength, setLeftoverLength] = useState<number | ''>(20);
  const [leftoverWidth, setLeftoverWidth] = useState<number | ''>(15);
  const [leftoverPieces, setLeftoverPieces] = useState(1);
  const [leftoverNotes, setLeftoverNotes] = useState('Scraps remaining from cutting layout');

  const handleGeneratePreview = async () => {
    if (!fabric?.imageUrl) {
      alert('Please upload or select a fabric photo first.');
      return;
    }
    setIsGeneratingPreview(true);
    setPreviewError(null);
    setPreviewRequiresSetup(false);
    try {
      const res = await generateProjectPreview({
        fabricImage: fabric.imageUrl,
        fabricColor: fabric.dominantColor || 'Natural',
        fabricMaterial: fabric.material || 'Cotton',
        fabricDimensions: fabric.dimensions ? `${fabric.dimensions.width}×${fabric.dimensions.height} ${fabric.dimensions.unit}` : undefined,
        projectTitle: idea.title,
        projectDescription: idea.description || idea.subtitle || '',
        category: idea.category,
      });

      if (res.success && res.imageUrl) {
        setPreviewImageUrl(res.imageUrl);
        setIsPhotoConditioned(true);
        if (idea) {
          idea.imageUrl = res.imageUrl;
          idea.isPhotoConditioned = true;
          idea.isGenericReference = false;
        }
      } else if (res.requiresSetup) {
        setPreviewRequiresSetup(true);
        setPreviewError(res.message || 'Image editing provider setup required (STABILITY_API_KEY or BFL_API_KEY).');
      } else {
        setPreviewError(res.error || 'Failed to generate fabric-conditioned preview.');
      }
    } catch (err: any) {
      setPreviewError(err.message || 'Preview generation failed.');
    } finally {
      setIsGeneratingPreview(false);
    }
  };

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

  // Single shared source of truth for feasibility & cutting layout
  const feasibility: CuttingLayoutResult = idea.rawFeasibility || evaluateFabricFeasibility(idea, fabric);
  const registryEntry = BLUEPRINT_PIECE_REGISTRY[idea.id] || BLUEPRINT_PIECE_REGISTRY['idea-quilted-sleeve'];

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
          length: fabric.dimensions?.length ?? fabric.dimensions?.height ?? 45,
          width: fabric.dimensions?.width ?? 35,
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
          patternPieces: registryEntry.pieces,
          seamAllowance: '1.0 cm included',
          grainline: 'Straight warp grain',
          cuttingOrder: ['Main body', 'Accents'],
          remainingFabricNotes: feasibility.remainingNotes
        },
        suitabilityReason: feasibility.suitabilityReason,
        matchScore: feasibility.matchScore
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

  const patternPieces = (idea.cuttingPlan?.patternPieces && idea.cuttingPlan.patternPieces.length > 0)
    ? idea.cuttingPlan.patternPieces
    : registryEntry.pieces;

  const dynamicTools = [
    `Sewing machine (${feasibility.fabricSpecs.needle}) or hand needle`,
    feasibility.fabricSpecs.thread,
    feasibility.fabricSpecs.presserFoot,
    'Fabric shears or rotary cutter',
    'Tailor chalk and clear ruler',
    'Steam iron and pressing cloth'
  ];

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
                {/* Score strictly synchronized with catalog card */}
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                  feasibility.matchScore >= 85 
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : feasibility.matchScore >= 60 
                    ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                    : 'bg-rose-100 text-rose-800 border-rose-300'
                }`}>
                  {feasibility.matchScore >= 50 ? `${feasibility.matchScore}% Surface Fit` : 'Does Not Fit Remnant'}
                </span>
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
                {feasibility.suitabilityReason}
              </p>
            </div>

            {/* Fabric Remnant & Finished Blueprint Companion Chips */}
            <div className="flex flex-col gap-2 p-3 rounded-2xl bg-surface border border-navy/10 sm:max-w-sm flex-shrink-0 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div 
                  className="relative w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden border border-navy/15 shadow-inner bg-slate-900"
                  style={{ width: '56px', height: '56px', minWidth: '56px', minHeight: '56px', maxWidth: '56px', maxHeight: '56px' }}
                >
                  <img
                    src={previewImageUrl}
                    alt={idea.title}
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (idea.fallbackImageUrl && target.src !== idea.fallbackImageUrl && !idea.fallbackImageUrl.includes('pollinations.ai')) {
                        target.src = idea.fallbackImageUrl;
                      } else {
                        target.src = '/blueprints/jute-patchwork-tote.jpg';
                      }
                    }}
                    className="w-full h-full object-cover block"
                    style={{ width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }}
                  />
                  <span className={`absolute bottom-0 inset-x-0 py-0.5 text-[8px] font-mono font-bold text-white text-center shadow-2xs truncate ${
                    isPhotoConditioned 
                      ? 'bg-emerald-700/90' 
                      : (idea.isGenericReference ? 'bg-amber-800/90' : 'bg-navy/90')
                  }`}>
                    {isPhotoConditioned ? 'AI Preview' : (idea.isGenericReference ? 'Ref Style' : 'Design')}
                  </span>
                </div>

                <div 
                  className="relative w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden border border-navy/15 shadow-inner bg-slate-900"
                  style={{ width: '56px', height: '56px', minWidth: '56px', minHeight: '56px', maxWidth: '56px', maxHeight: '56px' }}
                >
                  <img
                    src={fabric.imageUrl}
                    alt={fabric.name}
                    className="w-full h-full object-cover block"
                    style={{ width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }}
                  />
                  <span className="absolute bottom-0 inset-x-0 py-0.5 bg-coral/90 text-[8px] font-mono font-bold text-white text-center shadow-2xs truncate">
                    Fabric
                  </span>
                </div>

                <div className="text-xs min-w-0 pl-1">
                  <span className="text-[10px] uppercase font-mono text-charcoal-muted block">Remnant Source</span>
                  <p className="font-serif font-bold text-navy truncate max-w-[130px]">{fabric.name}</p>
                  <p className="text-[11px] text-coral font-mono">
                    {fabric.dimensions?.width}×{fabric.dimensions?.height || fabric.dimensions?.length} {fabric.dimensions?.unit || 'cm'} (~{fabric.weightGsm || 200} GSM)
                  </p>
                </div>
              </div>

              {/* Status & Preview Action */}
              <div className="border-t border-navy/5 pt-1.5">
                {isPhotoConditioned ? (
                  <p className="text-[10px] text-emerald-800 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                    AI concept conditioned on your uploaded fabric
                  </p>
                ) : (
                  <div>
                    {idea.isGenericReference && (
                      <p className="text-[9px] text-amber-700 font-mono italic mb-1">
                        Curated style reference • Does not depict your fabric
                      </p>
                    )}
                    {fabric.imageUrl && (
                      <button
                        type="button"
                        onClick={handleGeneratePreview}
                        disabled={isGeneratingPreview}
                        className="w-full text-[10px] font-mono px-2.5 py-1 rounded-lg bg-coral/10 hover:bg-coral/20 text-coral border border-coral/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Sparkles className="w-3 h-3 text-coral" />
                        <span>{isGeneratingPreview ? 'Synthesizing with Fabric Photo...' : 'Generate AI Preview (From My Fabric)'}</span>
                      </button>
                    )}
                  </div>
                )}

                {previewError && (
                  <p className="text-[10px] text-rose-700 font-mono mt-1">
                    {previewError}
                  </p>
                )}
                {previewRequiresSetup && (
                  <p className="text-[9px] text-slate-500 font-mono mt-0.5">
                    Requires server STABILITY_API_KEY or BFL_API_KEY environment variable.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Project Visual Preview & Reference Banner (Fitted to Screen) */}
          <div className="rounded-2xl bg-slate-950/90 border border-navy/20 p-4 sm:p-5 text-paper shadow-md">
            <div className="flex flex-col md:flex-row items-center gap-5">
              {/* Responsive Contained Image Box - strictly bounded to fit screen */}
              <div 
                className="relative w-full md:w-auto md:min-w-[240px] md:max-w-[280px] h-44 sm:h-48 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center p-2 border border-white/10 shadow-inner flex-shrink-0"
              >
                <img
                  src={previewImageUrl}
                  alt={idea.title}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (idea.fallbackImageUrl && target.src !== idea.fallbackImageUrl && !idea.fallbackImageUrl.includes('pollinations.ai')) {
                      target.src = idea.fallbackImageUrl;
                    } else {
                      target.src = '/blueprints/jute-patchwork-tote.jpg';
                    }
                  }}
                  className="max-h-full max-w-full object-contain rounded-lg shadow-md block transition-transform duration-300 hover:scale-105"
                  style={{ maxHeight: '175px', maxWidth: '100%', objectFit: 'contain' }}
                />
                <span className={`absolute top-2 left-2 px-2 py-0.5 text-[9px] font-mono font-bold rounded-md backdrop-blur-md shadow-sm ${
                  isPhotoConditioned 
                    ? 'bg-emerald-600/90 text-white' 
                    : (idea.isGenericReference ? 'bg-amber-600/90 text-white' : 'bg-navy/90 text-paper')
                }`}>
                  {isPhotoConditioned ? '✨ Fabric-Conditioned AI Preview' : (idea.isGenericReference ? 'Curated Style Reference' : 'Atelier Design Blueprint')}
                </span>
              </div>

              {/* Visual Project Concept Details */}
              <div className="space-y-2.5 flex-1 min-w-0 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-coral font-bold">
                    Visual Target Blueprint
                  </span>
                  <span className="text-white/30">•</span>
                  <span className="text-[10px] font-mono text-white/70">
                    Fabric: {fabric.name} ({fabric.dominantColor || 'Natural'})
                  </span>
                </div>
                
                <h3 className="font-serif text-lg sm:text-xl font-bold text-white truncate">
                  {idea.title}
                </h3>
                
                <p className="text-xs text-white/70 leading-relaxed font-sans line-clamp-2">
                  {idea.description || idea.subtitle || feasibility.suitabilityReason}
                </p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
                  {fabric.imageUrl && !isPhotoConditioned && (
                    <button
                      type="button"
                      onClick={handleGeneratePreview}
                      disabled={isGeneratingPreview}
                      className="text-xs font-mono px-3 py-1.5 rounded-lg bg-coral text-white hover:bg-coral-600 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isGeneratingPreview ? 'Synthesizing with Fabric Photo...' : 'Synthesize AI Preview (From My Fabric)'}</span>
                    </button>
                  )}
                  {isPhotoConditioned && (
                    <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Visual concept conditioned on your uploaded fabric swatch
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Feasibility Alert Banner */}
          <div className={`p-4 rounded-2xl border text-xs font-mono flex items-start gap-3 ${feasibility.statusBadgeColor}`}>
            {feasibility.status === 'feasible' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
            ) : feasibility.status === 'tight' ? (
              <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
            ) : feasibility.status === 'requires_piecing' ? (
              <Layers className="w-5 h-5 text-indigo-700 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-700 flex-shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="font-bold text-sm">{feasibility.statusLabel}</div>
              <p className="leading-relaxed opacity-95">{feasibility.explanation}</p>
              <div className="text-[11px] opacity-80 pt-1">
                Remnant Area: {feasibility.remnantAreaCm2} cm² • Consumed: ~{feasibility.consumedAreaCm2} cm² ({feasibility.utilizationPercent}% utilization) • Offcut remainder: ~{feasibility.remainingAreaCm2} cm²
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
                Required Remnant: {idea.fabricRequired || `${feasibility.remnantWidthCm}×${feasibility.remnantHeightCm} cm`}
              </span>
            </div>
            
            <p className="text-xs text-charcoal leading-relaxed font-mono bg-paper p-3.5 rounded-xl border border-navy/10">
              📐 Pattern Plan: {idea.patternNotes || feasibility.remainingNotes}
            </p>

            {/* Pattern Pieces Table with Explicit Supply Source */}
            {patternPieces.length > 0 && (
              <div className="overflow-x-auto bg-paper rounded-xl border border-navy/10 p-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-charcoal-muted block mb-2 font-bold">
                  Technical Pattern Pieces Layout & Supply Sourcing
                </span>
                <table className="w-full text-xs font-mono text-left">
                  <thead>
                    <tr className="border-b border-navy/10 text-charcoal-muted text-[10px]">
                      <th className="py-1">Piece Name</th>
                      <th className="py-1">Qty</th>
                      <th className="py-1">Dimensions</th>
                      <th className="py-1">Supply Source</th>
                      <th className="py-1">Notes / Grainline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy/5">
                    {patternPieces.map((p: any, idx: number) => {
                      const isRemnant = p.source === 'remnant' || !p.source;
                      return (
                        <tr key={idx} className="hover:bg-paper-50">
                          <td className="py-1.5 font-bold text-navy">{p.name}</td>
                          <td className="py-1.5">{p.count}</td>
                          <td className="py-1.5">{p.width} × {p.height} {p.unit || 'cm'}</td>
                          <td className="py-1.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isRemnant ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {isRemnant ? 'Your Remnant' : 'Separate Supply'}
                            </span>
                          </td>
                          <td className="py-1.5 text-charcoal-muted">{p.notes || 'Straight grain cut'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="mt-2 text-[10px] text-charcoal-muted flex items-center justify-between">
                  <span>Seam Allowance: {idea.cuttingPlan?.seamAllowance || '1.0 cm included'}</span>
                  <span>Grainline: {idea.cuttingPlan?.grainline || 'Parallel to warp'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Dynamic Fabric Sewing Specifications Callout */}
          <div className="p-4 sm:p-5 rounded-2xl bg-paper-100 border border-navy/15 space-y-3">
            <h4 className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Sliders className="w-3.5 h-3.5 text-coral" />
              Machine & Needle Specifications for {fabric.name} ({fabric.material})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="bg-surface p-3 rounded-xl border border-navy/10 space-y-1">
                <span className="text-[10px] text-charcoal-muted block font-sans uppercase font-bold">Recommended Needle</span>
                <span className="font-bold text-navy block">{feasibility.fabricSpecs.needle}</span>
              </div>
              <div className="bg-surface p-3 rounded-xl border border-navy/10 space-y-1">
                <span className="text-[10px] text-charcoal-muted block font-sans uppercase font-bold">Thread & Tension</span>
                <span className="text-navy font-semibold block">{feasibility.fabricSpecs.thread}</span>
                <span className="text-[11px] text-coral font-medium block">{feasibility.fabricSpecs.tension}</span>
              </div>
              <div className="bg-surface p-3 rounded-xl border border-navy/10 space-y-1">
                <span className="text-[10px] text-charcoal-muted block font-sans uppercase font-bold">Presser Foot & Seam Type</span>
                <span className="text-navy font-semibold block">{feasibility.fabricSpecs.presserFoot}</span>
                <span className="text-[11px] text-charcoal-muted block">{feasibility.fabricSpecs.stitchLength}</span>
              </div>
            </div>
          </div>

          {/* Required Tools & Materials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-surface border border-navy/10 shadow-2xs">
              <h4 className="text-xs font-bold text-navy uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-coral" />
                Required Tools
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {dynamicTools.map((tool: string, idx: number) => (
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
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-navy text-paper flex items-center justify-center text-xs font-mono font-bold">
                        {currentStep.step || safeStepIndex + 1}
                      </span>
                      <h4 className="font-serif text-lg font-bold text-navy">
                        {currentStep.title}
                      </h4>
                    </div>

                    <button
                      onClick={() => toggleStepCompleted(safeStepIndex)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        isCurrentStepDone 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-paper text-navy border border-navy/20 hover:bg-navy/5'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isCurrentStepDone ? 'Completed' : 'Mark Done'}</span>
                    </button>
                  </div>

                  <p className="text-sm text-charcoal leading-relaxed font-sans">
                    {currentStep.description}
                  </p>

                  {currentStep.tip && (
                    <div className="p-3 rounded-xl bg-bluegray/50 border border-bluegray-200 text-xs text-navy flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-coral shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold block">Atelier Technique Tip:</strong>
                        <span className="text-charcoal-muted">{currentStep.tip}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-navy/10">
                    <button
                      onClick={prevStep}
                      disabled={safeStepIndex === 0}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-navy bg-paper border border-navy/20 disabled:opacity-30 disabled:pointer-events-none hover:bg-navy/5 flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous Step</span>
                    </button>

                    <button
                      onClick={nextStep}
                      disabled={safeStepIndex === steps.length - 1}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-paper bg-navy disabled:opacity-30 disabled:pointer-events-none hover:bg-navy-700 flex items-center gap-1"
                    >
                      <span>Next Step</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Leftover Scrap Recording Dialog */}
        {showLeftoverModal && (
          <div className="absolute inset-0 bg-navy/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-paper rounded-2xl p-6 max-w-md w-full border border-navy/20 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-navy/10 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-coral" />
                  <h3 className="font-serif text-lg font-bold text-navy">Record Remnant Leftovers</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLeftoverModal(false)}
                  className="p-1 rounded-full text-charcoal-muted hover:text-navy"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-charcoal-muted leading-relaxed">
                Congratulations on completing <strong>{idea.title}</strong>! Record your confirmed scrap offcuts to keep your Fabric Stash inventory zero-waste.
              </p>

              <form onSubmit={handleConfirmLeftoverScraps} className="space-y-3 font-mono text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-navy mb-1">Length ({fabric.dimensions?.unit || 'cm'})</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={leftoverLength}
                      onChange={(e) => setLeftoverLength(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-surface border border-navy/20 rounded-lg px-2.5 py-1.5 text-navy focus:outline-none focus:ring-1 focus:ring-denim"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-navy mb-1">Width ({fabric.dimensions?.unit || 'cm'})</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={leftoverWidth}
                      onChange={(e) => setLeftoverWidth(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-surface border border-navy/20 rounded-lg px-2.5 py-1.5 text-navy focus:outline-none focus:ring-1 focus:ring-denim"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-navy mb-1">Number of Pieces</label>
                  <input
                    type="number"
                    min="1"
                    value={leftoverPieces}
                    onChange={(e) => setLeftoverPieces(Number(e.target.value))}
                    className="w-full bg-surface border border-navy/20 rounded-lg px-2.5 py-1.5 text-navy focus:outline-none focus:ring-1 focus:ring-denim"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-navy mb-1">Inventory Notes</label>
                  <input
                    type="text"
                    value={leftoverNotes}
                    onChange={(e) => setLeftoverNotes(e.target.value)}
                    className="w-full bg-surface border border-navy/20 rounded-lg px-2.5 py-1.5 text-navy focus:outline-none focus:ring-1 focus:ring-denim"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowLeftoverModal(false)}
                    className="px-3 py-1.5 rounded-lg text-charcoal hover:bg-navy/5 text-xs font-sans font-medium"
                  >
                    Skip
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-navy text-paper text-xs font-sans font-bold hover:bg-navy-700 transition-colors"
                  >
                    Add to My Fabric Stash
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </motion.div>
    </div>
  );
};
