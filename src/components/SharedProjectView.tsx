import React, { useState, useEffect } from 'react';
import { 
  Scissors, 
  BookOpen, 
  Compass, 
  Printer, 
  AlertCircle, 
  Sparkles, 
  ArrowLeft 
} from 'lucide-react';
import { fetchSharedProject } from '../api/reStyleApi';

interface SharedProjectViewProps {
  token: string;
  onGoHome: () => void;
}

export const SharedProjectView: React.FC<SharedProjectViewProps> = ({ token, onGoHome }) => {
  const [project, setProject] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchSharedProject(token);
        setProject(data);
      } catch (err: any) {
        setError(err.message || 'Shared blueprint not found or revoked');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-6 text-center">
        <div>
          <Compass className="w-8 h-8 text-coral animate-spin mx-auto mb-3" />
          <p className="font-serif text-lg text-navy">Loading Shared Atelier Blueprint...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-surface p-8 rounded-3xl border border-navy/15 text-center shadow-warm">
          <AlertCircle className="w-12 h-12 text-coral mx-auto mb-3" />
          <h2 className="font-serif text-2xl font-bold text-navy">Blueprint Unavailable</h2>
          <p className="text-xs sm:text-sm text-charcoal-muted mt-2 leading-relaxed">
            This shared project link does not exist, has expired, or was revoked by its creator.
          </p>
          <button
            onClick={onGoHome}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-navy text-paper text-xs font-semibold hover:bg-navy/90"
          >
            <ArrowLeft className="w-4 h-4 text-coral" />
            <span>Return to Re:Style Home</span>
          </button>
        </div>
      </div>
    );
  }

  const fabric = project.fabricSnapshot;
  const cuttingPlan = project.cuttingPlan;
  const patternPieces = cuttingPlan?.patternPieces || [];

  return (
    <div className="min-h-screen bg-paper text-charcoal">
      {/* Top Banner */}
      <header className="border-b border-navy/10 bg-paper-100 py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onGoHome} className="flex items-center gap-2 text-xs font-mono text-navy hover:text-coral font-bold">
            <ArrowLeft className="w-4 h-4 text-coral" />
            <span>Re:Style Atelier</span>
          </button>
          <span className="text-charcoal-muted font-mono text-xs">/ Public Blueprint</span>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-navy text-paper text-xs font-semibold hover:bg-navy/90 shadow-2xs"
        >
          <Printer className="w-3.5 h-3.5 text-coral" />
          <span>Print / Save PDF</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        
        {/* Title Header */}
        <div className="pb-6 border-b border-navy/10">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase bg-navy text-paper font-semibold">
              {project.category}
            </span>
            <span className="text-xs font-mono text-coral font-bold">
              {project.difficulty} • {project.timeEstimate}
            </span>
          </div>
          <h1 className="font-serif-title text-3xl sm:text-4xl text-navy font-bold">
            {project.title}
          </h1>
          {project.subtitle && (
            <p className="text-sm text-charcoal-muted mt-1 italic">
              {project.subtitle}
            </p>
          )}

          {project.suitabilityReason && (
            <p className="text-xs sm:text-sm text-charcoal-muted mt-3 max-w-xl">
              {project.suitabilityReason}
            </p>
          )}
        </div>

        {/* Fabric Remnant Snapshot */}
        {fabric && (
          <div className="p-5 rounded-2xl bg-surface border border-navy/15 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-bluegray flex items-center justify-center text-navy font-serif font-bold text-xl flex-shrink-0">
              ✂️
            </div>
            <div className="text-xs">
              <span className="text-[10px] font-mono uppercase text-charcoal-muted block">Remnant Source Profile</span>
              <p className="font-serif font-bold text-navy text-sm">{fabric.materialLabel || fabric.material}</p>
              <p className="text-[11px] font-mono text-coral">
                {fabric.dimensions?.length}×{fabric.dimensions?.width} {fabric.dimensions?.unit || 'cm'} • {fabric.dominantColor} • {fabric.pattern}
              </p>
            </div>
          </div>
        )}

        {/* Materials & Tools */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-surface border border-navy/10">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-navy mb-3 flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-coral" />
              Required Tools
            </h3>
            <ul className="space-y-1.5 text-xs text-charcoal">
              {project.toolsNeeded?.map((t: string, i: number) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-coral"></span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-surface border border-navy/10">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-navy mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              Materials & Notions
            </h3>
            <ul className="space-y-1.5 text-xs text-charcoal">
              {project.materialsNeeded?.map((m: any, i: number) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
                  <span>{typeof m === 'string' ? m : m.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Geometric Cutting Plan */}
        {patternPieces.length > 0 && (
          <div className="p-6 rounded-3xl bg-bluegray border border-bluegray-300 space-y-4">
            <h3 className="font-serif text-lg font-bold text-navy flex items-center gap-2">
              <Compass className="w-4 h-4 text-coral" />
              Zero-Waste Cutting Blueprint
            </h3>

            <div className="overflow-x-auto bg-paper rounded-xl border border-navy/10 p-4">
              <table className="w-full text-xs font-mono text-left">
                <thead>
                  <tr className="border-b border-navy/10 text-charcoal-muted text-[10px]">
                    <th className="py-1">Piece Name</th>
                    <th className="py-1">Qty</th>
                    <th className="py-1">Dimensions</th>
                    <th className="py-1">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy/5">
                  {patternPieces.map((p: any, idx: number) => (
                    <tr key={idx}>
                      <td className="py-2 font-bold text-navy">{p.name}</td>
                      <td className="py-2">{p.count}</td>
                      <td className="py-2">{p.width} × {p.height} {p.unit}</td>
                      <td className="py-2 text-charcoal-muted">{p.notes || 'Straight cut'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-3 text-[10px] font-mono text-charcoal-muted flex justify-between">
                <span>Seam Allowance: {cuttingPlan?.seamAllowance || '1.0 cm included'}</span>
                <span>Grainline: {cuttingPlan?.grainline || 'Parallel to warp'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Step-by-Step Instructions */}
        <div className="space-y-4">
          <h3 className="font-serif text-xl font-bold text-navy flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-coral" />
            Step-by-Step Assembly Instructions
          </h3>

          <div className="space-y-3">
            {project.steps?.map((step: any, idx: number) => (
              <div key={idx} className="p-5 rounded-2xl bg-surface border border-navy/10 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-navy text-paper font-serif font-bold text-xs flex items-center justify-center flex-shrink-0">
                    {step.step || idx + 1}
                  </span>
                  <h4 className="font-serif text-base font-bold text-navy">
                    {step.title}
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-charcoal leading-relaxed pl-10">
                  {step.description}
                </p>
                {step.tip && (
                  <p className="text-xs text-coral font-mono italic pl-10">
                    * Pro-tip: {step.tip}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
};
