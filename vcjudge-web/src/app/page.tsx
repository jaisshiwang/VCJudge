'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import AuthGate from '@/components/AuthGate';
import ScoreRing from '@/components/ScoreRing';
import { PITCHES } from '@/lib/data';

export default function Home() {
  const [q, setQ] = useState('');
  const [sector, setSector] = useState('All');
  const [sortBy, setSortBy] = useState<'score'|'name'|'updated'>('score');
  const [dir, setDir] = useState<'asc'|'desc'>('desc');

  const SECTORS = ['All','HealthTech','AI','FinTech','EdTech','DeepTech','Cannabis'];

  const rows = useMemo(() => {
    let arr = PITCHES.filter(d =>
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
    <AuthGate>
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
              <Link href="/analyze" style={{ textDecoration:'none' }}>
                <button style={{...styles.btn, ...styles.primary}}>Analyze New</button>
              </Link>
            </div>
          </div>

          <div style={styles.list}>
            {rows.map(row => (
              <div key={row.id} style={styles.card}>
                <div>
                  <Link href={`/pitches/${row.id}`} style={{ textDecoration:'none', color:'#111827' }}>
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
    </AuthGate>
  );
}