import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Navbar, type ActiveNavTab } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FabricStudio } from './components/FabricStudio';
import { AIAnalysisModal } from './components/AIAnalysisModal';
import { RecommendationsGallery, type CatalogSourceFilter } from './components/RecommendationsGallery';
import { MakingGuideModal } from './components/MakingGuideModal';
import { ImpactSection } from './components/ImpactSection';
import { CommunityShowcase } from './components/CommunityShowcase';
import { ManifestoSection } from './components/ManifestoSection';
import { Footer } from './components/Footer';

// Re:Style 2.0 Core Feature Sections
import { FabricStashSection } from './components/FabricStashSection';
import { ProjectPlannerSection } from './components/ProjectPlannerSection';
import { SavedProjectsSection } from './components/SavedProjectsSection';
import { MakerJourneySection } from './components/MakerJourneySection';
import { SharedProjectView } from './components/SharedProjectView';

import { SAMPLE_FABRICS } from './data/mockFabrics';
import type { FabricSample } from './data/mockFabrics';
import { generateDesigns, type DesignConcept } from './api/generateDesigns';
import { convertDesignConceptToUpcycleIdea } from './utils/blueprintAdapter';
import { 
  fetchFabrics, 
  fetchProjects, 
  type StashFabricItem, 
  type SavedProjectItem 
} from './api/reStyleApi';

