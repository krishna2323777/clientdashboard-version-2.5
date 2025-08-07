import React from 'react';

const ImportFromBaseCompany = ({ onImport }) => {
  return (
    <div style={{
      background: '#23234a',
      borderRadius: 20,
      boxShadow: '0 2px 16px rgba(59,130,246,0.10)',
      padding: '38px 32px 28px 32px',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start'
    }}>
      <div style={{
        background: '#2563eb',
        borderRadius: '50%',
        width: 64,
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 18
      }}>
        <span style={{ fontSize: 32 }}>🏢</span>
      </div>
      <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 10 }}>Import from Base Company</div>
      <div style={{ color: '#bfc6e0', fontSize: 16, marginBottom: 18 }}>
        We'll use information from your existing company profile to pre-fill the registration forms.
      </div>
      <ul style={{ color: '#22c55e', fontSize: 15, marginBottom: 22, paddingLeft: 0, listStyle: 'none' }}>
        <li style={{ marginBottom: 8 }}>
          <span style={{ marginRight: 8 }}>📄</span>
          Company details automatically imported
        </li>
        <li style={{ marginBottom: 8 }}>
          <span style={{ marginRight: 8 }}>👥</span>
          Directors and shareholders information pre-filled
        </li>
        <li>
          <span style={{ marginRight: 8 }}>✔️</span>
          Faster registration process
        </li>
      </ul>
      <button style={{
        background: 'linear-gradient(90deg,#2563eb 0%,#3b82f6 100%)',
        color: '#fff',
        border: 'none',
        borderRadius: 10,
        padding: '16px 0',
        width: '100%',
        fontWeight: 700,
        fontSize: 17,
        cursor: 'pointer',
        marginTop: 'auto'
      }}
        onClick={onImport}
      >
        Import from Base Company &nbsp; →
      </button>
    </div>
  );
};

export default ImportFromBaseCompany;