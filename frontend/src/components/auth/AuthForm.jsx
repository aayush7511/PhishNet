import { useState } from 'react';
import { login, register } from '../../api/client.js';

const inputStyle = {
  width: '100%',
  background: 'var(--bg-input)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  padding: '10px 14px',
  fontSize: '14px',
  color: 'var(--text-primary)',
  outline: 'none',
  marginBottom: '10px',
  display: 'block',
};

/**
 * AuthForm — controlled login or register form.
 * @param {{ mode: 'login'|'register', onSuccess: (user) => void }} props
 */
export default function AuthForm({ mode, onSuccess }) {
  const [fields, setFields] = useState({ username: '', email: '', password: '' });
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function set(key) {
    return (e) => setFields(f => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');

    // Client-side basics
    if (!fields.email.trim() || !fields.password) {
      setServerError('Email and password are required');
      return;
    }
    if (mode === 'register' && !fields.username.trim()) {
      setServerError('Username is required');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'login') {
        const data = await login({ email: fields.email, password: fields.password });
        onSuccess(data.user);
      } else {
        await register({ username: fields.username, email: fields.email, password: fields.password });
        // Auto-login after registration
        const data = await login({ email: fields.email, password: fields.password });
        onSuccess(data.user);
      }
    } catch (err) {
      setServerError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {mode === 'register' && (
        <input
          type="text"
          placeholder="Username"
          value={fields.username}
          onChange={set('username')}
          style={inputStyle}
          autoComplete="username"
        />
      )}
      <input
        type="email"
        placeholder="Email address"
        value={fields.email}
        onChange={set('email')}
        style={inputStyle}
        autoComplete="email"
      />
      <input
        type="password"
        placeholder="Password"
        value={fields.password}
        onChange={set('password')}
        style={{ ...inputStyle, marginBottom: '4px' }}
        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
      />

      {serverError && (
        <p style={{ color: 'var(--red)', fontSize: '12px', marginBottom: '12px', marginTop: '4px' }}>
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        style={{
          width: '100%',
          height: '44px',
          background: 'var(--blue-dark)',
          borderRadius: '8px',
          color: 'white',
          fontSize: '14px',
          fontWeight: 600,
          marginTop: '8px',
          opacity: isLoading ? 0.6 : 1,
          transition: 'opacity 0.2s',
        }}
      >
        {isLoading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
      </button>
    </form>
  );
}
