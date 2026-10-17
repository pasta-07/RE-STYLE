import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  Clock, 
  BookOpen, 
  HelpCircle, 
  Scissors, 
  Globe, 
  DollarSign, 
  Leaf,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { UPCYCLING_IDEAS } from '../data/upcyclingIdeas';
import type { UpcycleIdea } from '../data/upcyclingIdeas';
import type { FabricSample } from '../data/mockFabrics';
import { pickCuratedCatalogImage } from '../utils/blueprintAdapter';
import { evaluateFabricFeasibility, type CuttingLayoutResult } from '../utils/fabricFeasibility';
import { generateProjectPreview } from '../api/generateDesigns';

export type CatalogSourceFilter = 'ai' | 'all' | 'curated';

const getSafeImageUrl = (idea: UpcycleIdea, currentFabric: FabricSample): string => {
  return pickCuratedCatalogImage(idea, currentFabric, 0);
};

const NeutralBlueprintPlaceholder: React.FC<{
  title: string;
  fabric: FabricSample;
  onGeneratePreview?: () => void;
  isGenerating?: boolean;
}> = ({ title, fabric, onGeneratePreview, isGenerating }) => (
  <div className="relative w-full h-full bg-slate-900 flex flex-col items-center justify-center p-6 text-center text-slate-300">
    <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
    <div className="relative z-10 flex flex-col items-center gap-2 max-w-xs">
      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 shadow-inner">
        <Scissors className="w-5 h-5 text-sky-400" />
      </div>
      <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-sky-300">
        Pattern Blueprint Schematic
      </span>
      <p className="text-xs text-slate-300 font-serif line-clamp-2">
        {title}
      </p>
      <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700">
        Target Palette: {fabric.dominantColor || 'Natural'} • {fabric.material || 'Textile'}
      </span>
      {fabric.imageUrl && onGeneratePreview && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onGeneratePreview();
          }}
          disabled={isGenerating}
          className="mt-2 text-[10px] font-mono px-3 py-1 rounded-full bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-400/30 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <Sparkles className={`w-3 h-3 text-sky-300 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'Synthesizing Concept...' : 'Generate AI Preview'}</span>
        </button>
      )}
    </div>
  </div>
);

