import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  Clock, 
  BookOpen, 
  HelpCircle,
  Tag,
  Scissors,
  Globe,
  ExternalLink,
  DollarSign,
  Leaf
} from 'lucide-react';
import { UPCYCLING_IDEAS } from '../data/upcyclingIdeas';
import type { UpcycleIdea } from '../data/upcyclingIdeas';
import type { FabricSample } from '../data/mockFabrics';

export type CatalogSourceFilter = 'ai' | 'all' | 'curated';

const getSafeImageUrl = (idea: UpcycleIdea, currentFabric: FabricSample): string => {
  if (idea.imageUrl && !idea.imageUrl.includes('pollinations.ai')) {
    return idea.imageUrl;
  }
  if (idea.fallbackImageUrl && !idea.fallbackImageUrl.includes('pollinations.ai')) {
    return idea.fallbackImageUrl;
  }
  const combined = `${currentFabric.name} ${currentFabric.material} ${currentFabric.dominantColor || ''}`.toLowerCase();
  if (/jute|burlap/i.test(combined)) return '/blueprints/jute-patchwork-tote.jpg';
  if (/silk|satin/i.test(combined)) return '/blueprints/purple-silk-kimono-shrug.jpg';
  if (/lace|sheer/i.test(combined)) return '/blueprints/sage-lace-overlay-top.jpg';
  if (/denim|jean/i.test(combined)) return '/blueprints/denim-chore-jacket.jpg';
  if (/corduroy|velvet/i.test(combined)) return '/blueprints/terracotta-corduroy-overshirt.jpg';
  if (/linen|flax/i.test(combined)) return '/blueprints/belgian-slub-linen-weekend-carryall.jpg';
  return '/blueprints/yellow-cotton-summer-tunic.jpg';
};

const IdeaCardImage: React.FC<{
  idea: UpcycleIdea;
  currentFabric: FabricSample;
}> = ({ idea, currentFabric }) => {
  const [imgSrc, setImgSrc] = useState<string>(() => getSafeImageUrl(idea, currentFabric));
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const nextSrc = getSafeImageUrl(idea, currentFabric);
    setImgSrc(nextSrc);
    setIsLoaded(false);

    // Guaranteed safety timer: static blueprints resolve instantly,
    // so guarantee isLoaded is true within 300ms so cards never remain stuck on loading
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [idea.imageUrl, idea.fallbackImageUrl, currentFabric.id, currentFabric.material]);

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
          } else if (currentFabric.imageUrl && imgSrc !== currentFabric.imageUrl) {
            setImgSrc(currentFabric.imageUrl);
          } else if (/jute|burlap/i.test(`${currentFabric.name} ${currentFabric.material}`)) {
            setImgSrc('/blueprints/jute-patchwork-tote.jpg');
          } else if (/silk|satin/i.test(`${currentFabric.name} ${currentFabric.material}`)) {
            setImgSrc('/blueprints/purple-silk-kimono-shrug.jpg');
          } else if (/linen|flax/i.test(`${currentFabric.name} ${currentFabric.material}`)) {
            setImgSrc('/blueprints/belgian-slub-linen-weekend-carryall.jpg');
          } else {
            setImgSrc('/blueprints/yellow-cotton-summer-tunic.jpg');
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
}

