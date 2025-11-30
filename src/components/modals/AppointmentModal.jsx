import React, { useState } from 'react';
import { styles, colors } from '../../styles/styles';
import { formatDate, getTypeIcon, getMood } from '../../utils/helpers';

export function AppointmentModal({
  appointment,
  diagnoses,
  medications,
  diaryEntries,
  allDiaryEntries,
  setDiaryEntries,
  onClose,
  onUpdate,
  onDelete,
  isMobile,
}) {
  const [activeTab, setActiveTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState({
    prepNotes: appointment.prepNotes || '',
    postNotes: appointment.postNotes || '',
    questions: appointment.questions || '',
  });
  const [newEntry, setNewEntry] = useState({ mood: 3, symptoms: '', text: '' });

  const diagnosis = diagnoses.find(d => d.id === parseInt(appointment.diagnosisId));

  const tabs = [
    { id: 'info', label: '📋 Info' },
    { id: 'notes', label: '📝 Anteckningar' },
    { id: 'meds', label: '💊 Läkemedel' },
    { id: 'diary', label: '📔 Dagbok' },
  ];

  const handleSaveNotes = () => {
    onUpdate({ ...appointment, ...notes });
    setIsEditing(false);
  };

  const handleAddDiaryEntry = () => {
    if (!newEntry.text.trim()) return;
    
    const entry = {
      ...newEntry,
      id: Date.now(),
      date: appointment.date,
      appointmentId: appointment.id,
      createdAt: new Date().toISOString(),
    };
    
    setDiaryEntries([...allDiaryEntries, entry]);
    setNewEntry({ mood: 3, symptoms: '', text: '' });
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.modalHeader}>
          <span style={{ fontSize: '1.5rem' }}>{getTypeIcon(appointment.type)}</span>
          <h3 style={styles.modalTitle}>{appointment.title}</h3>
          {appointment.reminder && <span>🔔</span>}
          <button style={styles.modalClose} onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div style={styles.modalTabs}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              style={{
                ...styles.modalTab,
                ...(activeTab === tab.id ? styles.modalTabActive : {}),
              }}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={styles.modalBody}>
          {/* Info Tab */}
          {activeTab === 'info' && (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem',
                marginBottom: '1.5rem',
              }}>
                {[
                  { label: '📅 Datum', value: formatDate(appointment.date) },
                  { label: '🕐 Tid', value: appointment.time },
                  { label: '📍 Plats', value: appointment.location || 'Ej angiven' },
                  { label: '👨‍⚕️ Läkare', value: appointment.doctor || 'Ej angiven' },
                ].map((item, i) => (
                  <div key={i}>
                    <small style={{ color: colors.textMuted }}>{item.label}</small>
                    <div style={{ fontWeight: 600 }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {diagnosis && (
                <div style={{
                  background: '#f8f9fa',
                  padding: '1rem',
                  borderRadius: '10px',
                  borderLeft: `4px solid ${colors.purple}`,
                  marginBottom: '1rem',
                }}>
                  <strong>🔬 {diagnosis.name}</strong>
                  {diagnosis.description && (
                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: colors.textLight }}>
                      {diagnosis.description}
                    </p>
                  )}
                </div>
              )}

              {appointment.purpose && (
                <div style={{
                  background: '#e8f5e9',
                  padding: '1rem',
                  borderRadius: '10px',
                  marginBottom: '1rem',
                }}>
                  <strong>🎯 Syfte:</strong> {appointment.purpose}
                </div>
              )}

              <button
                style={{ ...styles.button, ...styles.buttonDanger, width: '100%' }}
                onClick={() => onDelete(appointment.id)}
              >
                🗑️ Ta bort besök
              </button>
            </>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <>
              {isEditing ? (
                <>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={styles.label}>📝 Förberedelser</label>
                    <textarea
                      style={styles.textarea}
                      rows={3}
                      value={notes.prepNotes}
                      onChange={e => setNotes({ ...notes, prepNotes: e.target.value })}
                      placeholder="Vad behöver du förbereda?"
                    />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={styles.label}>❓ Frågor att ställa</label>
                    <textarea
                      style={styles.textarea}
                      rows={4}
                      value={notes.questions}
                      onChange={e => setNotes({ ...notes, questions: e.target.value })}
                      placeholder="Vilka frågor vill du ta upp?"
                    />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={styles.label}>✅ Efter besöket</label>
                    <textarea
                      style={styles.textarea}
                      rows={4}
                      value={notes.postNotes}
                      onChange={e => setNotes({ ...notes, postNotes: e.target.value })}
                      placeholder="Vad sa läkaren? Vad blev resultatet?"
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      style={{ ...styles.button, ...styles.buttonGhost, flex: 1 }}
                      onClick={() => setIsEditing(false)}
                    >
                      Avbryt
                    </button>
                    <button
                      style={{ ...styles.button, flex: 1 }}
                      onClick={handleSaveNotes}
                    >
                      Spara
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {[
                    { title: '📝 Förberedelser', content: appointment.prepNotes },
                    { title: '❓ Frågor att ställa', content: appointment.questions },
                    { title: '✅ Efter besöket', content: appointment.postNotes },
                  ].map((section, i) => (
                    <div
                      key={i}
                      style={{
                        marginBottom: '1rem',
                        padding: '1rem',
                        background: '#fafbfc',
                        borderRadius: '10px',
                      }}
                    >
                      <strong>{section.title}</strong>
                      <p style={{ margin: '0.5rem 0 0', color: colors.textLight }}>
                        {section.content || 'Inga anteckningar'}
                      </p>
                    </div>
                  ))}
                  <button
                    style={{ ...styles.button, ...styles.buttonSecondary, width: '100%' }}
                    onClick={() => setIsEditing(true)}
                  >
                    ✏️ Redigera anteckningar
                  </button>
                </>
              )}
            </>
          )}

          {/* Medications Tab */}
          {activeTab === 'meds' && (
            <>
              <h4 style={{ marginTop: 0 }}>💊 Läkemedel vid besöket</h4>
              {appointment.medicationsAtTime?.length > 0 ? (
                appointment.medicationsAtTime.map(med => (
                  <div
                    key={med.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      background: '#f8faf9',
                      borderRadius: '8px',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <strong>{med.name}</strong>
                    <span style={{ color: colors.textMuted }}>{med.dosage}</span>
                  </div>
                ))
              ) : (
                <p style={{ color: colors.textMuted }}>Inga läkemedel registrerade vid detta tillfälle</p>
              )}

              <h4 style={{ marginTop: '1.5rem' }}>💊 Nuvarande aktiva läkemedel</h4>
              {medications.filter(m => m.active).length > 0 ? (
                medications.filter(m => m.active).map(med => (
                  <div
                    key={med.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      background: '#e8f5e9',
                      borderRadius: '8px',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <strong>{med.name}</strong>
                    <span style={{ color: colors.textMuted }}>{med.dosage}</span>
                  </div>
                ))
              ) : (
                <p style={{ color: colors.textMuted }}>Inga aktiva läkemedel</p>
              )}
            </>
          )}

          {/* Diary Tab */}
          {activeTab === 'diary' && (
            <>
              <h4 style={{ marginTop: 0 }}>📔 Anteckningar för detta besök</h4>
              {diaryEntries.length > 0 ? (
                diaryEntries.map(entry => (
                  <div
                    key={entry.id}
                    style={{
                      padding: '1rem',
                      background: '#fafbfc',
                      borderRadius: '10px',
                      borderLeft: `4px solid ${colors.primary}`,
                      marginBottom: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: colors.textMuted }}>{formatDate(entry.date)}</span>
                      <span style={{ fontSize: '1.5rem' }}>{getMood(entry.mood)}</span>
                    </div>
                    {entry.symptoms && (
                      <div style={{ marginTop: '0.5rem' }}>
                        {entry.symptoms.split(',').map((s, i) => (
                          <span key={i} style={styles.symptomTag}>{s.trim()}</span>
                        ))}
                      </div>
                    )}
                    {entry.text && (
                      <p style={{ margin: '0.5rem 0 0', color: colors.textLight }}>
                        {entry.text}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p style={{ color: colors.textMuted }}>Inga anteckningar kopplade till detta besök</p>
              )}

              <h4 style={{ marginTop: '1.5rem' }}>➕ Lägg till anteckning</h4>
              <div style={{ marginBottom: '1rem' }}>
                <label style={styles.label}>Humör</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[1, 2, 3, 4, 5].map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setNewEntry({ ...newEntry, mood: level })}
                      style={{
                        fontSize: '1.5rem',
                        padding: '0.5rem',
                        border: `2px solid ${newEntry.mood === level ? colors.primary : colors.border}`,
                        borderRadius: '10px',
                        background: newEntry.mood === level ? '#e8f5e9' : 'white',
                        cursor: 'pointer',
                        transform: newEntry.mood === level ? 'scale(1.1)' : 'scale(1)',
                      }}
                    >
                      {getMood(level)}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={styles.label}>Symtom</label>
                <input
                  style={styles.input}
                  placeholder="huvudvärk, yrsel..."
                  value={newEntry.symptoms}
                  onChange={e => setNewEntry({ ...newEntry, symptoms: e.target.value })}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={styles.label}>Anteckning</label>
                <textarea
                  style={styles.textarea}
                  rows={3}
                  placeholder="Hur var besöket?"
                  value={newEntry.text}
                  onChange={e => setNewEntry({ ...newEntry, text: e.target.value })}
                />
              </div>
              <button
                style={styles.button}
                onClick={handleAddDiaryEntry}
                disabled={!newEntry.text.trim()}
              >
                Lägg till
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
