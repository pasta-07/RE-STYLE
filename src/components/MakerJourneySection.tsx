import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Clock, 
  CheckCircle2, 
  Play, 
  Pause, 
  RotateCcw, 
  Bookmark, 
  Info, 
  Box, 
  ShieldCheck
} from 'lucide-react';
import { 
  fetchMakerStats, 
  fetchProjects, 
  logProjectSession, 
  type MakerStats, 
  type SavedProjectItem 
} from '../api/reStyleApi';

interface MakerJourneySectionProps {
  onNavigateToProjects: () => void;
  onNavigateToStash: () => void;
}

export const MakerJourneySection: React.FC<MakerJourneySectionProps> = ({
  onNavigateToProjects,
  onNavigateToStash,
}) => {
  const [stats, setStats] = useState<MakerStats | null>(null);
  const [activeProjects, setActiveProjects] = useState<SavedProjectItem[]>([]);

  // Active Timer state
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerNotes, setTimerNotes] = useState('');

  const loadData = async () => {
    try {
      const [statsData, projectsData] = await Promise.all([
        fetchMakerStats(),
        fetchProjects()
      ]);
      setStats(statsData);
      setActiveProjects(projectsData.filter(p => !['completed', 'abandoned'].includes(p.status)));
      if (projectsData.length > 0 && !selectedProjectId) {
        setSelectedProjectId(projectsData[0].id);
      }
    } catch (err) {
      console.error('[Maker Journey] Load error:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const handleStopAndLogTimer = async () => {
    setIsTimerRunning(false);
    if (!selectedProjectId) {
      alert('Please select an active project to log this session to.');
      return;
    }

    const minutes = Math.max(1, Math.round(elapsedSeconds / 60));
    try {
      await logProjectSession(selectedProjectId, {
        durationMinutes: minutes,
        notes: timerNotes.trim() || 'Timed atelier crafting session'
      });
      setElapsedSeconds(0);
      setTimerNotes('');
      alert(`Logged ${minutes} minutes of crafting time!`);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to log session');
    }
  };

  const formatTimerDisplay = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs > 0 ? `${hrs}:` : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <section id="journey-section" className="py-16 sm:py-24 bg-paper-100 border-t border-navy/10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bluegray text-navy text-xs font-semibold uppercase tracking-wider mb-3 border border-bluegray-200">
            <Award className="w-3.5 h-3.5 text-coral" />
            <span>Maker Log & Sustainability</span>
          </div>
          <h2 className="font-serif-title text-3xl sm:text-4xl lg:text-5xl text-navy font-bold tracking-tight">
            My Maker Journey.
          </h2>
          <p className="mt-3 text-base sm:text-lg text-charcoal-muted leading-relaxed">
            Every minute at the cutting table and every scrap transformed into a functional good recorded with mathematical transparency.
          </p>
        </div>

        {/* 4 Hero Highlight Metrics */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <div className="p-6 rounded-3xl bg-surface border border-navy/10 shadow-sm flex flex-col justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-charcoal-muted">Projects Completed</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-serif text-4xl font-bold text-emerald-800">{stats.projects.completed}</span>
                <span className="text-xs text-charcoal-muted">of {stats.projects.total} makes</span>
              </div>
              <p className="text-[11px] text-charcoal-muted mt-2 font-mono">
                {stats.projects.inProgress} in progress • {stats.projects.planned} planned
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-surface border border-navy/10 shadow-sm flex flex-col justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-charcoal-muted">Total Crafting Time</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-serif text-4xl font-bold text-navy">{stats.time.totalHours}</span>
                <span className="text-xs text-charcoal-muted">hours logged</span>
              </div>
              <p className="text-[11px] text-charcoal-muted mt-2 font-mono">
                {stats.time.sessionsLogged} tracked work sessions
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-surface border border-navy/10 shadow-sm flex flex-col justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-charcoal-muted">Fabric Confirmed Used</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-serif text-4xl font-bold text-coral">{stats.fabric.confirmedConsumedAreaSqM}</span>
                <span className="text-xs text-charcoal-muted">m² transformed</span>
              </div>
              <p className="text-[11px] text-charcoal-muted mt-2 font-mono">
                Based on verified entries
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-surface border border-navy/10 shadow-sm flex flex-col justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-charcoal-muted">Scraps Saved in Stash</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-serif text-4xl font-bold text-gold">{stats.fabric.scrapsInStash}</span>
                <span className="text-xs text-charcoal-muted">offcuts retained</span>
              </div>
              <p className="text-[11px] text-charcoal-muted mt-2 font-mono">
                {stats.fabric.availableAreaSqM} m² remaining stash
              </p>
            </div>
          </div>
        )}

        {/* 2-Column Section: Interactive Stopwatch + Transparent Sustainability */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Interactive Atelier Crafting Stopwatch (6 cols) */}
          <div className="lg:col-span-6 bg-surface rounded-3xl p-6 sm:p-8 border border-navy/15 shadow-warm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-navy/10">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-coral" />
                <h3 className="font-serif text-lg font-bold text-navy">
                  Atelier Work Session Timer
                </h3>
              </div>
              <span className="text-[11px] font-mono text-charcoal-muted uppercase">
                Real-Time Tracking
              </span>
            </div>

            <p className="text-xs text-charcoal-muted leading-relaxed">
              Track actual hands-on time spent pressing, cutting, and stitching. We believe in honest human time tracking without automated assumptions.
            </p>

            {/* Big Timer Digits */}
            <div className="py-6 rounded-2xl bg-paper text-center border border-navy/10 shadow-inner">
              <span className="font-mono text-5xl sm:text-6xl font-bold text-navy tracking-tight">
                {formatTimerDisplay(elapsedSeconds)}
              </span>
              <span className="block text-[11px] font-mono text-charcoal-muted mt-2 uppercase tracking-widest">
                {isTimerRunning ? 'Session Running' : elapsedSeconds > 0 ? 'Session Paused' : 'Ready to Start'}
              </span>
            </div>

            {/* Target Project Selection */}
            <div>
              <label className="block text-xs font-bold font-mono uppercase text-navy mb-1.5">
                Target Active Project
              </label>
              {activeProjects.length > 0 ? (
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-navy/15 text-xs sm:text-sm bg-paper text-navy font-medium focus:outline-none"
                >
                  {activeProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.status})
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-xs text-coral">No active projects available to log to. Start or save a project first.</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold font-mono uppercase text-navy mb-1.5">
                Session Milestone Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Assembling collar pleats, sewing straps..."
                value={timerNotes}
                onChange={(e) => setTimerNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-navy/15 text-xs bg-paper text-navy placeholder:text-charcoal-muted/60"
              />
            </div>

            {/* Timer Action Controls */}
            <div className="flex items-center gap-3 pt-2">
              {!isTimerRunning ? (
                <button
                  type="button"
                  onClick={() => setIsTimerRunning(true)}
                  className="flex-grow inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-navy text-paper font-semibold text-xs sm:text-sm hover:bg-navy/90 shadow-md transition-all active:scale-95"
                >
                  <Play className="w-4 h-4 text-emerald-400 fill-current" />
                  <span>{elapsedSeconds > 0 ? 'Resume Session' : 'Start Timer'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsTimerRunning(false)}
                  className="flex-grow inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-amber-700 text-white font-semibold text-xs sm:text-sm hover:bg-amber-800 shadow-md transition-all active:scale-95"
                >
                  <Pause className="w-4 h-4 text-white fill-current" />
                  <span>Pause Timer</span>
                </button>
              )}

              {elapsedSeconds > 0 && (
                <>
                  <button
                    type="button"
                    onClick={handleStopAndLogTimer}
                    className="inline-flex items-center gap-1.5 px-4 py-3 rounded-full bg-emerald-800 text-white font-semibold text-xs sm:text-sm hover:bg-emerald-900 shadow-md active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Log Time</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsTimerRunning(false);
                      setElapsedSeconds(0);
                    }}
                    title="Reset Timer"
                    className="p-3 rounded-full border border-navy/20 text-charcoal-muted hover:text-navy hover:bg-navy/5"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

          </div>

          {/* Right: Transparent Sustainability & Methodology (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-surface rounded-3xl p-6 sm:p-8 border border-navy/15 shadow-warm space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-navy/10">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <h3 className="font-serif text-lg font-bold text-navy">
                    Transparent Sustainability Ledger
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                  Verified Data
                </span>
              </div>

              {stats && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-paper border border-navy/10">
                    <span className="text-xs font-mono font-bold text-navy uppercase block mb-1">
                      🌱 Physical Fabric Utilisation
                    </span>
                    <p className="text-xs sm:text-sm text-charcoal leading-relaxed">
                      {stats.sustainability.confirmedConsumedExplanation}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-paper border border-navy/10">
                    <span className="text-xs font-mono font-bold text-navy uppercase block mb-1">
                      ✂️ Circular Scrap Retention
                    </span>
                    <p className="text-xs sm:text-sm text-charcoal leading-relaxed">
                      {stats.sustainability.scrapsRetainedExplanation}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-bluegray/50 border border-bluegray-300">
                    <span className="text-xs font-mono font-bold text-navy uppercase block mb-1 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-coral" />
                      Our Honest Accounting Methodology
                    </span>
                    <p className="text-xs text-charcoal-muted leading-relaxed">
                      {stats.sustainability.methodologyNotes}
                    </p>
                    <p className="text-[11px] text-charcoal-muted mt-2">
                      Unlike generic calculators that inflate offset numbers, Re:Style only counts fabric you physically cut and scraps you confirm retaining.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={onNavigateToProjects}
                  className="w-full sm:w-auto flex-grow inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-navy text-paper text-xs font-semibold hover:bg-navy/90"
                >
                  <Bookmark className="w-4 h-4 text-coral" />
                  <span>View All Active Projects</span>
                </button>

                <button
                  onClick={onNavigateToStash}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-navy/20 text-navy text-xs font-semibold hover:bg-paper"
                >
                  <Box className="w-4 h-4 text-navy" />
                  <span>Browse Stash</span>
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