export const RecommendationsGallery: React.FC<RecommendationsGalleryProps> = ({
  currentFabric,
  selectedCategory,
  onCategoryChange,
  onSelectIdeaForGuide,
  aiBlueprints = [],
  liveTrends = [],
  isAiLoading = false,
  filterMode,
  onFilterModeChange,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [userSelectedSource, setUserSelectedSource] = useState<CatalogSourceFilter | null>(null);

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

  // Dynamically tailor curated ideas so their titles, required materials, and suitability descriptions reflect currentFabric
  const tailoredCuratedIdeas = React.useMemo(() => {
    return UPCYCLING_IDEAS.map((idea) => {
      const colorWord = currentFabric.dominantColor ? `${currentFabric.dominantColor} ` : '';
      const matName = currentFabric.material || 'textile remnant';

      // Smart dynamic image for the curated idea matching the current fabric archetype
      let adaptedImage = idea.imageUrl;
      const combinedText = `${currentFabric.name} ${currentFabric.material} ${currentFabric.dominantColor || ''}`.toLowerCase();
      if (/jute|burlap/i.test(combinedText)) {
        if (/bag|tote|carryall/i.test(idea.title)) adaptedImage = '/blueprints/jute-patchwork-tote.jpg';
        else if (/crossbody|rig/i.test(idea.title)) adaptedImage = '/blueprints/jute-crossbody-rig.jpg';
        else if (/shrug|gilet|jacket/i.test(idea.title)) adaptedImage = '/blueprints/jute-sculptural-shrug.jpg';
        else if (/folio|sleeve/i.test(idea.title)) adaptedImage = '/blueprints/jute-document-folio.jpg';
        else if (/collar|choker/i.test(idea.title)) adaptedImage = '/blueprints/jute-statement-choker.jpg';
      } else if (/silk|satin/i.test(combinedText)) {
        if (/shrug|gilet|jacket/i.test(idea.title)) adaptedImage = '/blueprints/purple-silk-kimono-shrug.jpg';
        else if (/bag|pouch|wristlet/i.test(idea.title)) adaptedImage = '/blueprints/purple-silk-evening-pouch.jpg';
        else if (/scarf|bandana/i.test(idea.title)) adaptedImage = '/blueprints/purple-silk-origami-scarf.jpg';
        else if (/cushion/i.test(idea.title)) adaptedImage = '/blueprints/purple-silk-envelope-cushion.jpg';
      } else if (/lace|sheer|guipure/i.test(combinedText)) {
        if (/top|overlay|camisole/i.test(idea.title)) adaptedImage = '/blueprints/sage-lace-overlay-top.jpg';
        else if (/pouch|bag/i.test(idea.title)) adaptedImage = '/blueprints/green-lace-pouch.jpg';
        else if (/collar/i.test(idea.title)) adaptedImage = '/blueprints/lace-collar.jpg';
        else if (/bolero|shrug/i.test(idea.title)) adaptedImage = '/blueprints/lace-bolero.jpg';
      } else if (/corduroy|velvet/i.test(combinedText)) {
        if (/jacket|overshirt/i.test(idea.title)) adaptedImage = '/blueprints/terracotta-corduroy-overshirt.jpg';
        else if (/pouch|folio/i.test(idea.title)) adaptedImage = '/blueprints/corduroy-zip-pouch.jpg';
      } else if (/denim|jean/i.test(combinedText)) {
        if (/rig|crossbody/i.test(idea.title)) adaptedImage = '/blueprints/denim-crossbody-rig.jpg';
        else adaptedImage = '/blueprints/denim-chore-jacket.jpg';
      }

      return {
        ...idea,
        imageUrl: adaptedImage,
        fabricRequired: `Approx. ${currentFabric.dimensions.width}×${currentFabric.dimensions.height} ${currentFabric.dimensions.unit} ${colorWord}${matName} remnant`,
        suitabilityReason: `The ${currentFabric.weave || 'woven structure'} and ${currentFabric.texture || 'tactile drape'} of ${colorWord}${matName} (~${currentFabric.weightGsm} GSM) provide optimal zero-waste cutting lines.`,
        materialsNeeded: [
          `Main ${colorWord}${matName} remnant (${currentFabric.dimensions.width}×${currentFabric.dimensions.height} ${currentFabric.dimensions.unit})`,
          ...idea.materialsNeeded.slice(1)
        ]
      };
    });
  }, [currentFabric]);

  // Determine active blueprint pool based on chosen source filter
  let baseIdeasPool: UpcycleIdea[] = [];
  if (activeSource === 'ai') {
    baseIdeasPool = hasAiBlueprints ? aiBlueprints : tailoredCuratedIdeas;
  } else if (activeSource === 'curated') {
    baseIdeasPool = tailoredCuratedIdeas;
  } else {
    // 'all'
    baseIdeasPool = [...aiBlueprints, ...tailoredCuratedIdeas];
  }

  // Calculate simple, explainable match score from fabric data & dimensions
  const calculateExplainableScore = (idea: UpcycleIdea, fabric: FabricSample): number => {
    if (idea.matchScore && idea.isAiGenerated) {
      return idea.matchScore;
    }

    const widthCm = fabric.dimensions.unit === 'in' ? fabric.dimensions.width * 2.54 : fabric.dimensions.width;
    const heightCm = fabric.dimensions.unit === 'in' ? fabric.dimensions.height * 2.54 : fabric.dimensions.height;
    const areaCm2 = widthCm * heightCm;

    let score = 84;

    if (areaCm2 >= 1200) {
      score += 6;
    } else if (areaCm2 >= 600) {
      score += idea.category === 'Bags & Carry' ? 3 : 8;
    } else {
      score += idea.category === 'Accessories' ? 10 : -4;
    }

    const matLower = fabric.material.toLowerCase();
    if (idea.tags.some((tag) => matLower.includes(tag.toLowerCase()))) {
      score += 4;
    }

    if (fabric.condition === 'Crisp Remnant' || fabric.condition === 'Gently Washed') {
      score += 3;
    }

    return Math.min(99, Math.max(76, Math.round(score)));
  };

  // Filter recommendations
  const filteredIdeas = baseIdeasPool.filter((idea: UpcycleIdea) => {
    const matchesCategory = selectedCategory === 'All' || idea.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || idea.difficulty === selectedDifficulty;
    const matchesSearch = 
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  const totalCount = aiBlueprints.length + UPCYCLING_IDEAS.length;

  return (
    <section id="recommendations-section" className="py-20 lg:py-28 bg-paper relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bluegray text-navy text-xs font-semibold uppercase tracking-wider mb-3 border border-bluegray-200">
              <Sparkles className="w-3.5 h-3.5 text-coral" />
              <span>Generative Blueprint Catalog</span>
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

          <div className="flex items-center gap-2 font-mono text-xs text-charcoal-muted bg-surface p-2.5 rounded-2xl border border-navy/10 shadow-2xs">
            <span className={`w-2.5 h-2.5 rounded-full ${isAiLoading ? 'bg-coral animate-pulse' : (hasAiBlueprints && activeSource === 'ai' ? 'bg-emerald-500 animate-ping' : 'bg-denim animate-pulse')}`}></span>
            <span className="font-semibold text-navy">
              {isAiLoading
                ? 'Synthesizing TinyFish Trends...'
                : `${filteredIdeas.length} ${hasAiBlueprints && activeSource === 'ai' ? 'TinyFish AI Patterns' : 'Patterns'} Ready`}
            </span>
          </div>
        </div>

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
              <span>✨ TinyFish Matched Blueprints ({aiBlueprints.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleSourceChange('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSource === 'all'
                ? 'bg-navy text-paper shadow-sm'
                : 'text-charcoal hover:bg-paper-100'
            }`}
          >
            All Blueprints ({totalCount})
          </button>

          <button
            type="button"
            onClick={() => handleSourceChange('curated')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeSource === 'curated'
                ? 'bg-navy text-paper shadow-sm'
                : 'text-charcoal hover:bg-paper-100'
            }`}
          >
            Studio Curated Archive ({UPCYCLING_IDEAS.length})
          </button>
        </div>

        {/* TinyFish Trend Synthesis Live Banner (When AI blueprints are active) */}
        {hasAiBlueprints && activeSource !== 'curated' && (
          <div className="mb-10 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-bluegray/20 border border-emerald-200 shadow-warm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-800 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>TinyFish Real-Time Trend Synthesis Active</span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-navy">
                  {aiBlueprints.length} Bespoke Zero-Waste Blueprints for {currentFabric.name}
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-muted max-w-3xl leading-relaxed">
                  Synthesized live from your {currentFabric.material} remnant dimensions ({currentFabric.dimensions.width}×{currentFabric.dimensions.height} {currentFabric.dimensions.unit}) and real-time sustainable fashion trends fetched via TinyFish.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="px-3 py-1.5 rounded-xl bg-white/90 border border-emerald-300 text-xs font-mono text-emerald-900 font-bold shadow-2xs">
                  Fiber: {currentFabric.material}
                </span>
              </div>
            </div>

            {/* Clickable TinyFish Live Trend Sources */}
            {liveTrends && liveTrends.length > 0 && (
              <div className="mt-4 pt-3.5 border-t border-emerald-200/70 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono text-emerald-900 font-bold flex items-center gap-1 mr-1">
                  <Globe className="w-3.5 h-3.5 text-coral" />
                  TinyFish Trend Signals:
                </span>
                {liveTrends.slice(0, 4).map((trend, idx) => (
                  <a
                    key={idx}
                    href={trend.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={trend.snippet}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white text-[11px] font-medium text-navy border border-emerald-200 shadow-2xs hover:border-coral hover:text-coral transition-colors"
                  >
                    <span className="truncate max-w-[220px] sm:max-w-[320px]">{trend.title}</span>
                    <ExternalLink className="w-3 h-3 text-charcoal-muted flex-shrink-0" />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="p-4 sm:p-6 rounded-2xl bg-surface border border-navy/15 mb-10 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-grow max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search blueprints (e.g. tote, boro, charm, jacket, rig)..."
                aria-label="Search upcycling blueprints"
                className="w-full bg-paper border border-navy/20 rounded-xl px-4 py-2.5 text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-navy/30"
              />
            </div>

            {/* Difficulty Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0" role="toolbar" aria-label="Difficulty level filter">
              <span className="text-xs font-mono uppercase text-charcoal-muted mr-1">Skill:</span>
              {difficulties.map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-denim ${
                    selectedDifficulty === diff
                      ? 'bg-navy text-paper font-semibold'
                      : 'bg-paper text-charcoal hover:bg-navy/10 border border-navy/15'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>

          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-navy/10" role="tablist" aria-label="Category tabs">
            <span className="text-xs font-mono uppercase text-charcoal-muted mr-2 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-coral" />
              Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                role="tab"
                aria-selected={selectedCategory === cat}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-denim ${
                  selectedCategory === cat
                    ? 'bg-navy text-paper font-semibold shadow-xs'
                    : 'bg-paper text-charcoal hover:bg-navy/5 border border-navy/15'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Ideas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredIdeas.map((idea: UpcycleIdea) => {
            const calculatedScore = calculateExplainableScore(idea, currentFabric);
            const isAi = idea.isAiGenerated;

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

                    {/* Match Score Badge with explainable label */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span 
                        className="px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider font-bold bg-paper/95 backdrop-blur-md text-navy border border-navy/20 shadow-xs"
                        title="Score estimated from remnant area dimensions and textile structure suitability"
                      >
                        {calculatedScore}% Surface Fit
                      </span>
                    </div>

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

                    {/* Fabric Feasibility Notice */}
                    {idea.feasibility && (
                      <div 
                        className={`p-2.5 rounded-xl text-[11px] font-mono leading-tight flex items-start gap-1.5 ${
                          idea.feasibility.status === 'feasible' 
                            ? 'bg-emerald-50/90 text-emerald-900 border border-emerald-200' 
                            : idea.feasibility.status === 'tight'
                            ? 'bg-amber-50/90 text-amber-900 border border-amber-200'
                            : 'bg-rose-50/90 text-rose-900 border border-rose-200'
                        }`}
                        title={idea.feasibility.notes}
                      >
                        <span className="font-bold flex-shrink-0">
                          {idea.feasibility.status === 'feasible' ? '✓ Feasible' : idea.feasibility.status === 'tight' ? '⚠ Tight Fit' : '✕ Scant Material'}:
                        </span>
                        <span className="line-clamp-2">{idea.feasibility.notes}</span>
                      </div>
                    )}

                    {/* Blueprint Notes */}
                    <div className="p-3 rounded-xl bg-paper border border-navy/10 text-xs">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-charcoal-muted block mb-0.5">
                        Cutting & Construction Blueprint
                      </span>
                      <p className="text-navy font-medium line-clamp-1 font-mono text-[11px]">
                        {idea.patternNotes}
                      </p>
                    </div>

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

        {/* Empty Search State */}
        {filteredIdeas.length === 0 && (
          <div className="p-12 text-center rounded-3xl bg-surface border border-navy/15 max-w-lg mx-auto space-y-4 shadow-sm">
            <HelpCircle className="w-10 h-10 text-coral mx-auto" />
            <h3 className="font-serif text-lg font-bold text-navy">No matching blueprints found</h3>
            <p className="text-xs text-charcoal-muted">
              Try adjusting your search query, selecting another category, or explore all blueprints.
            </p>
            <button
              onClick={() => {
                onCategoryChange('All');
                setSelectedDifficulty('All');
                setSearchQuery('');
                handleSourceChange('all');
              }}
              className="px-5 py-2 rounded-full bg-navy text-paper text-xs font-semibold hover:bg-navy-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-denim"
            >
              Reset All Filters
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
