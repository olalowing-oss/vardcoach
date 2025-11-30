import React, { useState } from 'react';
import { styles, colors } from '../styles/styles';
import { formatDate, getMonthShort, getMood } from '../utils/helpers';

export function Diary({ diaryEntries, setDiaryEntries, medications, appointments, isMobile }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    mood: 3,
    symptoms: '',
    text: '',
    medicationNotes: '',
    appointmentId: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEntry = {
      ...formData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
    setDiaryEntries([...diaryEntries, newEntry]);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      mood: 3,
      symptoms: '',
      text: '',
      medicationNotes: '',
      appointmentId: '',
    });
    setShowForm(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Är du säker på att du vill ta bort denna anteckning?')) {
      setDiaryEntries(diaryEntries.filter(e => e.id !== id));
    }
  };

  const sortedEntries = [...diaryEntries].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  const activeMeds = medications.filter(m => m.active);

  return (
    <div style={styles.contentInner}>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>📔 Dagbok</h2>
        <button style={styles.button} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Avbryt' : '+ Ny anteckning'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={{
            ...styles.formGrid,
            gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr',
          }}>
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
              <label style={styles.label}>Humör</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[1, 2, 3, 4, 5].map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData({ ...formData, mood: level })}
                    style={{
                      fontSize: '1.75rem',
                      padding: '0.5rem',
                      border: `2px solid ${formData.mood === level ? colors.primary : colors.border}`,
                      borderRadius: '10px',
                      background: formData.mood === level ? '#e8f5e9' : 'white',
                      cursor: 'pointer',
                      transform: formData.mood === level ? 'scale(1.1)' : 'scale(1)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {getMood(level)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {appointments.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={styles.label}>Koppla till vårdbesök</label>
              <select
                style={styles.select}
                value={formData.appointmentId}
                onChange={e => setFormData({ ...formData, appointmentId: e.target.value })}
              >
                <option value="">Välj besök (valfritt)</option>
                {appointments.map(a => (
                  <option key={a.id} value={a.id}>
                    {formatDate(a.date)} - {a.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={styles.label}>Symtom</label>
            <input
              style={styles.input}
              placeholder="T.ex. huvudvärk, trötthet, yrsel..."
              value={formData.symptoms}
              onChange={e => setFormData({ ...formData, symptoms: e.target.value })}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={styles.label}>Hur har dagen varit?</label>
            <textarea
              style={styles.textarea}
              rows={4}
              placeholder="Beskriv hur du mår idag..."
              value={formData.text}
              onChange={e => setFormData({ ...formData, text: e.target.value })}
            />
          </div>

          {activeMeds.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={styles.label}>Läkemedelsanteckningar</label>
              <textarea
                style={styles.textarea}
                rows={2}
                placeholder="Några biverkningar eller effekter av medicinen?"
                value={formData.medicationNotes}
                onChange={e => setFormData({ ...formData, medicationNotes: e.target.value })}
              />
            </div>
          )}

          <button type="submit" style={styles.button}>Spara anteckning</button>
        </form>
      )}

      {diaryEntries.length === 0 ? (
        <div style={styles.emptyState}>
          <span style={styles.emptyIcon}>📔</span>
          <p style={styles.emptyText}>Inga anteckningar ännu</p>
          <p style={{ color: colors.textMuted, fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Börja dokumentera hur du mår för att spåra din hälsa över tid
          </p>
        </div>
      ) : (
        sortedEntries.map(entry => {
          const linkedAppointment = entry.appointmentId
            ? appointments.find(a => a.id === parseInt(entry.appointmentId))
            : null;

          return (
            <div key={entry.id} style={styles.diaryCard}>
              <div style={styles.diaryHeader}>
                <div style={styles.diaryDate}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                    {new Date(entry.date).getDate()}
                  </span>
                  <span style={{ fontSize: '0.75rem' }}>
                    {getMonthShort(entry.date)}
                  </span>
                </div>
                <span style={styles.diaryMood}>{getMood(entry.mood)}</span>
              </div>

              {linkedAppointment && (
                <div style={{
                  ...styles.badge,
                  ...styles.badgeSecondary,
                  marginTop: '0.5rem',
                }}>
                  📅 {linkedAppointment.title}
                </div>
              )}

              {entry.symptoms && (
                <div style={{ marginTop: '0.75rem' }}>
                  {entry.symptoms.split(',').map((symptom, i) => (
                    <span key={i} style={styles.symptomTag}>
                      {symptom.trim()}
                    </span>
                  ))}
                </div>
              )}

              {entry.text && (
                <p style={{
                  color: colors.textLight,
                  lineHeight: 1.7,
                  margin: '0.75rem 0',
                }}>
                  {entry.text}
                </p>
              )}

              {entry.medicationNotes && (
                <div style={{
                  background: '#e8f5e9',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  marginTop: '0.75rem',
                }}>
                  💊 {entry.medicationNotes}
                </div>
              )}

              <button
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  opacity: 0.4,
                  fontSize: '1rem',
                }}
                onClick={() => handleDelete(entry.id)}
              >
                🗑️
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}
