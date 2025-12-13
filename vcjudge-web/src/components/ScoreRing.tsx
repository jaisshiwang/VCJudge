'use client';
import React from 'react';

export default function ScoreRing({ value }: { value: number }) {
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
        strokeDasharray={`${dash} ${c - dash}`} strokeLinecap="round"
        transform="rotate(-90 24 24)"
      />
      <text x="50%" y="52%" dominantBaseline="middle" textAnchor="middle"
            fontSize="11" fontWeight={700} fill="#111827">{pct}</text>
    </svg>
  );
}