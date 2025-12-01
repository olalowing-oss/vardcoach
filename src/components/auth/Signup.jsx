import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button, Input, Card } from '../common';
import './Auth.css';

export function Signup({ onToggleMode }) {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Lösenorden matchar inte');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Lösenordet måste vara minst 6 tecken');
      setLoading(false);
      return;
    }

    try {
      await signUp(email, password, fullName);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Registrering misslyckades');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <Card className="auth-card">
          <div className="auth-header">
            <h1>✅ Kontot skapat!</h1>
            <p>Kolla din e-post för att verifiera ditt konto.</p>
          </div>
          <Button onClick={onToggleMode} fullWidth>
            Gå till inloggning
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <div className="auth-header">
          <h1>Skapa konto</h1>
          <p>Kom igång med Vårdhjälpen</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <Input
            type="text"
            label="Fullt namn"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="För- och efternamn"
            required
            disabled={loading}
          />

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
            placeholder="Minst 6 tecken"
            required
            disabled={loading}
          />

          <Input
            type="password"
            label="Bekräfta lösenord"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Ange lösenord igen"
            required
            disabled={loading}
          />

          {error && <div className="auth-error">{error}</div>}

          <Button type="submit" disabled={loading} fullWidth>
            {loading ? 'Skapar konto...' : 'Skapa konto'}
          </Button>
        </form>

        <div className="auth-footer">
          <div className="auth-toggle">
            <span>Har du redan ett konto? </span>
            <button
              type="button"
              className="auth-link"
              onClick={onToggleMode}
              disabled={loading}
            >
              Logga in
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default Signup;
