import React, { useState } from 'react';
import { 
  Scissors, 
  Sparkles, 
  Menu, 
  X, 
  ArrowUpRight, 
  Compass, 
  Box, 
  Bookmark, 
  Award
} from 'lucide-react';

export type ActiveNavTab = 'discover' | 'stash' | 'planner' | 'projects' | 'journey';

interface NavbarProps {
  activeTab: ActiveNavTab;
  onSelectTab: (tab: ActiveNavTab) => void;
  onScrollToStudio: () => void;
  stashCount?: number;
  projectsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onScrollToStudio,
  stashCount = 0,
  projectsCount = 0
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabClick = (tab: ActiveNavTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur-md border-b border-navy/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Atelier Tag */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => handleTabClick('discover')} 
              className="flex items-center gap-2.5 group text-left focus:outline-none" 
              aria-label="ReStylee Home"
            >
              <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center text-paper shadow-md transition-transform duration-300 group-hover:rotate-12 group-hover:scale-105">
                <Scissors className="w-5 h-5 text-coral transition-transform group-hover:scale-110" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-2xl font-bold tracking-tight text-navy flex items-center gap-1.5">
                  ReStylee
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-coral"></span>
                </span>
                <span className="text-[10px] uppercase tracking-widest text-charcoal-muted font-medium">
                  Circular Maker Atelier
                </span>
              </div>
            </button>

            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-bluegray text-navy text-xs font-medium border border-bluegray-200">
              <Compass className="w-3.5 h-3.5 text-denim" />
              <span>Waste is a design opportunity</span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-xs lg:text-sm font-medium" aria-label="Main navigation">
            <button
              onClick={() => handleTabClick('discover')}
              className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                activeTab === 'discover'
                  ? 'bg-navy text-paper font-semibold shadow-2xs'
                  : 'text-charcoal hover:text-navy hover:bg-paper-100'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${activeTab === 'discover' ? 'text-coral' : 'text-charcoal-muted'}`} />
              <span>Discover & AI Studio</span>
            </button>

            <button
              onClick={() => handleTabClick('stash')}
              className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                activeTab === 'stash'
                  ? 'bg-navy text-paper font-semibold shadow-2xs'
                  : 'text-charcoal hover:text-navy hover:bg-paper-100'
              }`}
            >
              <Box className={`w-3.5 h-3.5 ${activeTab === 'stash' ? 'text-coral' : 'text-charcoal-muted'}`} />
              <span>My Fabric Stash</span>
              {stashCount > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-coral text-white font-bold">
                  {stashCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleTabClick('planner')}
              className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                activeTab === 'planner'
                  ? 'bg-navy text-paper font-semibold shadow-2xs'
                  : 'text-charcoal hover:text-navy hover:bg-paper-100'
              }`}
            >
              <Compass className={`w-3.5 h-3.5 ${activeTab === 'planner' ? 'text-coral' : 'text-charcoal-muted'}`} />
              <span>Find a Project</span>
            </button>

            <button
              onClick={() => handleTabClick('projects')}
              className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                activeTab === 'projects'
                  ? 'bg-navy text-paper font-semibold shadow-2xs'
                  : 'text-charcoal hover:text-navy hover:bg-paper-100'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${activeTab === 'projects' ? 'text-coral' : 'text-charcoal-muted'}`} />
              <span>My Projects</span>
              {projectsCount > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-navy text-paper border border-navy/20 font-bold">
                  {projectsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleTabClick('journey')}
              className={`px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                activeTab === 'journey'
                  ? 'bg-navy text-paper font-semibold shadow-2xs'
                  : 'text-charcoal hover:text-navy hover:bg-paper-100'
              }`}
            >
              <Award className={`w-3.5 h-3.5 ${activeTab === 'journey' ? 'text-coral' : 'text-charcoal-muted'}`} />
              <span>Maker Journey</span>
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            {activeTab === 'discover' ? (
              <button
                onClick={onScrollToStudio}
                className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-navy text-paper text-xs font-semibold transition-all duration-300 hover:bg-navy-700 hover:shadow-warm active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-coral animate-pulse" />
                <span>Scan Swatch</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-gold transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            ) : (
              <button
                onClick={() => handleTabClick('stash')}
                className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-full border border-navy/20 text-navy text-xs font-semibold hover:bg-paper-100"
              >
                <Box className="w-3.5 h-3.5 text-coral" />
                <span>View Stash</span>
              </button>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-navy hover:bg-navy/5 focus:outline-none"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-navy/10 bg-paper px-4 pt-3 pb-6 space-y-2 animate-fadeIn">
          <button
            onClick={() => handleTabClick('discover')}
            className={`w-full text-left py-2 px-3 rounded-xl text-sm font-medium flex items-center justify-between ${
              activeTab === 'discover' ? 'bg-navy text-paper font-semibold' : 'text-charcoal hover:bg-paper-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-coral" />
              <span>Discover & AI Studio</span>
            </div>
          </button>

          <button
            onClick={() => handleTabClick('stash')}
            className={`w-full text-left py-2 px-3 rounded-xl text-sm font-medium flex items-center justify-between ${
              activeTab === 'stash' ? 'bg-navy text-paper font-semibold' : 'text-charcoal hover:bg-paper-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <Box className="w-4 h-4 text-coral" />
              <span>My Fabric Stash</span>
            </div>
            {stashCount > 0 && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-coral text-white font-bold">
                {stashCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabClick('planner')}
            className={`w-full text-left py-2 px-3 rounded-xl text-sm font-medium flex items-center justify-between ${
              activeTab === 'planner' ? 'bg-navy text-paper font-semibold' : 'text-charcoal hover:bg-paper-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-coral" />
              <span>Find a Project</span>
            </div>
          </button>

          <button
            onClick={() => handleTabClick('projects')}
            className={`w-full text-left py-2 px-3 rounded-xl text-sm font-medium flex items-center justify-between ${
              activeTab === 'projects' ? 'bg-navy text-paper font-semibold' : 'text-charcoal hover:bg-paper-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-coral" />
              <span>My Projects</span>
            </div>
            {projectsCount > 0 && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-navy text-paper border border-navy/20 font-bold">
                {projectsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabClick('journey')}
            className={`w-full text-left py-2 px-3 rounded-xl text-sm font-medium flex items-center justify-between ${
              activeTab === 'journey' ? 'bg-navy text-paper font-semibold' : 'text-charcoal hover:bg-paper-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-coral" />
              <span>Maker Journey</span>
            </div>
          </button>
        </div>
      )}
    </header>
  );
};
