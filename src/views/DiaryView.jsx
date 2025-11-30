import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, Button, Modal, Textarea } from '../components/common';
import { 
  generateId, formatDate, 
  MOOD_EMOJIS, MOOD_LABELS, COMMON_SYMPTOMS,
  getMoodEmoji, getMoodLabel 
} from '../utils/helpers';
import './DiaryView.css';

export function DiaryView() {
  const { state, actions } = useApp();
  const { diaryEntries, appointments } = state;
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    mood: 3,
    symptoms: [],
    notes: '',
    appointmentId: '',
  });

  // Get today's entry if exists
  const today = new Date().toISOString().split('T')[0];
  const todayEntry = diaryEntries.find(e => e.date === today);

  // Recent appointments for linking
  const recentAppointments = appointments
    .filter(a => {
      const aptDate = new Date(a.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return aptDate >= weekAgo && aptDate <= new Date();
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const openNewEntry = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      mood: 3,
      symptoms: [],
      notes: '',
      appointmentId: '',
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    // Check if entry for this date already exists
    const existingEntry = diaryEntries.find(e => e.date === formData.date);
    
    if (existingEntry) {
      if (window.confirm('Det finns redan en anteckning för detta datum. Vill du skriva över den?')) {
        actions.deleteDiaryEntry(existingEntry.id);
      } else {
        return;
      }
    }

    actions.addDiaryEntry({
      id: generateId(),
      ...formData,
    });

    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Vill du ta bort denna anteckning?')) {
      actions.deleteDiaryEntry(id);
    }
  };

  const toggleSymptom = (symptom) => {
    const newSymptoms = formData.symptoms.includes(symptom)
      ? formData.symptoms.filter(s => s !== symptom)
      : [...formData.symptoms, symptom];
    setFormData({ ...formData, symptoms: newSymptoms });
  };

  const getLinkedAppointment = (appointmentId) => {
    return appointments.find(a => a.id === appointmentId);
  };

  return (
    <div className="diary-view">
      <div className="view-header">
        <h1 className="page-title">Hälsodagbok</h1>
        <Button onClick={openNewEntry}>+ Ny anteckning</Button>
      </div>

      {/* Quick add for today */}
      {!todayEntry && (
        <Card className="quick-add-card">
          <h3>Hur mår du idag?</h3>
          <div className="quick-mood-selector">
            {MOOD_EMOJIS.map((emoji, index) => (
              <button
                key={index}
                className="quick-mood-btn"
                onClick={() => {
                  setFormData({ ...formData, mood: index + 1 });
                  setShowModal(true);
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Diary entries */}
      {diaryEntries.length === 0 ? (
        <Card className="empty-state">
          <span className="empty-icon">📔</span>
          <p>Inga dagboksanteckningar ännu</p>
          <Button onClick={openNewEntry}>Skriv din första anteckning</Button>
        </Card>
      ) : (
        <div className="diary-list">
          {diaryEntries.map(entry => {
            const linkedApt = entry.appointmentId ? getLinkedAppointment(entry.appointmentId) : null;
            
            return (
              <Card key={entry.id} className="diary-card">
                <div className="diary-header">
                  <div className="diary-date-mood">
                    <span className="diary-mood-icon">{getMoodEmoji(entry.mood)}</span>
                    <div className="diary-date-info">
                      <span className="diary-date">{formatDate(entry.date)}</span>
                      <span className="diary-mood-label">{getMoodLabel(entry.mood)}</span>
                    </div>
                  </div>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(entry.id)}
                  >
                    🗑️
                  </button>
                </div>

                {entry.symptoms && entry.symptoms.length > 0 && (
                  <div className="diary-symptoms">
                    {entry.symptoms.map((symptom, idx) => (
                      <span key={idx} className="symptom-tag">{symptom}</span>
                    ))}
                  </div>
                )}

                {entry.notes && (
                  <p className="diary-notes">{entry.notes}</p>
                )}

                {linkedApt && (
                  <div className="linked-appointment">
                    <span className="linked-icon">📅</span>
                    <span>Kopplat till: {linkedApt.title}</span>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* New Entry Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Ny dagboksanteckning"
        icon="📔"
      >
        <div className="form-group">
          <label className="input-label">Datum</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="date-input"
          />
        </div>

        <div className="form-group">
          <label className="input-label">Hur mår du?</label>
          <div className="mood-selector">
            {MOOD_EMOJIS.map((emoji, index) => (
              <button
                key={index}
                className={`mood-btn ${formData.mood === index + 1 ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, mood: index + 1 })}
                title={MOOD_LABELS[index]}
              >
                {emoji}
              </button>
            ))}
          </div>
          <span className="mood-label-text">{MOOD_LABELS[formData.mood - 1]}</span>
        </div>

        <div className="form-group">
          <label className="input-label">Symtom (valfritt)</label>
          <div className="symptoms-grid">
            {COMMON_SYMPTOMS.map(symptom => (
              <button
                key={symptom}
                className={`symptom-btn ${formData.symptoms.includes(symptom) ? 'active' : ''}`}
                onClick={() => toggleSymptom(symptom)}
              >
                {symptom}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <Textarea
            label="Anteckningar"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Hur har dagen varit? Något speciellt att notera?"
            rows={4}
          />
        </div>

        {recentAppointments.length > 0 && (
          <div className="form-group">
            <label className="input-label">Koppla till vårdbesök (valfritt)</label>
            <select
              value={formData.appointmentId}
              onChange={(e) => setFormData({ ...formData, appointmentId: e.target.value })}
              className="select-input"
            >
              <option value="">Välj besök...</option>
              {recentAppointments.map(apt => (
                <option key={apt.id} value={apt.id}>
                  {apt.title} - {formatDate(apt.date)}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="modal-actions">
          <Button variant="ghost" onClick={() => setShowModal(false)}>
            Avbryt
          </Button>
          <Button onClick={handleSubmit}>
            Spara
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default DiaryView;