export const App: React.FC = () => {
  // Check if viewing a public share link directly: /share/:token
  const [shareToken, setShareToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/share/')) {
      const parts = window.location.pathname.split('/share/');
      return parts[1] || null;
    }
    return null;
  });

  // Navigation tab state: 'discover' | 'stash' | 'planner' | 'projects' | 'journey'
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('discover');

  // Shared Stash & Saved Projects inventory state
  const [stashFabrics, setStashFabrics] = useState<StashFabricItem[]>([]);
  const [savedProjects, setSavedProjects] = useState<SavedProjectItem[]>([]);
  const [selectedFabricForPlanner, setSelectedFabricForPlanner] = useState<StashFabricItem | null>(null);

  // Discover / FabricStudio state
  const [currentFabric, setCurrentFabric] = useState<FabricSample>(SAMPLE_FABRICS[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [selectedIdeaForGuide, setSelectedIdeaForGuide] = useState<any | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiDesigns, setAiDesigns] = useState<DesignConcept[]>([]);
  const [aiTrends, setAiTrends] = useState<Array<{ title: string; snippet: string; url: string }>>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [galleryFilterMode, setGalleryFilterMode] = useState<CatalogSourceFilter>('all');
  const [aiErrorMessage, setAiErrorMessage] = useState<string | null>(null);
  const activeAnalysisIdRef = useRef<string | null>(null);

  // Load shared inventory & projects on mount and when tabs change
  const refreshStashAndProjects = async () => {
    try {
      const [fabrics, projects] = await Promise.all([
        fetchFabrics(),
        fetchProjects()
      ]);
      setStashFabrics(fabrics);
      setSavedProjects(projects);
    } catch (err) {
      console.warn('[App] Could not synchronize stash or projects:', err);
    }
  };

  useEffect(() => {
    refreshStashAndProjects();
  }, [activeTab]);

  // Convert AI design concepts backed by TinyFish into full interactive UpcycleIdeas
  const aiBlueprints = useMemo(() => {
    return aiDesigns.map((concept, idx) =>
      convertDesignConceptToUpcycleIdea(concept, currentFabric, idx)
    );
  }, [aiDesigns, currentFabric]);

  // Smooth scroll helpers
  const scrollToStudio = () => {
    if (activeTab !== 'discover') {
      setActiveTab('discover');
      setTimeout(() => {
        document.getElementById('studio-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById('studio-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToIdeas = () => {
    if (activeTab !== 'discover') {
      setActiveTab('discover');
      setTimeout(() => {
        if (aiDesigns.length > 0) setGalleryFilterMode('ai');
        document.getElementById('recommendations-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      if (aiDesigns.length > 0) setGalleryFilterMode('ai');
      document.getElementById('recommendations-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFabricChange = (newFabric: FabricSample) => {
    if (newFabric.id !== currentFabric.id || newFabric.imageUrl !== currentFabric.imageUrl || newFabric.material !== currentFabric.material || newFabric.dominantColor !== currentFabric.dominantColor) {
      setAiDesigns([]);
      setAiTrends([]);
      setAiErrorMessage(null);
      setGalleryFilterMode('all');
    }
    setCurrentFabric(newFabric);
  };

  const handleSelectSampleFromHero = (sampleId: string) => {
    const found = SAMPLE_FABRICS.find((f) => f.id === sampleId);
    if (found) {
      handleFabricChange(found);
      scrollToStudio();
    }
  };

  // Cross-Navigation: From Stash to Project Planner
  const handleSelectFabricForPlanner = (fabric: StashFabricItem) => {
    setSelectedFabricForPlanner(fabric);
    setActiveTab('planner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cross-Navigation: Send Stash Fabric into Fabric Studio for Visual Analysis
  const handleSendToStudio = (fabric: StashFabricItem) => {
    const converted: FabricSample = {
      id: fabric.id,
      name: fabric.name,
      material: fabric.materialLabel || fabric.material,
      weave: fabric.pattern,
      weightGsm: fabric.weightGsm || 200,
      condition: fabric.condition === 'new' ? 'Crisp Remnant' : fabric.condition === 'worn' ? 'Vintage Worn' : 'Gently Washed',
      dimensions: {
        width: fabric.dimensions.width,
        height: fabric.dimensions.length,
        unit: fabric.dimensions.unit
      },
      colorPalette: [{ name: fabric.dominantColor, hex: '#253247' }],
      texture: `${fabric.thickness || 'medium'} body`,
      imageUrl: fabric.imageUrl,
      tagline: fabric.notes || `${fabric.dominantColor} ${fabric.material} from personal stash`,
      dominantColor: fabric.dominantColor,
      pattern: fabric.pattern
    };
    handleFabricChange(converted);
    setActiveTab('discover');
    scrollToStudio();
  };

  // Open Blueprint from Planner or Recommendations
  const handleOpenBlueprint = (blueprint: any, fabric: any) => {
    setSelectedIdeaForGuide(blueprint);
    if (fabric) {
      // If fabric is already a FabricSample or StashFabricItem, ensure compatible shape
      const sampleLike: FabricSample = {
        id: fabric.id || 'current-fabric',
        name: fabric.name || 'Target Fabric',
        material: fabric.materialLabel || fabric.material || 'Natural Fiber',
        weave: fabric.pattern || 'Plain Weave',
        weightGsm: fabric.weightGsm || 200,
        condition: 'Crisp Remnant',
        dimensions: {
          width: fabric.dimensions?.width || 35,
          height: fabric.dimensions?.length || fabric.dimensions?.height || 45,
          unit: fabric.dimensions?.unit || 'cm'
        },
        colorPalette: [{ name: fabric.dominantColor || 'Observed Tone', hex: '#253247' }],
        texture: 'Artisanal remnant weave',
        imageUrl: fabric.imageUrl || currentFabric.imageUrl,
        tagline: fabric.notes || 'Selected fabric remnant',
        dominantColor: fabric.dominantColor,
        pattern: fabric.pattern
      };
      setCurrentFabric(sampleLike);
    }
  };

  const handleAnalyze = async (fabricToAnalyze: FabricSample) => {
    const analysisId = `analysis-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    activeAnalysisIdRef.current = analysisId;

    setIsAnalyzing(true);
    setIsAnalysisModalOpen(true);
    setIsAiLoading(true);
    setAiDesigns([]);
    setAiTrends([]);
    setAiErrorMessage(null);

    try {
      const preferredFiber = fabricToAnalyze.material && !fabricToAnalyze.material.includes('User Defined')
        ? fabricToAnalyze.material
        : fabricToAnalyze.name;

      const response = await generateDesigns({
        fabricType: preferredFiber,
        clothingType: fabricToAnalyze.clothingType,
        quantity: fabricToAnalyze.dimensionsText || `${fabricToAnalyze.dimensions.width}×${fabricToAnalyze.dimensions.height} ${fabricToAnalyze.dimensions.unit} remnant (~${fabricToAnalyze.weightGsm || 200} GSM)`,
        dimensionsText: fabricToAnalyze.dimensionsText,
        condition: fabricToAnalyze.condition,
        texture: fabricToAnalyze.texture,
        notes: fabricToAnalyze.notes,
        cost: '$14.00/meter',
        preferences: fabricToAnalyze.notes || fabricToAnalyze.tagline || 'Zero-waste contemporary silhouettes and circular accessories',
        image: fabricToAnalyze.imageUrl,
        dominantColor: fabricToAnalyze.dominantColor,
        colorFamily: fabricToAnalyze.colorFamily,
        archetype: fabricToAnalyze.archetype,
        pattern: fabricToAnalyze.pattern,
        colorPalette: fabricToAnalyze.colorPalette,
        userConfirmedColor: fabricToAnalyze.userConfirmedColor,
        userConfirmedMaterial: fabricToAnalyze.userConfirmedMaterial,
      });

      if (activeAnalysisIdRef.current !== analysisId) {
        return;
      }

      if (response.success && response.designs && response.designs.length > 0) {
        setAiDesigns(response.designs);
        setAiTrends(response.trends || []);
        setAiErrorMessage(null);
        setGalleryFilterMode('ai');
      } else {
        setAiDesigns([]);
        setAiTrends(response.trends || []);
        setAiErrorMessage(response.error || 'No reliable project recommendations could be matched to your required fabric constraints.');
        setGalleryFilterMode('ai');
      }
    } catch (err: any) {
      if (activeAnalysisIdRef.current !== analysisId) return;
      console.warn('[Re:Style API Notice] Backend not reached or fallback mode active:', err);
      setAiErrorMessage(err.message || 'Failed to reach design recommendation engine.');
      setAiDesigns([]);
    } finally {
      if (activeAnalysisIdRef.current === analysisId) {
        setIsAiLoading(false);
        setIsAnalyzing(false);
      }
    }
  };

  // If a public read-only share link is being viewed directly
  if (shareToken) {
    return (
      <SharedProjectView
        token={shareToken}
        onGoHome={() => {
          window.history.pushState({}, '', '/');
          setShareToken(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper text-charcoal font-sans selection:bg-bluegray selection:text-navy">
      {/* Sticky Navigation with Re:Style 2.0 Tab Indicators */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onScrollToStudio={scrollToStudio}
        stashCount={stashFabrics.length}
        projectsCount={savedProjects.length}
      />

      {/* Main Content Area */}
      <main className="flex-grow">
        
        {/* TAB 1: DISCOVER & AI STUDIO (Original Workflow) */}
        {activeTab === 'discover' && (
          <>
            <HeroSection
              onStartUpload={scrollToStudio}
              onExploreIdeas={scrollToIdeas}
              onSelectSampleFabric={handleSelectSampleFromHero}
            />

            <FabricStudio
              currentFabric={currentFabric}
              onFabricChange={handleFabricChange}
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />

            <RecommendationsGallery
              currentFabric={currentFabric}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              onSelectIdeaForGuide={(idea) => handleOpenBlueprint(idea, currentFabric)}
              aiBlueprints={aiBlueprints}
              liveTrends={aiTrends}
              isAiLoading={isAiLoading}
              filterMode={galleryFilterMode}
              onFilterModeChange={setGalleryFilterMode}
              aiErrorMessage={aiErrorMessage}
            />

            <ImpactSection />
            <CommunityShowcase />
            <ManifestoSection />
          </>
        )}

        {/* TAB 2: MY FABRIC STASH (Feature 1 & Leftovers) */}
        {activeTab === 'stash' && (
          <FabricStashSection
            onSelectFabricForPlanner={handleSelectFabricForPlanner}
            onSendToStudio={handleSendToStudio}
          />
        )}

        {/* TAB 3: FIND A PROJECT (Feature 2 Planner) */}
        {activeTab === 'planner' && (
          <ProjectPlannerSection
            stashFabrics={stashFabrics}
            selectedFabricFromStash={selectedFabricForPlanner}
            onOpenBlueprint={handleOpenBlueprint}
            onNavigateToProjects={() => setActiveTab('projects')}
          />
        )}

        {/* TAB 4: MY PROJECTS (Feature 3 & 4 Saved Library & Tracking) */}
        {activeTab === 'projects' && (
          <SavedProjectsSection
            onOpenProjectBlueprint={(project) => handleOpenBlueprint(project, project.fabric)}
            onNavigateToPlanner={() => setActiveTab('planner')}
          />
        )}

        {/* TAB 5: MAKER JOURNEY (Feature 4 & 6 Progress Log & Sustainability) */}
        {activeTab === 'journey' && (
          <MakerJourneySection
            onNavigateToProjects={() => setActiveTab('projects')}
            onNavigateToStash={() => setActiveTab('stash')}
          />
        )}

      </main>

      {/* Detail / Making Guide Modal (Interactive Blueprint & Checklists) */}
      <MakingGuideModal
        key={selectedIdeaForGuide?.id ?? 'none'}
        idea={selectedIdeaForGuide}
        fabric={currentFabric}
        onClose={() => setSelectedIdeaForGuide(null)}
        onSaved={refreshStashAndProjects}
      />

      {/* Prototype Scanning & Simulation Modal */}
      <AIAnalysisModal
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        fabric={currentFabric}
        onViewRecommendations={scrollToIdeas}
        aiDesigns={aiDesigns}
        liveTrends={aiTrends}
        isAiLoading={isAiLoading}
        aiErrorMessage={aiErrorMessage}
      />

      {/* Editorial Atelier Footer */}
      <Footer />
    </div>
  );
};

export default App;
