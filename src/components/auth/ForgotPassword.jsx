import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button, Input, Card } from '../common';
import './Auth.css';

export function ForgotPassword({ onBack }) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Något gick fel');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-container">
        <Card className="auth-card">
          <div className="auth-header">
            <h1>✅ E-post skickad!</h1>
            <p>Kolla din e-post för instruktioner om hur du återställer ditt lösenord.</p>
          </div>
          <Button onClick={onBack} fullWidth>
            Tillbaka till inloggning
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <div className="auth-header">
          <h1>Återställ lösenord</h1>
          <p>Vi skickar dig en länk för att återställa ditt lösenord.</p>
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

          {error && <div className="auth-error">{error}</div>}

          <Button type="submit" disabled={loading} fullWidth>
            {loading ? 'Skickar...' : 'Skicka återställningslänk'}
          </Button>
        </form>

        <div className="auth-footer">
          <button
            type="button"
            className="auth-link"
            onClick={onBack}
            disabled={loading}
          >
            ← Tillbaka till inloggning
          </button>
        </div>
      </Card>
    </div>
  );
}

export default ForgotPassword;
