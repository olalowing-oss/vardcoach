import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button, Input, Card } from '../common';
import './Auth.css';

export function Login({ onToggleMode, onForgotPassword }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
    } catch (err) {
      setError(err.message || 'Inloggning misslyckades');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <div className="auth-header">
          <h1>Logga in</h1>
          <p>Välkommen tillbaka till Vårdhjälpen</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <Input
            type="email"
            label="E-postadress"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="din@email.se"
            required
            disabled={loading}
          />

          <Input
            type="password"
            label="Lösenord"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={loading}
          />

          {error && <div className="auth-error">{error}</div>}

          <Button type="submit" disabled={loading} fullWidth>
            {loading ? 'Loggar in...' : 'Logga in'}
          </Button>
        </form>

        <div className="auth-footer">
          <button
            type="button"
            className="auth-link"
            onClick={onForgotPassword}
            disabled={loading}
          >
            Glömt lösenord?
          </button>
          <div className="auth-toggle">
            <span>Inget konto? </span>
            <button
              type="button"
              className="auth-link"
              onClick={onToggleMode}
              disabled={loading}
            >
              Registrera dig
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default Login;