const IdeaCardImage: React.FC<{
  idea: UpcycleIdea;
  currentFabric: FabricSample;
  onPreviewGenerated?: (previewUrl: string) => void;
}> = ({ idea, currentFabric, onPreviewGenerated }) => {
  const [imgSrc, setImgSrc] = useState<string>(() => {
    if (idea.imageUrl && !idea.imageUrl.includes('pollinations.ai')) return idea.imageUrl;
    return getSafeImageUrl(idea, currentFabric);
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (idea.imageUrl && !idea.imageUrl.includes('pollinations.ai')) {
      setImgSrc(idea.imageUrl);
    } else {
      setImgSrc(getSafeImageUrl(idea, currentFabric));
    }
    setIsLoaded(false);
    setHasError(false);

    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [idea.imageUrl, idea.fallbackImageUrl, currentFabric.id, currentFabric.material]);

  const handleGeneratePreview = async () => {
    if (!currentFabric.imageUrl) return;
    setIsGenerating(true);
    try {
      const res = await generateProjectPreview({
        fabricImage: currentFabric.imageUrl,
        fabricDetails: currentFabric,
        projectDetails: idea
      });
      if (res.success && res.previewUrl) {
        setImgSrc(res.previewUrl);
        setHasError(false);
        if (onPreviewGenerated) onPreviewGenerated(res.previewUrl);
      }
    } catch (err) {
      console.warn('[Preview Generation Notice]', err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (hasError || !imgSrc) {
    return (
      <NeutralBlueprintPlaceholder
        title={idea.title}
        fabric={currentFabric}
        onGeneratePreview={handleGeneratePreview}
        isGenerating={isGenerating}
      />
    );
  }

  return (
    <div className="relative w-full h-full bg-paper-200">
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-paper-200 via-paper-100 to-paper-200 animate-pulse flex flex-col items-center justify-center gap-2 text-charcoal-muted z-0">
          <Sparkles className="w-5 h-5 text-emerald-500 animate-spin" />
          <span className="text-[10px] font-mono tracking-wider uppercase text-charcoal/60">
            Synthesizing Visual...
          </span>
        </div>
      )}
      <img
        key={`${idea.id}-${imgSrc}`}
        src={imgSrc}
        alt={idea.title}
        loading="eager"
        decoding="sync"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          if (idea.fallbackImageUrl && imgSrc !== idea.fallbackImageUrl && !idea.fallbackImageUrl.includes('pollinations.ai')) {
            setImgSrc(idea.fallbackImageUrl);
          } else {
            setHasError(true);
          }
          setIsLoaded(true);
        }}
        className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-300 relative z-10 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};

export type FeasibilityFilterMode = 'matched' | 'modifications' | 'all';

interface RecommendationsGalleryProps {
  currentFabric: FabricSample;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onSelectIdeaForGuide: (idea: UpcycleIdea) => void;
  aiBlueprints?: UpcycleIdea[];
  liveTrends?: Array<{ title: string; snippet: string; url: string }>;
  isAiLoading?: boolean;
  filterMode?: CatalogSourceFilter;
  onFilterModeChange?: (mode: CatalogSourceFilter) => void;
  aiErrorMessage?: string | null;
}

export const RecommendationsGallery: React.FC<RecommendationsGalleryProps> = ({
  currentFabric,
  selectedCategory,
  onCategoryChange,
  onSelectIdeaForGuide,
  aiBlueprints = [],
  liveTrends: _liveTrends = [],
  isAiLoading = false,
  filterMode,
  onFilterModeChange,
  aiErrorMessage,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [userSelectedSource, setUserSelectedSource] = useState<CatalogSourceFilter | null>(null);
  const [feasibilityView, setFeasibilityView] = useState<FeasibilityFilterMode>('matched');

  const activeSource = filterMode ?? userSelectedSource ?? (aiBlueprints.length > 0 ? 'ai' : 'all');

  const handleSourceChange = (source: CatalogSourceFilter) => {
    if (onFilterModeChange) {
      onFilterModeChange(source);
    }
    setUserSelectedSource(source);
  };

  const categories = ['All', 'Apparel & Garments', 'Bags & Carry', 'Accessories', 'Home Goods', 'Art & Living'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Artisan'];

  const hasAiBlueprints = aiBlueprints.length > 0;

  // Dynamically evaluate every curated idea against the active remnant with deterministic 2D math
  const evaluatedCuratedIdeas = useMemo(() => {
    return UPCYCLING_IDEAS.map((idea, idx) => {
      const feasibilityResult: CuttingLayoutResult = evaluateFabricFeasibility(idea, currentFabric);
      const adaptedImage = pickCuratedCatalogImage(idea, currentFabric, idx);

      // Adapt tools to fabric sewing specs
      const dynamicTools = [
        `Sewing machine (${feasibilityResult.fabricSpecs.needle}) or hand-sewing needle`,
        feasibilityResult.fabricSpecs.thread,
        feasibilityResult.fabricSpecs.presserFoot,
        'Fabric shears or rotary cutter',
        'Steam iron & pressing cloth'
      ];

      // Dynamically adapt title and subtitle to the maker's actual clothing or fabric
      let customizedTitle = idea.title;
      let customizedSubtitle = idea.subtitle;

      if (currentFabric.clothingType) {
        const ct = currentFabric.clothingType.toLowerCase();
        if (ct.includes('jean') || ct.includes('trouser') || ct.includes('pant')) {
          if (idea.id === 'idea-patchwork-tote') {
            customizedTitle = `${currentFabric.dominantColor ? currentFabric.dominantColor + ' ' : ''}Denim Jean Market Tote`;
            customizedSubtitle = 'Cut from repurposed trouser leg panels & rear pocket hardware';
          } else if (idea.id === 'idea-corduroy-cardholder') {
            customizedTitle = `${currentFabric.dominantColor ? currentFabric.dominantColor + ' ' : ''}Jean Pocket Cardholder`;
            customizedSubtitle = 'Origami card envelope utilizing trouser coin pocket seam';
          } else if (idea.id === 'idea-quilted-sleeve') {
            customizedTitle = `${currentFabric.dominantColor ? currentFabric.dominantColor + ' ' : ''}Denim Leg Tube Tech Sleeve`;
            customizedSubtitle = 'Insulated device envelope cut from continuous trouser leg width';
          }
        } else if (ct.includes('shirt') || ct.includes('blouse')) {
          if (idea.id === 'idea-scrunchie-trio') {
            customizedTitle = `Gathered ${currentFabric.material || 'Silk'} Scrunchie Set`;
            customizedSubtitle = `Cut from ${currentFabric.clothingType} sleeve and collar strips`;
          } else if (idea.id === 'idea-cushion-cover') {
            customizedTitle = `${currentFabric.dominantColor ? currentFabric.dominantColor + ' ' : ''}Shirt Placket Cushion`;
            customizedSubtitle = 'Front button closure preserved as decorative focal closure';
          }
        } else if (ct.includes('jacket') || ct.includes('coat')) {
          if (idea.id === 'idea-patchwork-tote') {
            customizedTitle = `Structured ${currentFabric.clothingType} Carryall Tote`;
          }
        }
      }

      if (currentFabric.condition) {
        const cond = currentFabric.condition.toLowerCase();
        if (cond.includes('torn') || cond.includes('distressed') || cond.includes('frayed')) {
          if (!customizedSubtitle.includes('Sashiko')) {
            customizedSubtitle += ' • with Visible Sashiko Mending';
          }
        }
      }

      return {
        ...idea,
        title: customizedTitle,
        subtitle: customizedSubtitle,
        imageUrl: adaptedImage,
        fallbackImageUrl: adaptedImage,
        matchScore: feasibilityResult.matchScore,
        suitabilityReason: feasibilityResult.suitabilityReason,
        feasibility: {
          status: feasibilityResult.status,
          confidence: 'high',
          notes: feasibilityResult.explanation,
        },
        toolsNeeded: dynamicTools,
        rawFeasibility: feasibilityResult
      };
    });
  }, [currentFabric]);

  // Evaluated AI blueprints with the same 2D math and dynamic fabric specs
  const evaluatedAiBlueprints = useMemo(() => {
    return aiBlueprints.map((idea) => {
      const feasibilityResult: CuttingLayoutResult = evaluateFabricFeasibility(idea, currentFabric);
      return {
        ...idea,
        matchScore: feasibilityResult.matchScore,
        feasibility: {
          status: feasibilityResult.status,
          confidence: 'high',
          notes: feasibilityResult.explanation,
        },
        rawFeasibility: feasibilityResult
      };
    });
  }, [aiBlueprints, currentFabric]);

  // Determine active blueprint pool based on chosen source filter
  const baseIdeasPool = useMemo<UpcycleIdea[]>(() => {
    if (activeSource === 'ai') {
      return evaluatedAiBlueprints;
    } else if (activeSource === 'curated') {
      return evaluatedCuratedIdeas;
    }
    return [...evaluatedAiBlueprints, ...evaluatedCuratedIdeas];
  }, [activeSource, evaluatedAiBlueprints, evaluatedCuratedIdeas]);

  // Filter recommendations by category, difficulty, search
  const filteredIdeas = useMemo(() => {
    const list = baseIdeasPool.filter((idea: UpcycleIdea) => {
      const matchesCategory = selectedCategory === 'All' || idea.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'All' || idea.difficulty === selectedDifficulty;
      const matchesSearch = 
        idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        idea.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        idea.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        idea.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesDifficulty && matchesSearch;
    });

    // Rank feasible projects first, then tight, then requires piecing, then insufficient
    return list.sort((a: any, b: any) => {
      const statusOrder: Record<string, number> = {
        feasible: 1,
        tight: 2,
        requires_piecing: 3,
        insufficient_material: 4
      };
      const orderA = statusOrder[a.feasibility?.status || 'feasible'] || 2;
      const orderB = statusOrder[b.feasibility?.status || 'feasible'] || 2;
      if (orderA !== orderB) return orderA - orderB;
      return (b.matchScore || 0) - (a.matchScore || 0);
    });
  }, [baseIdeasPool, selectedCategory, selectedDifficulty, searchQuery]);

  // Separate directly matched blueprints from blueprints requiring modifications
  const directlyMatchedIdeas = useMemo(() => {
    return filteredIdeas.filter((idea: any) => idea.rawFeasibility?.isDirectlyMatched);
  }, [filteredIdeas]);

  const modificationIdeas = useMemo(() => {
    return filteredIdeas.filter((idea: any) => !idea.rawFeasibility?.isDirectlyMatched);
  }, [filteredIdeas]);

  const displayedIdeas = useMemo(() => {
    if (feasibilityView === 'matched') return directlyMatchedIdeas;
    if (feasibilityView === 'modifications') return modificationIdeas;
    return filteredIdeas;
  }, [feasibilityView, directlyMatchedIdeas, modificationIdeas, filteredIdeas]);

  return (
    <section id="recommendations-section" className="py-20 lg:py-28 bg-paper relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bluegray text-navy text-xs font-semibold uppercase tracking-wider mb-3 border border-bluegray-200">
              <Sparkles className="w-3.5 h-3.5 text-coral" />
              <span>Calculated 2D Blueprint Catalog</span>
            </div>
            <h2 className="font-serif-title text-3xl sm:text-4xl lg:text-5xl text-navy font-semibold leading-tight">
              Upcycling blueprints matched to your remnant.
            </h2>
            <p className="mt-3 text-base text-charcoal-muted max-w-2xl">
              Calculated for{' '}
              <span className="font-bold text-navy underline decoration-coral decoration-2">
                {currentFabric.name}
              </span>{' '}
              ({currentFabric.material}, {currentFabric.dimensions.width}×{currentFabric.dimensions.height} {currentFabric.dimensions.unit})
              {hasAiBlueprints && activeSource === 'ai' && (
                <span className="text-emerald-700 font-medium">
                  {' '}• Powered by TinyFish 2026 sustainable trends & Gemini Vision
                </span>
              )}
              .
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                document.getElementById('studio-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3.5 py-2.5 rounded-2xl bg-surface border border-navy/15 hover:border-coral text-navy hover:text-coral text-xs font-mono font-semibold transition-all flex items-center gap-1.5 shadow-2xs hover:shadow-xs cursor-pointer"
              title="Edit your fabric, garment, dimensions, condition or notes"
            >
              <Scissors className="w-3.5 h-3.5 text-coral" />
              <span>Revise Item Details</span>
            </button>

            <div className="flex items-center gap-2 font-mono text-xs text-charcoal-muted bg-surface p-2.5 rounded-2xl border border-navy/10 shadow-2xs">
              <span className={`w-2.5 h-2.5 rounded-full ${isAiLoading ? 'bg-coral animate-pulse' : (hasAiBlueprints && activeSource === 'ai' ? 'bg-emerald-500 animate-ping' : 'bg-denim animate-pulse')}`}></span>
              <span className="font-semibold text-navy">
                {isAiLoading
                  ? 'Synthesizing TinyFish Trends...'
                  : `${displayedIdeas.length} ${displayedIdeas.length === 1 ? 'Pattern' : 'Patterns'} ${feasibilityView === 'matched' ? 'Directly Matched' : feasibilityView === 'modifications' ? 'With Modifications' : 'Displayed'}`}
              </span>
            </div>
          </div>
        </div>

        {/* Textile Clarity & Measurement Notice Banner */}
        {currentFabric.uncertaintyNotice && (
          <div className="mb-8 p-4 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-900">
                  Textile Clarity & Measurement Notice
                </h4>
                <p className="text-xs text-amber-900/90 mt-0.5 leading-relaxed">
                  {currentFabric.uncertaintyNotice}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                document.getElementById('studio-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 text-white hover:bg-amber-700 text-xs font-mono font-semibold transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
            >
              <span>Clarify Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* AI Recommendation Conflict / Error Notice Banner */}
        {aiErrorMessage && (
          <div className="mb-8 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-rose-900">
                  Recommendation Constraint Notice
                </h4>
                <p className="text-xs text-rose-900/90 mt-0.5 leading-relaxed">
                  {aiErrorMessage}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleSourceChange('curated')}
              className="px-3.5 py-1.5 rounded-xl bg-rose-700 text-white hover:bg-rose-800 text-xs font-mono font-semibold transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
            >
              <span>Explore Curated Archive</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Catalog Source Toggle Tabs (AI Trends vs All vs Studio Archive) */}
        <div className="flex flex-wrap items-center gap-2 mb-8 p-1.5 bg-surface rounded-2xl border border-navy/15 max-w-fit shadow-xs">
          {hasAiBlueprints && (
            <button
              type="button"
              onClick={() => handleSourceChange('ai')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeSource === 'ai'
                  ? 'bg-emerald-700 text-white shadow-sm ring-1 ring-emerald-600'
                  : 'text-emerald-800 hover:bg-emerald-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
              <span>TinyFish 2026 Live Trends ({evaluatedAiBlueprints.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleSourceChange('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSource === 'all'
                ? 'bg-navy text-paper shadow-sm'
                : 'text-charcoal-muted hover:text-navy hover:bg-paper-100'
            }`}
          >
            All Blueprints ({evaluatedAiBlueprints.length + evaluatedCuratedIdeas.length})
          </button>

          <button
            type="button"
            onClick={() => handleSourceChange('curated')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSource === 'curated'
                ? 'bg-navy text-paper shadow-sm'
                : 'text-charcoal-muted hover:text-navy hover:bg-paper-100'
            }`}
          >
            Studio Core Tested Blueprints ({evaluatedCuratedIdeas.length})
          </button>
        </div>

        {/* Category Filters Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs font-mono font-bold text-navy uppercase tracking-wider mr-2">Category:</span>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onCategoryChange(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-coral text-paper font-semibold shadow-xs'
                    : 'bg-surface text-charcoal-muted hover:text-navy hover:bg-paper-100 border border-navy/10'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Difficulty Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-navy/10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-bold text-navy uppercase tracking-wider mr-2">Difficulty:</span>
            {difficulties.map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                  selectedDifficulty === diff
                    ? 'bg-navy text-paper font-bold'
                    : 'bg-paper text-charcoal-muted hover:text-navy border border-navy/10'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          <div className="relative max-w-xs w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search blueprints by title or tag..."
              className="w-full px-3.5 py-2 rounded-xl bg-surface border border-navy/15 text-xs text-navy placeholder:text-charcoal-muted/60 focus:outline-none focus:ring-2 focus:ring-denim"
            />
          </div>
        </div>

        {/* Feasibility Filter Sub-tabs: Directly Matched vs Possible with Modifications */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8 bg-paper-100 p-2.5 rounded-2xl border border-navy/15">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-bold text-navy uppercase tracking-wider mr-1 flex items-center gap-1">
              <Scissors className="w-3.5 h-3.5 text-coral" />
              Remnant Feasibility:
            </span>

            <button
              type="button"
              onClick={() => setFeasibilityView('matched')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                feasibilityView === 'matched'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-surface text-charcoal-muted hover:text-navy border border-navy/10'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>Directly Matched Remnant Projects ({directlyMatchedIdeas.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setFeasibilityView('modifications')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                feasibilityView === 'modifications'
                  ? 'bg-indigo-700 text-white shadow-xs'
                  : 'bg-surface text-charcoal-muted hover:text-navy border border-navy/10'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-300" />
              <span>Possible with Modifications ({modificationIdeas.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setFeasibilityView('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                feasibilityView === 'all'
                  ? 'bg-navy text-paper shadow-xs'
                  : 'bg-surface text-charcoal-muted hover:text-navy border border-navy/10'
              }`}
            >
              All Projects ({filteredIdeas.length})
            </button>
          </div>

          {modificationIdeas.length > 0 && feasibilityView === 'matched' && (
            <button
              type="button"
              onClick={() => setFeasibilityView('modifications')}
              className="text-[11px] font-mono text-indigo-700 hover:text-indigo-900 underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>+ View {modificationIdeas.length} projects possible with extra fabric/piecing</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Blueprint Cards Grid or Loading Skeleton */}
        {isAiLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {[1, 2, 3].map((idx) => (
              <div
                key={`loading-card-${idx}`}
                className="bg-surface rounded-3xl overflow-hidden border border-navy/15 p-6 flex flex-col justify-between animate-pulse space-y-4 shadow-warm"
              >
                <div className="aspect-[4/3] bg-paper-200 rounded-2xl flex flex-col items-center justify-center p-6 text-center gap-3">
                  <Sparkles className="w-8 h-8 text-coral animate-spin" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-navy">
                    {idx === 1
                      ? 'Deconstructing Textile Geometry...'
                      : idx === 2
                      ? 'Synthesizing Live Trends...'
                      : 'Calculating Zero-Waste Blueprint...'}
                  </span>
                  <p className="text-[11px] text-charcoal-muted max-w-xs leading-relaxed">
                    {idx === 1
                      ? `Calculating cutting layout and usable panels for your ${currentFabric.clothingType || currentFabric.material} (${currentFabric.dimensions.width}×${currentFabric.dimensions.height} ${currentFabric.dimensions.unit}).`
                      : idx === 2
                      ? `Matching ${currentFabric.dominantColor ? currentFabric.dominantColor + ' ' : ''}${currentFabric.material} in ${currentFabric.condition} condition to circular fashion styles.`
                      : `Deriving seam specifications, needle tolerances, and cutting order.`}
                  </p>
                </div>
                <div className="space-y-2 pt-2">
                  <div className="h-4 bg-paper-200 rounded-full w-3/4"></div>
                  <div className="h-3 bg-paper-100 rounded-full w-1/2"></div>
                  <div className="h-10 bg-paper-200 rounded-2xl mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedIdeas.map((idea: any) => {
              const isAi = idea.isAiGenerated;
              const rawFeasibility: CuttingLayoutResult | undefined = idea.rawFeasibility;
              const score = idea.matchScore;
              const status = idea.feasibility?.status;

            return (
              <motion.div
                key={`${idea.id}-${currentFabric.id || 'fab'}-${currentFabric.dominantColor || ''}-${currentFabric.material || ''}`}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.3 }}
                className={`group bg-surface rounded-3xl overflow-hidden border transition-all duration-300 flex flex-col justify-between shadow-warm hover:shadow-warm-lg ${
                  isAi ? 'border-emerald-300/80 ring-1 ring-emerald-200/50' : 'border-navy/15'
                }`}
              >
                <div>
                  {/* Card Visual Hero Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-paper-200">
                    <IdeaCardImage idea={idea} currentFabric={currentFabric} />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-transparent to-transparent opacity-60" />

                    {/* Match Score Badge with Honest Derived Fit */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span 
                        className={`px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider font-bold shadow-xs border ${
                          score >= 85 
                            ? 'bg-paper/95 text-navy border-navy/20' 
                            : score >= 60 
                            ? 'bg-indigo-50/95 text-indigo-900 border-indigo-200' 
                            : 'bg-rose-50/95 text-rose-900 border-rose-200'
                        }`}
                        title="Score calculated from physical 2D remnant dimensions, cutting layout, and textile compatibility"
                      >
                        {score >= 85 
                          ? `${score}% Surface Fit` 
                          : score >= 60 
                          ? `${score}% Fit (Pieced)` 
                          : 'Doesn’t Fit Remnant'}
                      </span>
                    </div>

                    {/* Badge: Photo-conditioned concept vs Generic style reference */}
                    {idea.isPhotoConditioned ? (
                      <div className="absolute top-10 left-3 flex items-center gap-1 z-20">
                        <span 
                          className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-950/85 text-emerald-200 border border-emerald-400/40 backdrop-blur-md shadow-xs flex items-center gap-1"
                          title="AI-generated concept preview derived from your uploaded fabric photo. Not a photograph of a finished real garment."
                        >
                          <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>AI Concept • Fabric Conditioned</span>
                        </span>
                      </div>
                    ) : idea.isGenericReference ? (
                      <div className="absolute top-10 left-3 flex items-center gap-1 z-20">
                        <span 
                          className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-950/85 text-amber-200 border border-amber-400/40 backdrop-blur-md shadow-xs flex items-center gap-1"
                          title={idea.imageNote || "Illustration is a generic styling reference and does not depict your exact fabric color or material."}
                        >
                          <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>{idea.imageLabel || 'Generic Style Reference'}</span>
                        </span>
                      </div>
                    ) : null}

                    {/* AI / TinyFish badge on card header */}
                    {isAi && (
                      <div className="absolute top-3 right-3 flex items-center gap-1">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-600 text-white backdrop-blur-md shadow-xs flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-200" />
                          <span>TinyFish Trend</span>
                        </span>
                      </div>
                    )}

                    {/* Category Label on Image */}
                    <div className="absolute bottom-3 left-3 text-paper text-xs font-serif font-bold drop-shadow flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-navy/85 backdrop-blur-sm border border-paper/20 text-paper text-[11px] font-sans font-semibold">
                        {idea.category}
                      </span>
                    </div>

                    {/* Inset preview of the user's actual uploaded fabric */}
                    {currentFabric.imageUrl && (
                      <div 
                        className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-paper/95 backdrop-blur-md border border-navy/20 shadow-sm"
                        title={`Tailored to your uploaded ${currentFabric.name || 'fabric remnant'}`}
                      >
                        <div className="w-4 h-4 rounded-full overflow-hidden border border-navy/30 ring-1 ring-paper shadow-2xs shrink-0">
                          <img src={currentFabric.imageUrl} alt="Uploaded fabric swatch" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-navy max-w-[130px] truncate">
                          {currentFabric.dominantColor ? `${currentFabric.dominantColor} ` : ''}{currentFabric.material || 'Your Fabric'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="font-serif text-xl font-bold text-navy group-hover:text-coral transition-colors">
                        {idea.title}
                      </h3>
                      <p className="text-xs text-charcoal-muted mt-1 italic">
                        {idea.subtitle}
                      </p>
                      <p className="text-xs text-charcoal-muted mt-2 line-clamp-2 leading-relaxed">
                        {idea.suitabilityReason}
                      </p>
                    </div>

                    {/* Physical Feasibility & Remnant Utilization Badge */}
                    {rawFeasibility && (
                      <div className={`p-2.5 rounded-xl border text-xs font-mono flex items-start gap-2 ${rawFeasibility.statusBadgeColor}`}>
                        {status === 'feasible' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                        ) : status === 'tight' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                        ) : status === 'requires_piecing' ? (
                          <Layers className="w-4 h-4 text-indigo-700 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-rose-700 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="leading-tight">
                          <span className="font-bold block">{rawFeasibility.statusLabel}</span>
                          <span className="text-[11px] opacity-90">{rawFeasibility.explanation}</span>
                        </div>
                      </div>
                    )}

                    {/* Explicit Modification Needed Callout Box */}
                    {rawFeasibility?.modificationNeeded && (
                      <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200/80 text-xs font-mono text-indigo-950 flex items-start gap-2">
                        <Layers className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block text-[10px] uppercase tracking-wider text-indigo-900">Modification Needed:</span>
                          <span className="text-[11px] leading-relaxed opacity-95">{rawFeasibility.modificationNeeded}</span>
                        </div>
                      </div>
                    )}

                    {/* Production Economics (for TinyFish / AI Blueprints) */}
                    {(idea.productionCost || idea.sellingPrice) && (
                      <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between text-xs">
                        <span className="font-mono text-emerald-800 text-[11px] font-semibold flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-emerald-600" />
                          Cost: <span className="font-bold">{idea.productionCost || '$18.50'}</span>
                        </span>
                        <span className="font-mono text-emerald-900 text-[11px] font-bold bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                          Retail: {idea.sellingPrice || '$75.00'}
                        </span>
                      </div>
                    )}

                    {/* Eco / Waste Reduction Impact */}
                    {idea.wasteReductionImpact && (
                      <div className="flex items-start gap-1.5 text-[11px] text-charcoal-muted font-mono leading-tight bg-paper-100 p-2 rounded-lg border border-navy/5">
                        <Leaf className="w-3 h-3 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{idea.wasteReductionImpact}</span>
                      </div>
                    )}

                    {/* Specs / Meta Badges */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-paper border border-navy/10 font-mono text-[11px] text-charcoal">
                        {idea.difficulty}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-paper border border-navy/10 font-mono text-[11px] text-charcoal flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-charcoal-muted" />
                        {idea.timeEstimate}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-bluegray border border-bluegray-300 font-mono text-[11px] text-navy font-semibold flex items-center gap-1">
                        <Scissors className="w-3.5 h-3.5 text-coral" />
                        {idea.fabricRequired}
                      </span>
                    </div>

                    {/* Blueprint Notes */}
                    <div className="p-3 rounded-xl bg-paper border border-navy/10 text-xs">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-charcoal-muted block mb-0.5">
                        Cutting & Construction Blueprint
                      </span>
                      <p className="text-navy font-medium line-clamp-1 font-mono text-[11px]">
                        {idea.patternNotes}
                      </p>
                    </div>

                    {/* Dynamic Fabric Needle & Thread Spec Tip */}
                    {rawFeasibility && (
                      <div className="text-[10px] font-mono text-charcoal-muted flex items-center gap-1.5 bg-paper-100 p-2 rounded-lg border border-navy/5">
                        <Info className="w-3 h-3 text-coral flex-shrink-0" />
                        <span className="truncate">Needle: {rawFeasibility.fabricSpecs.needle}</span>
                      </div>
                    )}

                    {/* TinyFish Source Citation if available */}
                    {idea.sourcesUsed && idea.sourcesUsed.length > 0 && (
                      <div className="text-[10px] font-mono text-charcoal-muted flex items-center gap-1 truncate">
                        <Globe className="w-3 h-3 text-coral flex-shrink-0" />
                        <span className="truncate">Trend reference: {idea.sourcesUsed[0]}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-6 pt-0">
                  <button
                    type="button"
                    onClick={() => onSelectIdeaForGuide(idea)}
                    className="w-full py-3.5 px-4 rounded-2xl bg-navy text-paper text-xs sm:text-sm font-semibold hover:bg-navy-700 transition-all duration-300 flex items-center justify-center gap-2 active:scale-98 group/btn focus:outline-none focus-visible:ring-2 focus-visible:ring-denim"
                  >
                    <BookOpen className="w-4 h-4 text-coral" />
                    <span>Open Step-by-Step Making Guide</span>
                    <ArrowRight className="w-4 h-4 text-gold group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Empty State when no patterns match */}
      {!isAiLoading && displayedIdeas.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-surface border border-navy/15 max-w-lg mx-auto space-y-4 shadow-sm">
          {activeSource === 'ai' ? (
            <>
              <AlertTriangle className="w-10 h-10 text-amber-600 mx-auto" />
              <h3 className="font-serif text-lg font-bold text-navy">
                No Reliable AI Match Found
              </h3>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                {aiErrorMessage || (
                  `No AI project blueprints reliably match your physical fabric constraints (${currentFabric.dominantColor ? `${currentFabric.dominantColor} ` : ''}${currentFabric.material || 'fabric'}, ${currentFabric.dimensions.width}×${currentFabric.dimensions.height} ${currentFabric.dimensions.unit}) without altering required properties. Unrelated preset recommendations are not silently substituted.`
                )}
              </p>
              <div className="pt-2 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleSourceChange('all')}
                  className="px-4 py-2 rounded-xl bg-navy text-paper text-xs font-semibold hover:bg-navy-700 transition-colors flex items-center gap-1.5"
                >
                  <span>Explore All Catalog Projects</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById('studio-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-2 rounded-xl bg-surface border border-navy/20 text-navy text-xs font-semibold hover:border-coral hover:text-coral transition-colors"
                >
                  Revise Fabric Details
                </button>
              </div>
            </>
          ) : (
            <>
              <HelpCircle className="w-10 h-10 text-coral mx-auto" />
              <h3 className="font-serif text-lg font-bold text-navy">
                {feasibilityView === 'matched'
                  ? `No direct matches in "${selectedCategory}"`
                  : `No blueprints found in "${selectedCategory}"`}
              </h3>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                {feasibilityView === 'matched' && modificationIdeas.length > 0
                  ? `Your ${currentFabric.dimensions.width}×${currentFabric.dimensions.height} ${currentFabric.dimensions.unit} ${currentFabric.name} cannot fit any "${selectedCategory}" pattern directly without extra fabric. However, ${modificationIdeas.length} project(s) can be made with modular piecing or contrast backing.`
                  : `No blueprints under "${selectedCategory}" with "${selectedDifficulty}" difficulty match your filters.`}
              </p>
              <div className="pt-2 flex flex-wrap justify-center gap-3">
                {feasibilityView === 'matched' && modificationIdeas.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setFeasibilityView('modifications')}
                    className="px-4 py-2 rounded-xl bg-indigo-700 text-white text-xs font-semibold hover:bg-indigo-800 transition-colors flex items-center gap-1.5"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>View {modificationIdeas.length} Projects with Modifications</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    onCategoryChange('All');
                    setSelectedDifficulty('All');
                    setSearchQuery('');
                    setFeasibilityView('matched');
                  }}
                  className="px-4 py-2 rounded-xl bg-navy text-paper text-xs font-semibold hover:bg-navy-700 transition-colors"
                >
                  Reset Filters & View All
                </button>
              </div>
            </>
          )}
        </div>
      )}

      </div>
    </section>
  );
};
