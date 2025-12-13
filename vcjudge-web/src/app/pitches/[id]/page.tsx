'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthGate from '@/components/AuthGate';
import { PITCHES } from '@/lib/data';
import ScoreRing from '@/components/ScoreRing';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

type ParsedResponse = {
  report?: string;
  executive_summary?: string;
  strengths?: string[];
  weaknesses?: string[];
  scores?: Record<string, number>;
  overall_score?: number;
  status?: string;
  download?: string;
};

export default function PitchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<ParsedResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const pitch = useMemo(() => PITCHES.find(p => p.id === id), [id]);

  useEffect(() => {
    if (!pitch) return;
    // For now, fake fetch: in future, GET from backend by pitch-id
    // setData(...) from storage; here we just leave null until analyzed is integrated.
  }, [pitch]);

  const styles = {
    pageWrap: { minHeight: '100dvh', background: 'linear-gradient(180deg, #f0f9ff 0%, #ecfeff 35%, #f5f3ff 100%)' },
    container: { maxWidth: 1100, margin: '2rem auto', padding: '0 1rem', fontFamily: 'Inter, ui-sans-serif, system-ui' } as React.CSSProperties,
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' } as React.CSSProperties,
    card: { border: '1px solid rgba(17,24,39,0.08)', borderRadius: 16, padding: 16, background: '#fff', boxShadow: '0 10px 24px rgba(2,6,23,0.06)' } as React.CSSProperties,
    grid2: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 } as React.CSSProperties,
    list: { margin: 0, paddingLeft: 18 } as React.CSSProperties,
  };

  if (!pitch) return <AuthGate><div style={{ padding: 24 }}>Pitch not found. <button onClick={()=>router.push('/')}>Go back</button></div></AuthGate>;

  return (
    <AuthGate>
      <div style={styles.pageWrap}>
        <main style={styles.container}>
          <div style={styles.row}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>{pitch.name}</h1>
              <span style={{ padding: '4px 10px', borderRadius: 999, background: '#eef2ff', border: '1px solid #e5e7eb', fontSize: 12 }}>{pitch.sector}</span>
              <ScoreRing value={pitch.score} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Link href="/" style={{ textDecoration: 'none' }}>
                <button style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff' }}>← All Pitches</button>
              </Link>
              <Link href="/analyze" style={{ textDecoration: 'none' }}>
                <button style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff' }}>Analyze New</button>
              </Link>
            </div>
          </div>

          {/* Read-only report view. If you already analyzed & stored results, show them; otherwise placeholder. */}
          <section style={{ ...styles.card, marginTop: 16 }}>
            <h2 style={{ marginTop: 0 }}>EXECUTIVE SUMMARY</h2>
            {data?.executive_summary ? (
              <p style={{ whiteSpace: 'pre-wrap' }}>{data.executive_summary}</p>
            ) : (
              <p style={{ color: '#6b7280' }}>No saved analysis yet for this pitch. (Hook this to your API storage.)</p>
            )}
          </section>

          <section style={{ ...styles.card, marginTop: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <h3>STRENGTH</h3>
                <ul style={styles.list}>
                  {(data?.strengths || []).map((s, i) => <li key={`s-${i}`}>{s}</li>)}
                </ul>
              </div>
              <div>
                <h3>WEAKNESS</h3>
                <ul style={styles.list}>
                  {(data?.weaknesses || []).map((w, i) => <li key={`w-${i}`}>{w}</li>)}
                </ul>
              </div>
            </div>
          </section>

          <section style={{ ...styles.card, marginTop: 16 }}>
            <h3 style={{ marginTop: 0 }}>FULL LLM REPORT</h3>
            {data?.report ? <pre style={{ whiteSpace: 'pre-wrap' }}>{data.report}</pre> : <p style={{ color: '#6b7280' }}>—</p>}
          </section>
        </main>
      </div>
    </AuthGate>
  );
}