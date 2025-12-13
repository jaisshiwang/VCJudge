'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [u, setU] = useState('');
  const [p, setP] = useState('');

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // accept any credentials for now
    localStorage.setItem('hv_authed', '1');
    router.replace('/');
  }

  const wrap: React.CSSProperties = {
    minHeight: '100dvh',
    display: 'grid',
    placeItems: 'center',
    background: 'linear-gradient(180deg, #f0f9ff 0%, #ecfeff 35%, #f5f3ff 100%)',
    fontFamily: 'Inter, ui-sans-serif, system-ui',
  };

  const card: React.CSSProperties = {
    width: 360, background: '#fff', borderRadius: 16, padding: 20,
    border: '1px solid rgba(17,24,39,0.08)', boxShadow: '0 10px 24px rgba(2,6,23,0.06)'
  };

  const input: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff' };

  return (
    <div style={wrap}>
      <form onSubmit={onSubmit} style={card}>
        <h1 style={{ marginTop: 0 }}>HyperVC Login</h1>
        <div style={{ display: 'grid', gap: 10 }}>
          <input placeholder="Username" value={u} onChange={e=>setU(e.target.value)} style={input} />
          <input type="password" placeholder="Password" value={p} onChange={e=>setP(e.target.value)} style={input} />
          <button type="submit" style={{ padding:'10px 12px', borderRadius: 12, border:'1px solid #1d4ed8', background:'linear-gradient(180deg,#3b82f6,#2563eb)', color:'#fff', fontWeight:700 }}>
            Sign in
          </button>
        </div>
      </form>
    </div>
  );
}