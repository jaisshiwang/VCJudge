'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';

// ---- Dummy data (replace with API later) ----
const DUMMY: Array<{
  id: string;
  name: string;
  sector: string;
  score: number;     // 0..100
  updated: string;   // ISO date
}> = [
  { id: 's1',  name: 'Startup 1',  sector: 'HealthTech', score: 78, updated: '2025-10-25' },
  { id: 's2',  name: 'Startup 2',  sector: 'AI',         score: 91, updated: '2025-10-24' },
  { id: 's3',  name: 'Startup 3',  sector: 'EdTech',     score: 51, updated: '2025-09-15' },
  { id: 's4',  name: 'Startup 4',  sector: 'DeepTech',   score: 82, updated: '2025-10-12' },
  { id: 's50', name: 'Startup 50', sector: 'Cannabis',   score: 63, updated: '2025-08-30' },
];

const SECTORS = ['All','HealthTech','AI','FinTech','EdTech','DeepTech','Cannabis'];

function ScoreRing({ value }: { value: number }) {
  const r = 16;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const dash = (pct / 100) * c;

  return (
    <svg width={48} height={48} viewBox="0 0 48 48" aria-label={`Score ${pct}`}>
      <circle cx={24} cy={24} r={r} stroke="#e5e7eb" strokeWidth={8} fill="none" />
      <circle
        cx={24} cy={24} r={r}
        stroke="#2563eb" strokeWidth={8} fill="none"
        strokeDasharray={`${dash} ${c - dash}`}
        strokeLinecap="round"
        transform="rotate(-90 24 24)"
      />
      <text x="50%" y="52%" dominantBaseline="middle" textAnchor="middle"
            fontSize="11" fontWeight={700} fill="#111827">{pct}</text>
    </svg>
  );
}

export default function PitchesPage() {
  const [q, setQ] = useState('');
  const [sector, setSector] = useState('All');
  const [sortBy, setSortBy] = useState<'score'|'name'|'updated'>('score');
  const [dir, setDir] = useState<'asc'|'desc'>('desc');

  const rows = useMemo(() => {
    let arr = DUMMY.filter(d =>
      (sector === 'All' || d.sector === sector) &&
      (q.trim() === '' || d.name.toLowerCase().includes(q.toLowerCase()))
    );
    arr = arr.sort((a,b) => {
      const mul = dir === 'asc' ? 1 : -1;
      if (sortBy === 'score')   return mul * (a.score - b.score);
      if (sortBy === 'name')    return mul * a.name.localeCompare(b.name);
      return mul * (new Date(a.updated).getTime() - new Date(b.updated).getTime());
    });
    return arr;
  }, [q, sector, sortBy, dir]);

  const styles: Record<string, React.CSSProperties> = {
    page: { minHeight: '100dvh', background: 'linear-gradient(180deg, #f0f9ff 0%, #ecfeff 35%, #f5f3ff 100%)' },
    container: { maxWidth: 1000, margin: '2rem auto', padding: '0 16px', fontFamily: 'Inter, ui-sans-serif, system-ui' },
    header: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 16 },
    h1: { fontSize: 26, fontWeight: 800, margin: 0 },
    controls: { display:'flex', gap: 10, flexWrap:'wrap', alignItems:'center' },
    chip: { padding:'6px 10px', borderRadius: 999, background:'#eef2ff', border:'1px solid #e5e7eb', fontSize:12 },
    card: { background:'#fff', border:'1px solid rgba(17,24,39,0.08)', borderRadius: 14, padding: 12, display:'grid', gridTemplateColumns:'1fr auto auto', alignItems:'center', gap: 10, boxShadow:'0 6px 16px rgba(2,6,23,0.06)' },
    name: { fontWeight: 700, fontSize: 16 },
    meta: { color:'#374151', fontSize: 12 },
    btn: { padding:'8px 12px', borderRadius: 10, border:'1px solid #e5e7eb', background:'#fff', cursor:'pointer' },
    primary: { background:'linear-gradient(180deg,#3b82f6,#2563eb)', color:'#fff', border:'1px solid #1d4ed8' },
    list: { display:'grid', gap: 12 },
    input: { padding:'8px 10px', borderRadius:10, border:'1px solid #e5e7eb', background:'#fff' }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.h1}>All Pitches</h1>
          <div style={styles.controls}>
            <input placeholder="Search" value={q} onChange={e=>setQ(e.target.value)} style={styles.input} />
            <select value={sector} onChange={e=>setSector(e.target.value)} style={styles.input}>
              {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={sortBy} onChange={e=>setSortBy(e.target.value as 'score' | 'name' | 'updated')} style={styles.input}>
              <option value="score">Sort: Score</option>
              <option value="name">Sort: Name</option>
              <option value="updated">Sort: Updated</option>
            </select>
            <button onClick={() => setDir(dir==='asc' ? 'desc' : 'asc')} style={styles.btn}>Dir: {dir}</button>
            <Link href="/" style={{ textDecoration:'none' }}>
              <button style={{...styles.btn, ...styles.primary}}>Analyze New</button>
            </Link>
          </div>
        </div>

        <div style={styles.list}>
          {rows.map(row => (
            <div key={row.id} style={styles.card}>
              <div>
                <Link href={`/?id=${row.id}`} style={{ textDecoration:'none', color:'#111827' }}>
                  <div style={styles.name}>{row.name}</div>
                </Link>
                <div style={{ display:'flex', gap:8, alignItems:'center', marginTop:4 }}>
                  <span style={styles.chip}>{row.sector}</span>
                  <span style={styles.meta}>Updated: {new Date(row.updated).toLocaleDateString('en-GB')}</span>
                </div>
              </div>
              <div style={{ fontWeight:700 }}>{row.score}/100</div>
              <ScoreRing value={row.score} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}