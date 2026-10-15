import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Cpu, 
  ArrowRight, 
  X,
  Palette,
  Globe,
  ExternalLink,
  Sparkles,
  TrendingUp,
  Loader2
} from 'lucide-react';
import type { FabricSample } from '../data/mockFabrics';
import { UPCYCLING_IDEAS } from '../data/upcyclingIdeas';
import type { DesignConcept } from '../api/generateDesigns';

interface AIAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  fabric: FabricSample;
  onViewRecommendations: () => void;
  aiDesigns?: DesignConcept[];
  liveTrends?: Array<{ title: string; snippet: string; url: string }>;
  isAiLoading?: boolean;
}

export const AIAnalysisModal: React.FC<AIAnalysisModalProps> = ({
  isOpen,
  onClose,
  fabric,
  onViewRecommendations,
  aiDesigns,
  liveTrends,
  isAiLoading,
}) => {
  const [scanStepIndex, setScanStepIndex] = useState(0);
  const isScanning = Boolean(isAiLoading);

  const scanSteps = [
    'Evaluating uploaded remnant outline & geometric dimensions...',
    'Querying TinyFish live sustainable fashion trends...',
    'Synthesizing bespoke zero-waste silhouettes with Gemini LLM...',
    'Calculating fabric consumption, margin economics & zero-waste impact...',
  ];

  // Cycle scanning steps while live AI synthesis is running
  useEffect(() => {
    if (!isOpen || !isAiLoading) return;

    const interval = setInterval(() => {
      setScanStepIndex((prev) => (prev + 1) % scanSteps.length);
    }, 1200);

    return () => clearInterval(interval);
  }, [isOpen, isAiLoading, scanSteps.length]);

  // Handle Escape key to close dialog
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-navy-900/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="analysis-modal-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-paper rounded-3xl overflow-hidden border border-navy/20 shadow-2xl"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy/10 bg-paper-100 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-navy font-semibold">
            <Cpu className="w-4 h-4 text-coral animate-pulse" />
            <span id="analysis-modal-title">
              {aiDesigns && aiDesigns.length > 0 
                ? 'Re:Style AI Design Engine // Live Trends & Blueprint Diagnostics' 
                : 'Interactive Prototype Simulator // Pattern Diagnostics'}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close diagnostics dialog"
            className="p-1.5 rounded-full text-charcoal-muted hover:text-navy hover:bg-navy/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-denim"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body - Scrollable */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
          
          {isScanning ? (
            <div className="space-y-6 text-center py-4">
              {/* Scanning visual box with animated laser beam line */}
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto rounded-2xl overflow-hidden border-2 border-navy/20 shadow-warm bg-paper-200">
                <img
                  src={fabric.imageUrl}
                  alt={fabric.name}
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80';
                  }}
                  className="w-full h-full object-cover filter contrast-105"
                />
                
                {/* Laser scan line overlay */}
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-coral via-paper to-coral shadow-[0_0_12px_#c96f52] animate-scan-line z-10" />
                <div className="absolute inset-0 bg-navy/10 pointer-events-none" />

                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#25324715_1px,transparent_1px),linear-gradient(to_bottom,#25324715_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
              </div>

              <div>
                <h4 className="font-serif text-xl font-bold text-navy">
                  Evaluating Remnant Parameters & Web Trends...
                </h4>
                <p className="text-xs font-mono text-coral mt-2 h-5">
                  {scanSteps[scanStepIndex]}
                </p>
              </div>

              {/* Progress dots */}
              <div className="flex justify-center gap-2">
                {scanSteps.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx <= scanStepIndex ? 'w-6 bg-navy' : 'w-2 bg-navy/20'
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Top Banner */}
              {aiDesigns && aiDesigns.length > 0 && !isAiLoading ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-emerald-200" />
                    </div>
                    <div>
                      <h4 className="font-serif text-base font-bold text-navy">
                        Live AI Sustainable Concepts Ready
                      </h4>
                      <p className="text-xs text-charcoal-muted">
                        Generated {aiDesigns.length} commercially viable products using TinyFish search trends & Gemini LLM.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      Live AI Active
                    </span>
                  </div>
                </div>
              ) : isAiLoading ? (
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center flex-shrink-0">
                      <Loader2 className="w-5 h-5 text-amber-200 animate-spin" />
                    </div>
                    <div>
                      <h4 className="font-serif text-base font-bold text-navy flex items-center gap-2">
                        <span>Synthesizing Live AI Blueprints</span>
                        <span className="w-2 h-2 rounded-full bg-coral animate-ping" />
                      </h4>
                      <p className="text-xs text-charcoal-muted">
                        Querying TinyFish live search trends and drafting bespoke zero-waste patterns...
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-charcoal-muted block">Status</span>
                    <span className="text-xs font-mono font-bold text-amber-800 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin text-coral" />
                      Synthesizing...
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-bluegray border border-bluegray-300 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-navy text-paper flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-coral" />
                    </div>
                    <div>
                      <h4 className="font-serif text-base font-bold text-navy">
                        Simulation Complete & Indexed
                      </h4>
                      <p className="text-xs text-charcoal-muted">
                        Matched {UPCYCLING_IDEAS.length} zero-waste blueprints using remnant parameters.
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-charcoal-muted block">Status</span>
                    <span className="text-xs font-mono font-bold text-navy">
                      Curated Archive
                    </span>
                  </div>
                </div>
              )}

              {/* TinyFish Live Web Trends Section (if available) */}
              {liveTrends && liveTrends.length > 0 && (
                <div className="p-4 rounded-2xl bg-paper-100 border border-navy/15">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-bold text-navy uppercase font-mono tracking-wider flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-coral" />
                      TinyFish Live Web Research ({liveTrends.length} Trends Discovered)
                    </span>
                    <span className="text-[10px] font-mono text-charcoal-muted">Real-Time Search</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {liveTrends.slice(0, 4).map((trend, idx) => (
                      <a
                        key={idx}
                        href={trend.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-surface border border-navy/10 hover:border-coral/50 transition-colors group flex items-start justify-between gap-2"
                      >
                        <div className="overflow-hidden">
                          <p className="font-bold text-navy truncate group-hover:text-coral transition-colors">
                            {trend.title}
                          </p>
                          <p className="text-[11px] text-charcoal-muted line-clamp-1 mt-0.5">
                            {trend.snippet}
                          </p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-charcoal-muted group-hover:text-coral flex-shrink-0 mt-0.5" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Generated AI Concepts List (if available) */}
              {aiDesigns && aiDesigns.length > 0 ? (
                <div>
                  <h5 className="text-xs uppercase font-mono tracking-wider text-navy font-bold flex items-center gap-1.5 mb-3">
                    <TrendingUp className="w-3.5 h-3.5 text-coral" />
                    AI Commercial Clothing Concepts
                  </h5>
                  <div className="space-y-3">
                    {aiDesigns.map((concept, idx) => (
                      <div 
                        key={concept.id || idx}
                        className="p-4 rounded-2xl bg-surface border border-navy/15 shadow-2xs hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <h6 className="font-serif text-base font-bold text-navy">
                            {concept.title}
                          </h6>
                          <div className="flex items-center gap-2 text-xs font-mono">
                            <span className="px-2 py-0.5 rounded-md bg-paper-200 text-charcoal font-medium">
                              Cost: {concept.estimatedProductionCost}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                              Retail: {concept.potentialSellingPrice}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-charcoal leading-relaxed mb-3">
                          {concept.description}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono bg-paper-100 p-2.5 rounded-xl border border-navy/10 mb-2">
                          <div>
                            <span className="text-charcoal-muted block">Fabric Usage:</span>
                            <span className="font-bold text-navy">{concept.estimatedFabricUsage}</span>
                          </div>
                          <div>
                            <span className="text-charcoal-muted block">Waste Reduction:</span>
                            <span className="font-bold text-emerald-700">{concept.wasteReductionImpact}</span>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            disabled={Boolean(isAiLoading)}
                            onClick={() => {
                              if (isAiLoading) return;
                              onClose();
                              onViewRecommendations();
                            }}
                            className={`text-xs font-semibold flex items-center gap-1 ${
                              isAiLoading
                                ? 'text-charcoal-muted cursor-not-allowed opacity-60'
                                : 'text-navy hover:text-coral transition-colors cursor-pointer'
                            }`}
                          >
                            <span>Explore Blueprint in Catalog</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Fallback Grid of Remnant Properties if no AI concepts */
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-paper-100 border border-navy/10">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-charcoal-muted block">Material Profile</span>
                    <p className="font-serif text-sm font-bold text-navy mt-0.5">{fabric.material}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-paper-100 border border-navy/10">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-charcoal-muted block">Weave Structure</span>
                    <p className="font-serif text-sm font-bold text-navy mt-0.5">{fabric.weave}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-paper-100 border border-navy/10">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-charcoal-muted block">Weight Estimate</span>
                    <p className="font-serif text-sm font-bold text-navy mt-0.5">{fabric.weightGsm} GSM</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-paper-100 border border-navy/10">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-charcoal-muted block">Condition</span>
                    <p className="font-serif text-sm font-bold text-coral mt-0.5">{fabric.condition}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-paper-100 border border-navy/10">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-charcoal-muted block">Usable Surface</span>
                    <p className="font-serif text-sm font-bold text-navy mt-0.5">
                      {fabric.dimensions.width}×{fabric.dimensions.height} {fabric.dimensions.unit}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-paper-100 border border-navy/10">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-charcoal-muted block">Pattern Match</span>
                    <p className="font-serif text-sm font-bold text-navy mt-0.5">Geometric Fold</p>
                  </div>
                </div>
              )}

              {/* Extracted Color Palette */}
              <div>
                <span className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Palette className="w-3.5 h-3.5 text-coral" />
                  Atelier Chromatic Palette
                </span>
                <div className="flex gap-2">
                  {fabric.colorPalette.map((col, idx) => (
                    <div key={idx} className="flex-1 text-center">
                      <div
                        className="h-8 rounded-lg border border-navy/15 shadow-2xs"
                        style={{ backgroundColor: col.hex }}
                        title={`${col.name} (${col.hex})`}
                      />
                      <span className="text-[10px] font-mono text-charcoal-muted block mt-1 truncate">
                        {col.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA to view recommendations - disabled during AI synthesis */}
              <button
                type="button"
                disabled={Boolean(isAiLoading)}
                onClick={() => {
                  if (isAiLoading) return;
                  onClose();
                  onViewRecommendations();
                }}
                className={`w-full py-4 px-6 rounded-2xl text-base font-semibold shadow-warm transition-all duration-300 flex items-center justify-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-denim ${
                  isAiLoading
                    ? 'bg-navy/60 text-paper/70 cursor-not-allowed opacity-80'
                    : 'bg-navy hover:bg-navy-700 text-paper hover:shadow-warm-lg active:scale-98 cursor-pointer'
                }`}
              >
                {isAiLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 text-coral animate-spin" />
                    <span>Synthesizing Live AI Blueprints (Please wait...)</span>
                  </>
                ) : (
                  <>
                    <span>
                      {aiDesigns && aiDesigns.length > 0
                        ? `Explore ${aiDesigns.length} Matched Upcycling Blueprints`
                        : 'Explore Matched Upcycling Blueprints'}
                    </span>
                    <ArrowRight className="w-4 h-4 text-coral" />
                  </>
                )}
              </button>

            </div>
          )}

        </div>

      </motion.div>
    </div>
  );
};
