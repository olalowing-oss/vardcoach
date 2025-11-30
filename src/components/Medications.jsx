import React, { useState } from 'react';
import { styles, colors } from '../styles/styles';
import { formatDate } from '../utils/helpers';

export function Medications({ medications, setMedications, isMobile }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    times: ['08:00'],
    instructions: '',
    startDate: new Date().toISOString().split('T')[0],
    active: true,
    reminder: true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newMedication = {
      ...formData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
    setMedications([...medications, newMedication]);
    setFormData({
      name: '',
      dosage: '',
      times: ['08:00'],
      instructions: '',
      startDate: new Date().toISOString().split('T')[0],
      active: true,
      reminder: true,
    });
    setShowForm(false);
  };

  const handleToggleActive = (id) => {
    setMedications(medications.map(m =>
      m.id === id ? { ...m, active: !m.active } : m
    ));
  };

  const handleToggleReminder = (id) => {
    setMedications(medications.map(m =>
      m.id === id ? { ...m, reminder: !m.reminder } : m
    ));
  };

  const handleDelete = (id) => {
    if (window.confirm('Är du säker på att du vill ta bort detta läkemedel?')) {
      setMedications(medications.filter(m => m.id !== id));
    }
  };

  const addTime = () => {
    setFormData({ ...formData, times: [...formData.times, '12:00'] });
  };

  const removeTime = (index) => {
    setFormData({
      ...formData,
      times: formData.times.filter((_, i) => i !== index),
    });
  };

  const updateTime = (index, value) => {
    const newTimes = [...formData.times];
    newTimes[index] = value;
    setFormData({ ...formData, times: newTimes });
  };

  const activeMeds = medications.filter(m => m.active);
  const inactiveMeds = medications.filter(m => !m.active);

  return (
    <div style={styles.contentInner}>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>💊 Läkemedel</h2>
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
              <label style={styles.label}>Läkemedel *</label>
              <input
                required
                style={styles.input}
                placeholder="T.ex. Enalapril"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label style={styles.label}>Dosering *</label>
              <input
                required
                style={styles.input}
                placeholder="T.ex. 5mg"
                value={formData.dosage}
                onChange={e => setFormData({ ...formData, dosage: e.target.value })}
              />
            </div>
            <div>
              <label style={styles.label}>Startdatum</label>
              <input
                type="date"
                style={styles.input}
                value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={styles.label}>Doseringstider</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
              {formData.times.map((time, i) => (
                <div key={i} style={{ display: 'flex', gap: '4px' }}>
                  <input
                    type="time"
                    value={time}
                    onChange={e => updateTime(i, e.target.value)}
                    style={{ ...styles.input, width: 'auto', padding: '0.5rem 0.75rem' }}
                  />
                  {formData.times.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTime(i)}
                      style={{
                        background: '#fee',
                        color: colors.red,
                        border: 'none',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addTime}
                style={{
                  background: '#e8f5e9',
                  color: colors.primary,
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                + Tid
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={styles.label}>Instruktioner</label>
            <textarea
              style={styles.textarea}
              rows={2}
              placeholder="T.ex. Ta med mat"
              value={formData.instructions}
              onChange={e => setFormData({ ...formData, instructions: e.target.value })}
            />
          </div>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
            cursor: 'pointer',
          }}>
            <input
              type="checkbox"
              checked={formData.reminder}
              onChange={e => setFormData({ ...formData, reminder: e.target.checked })}
              style={styles.checkbox}
            />
            <span>🔔 Aktivera påminnelser</span>
          </label>

          <button type="submit" style={styles.button}>Spara läkemedel</button>
        </form>
      )}

      {medications.length === 0 ? (
        <div style={styles.emptyState}>
          <span style={styles.emptyIcon}>💊</span>
          <p style={styles.emptyText}>Inga läkemedel registrerade</p>
        </div>
      ) : (
        <>
          {activeMeds.length > 0 && (
            <>
              <h3 style={{ marginBottom: '1rem' }}>Aktiva läkemedel</h3>
              {activeMeds.map(med => (
                <MedicationCard
                  key={med.id}
                  medication={med}
                  onToggleActive={handleToggleActive}
                  onToggleReminder={handleToggleReminder}
                  onDelete={handleDelete}
                />
              ))}
            </>
          )}

          {inactiveMeds.length > 0 && (
            <>
              <h3 style={{ marginTop: '2rem', marginBottom: '1rem', opacity: 0.6 }}>
                Avslutade läkemedel
              </h3>
              {inactiveMeds.map(med => (
                <MedicationCard
                  key={med.id}
                  medication={med}
                  onToggleActive={handleToggleActive}
                  onToggleReminder={handleToggleReminder}
                  onDelete={handleDelete}
                  inactive
                />
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
}

function MedicationCard({ medication, onToggleActive, onToggleReminder, onDelete, inactive }) {
  return (
    <div style={{ ...styles.medicationCard, opacity: inactive ? 0.5 : 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {medication.name}
            {medication.reminder && !inactive && (
              <span style={{ color: colors.primary }}>🔔</span>
            )}
          </h4>
          <span style={{ color: colors.textMuted }}>{medication.dosage}</span>
        </div>
        <button
          onClick={() => onToggleActive(medication.id)}
          style={{
            ...styles.toggleButton,
            background: medication.active ? colors.primary : colors.gray,
          }}
        >
          {medication.active ? '✓ Aktiv' : 'Inaktiv'}
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1rem 0', flexWrap: 'wrap' }}>
        <span style={{ color: colors.textMuted }}>⏰</span>
        {medication.times.map((time, i) => (
          <span key={i} style={styles.timeChip}>{time}</span>
        ))}
      </div>

      {medication.instructions && (
        <div style={{
          fontSize: '0.9rem',
          color: colors.textLight,
          background: '#fef9e7',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
        }}>
          📋 {medication.instructions}
        </div>
      )}

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: `1px solid ${colors.border}`,
        paddingTop: '1rem',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}>
        <span style={{ color: colors.lightGray, fontSize: '0.85rem' }}>
          Start: {formatDate(medication.startDate)}
        </span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {medication.active && (
            <button
              style={{ ...styles.button, ...styles.buttonGhost, ...styles.buttonSmall }}
              onClick={() => onToggleReminder(medication.id)}
            >
              {medication.reminder ? '🔕 Av' : '🔔 På'}
            </button>
          )}
          <button
            style={{ ...styles.button, ...styles.buttonDanger, ...styles.buttonSmall }}
            onClick={() => onDelete(medication.id)}
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
