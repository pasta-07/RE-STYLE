import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Sparkles, 
  AlertCircle, 
  Ruler, 
  Grid, 
  List, 
  Archive,
  Box,
  Compass,
  X
} from 'lucide-react';
import { 
  fetchFabrics, 
  createFabric, 
  updateFabric, 
  deleteFabric, 
  type StashFabricItem 
} from '../api/reStyleApi';
import { inspectFabricImage } from '../api/generateDesigns';
import { extractColorsFromDataUrl } from '../utils/colorExtractor';

interface FabricStashSectionProps {
  onSelectFabricForPlanner: (fabric: StashFabricItem) => void;
  onSendToStudio: (fabric: StashFabricItem) => void;
}

export const FabricStashSection: React.FC<FabricStashSectionProps> = ({
  onSelectFabricForPlanner,
  onSendToStudio,
}) => {
  const [fabrics, setFabrics] = useState<StashFabricItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [materialFilter, setMaterialFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFabric, setEditingFabric] = useState<StashFabricItem | null>(null);
  const [deletingFabric, setDeletingFabric] = useState<StashFabricItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State for Add / Edit
  const [formName, setFormName] = useState('');
  const [formMaterial, setFormMaterial] = useState('cotton');
  const [formMaterialLabel, setFormMaterialLabel] = useState('');
  const [formDominantColor, setFormDominantColor] = useState('Natural Tone');
  const [formPattern, setFormPattern] = useState('Plain Weave');
  const [formLength, setFormLength] = useState<number | ''>(45);
  const [formWidth, setFormWidth] = useState<number | ''>(35);
  const [formUnit, setFormUnit] = useState<'cm' | 'in'>('cm');
  const [formTotalQty, setFormTotalQty] = useState(1);
  const [formCondition, setFormCondition] = useState<StashFabricItem['condition']>('new');
  const [formStretch, setFormStretch] = useState<StashFabricItem['stretch']>('none');
  const [formThickness, setFormThickness] = useState<StashFabricItem['thickness']>('medium');
  const [formWeightGsm, setFormWeightGsm] = useState<number | ''>(200);
  const [formPurchaseCost, setFormPurchaseCost] = useState<number | ''>('');
  const [formStorageLocation, setFormStorageLocation] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formSource, setFormSource] = useState<StashFabricItem['source']>('purchased');
  const [formImage, setFormImage] = useState<string>('https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80');

  // AI Inspection state during upload
  const [isAiInspecting, setIsAiInspecting] = useState(false);
  const [aiInspectionStatus, setAiInspectionStatus] = useState<string | null>(null);

  const loadFabrics = async () => {
    try {
      setLoading(true);
      const list = await fetchFabrics({
        search,
        material: materialFilter,
        condition: conditionFilter,
        availability: availabilityFilter,
        source: sourceFilter,
        sortBy
      });
      setFabrics(list);
    } catch (err: any) {
      console.error('[Stash] Error loading fabrics:', err);
      setErrorMessage(err.message || 'Failed to load fabrics from stash');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFabrics();
  }, [search, materialFilter, conditionFilter, availabilityFilter, sourceFilter, sortBy]);

  // Aggregate Metrics
  const totalPieces = fabrics.length;
  const availablePieces = fabrics.filter(f => f.availableQuantity > 0).length;
  const reservedPieces = fabrics.filter(f => f.reservedQuantity > 0).length;
  const totalAreaSqM = fabrics.reduce((acc, f) => {
    const l = f.dimensions.unit === 'in' ? f.dimensions.length * 2.54 : f.dimensions.length;
    const w = f.dimensions.unit === 'in' ? f.dimensions.width * 2.54 : f.dimensions.width;
    return acc + ((l * w * f.availableQuantity) / 10000);
  }, 0);

  const openAddModal = () => {
    setEditingFabric(null);
    setFormName('');
    setFormMaterial('cotton');
    setFormMaterialLabel('');
    setFormDominantColor('Natural Tone');
    setFormPattern('Plain Solid Weave');
    setFormLength(45);
    setFormWidth(35);
    setFormUnit('cm');
    setFormTotalQty(1);
    setFormCondition('new');
    setFormStretch('none');
    setFormThickness('medium');
    setFormWeightGsm(200);
    setFormPurchaseCost('');
    setFormStorageLocation('');
    setFormNotes('');
    setFormSource('purchased');
    setFormImage('https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80');
    setAiInspectionStatus(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (fabric: StashFabricItem) => {
    setEditingFabric(fabric);
    setFormName(fabric.name);
    setFormMaterial(fabric.material);
    setFormMaterialLabel(fabric.materialLabel || fabric.material);
    setFormDominantColor(fabric.dominantColor);
    setFormPattern(fabric.pattern);
    setFormLength(fabric.dimensions.length);
    setFormWidth(fabric.dimensions.width);
    setFormUnit(fabric.dimensions.unit);
    setFormTotalQty(fabric.totalQuantity);
    setFormCondition(fabric.condition);
    setFormStretch(fabric.stretch || 'none');
    setFormThickness(fabric.thickness || 'medium');
    setFormWeightGsm(fabric.weightGsm || 200);
    setFormPurchaseCost(fabric.purchaseCost ?? '');
    setFormStorageLocation(fabric.storageLocation || '');
    setFormNotes(fabric.notes || '');
    setFormSource(fabric.source);
    setFormImage(fabric.imageUrl);
    setAiInspectionStatus(null);
    setIsAddModalOpen(true);
  };

  // Image Upload with Vision & Canvas Color Analysis
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('File size exceeds 8MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setFormImage(dataUrl);

      // 1. Instant local pixel/canvas analysis
      try {
        const local = await extractColorsFromDataUrl(dataUrl, file.name);
        setFormDominantColor(local.dominantColor);
        setFormMaterial(local.fiberType.toLowerCase());
        setFormMaterialLabel(local.fiberType);
        setFormPattern(local.pattern);
        if (local.weightGsm) setFormWeightGsm(local.weightGsm);
        setFormName(`${local.dominantColor} ${local.fiberType} Remnant`);
      } catch (err) {
        console.warn('[Stash] Local color extraction notice:', err);
      }

      // 2. Multimodal Gemini Vision inspection
      setIsAiInspecting(true);
      setAiInspectionStatus('Analyzing photograph with Google Vision for colors, pattern, and weave structure...');

      try {
        const res = await inspectFabricImage(dataUrl);
        if (res.success && res.inspection) {
          const insp = res.inspection;
          if (insp.dominantColor) setFormDominantColor(insp.dominantColor);
          if (insp.pattern) setFormPattern(insp.pattern);
          if (insp.fiberType) {
            setFormMaterial(insp.fiberType.toLowerCase());
            setFormMaterialLabel(insp.fiberType);
          }
          if (insp.weightGsm) setFormWeightGsm(insp.weightGsm);
          if (insp.suggestedName) setFormName(insp.suggestedName);
          setAiInspectionStatus(`✨ AI Identified: ${insp.dominantColor} • ${insp.pattern} • ${insp.fiberType || 'Woven Structure'}. Review & adjust fields below.`);
        } else {
          setAiInspectionStatus('Photo loaded. Please review and verify dimensions and material below.');
        }
      } catch (err) {
        console.warn('[Stash Vision]', err);
        setAiInspectionStatus('Photo uploaded successfully. Please verify measurements and material.');
      } finally {
        setIsAiInspecting(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveFabric = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Please enter a fabric label or name.');
      return;
    }

    const length = Number(formLength);
    const width = Number(formWidth);
    if (isNaN(length) || length <= 0 || isNaN(width) || width <= 0) {
      alert('Please provide valid positive dimensions.');
      return;
    }

    try {
      const payload: Partial<StashFabricItem> = {
        name: formName.trim(),
        imageUrl: formImage,
        material: formMaterial,
        materialLabel: formMaterialLabel || formMaterial,
        dominantColor: formDominantColor,
        pattern: formPattern,
        dimensions: {
          length,
          width,
          unit: formUnit
        },
        totalQuantity: Number(formTotalQty) || 1,
        condition: formCondition,
        stretch: formStretch,
        thickness: formThickness,
        weightGsm: formWeightGsm ? Number(formWeightGsm) : 200,
        purchaseCost: formPurchaseCost !== '' ? Number(formPurchaseCost) : null,
        storageLocation: formStorageLocation.trim(),
        notes: formNotes.trim(),
        source: formSource
      };

      if (editingFabric) {
        await updateFabric(editingFabric.id, payload);
      } else {
        await createFabric(payload);
      }

      setIsAddModalOpen(false);
      loadFabrics();
    } catch (err: any) {
      alert(err.message || 'Failed to save fabric');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingFabric) return;
    try {
      await deleteFabric(deletingFabric.id);
      setDeletingFabric(null);
      loadFabrics();
    } catch (err: any) {
      alert(err.message || 'Cannot delete fabric');
    }
  };

  return (
    <section id="stash-section" className="py-16 sm:py-24 bg-paper relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header spread */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bluegray text-navy text-xs font-semibold uppercase tracking-wider mb-3 border border-bluegray-200">
              <Box className="w-3.5 h-3.5 text-coral" />
              <span>Fabric Inventory</span>
            </div>
            <h2 className="font-serif-title text-3xl sm:text-4xl lg:text-5xl text-navy font-bold tracking-tight">
              My Fabric Stash.
            </h2>
            <p className="mt-3 text-base sm:text-lg text-charcoal-muted max-w-2xl leading-relaxed">
              Every remnant, deadstock bolt, and offcut scrap in your studio catalogued with precision. Track reservations, dimensions, and circular reuse.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-navy text-paper font-semibold text-sm hover:bg-navy/90 transition-all shadow-md active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-denim"
            >
              <Plus className="w-4 h-4 text-coral" />
              <span>Add Fabric Piece</span>
            </button>
          </div>
        </div>

        {/* Top Aggregates Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="p-5 rounded-2xl bg-surface border border-navy/10 shadow-2xs">
            <span className="text-[11px] font-mono uppercase tracking-wider text-charcoal-muted block">Total Catalogued</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-serif text-3xl font-bold text-navy">{totalPieces}</span>
              <span className="text-xs text-charcoal-muted">pieces</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-surface border border-navy/10 shadow-2xs">
            <span className="text-[11px] font-mono uppercase tracking-wider text-charcoal-muted block">Available Now</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-serif text-3xl font-bold text-emerald-800">{availablePieces}</span>
              <span className="text-xs text-emerald-700">unreserved</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-surface border border-navy/10 shadow-2xs">
            <span className="text-[11px] font-mono uppercase tracking-wider text-charcoal-muted block">Reserved for Projects</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-serif text-3xl font-bold text-coral">{reservedPieces}</span>
              <span className="text-xs text-coral">active designs</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-surface border border-navy/10 shadow-2xs">
            <span className="text-[11px] font-mono uppercase tracking-wider text-charcoal-muted block">Total Stash Area</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-serif text-3xl font-bold text-navy">{totalAreaSqM.toFixed(2)}</span>
              <span className="text-xs text-charcoal-muted">m² available</span>
            </div>
          </div>
        </div>

        {/* Error message alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-coral/10 border border-coral/30 flex items-center justify-between text-xs text-coral">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="p-1 hover:text-navy" aria-label="Dismiss error">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-navy/10 shadow-sm mb-8 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-grow">
              <Search className="w-4 h-4 text-charcoal-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search stash by fabric name, color, pattern, notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-navy/15 bg-paper text-navy placeholder:text-charcoal-muted/60 focus:outline-none focus:ring-2 focus:ring-navy/20"
              />
            </div>

            {/* View Mode & Sorter */}
            <div className="flex items-center gap-2 justify-end">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort inventory"
                className="px-3 py-2 text-xs font-mono rounded-xl border border-navy/15 bg-paper text-navy focus:outline-none focus:ring-2 focus:ring-navy/20"
              >
                <option value="date_desc">Sort: Newest Added</option>
                <option value="date_asc">Sort: Oldest Added</option>
                <option value="available_desc">Sort: Available Qty</option>
                <option value="area_desc">Sort: Largest Area</option>
                <option value="material_asc">Sort: Material Name</option>
              </select>

              <div className="flex items-center rounded-xl border border-navy/15 p-0.5 bg-paper">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-navy text-paper' : 'text-charcoal-muted hover:text-navy'}`}
                  title="Grid View"
                  aria-label="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-navy text-paper' : 'text-charcoal-muted hover:text-navy'}`}
                  title="List View"
                  aria-label="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Pill Filters */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-navy/10 text-xs">
            <span className="text-[11px] font-mono text-charcoal-muted uppercase mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filters:
            </span>

            {/* Material */}
            <select
              value={materialFilter}
              onChange={(e) => setMaterialFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-navy/15 bg-paper text-xs text-navy focus:outline-none"
            >
              <option value="all">Material: All</option>
              <option value="cotton">Cotton</option>
              <option value="denim">Denim</option>
              <option value="linen">Linen</option>
              <option value="silk">Silk</option>
              <option value="wool">Wool</option>
              <option value="corduroy">Corduroy</option>
            </select>

            {/* Condition */}
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-navy/15 bg-paper text-xs text-navy focus:outline-none"
            >
              <option value="all">Condition: All</option>
              <option value="new">Crisp / New</option>
              <option value="good">Good Condition</option>
              <option value="worn">Vintage Worn</option>
              <option value="damaged">Frayed / Damaged</option>
            </select>

            {/* Availability */}
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-navy/15 bg-paper text-xs text-navy focus:outline-none"
            >
              <option value="all">Availability: All</option>
              <option value="available">Available Only</option>
              <option value="reserved">Reserved</option>
              <option value="consumed">Consumed</option>
            </select>

            {/* Source */}
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-navy/15 bg-paper text-xs text-navy focus:outline-none"
            >
              <option value="all">Source: All</option>
              <option value="purchased">Purchased</option>
              <option value="leftover">Leftover</option>
              <option value="scrap">Offcut Scrap</option>
            </select>

            {(materialFilter !== 'all' || conditionFilter !== 'all' || availabilityFilter !== 'all' || sourceFilter !== 'all' || search) && (
              <button
                onClick={() => {
                  setMaterialFilter('all');
                  setConditionFilter('all');
                  setAvailabilityFilter('all');
                  setSourceFilter('all');
                  setSearch('');
                }}
                className="text-[11px] font-mono text-coral hover:underline ml-auto"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

        {/* Empty State */}
        {fabrics.length === 0 && !loading && (
          <div className="text-center py-16 px-4 bg-surface rounded-3xl border border-navy/10">
            <Archive className="w-12 h-12 text-charcoal-muted mx-auto mb-3 opacity-60" />
            <h3 className="font-serif text-xl font-bold text-navy">No fabrics found in stash</h3>
            <p className="text-xs sm:text-sm text-charcoal-muted max-w-md mx-auto mt-1 mb-6">
              {search || materialFilter !== 'all' 
                ? 'Try adjusting your search terms or filters to see your saved materials.' 
                : 'Start your zero-waste journey by saving your first textile remnant or offcut scrap.'}
            </p>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-navy text-paper text-sm font-semibold hover:bg-navy/90"
            >
              <Plus className="w-4 h-4 text-coral" />
              <span>Add Your First Remnant</span>
            </button>
          </div>
        )}

        {/* Fabric Cards: Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {fabrics.map((fabric) => {
              const isAvailable = fabric.availableQuantity > 0;
              return (
                <div 
                  key={fabric.id}
                  className="group bg-surface rounded-2xl border border-navy/15 overflow-hidden shadow-2xs hover:shadow-warm transition-all duration-300 flex flex-col"
                >
                  {/* Photo Header */}
                  <div className="relative aspect-[4/3] bg-paper-200 overflow-hidden">
                    <img 
                      src={fabric.imageUrl} 
                      alt={fabric.name} 
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=800&q=80';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Source & Status Badges */}
                    <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider shadow-sm ${
                        isAvailable ? 'bg-emerald-800 text-white' : 'bg-charcoal text-paper'
                      }`}>
                        {isAvailable ? `${fabric.availableQuantity} Avail` : 'Reserved'}
                      </span>
                      {fabric.source === 'scrap' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gold text-navy shadow-sm">
                          Offcut Scrap
                        </span>
                      )}
                    </div>

                    {fabric.reservedQuantity > 0 && (
                      <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-coral text-white shadow-sm">
                        {fabric.reservedQuantity} Reserved
                      </span>
                    )}
                  </div>

                  {/* Body Info */}
                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-charcoal-muted mb-1">
                        <span className="capitalize">{fabric.material} • {fabric.conditionLabel || fabric.condition}</span>
                        {fabric.storageLocation && (
                          <span className="truncate max-w-[100px]" title={fabric.storageLocation}>
                            📍 {fabric.storageLocation}
                          </span>
                        )}
                      </div>

                      <h3 className="font-serif text-base font-bold text-navy group-hover:text-coral transition-colors line-clamp-1">
                        {fabric.name}
                      </h3>

                      <div className="mt-2 flex items-center gap-1.5 text-xs font-mono font-semibold text-navy">
                        <Ruler className="w-3.5 h-3.5 text-coral" />
                        <span>{fabric.dimensions.length} × {fabric.dimensions.width} {fabric.dimensions.unit}</span>
                        <span className="text-charcoal-muted">•</span>
                        <span className="text-charcoal-muted">{fabric.dominantColor}</span>
                      </div>

                      {fabric.notes && (
                        <p className="mt-2 text-xs text-charcoal-muted line-clamp-2 italic">
                          "{fabric.notes}"
                        </p>
                      )}
                    </div>

                    {/* Action Footers */}
                    <div className="mt-4 pt-3 border-t border-navy/10 flex items-center justify-between gap-2">
                      <button
                        onClick={() => onSelectFabricForPlanner(fabric)}
                        className="flex-grow inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy text-paper text-xs font-medium hover:bg-navy/85 transition-colors"
                        title="Find Projects"
                      >
                        <Compass className="w-3.5 h-3.5 text-coral" />
                        <span>Find Projects</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onSendToStudio(fabric)}
                          className="p-1.5 rounded-lg text-charcoal-muted hover:text-coral hover:bg-coral/10"
                          title="Design in AI Studio"
                          aria-label="Design in AI Studio"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(fabric)}
                          className="p-1.5 rounded-lg text-charcoal-muted hover:text-navy hover:bg-navy/5"
                          title="Edit Details"
                          aria-label="Edit fabric details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingFabric(fabric)}
                          className="p-1.5 rounded-lg text-charcoal-muted hover:text-coral hover:bg-coral/10"
                          title="Delete Fabric"
                          aria-label="Delete fabric"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Fabric Cards: List View */}
        {viewMode === 'list' && (
          <div className="bg-surface rounded-2xl border border-navy/15 overflow-hidden shadow-sm divide-y divide-navy/10">
            {fabrics.map((fabric) => (
              <div key={fabric.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-paper-50 transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={fabric.imageUrl}
                    alt={fabric.name}
                    className="w-14 h-14 rounded-xl object-cover border border-navy/15 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="font-serif text-base font-bold text-navy truncate">
                      {fabric.name}
                    </h4>
                    <div className="text-xs font-mono text-charcoal-muted flex flex-wrap gap-2 mt-0.5">
                      <span>{fabric.material}</span>
                      <span>•</span>
                      <span>{fabric.dimensions.length}×{fabric.dimensions.width} {fabric.dimensions.unit}</span>
                      <span>•</span>
                      <span>{fabric.dominantColor}</span>
                      <span>•</span>
                      <span className="capitalize">{fabric.condition}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                    fabric.availableQuantity > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-charcoal/10 text-charcoal'
                  }`}>
                    {fabric.availableQuantity} available
                  </span>

                  <button
                    onClick={() => onSelectFabricForPlanner(fabric)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-navy text-paper text-xs font-semibold hover:bg-navy/90"
                  >
                    <Compass className="w-3.5 h-3.5 text-coral" />
                    <span>Find Projects</span>
                  </button>

                  <button
                    onClick={() => onSendToStudio(fabric)}
                    className="p-1.5 text-charcoal-muted hover:text-coral"
                    title="Design in AI Studio"
                    aria-label="Design in AI Studio"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => openEditModal(fabric)}
                    className="p-1.5 text-charcoal-muted hover:text-navy"
                    aria-label="Edit fabric"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeletingFabric(fabric)}
                    className="p-1.5 text-charcoal-muted hover:text-coral"
                    aria-label="Delete fabric"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* --- ADD / EDIT FABRIC MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-navy/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn" role="dialog" aria-modal="true">
          <div className="relative w-full max-w-2xl bg-paper rounded-3xl overflow-hidden border border-navy/20 shadow-2xl max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-navy/10 bg-paper-100 flex-shrink-0">
              <h3 className="font-serif text-lg font-bold text-navy flex items-center gap-2">
                <Box className="w-4 h-4 text-coral" />
                <span>{editingFabric ? 'Edit Fabric Remnant' : 'Add New Fabric to Stash'}</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full text-charcoal-muted hover:text-navy hover:bg-navy/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveFabric} className="p-6 overflow-y-auto space-y-6 flex-grow">
              
              {/* Photo Upload Area */}
              <div>
                <label className="block text-xs font-bold font-mono uppercase text-navy mb-2">
                  Fabric Photograph & Visual Swatch
                </label>
                <div className="flex items-center gap-4">
                  <img
                    src={formImage}
                    alt="Preview"
                    className="w-20 h-20 rounded-2xl object-cover border border-navy/20 shadow-inner flex-shrink-0"
                  />
                  <div className="flex-grow">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageFileChange}
                      className="text-xs file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-navy file:text-paper hover:file:bg-navy/80 cursor-pointer"
                    />
                    <p className="text-[11px] text-charcoal-muted mt-1.5">
                      Upload a photo to automatically analyze color, pattern, and weave structure using Google Vision.
                    </p>
                  </div>
                </div>

                {/* AI Inspection Status Bar */}
                {aiInspectionStatus && (
                  <div className="mt-3 p-3 rounded-xl bg-bluegray border border-bluegray-300 text-xs text-navy flex items-start gap-2 animate-fadeIn">
                    <Sparkles className="w-4 h-4 text-coral flex-shrink-0 mt-0.5 animate-pulse" />
                    <span>{aiInspectionStatus}</span>
                  </div>
                )}
              </div>

              {/* Name & Material */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold font-mono uppercase text-navy mb-1">
                    Fabric Label / Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Raw Indigo Twill Remnant"
                    className="w-full px-3.5 py-2 rounded-xl border border-navy/15 text-xs sm:text-sm bg-surface text-navy focus:outline-none focus:ring-2 focus:ring-navy/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold font-mono uppercase text-navy mb-1">
                    Primary Fiber / Material
                  </label>
                  <select
                    value={formMaterial}
                    onChange={(e) => setFormMaterial(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-navy/15 text-xs sm:text-sm bg-surface text-navy focus:outline-none focus:ring-2 focus:ring-navy/20"
                  >
                    <option value="cotton">Cotton / Canvas</option>
                    <option value="denim">Denim / Heavy Twill</option>
                    <option value="linen">Linen / Flax</option>
                    <option value="silk">Silk / Satin</option>
                    <option value="wool">Wool / Tweed</option>
                    <option value="corduroy">Corduroy / Velvet</option>
                    <option value="polyester">Polyester / Synthetic</option>
                    <option value="blend">Fiber Blend</option>
                    <option value="other">Other Textile</option>
                  </select>
                </div>
              </div>

              {/* Color & Pattern */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold font-mono uppercase text-navy mb-1">
                    Observed Dominant Color
                  </label>
                  <input
                    type="text"
                    value={formDominantColor}
                    onChange={(e) => setFormDominantColor(e.target.value)}
                    placeholder="e.g. Deep Indigo, Terracotta Red"
                    className="w-full px-3.5 py-2 rounded-xl border border-navy/15 text-xs sm:text-sm bg-surface text-navy focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold font-mono uppercase text-navy mb-1">
                    Pattern / Weave Texture
                  </label>
                  <input
                    type="text"
                    value={formPattern}
                    onChange={(e) => setFormPattern(e.target.value)}
                    placeholder="e.g. 3x1 Twill, Floral Print, Slub"
                    className="w-full px-3.5 py-2 rounded-xl border border-navy/15 text-xs sm:text-sm bg-surface text-navy focus:outline-none"
                  />
                </div>
              </div>

              {/* Dimensions (Length & Width) & Units */}
              <div className="p-4 rounded-2xl bg-surface border border-navy/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold font-mono uppercase text-navy flex items-center gap-1.5">
                    <Ruler className="w-3.5 h-3.5 text-coral" />
                    Physical Dimensions *
                  </label>
                  <div className="flex items-center gap-1 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setFormUnit('cm')}
                      className={`px-2.5 py-0.5 rounded-md ${formUnit === 'cm' ? 'bg-navy text-paper font-bold' : 'text-charcoal-muted'}`}
                    >
                      CM
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormUnit('in')}
                      className={`px-2.5 py-0.5 rounded-md ${formUnit === 'in' ? 'bg-navy text-paper font-bold' : 'text-charcoal-muted'}`}
                    >
                      INCH
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] font-mono text-charcoal-muted block mb-1">Length</span>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formLength}
                      onChange={(e) => setFormLength(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3.5 py-2 rounded-xl border border-navy/15 text-xs sm:text-sm bg-paper text-navy focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-charcoal-muted block mb-1">Width</span>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formWidth}
                      onChange={(e) => setFormWidth(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3.5 py-2 rounded-xl border border-navy/15 text-xs sm:text-sm bg-paper text-navy focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Condition & Source */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold font-mono uppercase text-navy mb-1">
                    Textile Condition
                  </label>
                  <select
                    value={formCondition}
                    onChange={(e) => setFormCondition(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-navy/15 text-xs bg-surface text-navy"
                  >
                    <option value="new">Crisp Remnant</option>
                    <option value="good">Gently Washed</option>
                    <option value="worn">Vintage Worn</option>
                    <option value="damaged">Frayed / Damaged</option>
                    <option value="needs_repair">Needs Mending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold font-mono uppercase text-navy mb-1">
                    Origin Source
                  </label>
                  <select
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-navy/15 text-xs bg-surface text-navy"
                  >
                    <option value="purchased">Purchased Remnant</option>
                    <option value="leftover">Project Leftover</option>
                    <option value="scrap">Offcut Scrap</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold font-mono uppercase text-navy mb-1">
                    Piece Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formTotalQty}
                    onChange={(e) => setFormTotalQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full px-3 py-2 rounded-xl border border-navy/15 text-xs bg-surface text-navy"
                  />
                </div>
              </div>

              {/* Storage Location & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold font-mono uppercase text-navy mb-1">
                    Storage Location (Optional)
                  </label>
                  <input
                    type="text"
                    value={formStorageLocation}
                    onChange={(e) => setFormStorageLocation(e.target.value)}
                    placeholder="e.g. Studio Bin B, Shelf 2"
                    className="w-full px-3.5 py-2 rounded-xl border border-navy/15 text-xs bg-surface text-navy"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold font-mono uppercase text-navy mb-1">
                    Est. Value / Cost (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formPurchaseCost}
                    onChange={(e) => setFormPurchaseCost(e.target.value ? Number(e.target.value) : '')}
                    placeholder="$8.50"
                    className="w-full px-3.5 py-2 rounded-xl border border-navy/15 text-xs bg-surface text-navy"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold font-mono uppercase text-navy mb-1">
                  Makers Notes & Heritage Details
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Notes on fiber source, selvedge features, or inspiration..."
                  className="w-full px-3.5 py-2 rounded-xl border border-navy/15 text-xs bg-surface text-navy focus:outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-navy/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-full border border-navy/20 text-xs font-semibold text-navy hover:bg-navy/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAiInspecting}
                  className="px-6 py-2.5 rounded-full bg-navy text-paper text-xs font-semibold hover:bg-navy/90 shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  {editingFabric ? 'Save Changes' : 'Add to Stash'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {deletingFabric && (
        <div className="fixed inset-0 z-50 bg-navy/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" role="dialog" aria-modal="true">
          <div className="bg-paper p-6 rounded-3xl max-w-md w-full border border-navy/20 shadow-2xl">
            <h4 className="font-serif text-lg font-bold text-navy flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-coral" />
              <span>Confirm Fabric Removal</span>
            </h4>
            <p className="text-xs sm:text-sm text-charcoal-muted mt-2 leading-relaxed">
              Are you sure you want to remove <strong className="text-navy">{deletingFabric.name}</strong> from your fabric stash?
              This action cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeletingFabric(null)}
                className="px-4 py-2 rounded-full border border-navy/20 text-xs font-semibold text-navy hover:bg-navy/5"
              >
                Keep in Stash
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-full bg-coral text-white text-xs font-semibold hover:bg-coral/90 shadow-sm"
              >
                Delete Fabric
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
