import React, { useMemo, useState } from 'react';
import { styles, colors } from '../styles/styles';
import { formatDate } from '../utils/helpers';

export function Diagnoses({ diagnoses, setDiagnoses, ai, isMobile }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [detailDiag, setDetailDiag] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    doctor: '',
    description: '',
    treatments: '',
  });

  const sortedDiagnoses = useMemo(() => (
    [...diagnoses].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
  ), [diagnoses]);

  const resetForm = () => {
    setFormData({
      name: '',
      date: new Date().toISOString().split('T')[0],
      doctor: '',
      description: '',
      treatments: '',
    });
    setEditingId(null);
  };

  const handleToggleForm = () => {
    if (showForm) {
      setShowForm(false);
      resetForm();
    } else {
      resetForm();
      setShowForm(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingId) {
      setDiagnoses(diagnoses.map(d => (
        d.id === editingId ? { ...d, ...formData } : d
      )));
    } else {
      const newDiagnosis = {
        ...formData,
        id: Date.now(),
        createdAt: new Date().toISOString(),
      };
      setDiagnoses([...diagnoses, newDiagnosis]);
    }

    resetForm();
    setShowForm(false);
  };

  const handleDelete = (diagnosis) => {
    if (!window.confirm('Är du säker på att du vill ta bort denna diagnos?')) return;
    setDiagnoses(diagnoses.filter(d => d.id !== diagnosis.id));
    if (editingId === diagnosis.id) {
      resetForm();
      setShowForm(false);
    }
    if (detailDiag?.id === diagnosis.id) {
      setShowDetailModal(false);
      setDetailDiag(null);
    }
  };

  const handleAnalyze = (diagnosis) => {
    ai.analyzeDiagnosis(diagnosis);
  };

  const handleOpenEdit = (diagnosis) => {
    setFormData({
      name: diagnosis.name || '',
      date: diagnosis.date || new Date().toISOString().split('T')[0],
      doctor: diagnosis.doctor || '',
      description: diagnosis.description || '',
      treatments: diagnosis.treatments || '',
    });
    setEditingId(diagnosis.id);
    setShowForm(true);
  };

  const openDetailModal = (diagnosis) => {
    setDetailDiag(diagnosis);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setDetailDiag(null);
    setShowDetailModal(false);
  };

  const getSnippet = (text = '') => {
    if (!text) return '';
    const sentences = text.split(/(?<=[.!?])\s+/);
    const snippet = sentences.slice(0, 2).join(' ');
    return sentences.length > 2 ? `${snippet} …` : snippet;
  };

  return (
    <div style={styles.contentInner}>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>🔬 Diagnoser</h2>
        <button style={styles.button} onClick={handleToggleForm}>
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
        sortedDiagnoses.map(diag => (
          <div key={diag.id} style={styles.card}>
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'flex-start' : 'center',
              gap: '0.75rem',
              marginBottom: '0.5rem',
            }}>
              <div style={{ flex: 1 }}>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: colors.primary,
                    fontWeight: 700,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onClick={() => openDetailModal(diag)}
                >
                  {diag.name}
                </button>
                <div style={{ color: colors.textMuted, fontSize: '0.85rem', marginTop: '0.2rem' }}>
                  {formatDate(diag.date)}
                </div>
              </div>
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap',
                justifyContent: isMobile ? 'flex-start' : 'flex-end',
              }}>
              <button
                style={{ ...styles.button, ...styles.buttonGhost }}
                onClick={() => handleAnalyze(diag)}
                disabled={ai.isLoading}
              >
                {ai.isLoading ? '⏳ Analyserar...' : '🤖 AI-analys'}
                </button>
                <button
                  style={{ ...styles.button, ...styles.buttonGhost }}
                  onClick={() => handleOpenEdit(diag)}
                >
                  ✏️ Redigera
                </button>
                <button
                  style={{ ...styles.button, ...styles.buttonGhost }}
                  onClick={() => handleDelete(diag)}
                >
                  🗑 Ta bort
                </button>
              </div>
            </div>

            {diag.doctor && (
              <p style={{ color: colors.textLight, margin: '0.25rem 0' }}>
                👨‍⚕️ {diag.doctor}
              </p>
            )}

            {diag.description && (
              <p style={{ color: colors.textLight, lineHeight: 1.6, margin: '0.5rem 0' }}>
                {getSnippet(diag.description)}
              </p>
            )}

            {diag.treatments && (
              <div style={{
                background: '#f8faf9',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                marginBottom: '0.5rem',
              }}>
                <strong>💊 Behandling:</strong> {diag.treatments}
              </div>
            )}
          </div>
        ))
      )}

      {/* Detail Modal */}
      {showDetailModal && detailDiag && (
        <div style={styles.overlay} onClick={closeDetailModal}>
          <div
            style={{ ...styles.modal, maxWidth: '600px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>{detailDiag.name}</h3>
              <button style={styles.modalClose} onClick={closeDetailModal}>
                ✕
              </button>
            </div>
            <div style={styles.modalBody}>
              <p><strong>Datum:</strong> {formatDate(detailDiag.date)}</p>
              {detailDiag.doctor && <p><strong>Läkare:</strong> {detailDiag.doctor}</p>}
              {detailDiag.description && (
                <>
                  <p><strong>Beskrivning:</strong></p>
                  <p>{detailDiag.description}</p>
                </>
              )}
              {detailDiag.treatments && (
                <p><strong>Behandling:</strong> {detailDiag.treatments}</p>
              )}
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap',
                marginTop: '1rem',
              }}>
                <button
                  style={{ ...styles.button, ...styles.buttonSecondary }}
                  onClick={() => {
                    handleAnalyze(detailDiag);
                    closeDetailModal();
                  }}
                >
                  🤖 AI-analys
                </button>
                <button
                  style={{ ...styles.button, ...styles.buttonGhost }}
                  onClick={() => {
                    closeDetailModal();
                    handleOpenEdit(detailDiag);
                  }}
                >
                  ✏️ Redigera
                </button>
                <button
                  style={{ ...styles.button, ...styles.buttonGhost }}
                  onClick={() => handleDelete(detailDiag)}
                >
                  🗑 Ta bort
                </button>
              </div>
            </div>
          </div>
        </div>
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
