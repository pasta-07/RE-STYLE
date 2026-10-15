/**
 * Re:Style 2.0 Frontend API Client
 * Interfaces with the backend store, recommendation engine, PDF export, and sharing services.
 */

const API_BASE = '/api';

export interface StashFabricItem {
  id: string;
  name: string;
  imageUrl: string;
  material: string;
  materialLabel?: string;
  dominantColor: string;
  secondaryColors?: string[];
  pattern: string;
  dimensions: {
    length: number;
    width: number;
    unit: 'cm' | 'in';
  };
  shape?: 'rectangular' | 'strip' | 'irregular' | 'circular' | 'offcut';
  totalQuantity: number;
  reservedQuantity: number;
  consumedQuantity: number;
  availableQuantity: number;
  condition: 'new' | 'good' | 'worn' | 'damaged' | 'needs_repair';
  conditionLabel?: string;
  stretch?: 'none' | 'low' | 'medium' | 'high';
  thickness?: 'light' | 'medium' | 'heavy';
  weightGsm?: number;
  purchaseCost?: number | null;
  storageLocation?: string;
  notes?: string;
  source: 'purchased' | 'leftover' | 'scrap';
  parentFabricId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PatternPiece {
  name: string;
  count: number;
  width: number;
  height: number;
  unit: string;
  notes?: string;
}

export interface CuttingPlan {
  patternPieces: PatternPiece[];
  seamAllowance: string;
  grainline: string;
  cuttingOrder: string[];
  remainingFabricNotes: string;
}

export interface ProjectStep {
  step: number;
  title: string;
  description: string;
  tip?: string;
  completed: boolean;
  completedAt?: string | null;
}

export interface SavedProjectItem {
  id: string;
  blueprintId: string;
  title: string;
  subtitle?: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  timeEstimate: string;
  imageUrl: string;
  fabricId: string | null;
  fabric?: StashFabricItem | null;
  fabricAllocated?: {
    length: number;
    width: number;
    unit: 'cm' | 'in';
    areaCm2?: number;
  } | null;
  fabricConsumed?: {
    consumedQuantity: number;
    consumedLength?: number;
    consumedWidth?: number;
    unit?: string;
    confirmedAt?: string;
  } | null;
  leftoversConfirmed?: {
    confirmed: boolean;
    length: number;
    width: number;
    unit: string;
    pieces: number;
    stashFabricId?: string;
    notes?: string;
    recordedAt?: string;
  } | null;
  status: 'planned' | 'ready' | 'in_progress' | 'paused' | 'completed' | 'abandoned';
  isFavourite: boolean;
  materialsNeeded: Array<{ name: string; required?: boolean }>;
  toolsNeeded: string[];
  steps: ProjectStep[];
  cuttingPlan: CuttingPlan;
  suitabilityReason?: string;
  matchScore?: number;
  personalNotes?: string;
  progressPhotos?: string[];
  startDate?: string | null;
  completedDate?: string | null;
  totalTimeSpentMinutes?: number;
  sessionsCount?: number;
  completedStepCount?: number;
  totalStepCount?: number;
  progressPercent?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectSession {
  id: string;
  projectId: string;
  date: string;
  durationMinutes: number;
  notes: string;
  createdAt: string;
}

export interface RecommendedProject {
  id: string;
  blueprintId?: string;
  title: string;
  subtitle: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  timeEstimate: string;
  timeMinutes: number;
  fabricRequired: string;
  minDimensions: { length: number; width: number; unit: 'cm' | 'in' };
  minAreaCm2: number;
  matchScore: number;
  feasibility: {
    status: 'feasible' | 'tight' | 'insufficient_material' | 'unknown';
    confidence: string;
    notes: string;
  };
  consumptionEstimate: string;
  leftoverEstimate: string;
  suitabilityReason: string;
  explanations: string[];
  imageUrl: string;
  requiredTools: string[];
  optionalTools?: string[];
  materialsNeeded: Array<{ name: string; required?: boolean }>;
  cuttingPlan: CuttingPlan;
  steps: ProjectStep[];
}

export interface MakerStats {
  projects: {
    total: number;
    planned: number;
    inProgress: number;
    completed: number;
    paused: number;
    abandoned: number;
  };
  time: {
    totalMinutes: number;
    totalHours: number;
    sessionsLogged: number;
  };
  fabric: {
    totalPieces: number;
    availablePieces: number;
    reservedPieces: number;
    scrapsInStash: number;
    scrapsAddedFromProjects: number;
    availableAreaSqM: number;
    confirmedConsumedAreaSqM: number;
  };
  sustainability: {
    confirmedConsumedExplanation: string;
    scrapsRetainedExplanation: string;
    methodologyNotes: string;
  };
}

// --- FABRIC STASH API ---

export async function fetchFabrics(filters: Record<string, any> = {}): Promise<StashFabricItem[]> {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '' && v !== 'all') {
      query.set(k, String(v));
    }
  });

  const res = await fetch(`${API_BASE}/fabrics?${query.toString()}`);
  if (!res.ok) throw new Error(`Failed to load fabrics (HTTP ${res.status})`);
  const data = await res.json();
  return data.fabrics || [];
}

