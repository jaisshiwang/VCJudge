'use client';

import React, { useState, useMemo } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<string>('');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prettySize = useMemo(() => {
    if (!file) return '';
    const kb = file.size / 1024;
    return kb < 1024 ? `${kb.toFixed(1)} KB` : `${(kb / 1024).toFixed(2)} MB`;
  }, [file]);

  async function onUpload() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setReport('');
    setDownloadUrl(null);

    try {
      const form = new FormData();
      form.append('file', file);

      // Post directly to FastAPI (bypasses Next's 1MB limit)
      const res = await fetch(`${API_BASE}/api/analyze`, { method: 'POST', body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.report || `Analyze failed (${res.status})`);

      setReport(json.report || '');
      setDownloadUrl(json.download || null);
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : (() => { try { return JSON.stringify(e); } catch { return 'Unknown error'; }})();
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function onCopy() {
    if (!report) return;
    navigator.clipboard.writeText(report).catch(() => {});
  }

  const styles = {
    container: { maxWidth: 1000, margin: '2rem auto', padding: '0 1rem', fontFamily: 'Inter, ui-sans-serif, system-ui' } as React.CSSProperties,
    row: { display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' } as React.CSSProperties,
    h1: { fontSize: 28, fontWeight: 700, margin: 0 } as React.CSSProperties,
    sub: { color: '#6b7280', fontSize: 13 } as React.CSSProperties,
    card: { border: '1px solid #e5e7eb', borderRadius: 16, padding: 16, background: '#fff' } as React.CSSProperties,
    btn: {
      padding: '10px 14px',
      borderRadius: 12,
      border: '1px solid #e5e7eb',
      background: '#111827',
      color: '#fff',
      fontWeight: 600,
      cursor: 'pointer'
    } as React.CSSProperties,
    btnGhost: {
      padding: '10px 14px',
      borderRadius: 12,
      border: '1px solid #e5e7eb',
      background: '#fff',
      color: '#111827',
      fontWeight: 600,
      cursor: 'pointer'
    } as React.CSSProperties,
    btnDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed'
    } as React.CSSProperties,
    tag: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 10px',
      borderRadius: 999,
      background: '#f3f4f6',
      fontSize: 12
    } as React.CSSProperties,
    toolbar: { display: 'flex', gap: 10, flexWrap: 'wrap' } as React.CSSProperties,
    report: {
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      fontFamily:
        'ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace',
      fontSize: 13.5,
      lineHeight: 1.6,
      maxHeight: 600,
      overflow: 'auto',
      margin: 0
    } as React.CSSProperties,
    error: {
      padding: '10px 12px',
      borderRadius: 12,
      background: '#fef2f2',
      color: '#991b1b',
      border: '1px solid #fecaca',
      fontSize: 14
    } as React.CSSProperties
  };

  return (
    <main style={styles.container}>
      {/* Header */}
      <div style={{ ...styles.row, marginBottom: 16 }}>
        <div>
          <h1 style={styles.h1}>VCJudge – Pitch Deck Analyzer</h1>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <span style={styles.tag}>Alpha UI</span>
            <span style={styles.tag}>LLM-backed</span>
            {file && <span style={styles.tag}>Selected: {file.name} · {prettySize}</span>}
          </div>
        </div>

        <div style={styles.toolbar}>
          <label style={{ ...styles.btnGhost, borderStyle: 'dashed' }}>
            <input
              type="file"
              accept=".pdf,.ppt,.pptx,.zip"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              style={{ display: 'none' }}
            />
            📤 Choose file
          </label>
          <button
            onClick={onUpload}
            disabled={!file || loading}
            style={{ ...styles.btn, ...( !file || loading ? styles.btnDisabled : {}) }}
          >
            {loading ? 'Analyzing…' : 'Run Analysis'}
          </button>
          {downloadUrl && (
            <a href={`${API_BASE}${downloadUrl}`} target="_blank" rel="noreferrer">
              <button style={styles.btnGhost}>⬇️ Download original</button>
            </a>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ ...styles.error, marginBottom: 16 }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Report */}
      <section style={{ ...styles.card }}>
        <div style={{ ...styles.row, marginBottom: 8 }}>
          <div>
            <h2 style={{ margin: 0 }}>LLM Report</h2>
            <div style={styles.sub}>
              The complete evaluation returned by your analyzer (no parsing).
            </div>
          </div>
          <div style={styles.toolbar}>
            <button onClick={onCopy} disabled={!report} style={{ ...styles.btnGhost, ...( !report ? styles.btnDisabled : {}) }}>
              📋 Copy report
            </button>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              style={styles.btnGhost}
            >
              ⬆️ Scroll to top
            </button>
          </div>
        </div>

        <pre style={styles.report}>
{report || 'Upload a deck and click “Run Analysis” to generate the report.'}
        </pre>
      </section>

      {/* Footer note */}
      <div style={{ textAlign: 'center', color: '#6b7280', fontSize: 12, marginTop: 14 }}>
        API: <code>{API_BASE}</code>
      </div>
    </main>
  );
}