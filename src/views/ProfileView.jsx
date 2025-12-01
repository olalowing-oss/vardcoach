import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Card, Button, Input } from '../components/common';
import './ProfileView.css';

export function ProfileView() {
  const { user, profile, updateProfile, signOut } = useAuth();
  const { actions } = useApp();
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isImportingDemo, setIsImportingDemo] = useState(false);

  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await updateProfile({ full_name: fullName });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Kunde inte uppdatera profil');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleImportDemoData = () => {
    const confirmed = window.confirm(
      'Detta ersätter din nuvarande data med ett demokonto. Vill du fortsätta?'
    );
    if (!confirmed) return;

    setIsImportingDemo(true);
    try {
      actions.importDemoData();
    } finally {
      setIsImportingDemo(false);
    }
  };

  return (
    <div className="profile-view">
      <div className="profile-header">
        <h1 className="page-title">Min profil</h1>
        <p className="page-subtitle">Hantera dina kontoinställningar</p>
      </div>

      <div className="profile-content">
        <Card>
          <h3>Kontoinformation</h3>
          <div className="profile-info">
            <div className="profile-info-item">
              <label>E-postadress</label>
              <div className="profile-info-value">{user?.email}</div>
            </div>
            <div className="profile-info-item">
              <label>Kontot skapades</label>
              <div className="profile-info-value">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString('sv-SE', {
                      dateStyle: 'long',
                    })
                  : 'Okänt'}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h3>Redigera profil</h3>
          <form onSubmit={handleSubmit} className="profile-form">
            <Input
              label="Fullt namn"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="För- och efternamn"
              disabled={loading}
            />

            {error && <div className="profile-error">{error}</div>}
            {success && <div className="profile-success">✅ Profil uppdaterad!</div>}

            <Button type="submit" disabled={loading}>
              {loading ? 'Sparar...' : 'Spara ändringar'}
            </Button>
          </form>
        </Card>

        <Card>
          <h3>Hantera konto</h3>
          <div className="profile-actions">
            <p className="profile-actions-text">
              Vill du logga ut från ditt konto?
            </p>
            <Button variant="danger" onClick={handleLogout}>
              🚪 Logga ut
            </Button>
          </div>
        </Card>

        <Card>
          <h3>Demodata för demo</h3>
          <div className="profile-actions">
            <p className="profile-actions-text">
              Fyll appen med ett komplett exempelkonto för att visa funktionerna. Din befintliga data ersätts.
            </p>
            <Button onClick={handleImportDemoData} disabled={isImportingDemo}>
              {isImportingDemo ? 'Importerar...' : 'Importera demodata'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default ProfileView;
