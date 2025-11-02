'use client';

import React, { useEffect, useMemo, useState } from 'react';

// === Config ===
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

// === Types aligned to API ===
type ParsedResponse = {
  report: string | unknown;
  executive_summary: string | unknown;
  strengths: unknown;
  weaknesses: unknown;
  scores: Record<string, number> | unknown;
  overall_score: number | null | unknown;
  status: 'accepted' | 'rejected' | 'under_review' | string | unknown;
  download?: string;
};

// Safe guards to keep JSX happy even if API returns odd shapes
const asString = (v: unknown, fallback = ''): string =>
  typeof v === 'string' ? v : v ? JSON.stringify(v, null, 2) : fallback;
const asStringArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))) : [];
const asNumberRecord = (v: unknown): Record<string, number> => {
  if (!v || typeof v !== 'object') return {};
  const out: Record<string, number> = {};
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
    const num = typeof val === 'number' ? val : Number(val);
    if (!Number.isNaN(num)) out[k] = num;
  }
  return out;
};
const asStatus = (v: unknown): 'accepted' | 'rejected' | 'under_review' | string =>
  typeof v === 'string' ? v : 'under_review';

export default function Page() {
  // UI state
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<ParsedResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [showReport, setShowReport] = useState(true);
  const [today, setToday] = useState('');
  const [hovered, setHovered] = useState<string | null>(null);

  // Avoid hydration mismatch for locale date
  useEffect(() => {
    setToday(
      new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    );
  }, []);

  // Derived values
  const prettySize = useMemo(() => {
    if (!file) return '';
    const kb = file.size / 1024;
    return kb < 1024 ? `${kb.toFixed(1)} KB` : `${(kb / 1024).toFixed(2)} MB`;
  }, [file]);

  const title = useMemo(() => (file?.name ? file.name.replace(/\.[^.]+$/, '') : 'HyperVC'), [file]);

  const normalized = useMemo(() => {
    if (!data) return null;
    return {
      report: asString(data.report),
      executive_summary: asString(data.executive_summary),
      strengths: asStringArray(data.strengths),
      weaknesses: asStringArray(data.weaknesses),
      scores: asNumberRecord(data.scores),
      overall_score:
        typeof data.overall_score === 'number' && isFinite(data.overall_score)
          ? data.overall_score
          : null,
      status: asStatus(data.status),
      download: data.download,
    };
  }, [data]);

  // Actions
  async function onUpload() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${API_BASE}/api/analyze`, { method: 'POST', body: form });
      const json = (await res.json()) as Partial<ParsedResponse> | null;
      if (!res.ok) {
        // prefer an API-provided message if present
        const apiMessage =
          json && typeof json === 'object' && 'report' in json ? (json as Partial<ParsedResponse>).report : null;
        throw new Error(asString(apiMessage) || `Analyze failed (${res.status})`);
      }
      setData(json as ParsedResponse);
      setShowReport(true);
    } catch (err: unknown) {
      let msg = 'Something went wrong';
      if (err instanceof Error) msg = err.message;
      else if (typeof err === 'string') msg = err;
      else {
        try {
          msg = JSON.stringify(err);
        } catch {}
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function statusChip(s?: string) {
    const base: React.CSSProperties = {
      display: 'inline-flex', gap: '.4rem', padding: '.3rem .7rem', borderRadius: 999, fontSize: 12, border: '1px solid', alignItems: 'center', fontWeight: 700,
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    };
    if (s === 'accepted') return <span style={{ ...base, background: 'rgba(16,185,129,0.12)', borderColor: 'rgba(16,185,129,0.5)', color: '#065f46' }}>✅ Accepted</span>;
    if (s === 'rejected') return <span style={{ ...base, background: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.45)', color: '#7f1d1d' }}>⛔ Rejected</span>;
    return <span style={{ ...base, background: 'rgba(245,158,11,0.14)', borderColor: 'rgba(245,158,11,0.45)', color: '#7c2d12' }}>🕒 Under Review</span>;
  }

  // === Styles ===
  const styles = {
    pageWrap: {
      minHeight: '100dvh',
      background: 'linear-gradient(180deg, #f0f9ff 0%, #ecfeff 35%, #f5f3ff 100%)',
    } as React.CSSProperties,
    banner: {
      background: 'linear-gradient(90deg, #3b82f6 0%, #06b6d4 60%, #10b981 100%)',
      color: '#fff',
      padding: '28px 0',
      boxShadow: '0 10px 25px rgba(2, 132, 199, 0.25)',
      borderBottom: '1px solid rgba(255,255,255,0.25)'
    } as React.CSSProperties,
    bannerInner: {
      maxWidth: 1100,
      margin: '0 auto',
      padding: '0 16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    } as React.CSSProperties,
    bannerTitle: { fontSize: 24, fontWeight: 800, letterSpacing: 0.2 } as React.CSSProperties,

    container: { maxWidth: 1100, margin: '2rem auto', padding: '0 1rem', fontFamily: 'Inter, ui-sans-serif, system-ui' } as React.CSSProperties,
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 } as React.CSSProperties,
    h1: { fontSize: 28, fontWeight: 800, margin: 0, background: 'linear-gradient(90deg,#111827,#334155)', WebkitBackgroundClip: 'text', color: 'transparent' } as React.CSSProperties,
    tag: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, background: 'rgba(17,24,39,0.05)', fontSize: 12, border: '1px solid rgba(17,24,39,0.08)' } as React.CSSProperties,

    btn: { padding: '10px 14px', borderRadius: 12, border: '1px solid #1d4ed8', background: 'linear-gradient(180deg,#3b82f6,#2563eb)', color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 16px rgba(37,99,235,0.35)', transition: 'transform .12s ease, filter .12s ease' } as React.CSSProperties,
    btnGhost: { padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(17,24,39,0.12)', background: 'rgba(255,255,255,0.7)', backdropFilter: 'saturate(120%) blur(2px)', color: '#111827', fontWeight: 600, cursor: 'pointer', transition: 'transform .12s ease, filter .12s ease', boxShadow: '0 3px 12px rgba(0,0,0,0.06)' } as React.CSSProperties,
    btnDisabled: { opacity: 0.6, cursor: 'not-allowed' } as React.CSSProperties,

    card: { border: '1px solid rgba(17,24,39,0.08)', borderRadius: 16, padding: 16, background: '#fff', boxShadow: '0 10px 24px rgba(2,6,23,0.06)' } as React.CSSProperties,
    grid2: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 } as React.CSSProperties,
    list: { margin: 0, paddingLeft: 18 } as React.CSSProperties,
    note: { whiteSpace: 'pre-wrap', wordBreak: 'break-word' } as React.CSSProperties,
    report: { whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', fontSize: 13.5, lineHeight: 1.6, maxHeight: 420, overflow: 'auto', background: 'linear-gradient(180deg,#fafafa,#ffffff)', borderRadius: 12, padding: 12, border: '1px solid rgba(17,24,39,0.06)' } as React.CSSProperties,
    table: { width: '100%', borderCollapse: 'collapse' } as React.CSSProperties,
    th: { textAlign: 'left', borderBottom: '1px solid rgba(17,24,39,0.08)', padding: '10px 8px', background: 'linear-gradient(180deg,#fafafa,#ffffff)' } as React.CSSProperties,
    td: { borderBottom: '1px solid rgba(17,24,39,0.06)', padding: '10px 8px' } as React.CSSProperties,
    barWrap: { width: '100%', height: 10, background: 'rgba(17,24,39,0.06)', borderRadius: 6, overflow: 'hidden' } as React.CSSProperties,
    bar: { height: '100%', background: 'linear-gradient(90deg,#3b82f6,#06b6d4)' } as React.CSSProperties,
    error: { padding: '10px 12px', borderRadius: 12, background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', fontSize: 14, boxShadow: '0 8px 18px rgba(239,68,68,0.15)' } as React.CSSProperties,
  };

  const scoresList = useMemo(() => {
    if (!normalized) return [] as [string, number][];
    const entries = Object.entries(normalized.scores);
    return entries.sort((a, b) => b[1] - a[1]);
  }, [normalized]);

  // === JSX ===
  return (
    <div style={styles.pageWrap}>
      {/* Top banner */}
      <div style={styles.banner}>
        <div style={styles.bannerInner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>🚀</span>
            <div style={styles.bannerTitle}>HyperVC – Pitch Analyzer</div>
          </div>
          {normalized && typeof normalized.overall_score === 'number' && (
            <div style={{ fontWeight: 800, fontSize: 16 }}>Overall: {normalized.overall_score.toFixed(2)}/10</div>
          )}
        </div>
      </div>

      <main style={styles.container}>
        {/* Header */}
        <div style={{ ...styles.row, marginBottom: 14 }}>
          <div>
            <h1 style={styles.h1}>{title}</h1>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <span style={styles.tag}>Pitch Report</span>
              {file && <span style={styles.tag}>{file.name} · {prettySize}</span>}
              {normalized && normalized.status ? statusChip(String(normalized.status)) : null}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <label
              style={{ ...styles.btnGhost, borderStyle: 'dashed', ...(loading ? styles.btnDisabled : {}), transform: hovered==='choose' ? 'scale(1.02)' : undefined, filter: hovered==='choose' ? 'brightness(1.02)' : undefined }}
              onMouseEnter={() => setHovered('choose')}
              onMouseLeave={() => setHovered(null)}
            >
              <input type="file" accept=".pdf,.ppt,.pptx,.zip" onChange={(e) => setFile(e.target.files?.[0] || null)} style={{ display: 'none' }} disabled={loading} />
              📤 {loading ? 'Loading…' : 'Choose file'}
            </label>
            <button
              onClick={onUpload}
              disabled={!file || loading}
              style={{ ...styles.btn, ...( !file || loading ? styles.btnDisabled : {}), transform: hovered==='run' ? 'scale(1.03)' : undefined, filter: hovered==='run' ? 'brightness(1.05)' : undefined }}
              onMouseEnter={() => setHovered('run')}
              onMouseLeave={() => setHovered(null)}
            >
              {loading ? 'Analyzing…' : 'Run Analysis'}
            </button>
            {normalized?.download && (
              <a href={`${API_BASE}${normalized.download}`} target="_blank" rel="noreferrer">
                <button
                  style={{ ...styles.btnGhost, transform: hovered==='dl' ? 'scale(1.02)' : undefined, filter: hovered==='dl' ? 'brightness(1.02)' : undefined }}
                  onMouseEnter={() => setHovered('dl')}
                  onMouseLeave={() => setHovered(null)}
                >
                  ⬇️ Download deck
                </button>
              </a>
            )}
            {normalized?.report && (
              <button
                onClick={() => setShowReport((s) => !s)}
                style={{ ...styles.btnGhost, transform: hovered==='toggle' ? 'scale(1.02)' : undefined, filter: hovered==='toggle' ? 'brightness(1.02)' : undefined }}
                onMouseEnter={() => setHovered('toggle')}
                onMouseLeave={() => setHovered(null)}
              >
                {showReport ? 'Hide report' : 'Show report'}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div style={{ ...styles.error, marginBottom: 16 }}>
            <strong>Error:</strong> {error}
            <button onClick={() => setError(null)} style={{ ...styles.btnGhost, marginLeft: 10 }}>Dismiss</button>
          </div>
        )}

        {/* Executive Summary + Notes */}
        <div style={{ ...styles.grid2, marginBottom: 16 }}>
          <section style={styles.card}>
            <h2 style={{ marginTop: 0 }}>EXECUTIVE SUMMARY</h2>
            {normalized?.executive_summary ? (
              <p style={styles.note}>{asString(normalized.executive_summary)}</p>
            ) : (
              <p style={{ color: '#6b7280' }}>Upload a deck and run analysis to see the executive summary.</p>
            )}
          </section>

          <aside style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h2 style={{ marginTop: 0 }}>NOTES</h2>
              <small>{today}</small>
            </div>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Enter text here" style={{ width: '100%', height: 160, borderRadius: 12, padding: 8 }} />
            <div style={{ textAlign: 'right' }}>
              <button onClick={() => console.log('Save notes', notes)} style={styles.btnGhost}>Save</button>
            </div>
          </aside>
        </div>

        {/* Strength / Weakness */}
        <section style={{ ...styles.card, marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <h3>STRENGTH</h3>
              <ul style={styles.list}>
                {(normalized?.strengths || []).map((s, i) => <li key={`s-${i}`}>{s}</li>)}
                {!normalized?.strengths?.length && <li style={{ color: '#6b7280' }}>—</li>}
              </ul>
            </div>
            <div>
              <h3>WEAKNESS</h3>
              <ul style={styles.list}>
                {(normalized?.weaknesses || []).map((w, i) => <li key={`w-${i}`}>{w}</li>)}
                {!normalized?.weaknesses?.length && <li style={{ color: '#6b7280' }}>—</li>}
              </ul>
            </div>
          </div>
        </section>

        {/* Metric scores */}
        <section style={{ ...styles.card, marginBottom: 16 }}>
          <h3 style={{ marginTop: 0 }}>METRIC SCORES</h3>
          {scoresList.length > 0 ? (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Metric</th>
                  <th style={styles.th} colSpan={2}>Score (/10)</th>
                </tr>
              </thead>
              <tbody>
                {scoresList.map(([k, v]) => (
                  <tr key={k}>
                    <td style={styles.td}>{k}</td>
                    <td style={{ ...styles.td, width: 120 }}>{(typeof v === 'number' && isFinite(v) ? v : 0).toFixed(2)}</td>
                    <td style={styles.td}>
                      <div style={styles.barWrap}>
                        <div style={{ ...styles.bar, width: `${Math.max(0, Math.min(10, (typeof v === 'number' && isFinite(v) ? v : 0))) * 10}%` }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: '#6b7280' }}>—</p>
          )}
        </section>

        {/* Full report */}
        {normalized?.report && showReport && (
          <section style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <h3 style={{ marginTop: 0 }}>FULL LLM REPORT</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => navigator.clipboard.writeText(asString(normalized.report))} style={styles.btnGhost}>📋 Copy</button>
                <button onClick={() => setShowReport(false)} style={styles.btnGhost}>Hide</button>
              </div>
            </div>
            <pre style={styles.report}>{asString(normalized.report)}</pre>
          </section>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', color: '#6b7280', fontSize: 12, marginTop: 14 }}>
          API: <code>{API_BASE}</code>
        </div>
      </main>
    </div>
  );
}