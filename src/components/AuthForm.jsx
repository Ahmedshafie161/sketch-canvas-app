// src/components/AuthForm.jsx
import React from 'react';

const AuthForm = ({ 
  authMode, 
  setAuthMode, 
  username, 
  setUsername, 
  password, 
  setPassword, 
  handleAuth 
}) => {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0f172a',
    }}>
      <div style={{
        backgroundColor: '#1e293b',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        width: '100%',
        maxWidth: '400px',
      }}>
        <h2 style={{ color: '#f1f5f9', marginBottom: '1.5rem', textAlign: 'center' }}>
          {authMode === 'login' ? 'Login' : 'Register'}
        </h2>
        
        <form onSubmit={handleAuth}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              marginBottom: '1rem',
              backgroundColor: '#334155',
              border: '2px solid #475569',
              borderRadius: '8px',
              color: '#f1f5f9',
              fontSize: '1rem',
            }}
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              marginBottom: '1.5rem',
              backgroundColor: '#334155',
              border: '2px solid #475569',
              borderRadius: '8px',
              color: '#f1f5f9',
              fontSize: '1rem',
            }}
          />
          
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#3b82f6',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '1rem',
            }}
          >
            {authMode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>
        
        <button
          onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: 'transparent',
            border: '2px solid #475569',
            borderRadius: '8px',
            color: '#94a3b8',
            fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          {authMode === 'login' ? 'Need an account? Register' : 'Have an account? Login'}
        </button>
      </div>
    </div>
  );
};

export default AuthForm;