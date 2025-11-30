import React, { useState } from 'react';
import { styles, colors } from '../styles/styles';
import { formatDate } from '../utils/helpers';

export function Diagnoses({ diagnoses, setDiagnoses, ai, isMobile }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    doctor: '',
    description: '',
    treatments: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newDiagnosis = {
      ...formData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
    setDiagnoses([...diagnoses, newDiagnosis]);
    setFormData({
      name: '',
      date: new Date().toISOString().split('T')[0],
      doctor: '',
      description: '',
      treatments: '',
    });
    setShowForm(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Är du säker på att du vill ta bort denna diagnos?')) {
      setDiagnoses(diagnoses.filter(d => d.id !== id));
    }
  };

  const handleAnalyze = (diagnosis) => {
    ai.analyzeDiagnosis(diagnosis);
  };

  return (
    <div style={styles.contentInner}>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>🔬 Diagnoser</h2>
        <button style={styles.button} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Avbryt' : '+ Lägg till'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={{
            ...styles.formGrid,
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          }}>
            <div>
              <label style={styles.label}>Diagnos *</label>
              <input
                required
                style={styles.input}
                placeholder="T.ex. Hypertoni"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label style={styles.label}>Datum</label>
              <input
                type="date"
                style={styles.input}
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <label style={styles.label}>Läkare</label>
              <input
                style={styles.input}
                placeholder="Dr. Andersson"
                value={formData.doctor}
                onChange={e => setFormData({ ...formData, doctor: e.target.value })}
              />
            </div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={styles.label}>Beskrivning</label>
            <textarea
              style={styles.textarea}
              rows={3}
              placeholder="Beskriv diagnosen..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={styles.label}>Behandling</label>
            <textarea
              style={styles.textarea}
              rows={3}
              placeholder="Vilken behandling har ordinerats?"
              value={formData.treatments}
              onChange={e => setFormData({ ...formData, treatments: e.target.value })}
            />
          </div>
          <button type="submit" style={styles.button}>Spara diagnos</button>
        </form>
      )}

      {diagnoses.length === 0 ? (
        <div style={styles.emptyState}>
          <span style={styles.emptyIcon}>🔬</span>
          <p style={styles.emptyText}>Inga diagnoser registrerade</p>
        </div>
      ) : (
        diagnoses.map(diag => (
          <div key={diag.id} style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h4 style={{ margin: 0 }}>{diag.name}</h4>
              <span style={{ ...styles.badge, ...styles.badgeGray }}>
                {formatDate(diag.date)}
              </span>
            </div>
            {diag.doctor && (
              <p style={{ color: colors.textLight, margin: '0.5rem 0' }}>
                👨‍⚕️ {diag.doctor}
              </p>
            )}
            {diag.description && (
              <p style={{ color: colors.textLight, lineHeight: 1.6, margin: '0.5rem 0' }}>
                {diag.description}
              </p>
            )}
            {diag.treatments && (
              <div style={{
                background: '#f8faf9',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                margin: '0.75rem 0',
              }}>
                <strong>💊 Behandling:</strong> {diag.treatments}
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              <button
                style={{ ...styles.button, ...styles.buttonSecondary }}
                onClick={() => handleAnalyze(diag)}
                disabled={ai.isLoading}
              >
                {ai.isLoading ? '⏳ Analyserar...' : '🤖 Analysera med AI'}
              </button>
              <button
                style={{ ...styles.button, ...styles.buttonDanger }}
                onClick={() => handleDelete(diag.id)}
              >
                🗑️
              </button>
            </div>
          </div>
        ))
      )}

      {/* AI Response */}
      {ai.response && (
        <div style={{
          background: '#f8fafc',
          borderRadius: '16px',
          marginTop: '1.5rem',
          overflow: 'hidden',
          border: `2px solid ${colors.border}`,
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 1.25rem',
            background: `linear-gradient(135deg, ${colors.secondary}, #2980b9)`,
            color: 'white',
          }}>
            <span style={{ fontWeight: 600 }}>🤖 AI-analys</span>
            <button
              style={styles.modalClose}
              onClick={ai.clearResponse}
            >
              ✕
            </button>
          </div>
          <div style={{ padding: '1.25rem', maxHeight: '400px', overflowY: 'auto' }}>
            {ai.response.split('\n').map((line, i) => (
              <p key={i} style={{ margin: '0 0 0.5rem' }}>{line}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
