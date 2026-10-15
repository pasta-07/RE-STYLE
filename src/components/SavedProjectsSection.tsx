import React, { useState, useEffect } from 'react';
import { 
  Bookmark, 
  Heart, 
  Clock, 
  Printer, 
  Share2, 
  Trash2, 
  Scissors, 
  FileText, 
  ChevronRight, 
  Copy, 
  Check, 
  X, 
  Compass
} from 'lucide-react';
import { 
  fetchProjects, 
  updateProjectStatus, 
  deleteProject, 
  downloadProjectPdf, 
  createShareLink, 
  revokeShareLink, 
  logProjectSession, 
  type SavedProjectItem 
} from '../api/reStyleApi';

interface SavedProjectsSectionProps {
  onOpenProjectBlueprint: (project: SavedProjectItem) => void;
  onNavigateToPlanner: () => void;
}

const STATUS_FILTERS = [
  { value: 'all', label: 'All Projects' },
  { value: 'planned', label: 'Planned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
  { value: 'abandoned', label: 'Abandoned' }
];

export const SavedProjectsSection: React.FC<SavedProjectsSectionProps> = ({
  onOpenProjectBlueprint,
  onNavigateToPlanner,
}) => {
  const [projects, setProjects] = useState<SavedProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [favouriteFilter, setFavouriteFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [activeShareModalProject, setActiveShareModalProject] = useState<SavedProjectItem | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);

  const [activeSessionModalProject, setActiveSessionModalProject] = useState<SavedProjectItem | null>(null);
  const [sessionMinutes, setSessionMinutes] = useState<number | ''>(45);
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);

  // Leftover confirmation modal on project completion
  const [completionModalProject, setCompletionModalProject] = useState<SavedProjectItem | null>(null);
  const [leftoverLength, setLeftoverLength] = useState<number | ''>(20);
  const [leftoverWidth, setLeftoverWidth] = useState<number | ''>(15);
  const [leftoverPieces, setLeftoverPieces] = useState(1);
  const [leftoverNotes, setLeftoverNotes] = useState('Offcuts from main body panels');

  const loadProjects = async () => {
    try {
      setLoading(true);
      const list = await fetchProjects({
        status: statusFilter,
        favourite: favouriteFilter ? 'true' : undefined,
        search: searchQuery
      });
      setProjects(list);
    } catch (err) {
      console.error('[Projects] Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [statusFilter, favouriteFilter, searchQuery]);

  const handleStatusChange = async (project: SavedProjectItem, newStatus: string) => {
    if (newStatus === 'completed') {
      // Trigger leftover scrap confirmation flow
      setCompletionModalProject(project);
      return;
    }

    try {
      await updateProjectStatus(project.id, newStatus);
      loadProjects();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleConfirmCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completionModalProject) return;

    try {
      await updateProjectStatus(completionModalProject.id, 'completed', {
        consumedQuantity: 1,
        leftovers: {
          confirmed: true,
          length: Number(leftoverLength) || 0,
          width: Number(leftoverWidth) || 0,
          unit: completionModalProject.fabric?.dimensions.unit || 'cm',
          pieces: Number(leftoverPieces) || 1,
          notes: leftoverNotes.trim()
        }
      });
      setCompletionModalProject(null);
      loadProjects();
    } catch (err: any) {
      alert(err.message || 'Failed to complete project');
    }
  };

  const handleDelete = async (project: SavedProjectItem) => {
    if (!confirm(`Are you sure you want to remove "${project.title}" from your saved projects? Any reserved fabric will be released.`)) {
      return;
    }
    try {
      await deleteProject(project.id);
      loadProjects();
    } catch (err: any) {
      alert(err.message || 'Failed to delete project');
    }
  };

  const handleOpenShare = async (project: SavedProjectItem) => {
    try {
      setActiveShareModalProject(project);
      const res = await createShareLink(project.id);
      setShareUrl(res.shareUrl);
      setCopiedShare(false);
    } catch (err: any) {
      alert(err.message || 'Failed to generate share link');
    }
  };

  const handleCopyShare = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const handleRevokeShare = async () => {
    if (!activeShareModalProject) return;
    try {
      await revokeShareLink(activeShareModalProject.id);
      setShareUrl(null);
      alert('Share link has been revoked. Anyone accessing the previous link will see a 404 expired notice.');
    } catch (err: any) {
      alert(err.message || 'Failed to revoke link');
    }
  };

  const handleLogSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSessionModalProject) return;

    const mins = Number(sessionMinutes);
    if (isNaN(mins) || mins <= 0) {
      alert('Please enter valid session minutes.');
      return;
    }

    try {
      await logProjectSession(activeSessionModalProject.id, {
        durationMinutes: mins,
        notes: sessionNotes.trim(),
        date: sessionDate
      });
      setActiveSessionModalProject(null);
      setSessionNotes('');
      loadProjects();
    } catch (err: any) {
      alert(err.message || 'Failed to log session');
    }
  };

  const handleDownloadPdf = async (project: SavedProjectItem) => {
    try {
      const filename = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_blueprint.pdf`;
      await downloadProjectPdf(project.id, filename);
    } catch (err: any) {
      alert(err.message || 'Failed to download PDF');
    }
  };

  return (
    <section id="projects-section" className="py-16 sm:py-24 bg-paper relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bluegray text-navy text-xs font-semibold uppercase tracking-wider mb-3 border border-bluegray-200">
              <Bookmark className="w-3.5 h-3.5 text-coral" />
              <span>Project Library</span>
            </div>
            <h2 className="font-serif-title text-3xl sm:text-4xl lg:text-5xl text-navy font-bold tracking-tight">
              My Saved Projects.
            </h2>
            <p className="mt-3 text-base sm:text-lg text-charcoal-muted max-w-2xl leading-relaxed">
              Active blueprints, cutting layouts, and step trackers. Log crafting sessions, download printable atelier PDFs, and celebrate completed makes.
            </p>
          </div>

          <button
            onClick={onNavigateToPlanner}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-navy text-paper font-semibold text-sm hover:bg-navy/90 shadow-md active:scale-95"
          >
            <Compass className="w-4 h-4 text-coral" />
            <span>Discover More Projects</span>
          </button>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-navy/10 shadow-sm mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Status tabs */}
            <div className="flex flex-wrap items-center gap-1.5" role="tablist">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  role="tab"
                  aria-selected={statusFilter === f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    statusFilter === f.value 
                      ? 'bg-navy text-paper shadow-2xs' 
                      : 'bg-paper text-charcoal hover:bg-paper-50 border border-navy/10'
                  }`}
                >
                  {f.label}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setFavouriteFilter(!favouriteFilter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                  favouriteFilter 
                    ? 'bg-coral text-white border-coral' 
                    : 'bg-paper text-charcoal border-navy/10 hover:bg-paper-50'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${favouriteFilter ? 'fill-current' : 'text-coral'}`} />
                <span>Favourites</span>
              </button>
            </div>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Search saved projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3.5 py-1.5 text-xs rounded-xl border border-navy/15 bg-paper text-navy placeholder:text-charcoal-muted/60"
            />
          </div>
        </div>

        {/* Empty State */}
        {projects.length === 0 && !loading && (
          <div className="text-center py-16 px-4 bg-surface rounded-3xl border border-navy/10">
            <Bookmark className="w-12 h-12 text-charcoal-muted mx-auto mb-3 opacity-60" />
            <h3 className="font-serif text-xl font-bold text-navy">No saved projects found</h3>
            <p className="text-xs sm:text-sm text-charcoal-muted max-w-md mx-auto mt-1 mb-6">
              Browse the Project Planner or Discover gallery to save your favorite zero-waste blueprints.
            </p>
            <button
              onClick={onNavigateToPlanner}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-navy text-paper text-sm font-semibold hover:bg-navy/90"
            >
              <span>Explore Projects for Your Stash</span>
              <ChevronRight className="w-4 h-4 text-coral" />
            </button>
          </div>
        )}

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const progress = project.progressPercent || 0;
            const completedCount = project.completedStepCount || 0;
            const totalSteps = project.totalStepCount || project.steps?.length || 0;
            const hours = ((project.totalTimeSpentMinutes || 0) / 60).toFixed(1);

            return (
              <div 
                key={project.id}
                className="bg-surface rounded-3xl border border-navy/15 overflow-hidden shadow-2xs hover:shadow-warm transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Photo Header */}
                  <div className="relative aspect-[16/10] bg-paper-200 overflow-hidden">
                    <img 
                      src={project.imageUrl} 
                      alt={project.title} 
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80';
                      }}
                      className="w-full h-full object-cover" 
                    />

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <select
                        value={project.status}
                        onChange={(e) => handleStatusChange(project, e.target.value)}
                        aria-label={`Change status for ${project.title}`}
                        className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider shadow-md border focus:outline-none cursor-pointer ${
                          project.status === 'completed' 
                            ? 'bg-emerald-800 text-white border-emerald-900' 
                            : project.status === 'in_progress' 
                            ? 'bg-navy text-white border-navy' 
                            : project.status === 'paused'
                            ? 'bg-amber-700 text-white border-amber-800'
                            : project.status === 'abandoned'
                            ? 'bg-charcoal text-white border-charcoal'
                            : 'bg-paper text-navy border-navy/20'
                        }`}
                      >
                        <option value="planned">Status: Planned</option>
                        <option value="ready">Status: Ready to Start</option>
                        <option value="in_progress">Status: In Progress</option>
                        <option value="paused">Status: Paused</option>
                        <option value="completed">Status: Completed ✓</option>
                        <option value="abandoned">Status: Abandoned</option>
                      </select>
                    </div>

                    {/* Print Quick Action */}
                    <button
                      onClick={() => handleDownloadPdf(project)}
                      title="Download Printable PDF Blueprint"
                      aria-label="Download Printable PDF Blueprint"
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-paper/90 backdrop-blur-sm text-navy flex items-center justify-center hover:bg-paper shadow transition-transform active:scale-95"
                    >
                      <Printer className="w-4 h-4 text-navy" />
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 sm:p-6 space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono text-coral font-semibold mb-1">
                        <span>{project.category}</span>
                        <span>{project.difficulty} • {project.timeEstimate}</span>
                      </div>
                      <h3 className="font-serif text-xl font-bold text-navy leading-snug line-clamp-1">
                        {project.title}
                      </h3>
                      {project.subtitle && (
                        <p className="text-xs text-charcoal-muted line-clamp-1 mt-0.5 italic">
                          {project.subtitle}
                        </p>
                      )}
                    </div>

                    {/* Attached Fabric Remnant Chip */}
                    {project.fabric && (
                      <div className="p-2.5 rounded-xl bg-paper border border-navy/10 flex items-center gap-3">
                        <img 
                          src={project.fabric.imageUrl} 
                          alt={project.fabric.name}
                          className="w-10 h-10 rounded-lg object-cover border border-navy/15 flex-shrink-0" 
                        />
                        <div className="min-w-0 text-xs">
                          <span className="text-[10px] font-mono uppercase text-charcoal-muted block">Fabric Allocated</span>
                          <p className="font-serif font-bold text-navy truncate">{project.fabric.name}</p>
                          <p className="text-[11px] font-mono text-coral">
                            {project.fabric.dimensions.length}×{project.fabric.dimensions.width} {project.fabric.dimensions.unit} ({project.fabric.material})
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Step Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                        <span className="text-charcoal-muted">Steps Completed:</span>
                        <span className="font-bold text-navy">{completedCount} of {totalSteps} ({progress}%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-navy/10 overflow-hidden">
                        <div 
                          className="h-full bg-coral transition-all duration-500 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Time & Session Tracker Meta */}
                    <div className="flex items-center justify-between text-xs font-mono text-charcoal-muted pt-2 border-t border-navy/10">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-navy" />
                        <span>Crafting Time: <strong>{hours}h</strong></span>
                      </span>
                      <button
                        onClick={() => setActiveSessionModalProject(project)}
                        className="text-xs text-coral hover:underline font-semibold"
                      >
                        + Log Time
                      </button>
                    </div>

                  </div>
                </div>

                {/* Footer Action Strip */}
                <div className="p-4 sm:p-5 pt-0 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onOpenProjectBlueprint(project)}
                    className="flex-grow inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-navy text-paper text-xs font-semibold hover:bg-navy/90 transition-colors shadow-2xs"
                  >
                    <FileText className="w-3.5 h-3.5 text-coral" />
                    <span>Open Blueprint & Steps</span>
                  </button>

                  <button
                    onClick={() => handleOpenShare(project)}
                    title="Share Blueprint"
                    aria-label="Share Blueprint"
                    className="p-2.5 rounded-xl border border-navy/15 text-charcoal-muted hover:text-navy hover:bg-paper"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(project)}
                    title="Delete Project"
                    aria-label="Delete Project"
                    className="p-2.5 rounded-xl border border-navy/15 text-charcoal-muted hover:text-coral hover:bg-coral/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* --- LOG SESSION MODAL --- */}
      {activeSessionModalProject && (
        <div className="fixed inset-0 z-50 bg-navy/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" role="dialog" aria-modal="true">
          <div className="bg-paper p-6 rounded-3xl max-w-md w-full border border-navy/20 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-navy/10 mb-4">
              <h4 className="font-serif text-lg font-bold text-navy flex items-center gap-2">
                <Clock className="w-4 h-4 text-coral" />
                <span>Log Crafting Session</span>
              </h4>
              <button 
                onClick={() => setActiveSessionModalProject(null)}
                className="p-1 rounded-full text-charcoal-muted hover:text-navy"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-charcoal-muted mb-4">
              Recording time for: <strong className="text-navy">{activeSessionModalProject.title}</strong>
            </p>

            <form onSubmit={handleLogSessionSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-charcoal-muted uppercase mb-1">
                    Duration (Minutes) *
                  </label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    required
                    value={sessionMinutes}
                    onChange={(e) => setSessionMinutes(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 rounded-xl border border-navy/15 text-xs bg-surface text-navy focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-charcoal-muted uppercase mb-1">
                    Session Date
                  </label>
                  <input
                    type="date"
                    required
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-navy/15 text-xs bg-surface text-navy focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-charcoal-muted uppercase mb-1">
                  Session Notes (Phases or milestones)
                </label>
                <textarea
                  rows={2}
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="e.g. Cut main panels, hemmed perimeter straps..."
                  className="w-full px-3 py-2 rounded-xl border border-navy/15 text-xs bg-surface text-navy focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveSessionModalProject(null)}
                  className="px-4 py-2 rounded-full border border-navy/20 text-xs font-semibold text-navy hover:bg-navy/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-navy text-paper text-xs font-semibold hover:bg-navy/90 shadow-md"
                >
                  Save Work Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- SHARE MODAL --- */}
      {activeShareModalProject && (
        <div className="fixed inset-0 z-50 bg-navy/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" role="dialog" aria-modal="true">
          <div className="bg-paper p-6 sm:p-7 rounded-3xl max-w-lg w-full border border-navy/20 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-navy/10">
              <h4 className="font-serif text-lg font-bold text-navy flex items-center gap-2">
                <Share2 className="w-4 h-4 text-coral" />
                <span>Share Blueprint with Community</span>
              </h4>
              <button 
                onClick={() => setActiveShareModalProject(null)}
                className="p-1 rounded-full text-charcoal-muted hover:text-navy"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-charcoal-muted leading-relaxed">
              Anyone with this link can view the read-only cutting plan and step instructions. 
              <strong className="text-navy"> Private inventory details, personal user notes, and costs are strictly excluded.</strong>
            </p>

            {shareUrl ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface border border-navy/15">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-grow text-xs bg-transparent text-navy font-mono truncate focus:outline-none"
                  />
                  <button
                    onClick={handleCopyShare}
                    className="px-3 py-1.5 rounded-lg bg-navy text-paper text-xs font-semibold flex items-center gap-1.5 hover:bg-navy/90"
                  >
                    {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedShare ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={handleRevokeShare}
                    className="text-xs font-mono text-coral hover:underline flex items-center gap-1"
                  >
                    <span>Revoke Access Link</span>
                  </button>

                  <button
                    onClick={() => setActiveShareModalProject(null)}
                    className="px-5 py-2 rounded-full bg-navy text-paper text-xs font-semibold"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs font-mono text-coral mb-3">Share link was revoked.</p>
                <button
                  onClick={() => handleOpenShare(activeShareModalProject)}
                  className="px-4 py-2 rounded-full bg-navy text-paper text-xs font-semibold"
                >
                  Generate New Share Link
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- CONFIRM COMPLETION & LEFTOVER RECORDING MODAL (Feature 5) --- */}
      {completionModalProject && (
        <div className="fixed inset-0 z-50 bg-navy/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" role="dialog" aria-modal="true">
          <div className="bg-paper p-6 sm:p-7 rounded-3xl max-w-lg w-full border border-navy/20 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-navy/10">
              <h4 className="font-serif text-lg font-bold text-navy flex items-center gap-2">
                <Scissors className="w-4 h-4 text-coral" />
                <span>Project Completed — Record Leftover Scraps</span>
              </h4>
              <button 
                onClick={() => setCompletionModalProject(null)}
                className="p-1 rounded-full text-charcoal-muted hover:text-navy"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-charcoal-muted leading-relaxed">
              Congratulations on completing <strong className="text-navy">{completionModalProject.title}</strong>! 
              Measure your confirmed remaining offcuts so Re:Style can automatically add them to your fabric stash for zero-waste projects (scrunchies, coasters, sachets).
            </p>

            <form onSubmit={handleConfirmCompletion} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-charcoal-muted uppercase mb-1">
                    Remaining Length ({completionModalProject.fabric?.dimensions.unit || 'cm'}) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={leftoverLength}
                    onChange={(e) => setLeftoverLength(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 rounded-xl border border-navy/15 text-xs bg-surface text-navy focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-charcoal-muted uppercase mb-1">
                    Remaining Width ({completionModalProject.fabric?.dimensions.unit || 'cm'}) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={leftoverWidth}
                    onChange={(e) => setLeftoverWidth(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 rounded-xl border border-navy/15 text-xs bg-surface text-navy focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-charcoal-muted uppercase mb-1">
                    Number of Separate Pieces
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={leftoverPieces}
                    onChange={(e) => setLeftoverPieces(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full px-3 py-2 rounded-xl border border-navy/15 text-xs bg-surface text-navy focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-charcoal-muted uppercase mb-1">
                    Offcut Notes
                  </label>
                  <input
                    type="text"
                    value={leftoverNotes}
                    onChange={(e) => setLeftoverNotes(e.target.value)}
                    placeholder="e.g. 2 rectangular strips"
                    className="w-full px-3 py-2 rounded-xl border border-navy/15 text-xs bg-surface text-navy focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-navy/10 flex items-center justify-between">
                <button
                  type="button"
                  onClick={async () => {
                    // Complete without adding scraps to stash
                    await updateProjectStatus(completionModalProject.id, 'completed', { consumedQuantity: 1 });
                    setCompletionModalProject(null);
                    loadProjects();
                  }}
                  className="text-xs font-mono text-charcoal-muted hover:underline"
                >
                  Skip Scrap Recording
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCompletionModalProject(null)}
                    className="px-4 py-2 rounded-full border border-navy/20 text-xs font-semibold text-navy hover:bg-navy/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-emerald-800 text-white text-xs font-semibold hover:bg-emerald-900 shadow-md"
                  >
                    Confirm & Add to Stash
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </section>
  );
};
