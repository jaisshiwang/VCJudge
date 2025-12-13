// Dummy data shared by list + detail pages (replace with API later)
export type Pitch = {
  id: string;
  name: string;
  sector: string;
  score: number;      
  updated: string;
};

export const PITCHES: Pitch[] = [
  { id: 's1',  name: 'Startup 1',  sector: 'HealthTech', score: 78, updated: '2025-10-25' },
  { id: 's2',  name: 'Startup 2',  sector: 'AI',         score: 91, updated: '2025-10-24' },
  { id: 's3',  name: 'Startup 3',  sector: 'EdTech',     score: 51, updated: '2025-09-15' },
  { id: 's4',  name: 'Startup 4',  sector: 'DeepTech',   score: 82, updated: '2025-10-12' },
  { id: 's50', name: 'Startup 50', sector: 'Cannabis',   score: 63, updated: '2025-08-30' },
];