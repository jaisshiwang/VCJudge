'use client';

export default function LogoutButton() {
  return (
    <button
      onClick={() => {
        localStorage.removeItem('hv_authed');
        window.location.href = '/login';
      }}
      style={{
        padding: '6px 12px',
        borderRadius: 8,
        border: '1px solid #e5e7eb',
        background: '#fff',
        cursor: 'pointer',
      }}
    >
      Logout
    </button>
  );
}