export async function fetchFabricById(id: string): Promise<{ fabric: StashFabricItem; associatedProjects: any[]; movements: any[] }> {
  const res = await fetch(`${API_BASE}/fabrics/${id}`);
  if (!res.ok) throw new Error(`Fabric #${id} not found`);
  return res.json();
}

export async function createFabric(payload: Partial<StashFabricItem>): Promise<StashFabricItem> {
  const res = await fetch(`${API_BASE}/fabrics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to create fabric (HTTP ${res.status})`);
  }
  const data = await res.json();
  return data.fabric;
}

export async function updateFabric(id: string, payload: Partial<StashFabricItem>): Promise<StashFabricItem> {
  const res = await fetch(`${API_BASE}/fabrics/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to update fabric (HTTP ${res.status})`);
  }
  const data = await res.json();
  return data.fabric;
}

export async function deleteFabric(id: string): Promise<{ success: boolean; deletedId: string }> {
  const res = await fetch(`${API_BASE}/fabrics/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to delete fabric (HTTP ${res.status})`);
  }
  return res.json();
}

// --- PROJECT PLANNER & RECOMMENDATIONS API ---

export async function fetchProjectRecommendations(payload: {
  fabricId?: string;
  fabric?: any;
  preferences?: {
    skill?: string;
    tools?: string[];
    time?: string;
    intendedUse?: string;
    budget?: string;
    style?: string;
  };
}): Promise<RecommendedProject[]> {
  const res = await fetch(`${API_BASE}/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to fetch recommendations`);
  }
  const data = await res.json();
  return data.recommendations || [];
}

// --- SAVED PROJECTS API ---

export async function fetchProjects(filters: Record<string, any> = {}): Promise<SavedProjectItem[]> {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '' && v !== 'all') {
      query.set(k, String(v));
    }
  });

  const res = await fetch(`${API_BASE}/projects?${query.toString()}`);
  if (!res.ok) throw new Error(`Failed to load projects`);
  const data = await res.json();
  return data.projects || [];
}

export async function fetchProjectById(id: string): Promise<SavedProjectItem> {
  const res = await fetch(`${API_BASE}/projects/${id}`);
  if (!res.ok) throw new Error(`Project #${id} not found`);
  const data = await res.json();
  return data.project;
}

export async function saveProject(payload: Partial<SavedProjectItem>): Promise<SavedProjectItem> {
  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to save project');
  }
  const data = await res.json();
  return data.project;
}

export async function updateProject(id: string, payload: Partial<SavedProjectItem>): Promise<SavedProjectItem> {
  const res = await fetch(`${API_BASE}/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update project');
  }
  const data = await res.json();
  return data.project;
}

export async function updateProjectStatus(
  id: string, 
  status: string, 
  details: {
    consumedQuantity?: number;
    consumedLength?: number;
    consumedWidth?: number;
    leftovers?: {
      confirmed: boolean;
      length: number;
      width: number;
      unit: string;
      pieces: number;
      notes?: string;
    };
  } = {}
): Promise<SavedProjectItem> {
  const res = await fetch(`${API_BASE}/projects/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, details })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update project status');
  }
  const data = await res.json();
  return data.project;
}

export async function updateProjectStep(id: string, stepIndex: number, completed: boolean): Promise<SavedProjectItem> {
  const res = await fetch(`${API_BASE}/projects/${id}/steps/${stepIndex}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update step');
  }
  const data = await res.json();
  return data.project;
}

export async function deleteProject(id: string): Promise<{ success: boolean; deletedId: string }> {
  const res = await fetch(`${API_BASE}/projects/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete project');
  }
  return res.json();
}

// --- TIME SESSIONS API ---

export async function logProjectSession(projectId: string, sessionData: { durationMinutes: number; notes?: string; date?: string }): Promise<ProjectSession> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sessionData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to log crafting session');
  }
  const data = await res.json();
  return data.session;
}

export async function deleteProjectSession(projectId: string, sessionId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/sessions/${sessionId}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete session');
  }
  return res.json();
}

// --- PDF EXPORT ACTIONS ---

export async function downloadProjectPdf(projectId: string, filename = 'blueprint.pdf'): Promise<void> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/pdf`);
  if (!res.ok) throw new Error('Failed to generate project PDF');

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export async function downloadBlueprintPdf(blueprint: any, fabric: any, filename = 'blueprint.pdf'): Promise<void> {
  const res = await fetch(`${API_BASE}/export-blueprint-pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blueprint, fabric })
  });
  if (!res.ok) throw new Error('Failed to export blueprint PDF');

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

// --- SHARING API ---

export async function createShareLink(projectId: string): Promise<{ token: string; shareUrl: string }> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/share`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate share link');
  }
  return res.json();
}

export async function fetchSharedProject(token: string): Promise<any> {
  const res = await fetch(`${API_BASE}/share/${token}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Shared project not found or expired');
  }
  const data = await res.json();
  return data.project;
}

export async function revokeShareLink(projectId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/share`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to revoke share link');
  return res.json();
}

// --- MAKER STATS API ---

export async function fetchMakerStats(): Promise<MakerStats> {
  const res = await fetch(`${API_BASE}/maker-stats`);
  if (!res.ok) throw new Error('Failed to fetch maker statistics');
  const data = await res.json();
  return data.stats;
}
