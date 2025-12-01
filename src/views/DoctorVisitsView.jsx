import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAI } from '../hooks/useAI';
import { Card, Button, Modal, Textarea, Select } from '../components/common';
import { AppointmentFormFields } from '../components/forms/AppointmentFormFields';
import { generateId, formatDate, APPOINTMENT_TYPES } from '../utils/helpers';
import './DoctorVisitsView.css';

export function DoctorVisitsView() {
  const { state, actions } = useApp();
  const { doctorVisits, diagnoses, visitAiNotes, medications = [], appointments = [] } = state;
  const { analyzeDoctorVisit, isLoading } = useAI();

  const [filterDiagnosis, setFilterDiagnosis] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingVisit, setEditingVisit] = useState(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [hasSavedAnalysis, setHasSavedAnalysis] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('Besöksanalys');

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    location: '',
    diagnosisId: '',
    title: '',
    doctor: '',
    type: 'checkup',
    purpose: '',
    prepNotes: '',
    reminder: false,
    notes: '',
  });

  const diagnosisOptions = useMemo(() => (
    diagnoses.map(diag => ({ value: diag.id, label: diag.name }))
  ), [diagnoses]);
  const activeMedications = useMemo(() => (
    medications.filter(m => m?.active)
  ), [medications]);

  const filteredVisits = useMemo(() => {
    return doctorVisits
      .filter(v => (filterDiagnosis ? v.diagnosisId === filterDiagnosis : true))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [doctorVisits, filterDiagnosis]);

  const handleOpenNew = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      location: '',
      diagnosisId: '',
      title: '',
      doctor: '',
      type: 'checkup',
      purpose: '',
      prepNotes: '',
      reminder: false,
      notes: '',
    });
    setEditingVisit(null);
    setShowModal(true);
  };

  const handleOpenEdit = (visit) => {
    setFormData({
      date: visit.date,
      diagnosisId: visit.diagnosisId || '',
      title: visit.title || '',
      doctor: visit.doctor || '',
      time: visit.time || '09:00',
      location: visit.location || '',
      type: visit.type || 'checkup',
      purpose: visit.purpose || '',
      prepNotes: visit.prepNotes || '',
      reminder: Boolean(visit.reminder),
      notes: visit.notes || '',
    });
    setEditingVisit(visit);
    setShowModal(true);
  };

  const handleOpenDetail = (visit) => {
    setSelectedVisit(visit);
    setShowDetailModal(true);
  };
  
  const syncAppointmentWithCalendar = (visitValues, existingAppointmentId = null) => {
    const appointmentId = existingAppointmentId || generateId();
    const existingAppointment = appointments.find(a => a.id === appointmentId);
    
    const appointmentPayload = {
      id: appointmentId,
      title: visitValues.title || diagnoses.find(d => d.id === visitValues.diagnosisId)?.name || 'Läkarbesök',
      date: visitValues.date,
      time: visitValues.time || '09:00',
      location: visitValues.location || '',
      doctor: visitValues.doctor || '',
      type: visitValues.type || 'checkup',
      diagnosisId: visitValues.diagnosisId || '',
      purpose: visitValues.purpose || '',
      prepNotes: visitValues.prepNotes || '',
      reminder: Boolean(visitValues.reminder),
      medicationsAtTime: activeMedications.map(m => ({
        id: m.id,
        name: m.name,
        dosage: m.dosage,
        times: m.times,
      })),
      postNotes: existingAppointment?.postNotes || '',
      questions: existingAppointment?.questions || [],
    };

    if (existingAppointmentId) {
      actions.updateAppointment(appointmentPayload);
    } else {
      actions.addAppointment(appointmentPayload);
    }

    return appointmentId;
  };

  const handleSaveVisit = () => {
    if (!formData.date || !formData.notes.trim()) return;
    const appointmentId = syncAppointmentWithCalendar(formData, editingVisit?.appointmentId || null);
    if (editingVisit) {
      actions.updateVisit({ ...editingVisit, ...formData, appointmentId });
    } else {
      actions.addVisit({ id: generateId(), ...formData, appointmentId, createdAt: new Date().toISOString() });
    }
    setShowModal(false);
  };

  const handleDeleteVisit = (visit) => {
    if (window.confirm('Vill du ta bort detta läkarbesök?')) {
      actions.deleteVisit(visit.id);
      if (visit.appointmentId) {
        actions.deleteAppointment(visit.appointmentId);
      }
    }
  };

  const openAiAnalysis = (visit) => {
    setSelectedVisit(visit);
    setAnalysis('');
    setHasSavedAnalysis(false);
    setCurrentQuestion(visit.title || 'Besöksanalys');
    setShowAiModal(true);
  };

  const handleRunAnalysis = async () => {
    if (!selectedVisit) return;
    const diagnosis = diagnoses.find(d => d.id === selectedVisit.diagnosisId);
    const result = await analyzeDoctorVisit(selectedVisit, diagnosis);
    setAnalysis(result);
    setHasSavedAnalysis(false);
  };

  const handleSaveAnalysis = () => {
    if (!selectedVisit || !analysis || hasSavedAnalysis) return;
    const note = {
      id: generateId(),
      question: currentQuestion || 'Besöksanalys',
      answer: analysis,
      createdAt: new Date().toISOString(),
    };
    actions.addVisitAnalysis(selectedVisit.id, note);
    setHasSavedAnalysis(true);
  };

  const savedAnalyses = selectedVisit ? (visitAiNotes[selectedVisit.id] || []).slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];

  const handleDeleteAnalysis = (noteId) => {
    if (!selectedVisit) return;
    actions.deleteVisitAnalysis(selectedVisit.id, noteId);
  };

  const getSnippet = (text = '') => {
    if (!text) return '';
    const sentences = text.split(/(?<=[.!?])\s+/);
    const snippet = sentences.slice(0, 2).join(' ');
    return sentences.length > 2 ? `${snippet} …` : snippet;
  };

  return (
    <div className="doctor-visits-view">
      <div className="view-header">
        <div>
          <h1 className="page-title">Läkarbesök</h1>
          <p className="page-subtitle">Samla dina anteckningar från varje besök och koppla dem till diagnoser.</p>
        </div>
        <Button onClick={handleOpenNew}>+ Nytt besök</Button>
      </div>

      <div className="filter-row">
        <Select
          label="Filtrera på diagnos"
          value={filterDiagnosis}
          onChange={(e) => setFilterDiagnosis(e.target.value)}
          options={diagnosisOptions}
          placeholder="Alla diagnoser"
        />
      </div>

      {filteredVisits.length === 0 ? (
        <Card className="empty-state">
          <span className="empty-icon">🩺</span>
          <p>Inga läkarbesök registrerade ännu.</p>
        </Card>
      ) : (
        <div className="visits-list">
          {filteredVisits.map(visit => (
            <Card key={visit.id} className="visit-card">
                <div className="visit-header">
                <div>
                  {visit.title && (
                    <button className="visit-title" onClick={() => handleOpenDetail(visit)}>
                      {visit.title}
                    </button>
                  )}
                  {!visit.title && (
                    <button className="visit-title" onClick={() => handleOpenDetail(visit)}>
                      {formatDate(visit.date)}
                    </button>
                  )}
                  <div className="visit-date">{formatDate(visit.date)}</div>
                </div>
                <div className="visit-actions">
                  <Button size="small" variant="ghost" onClick={() => openAiAnalysis(visit)}>
                    🤖 AI-analys
                  </Button>
                  <Button size="small" variant="ghost" onClick={() => handleOpenEdit(visit)}>
                    ✏️ Redigera
                  </Button>
                  <Button size="small" variant="ghost" onClick={() => handleDeleteVisit(visit)}>
                    🗑 Ta bort
                  </Button>
                </div>
              </div>
              <div className="visit-meta">
                <span>Diagnos: {diagnoses.find(d => d.id === visit.diagnosisId)?.name || 'Ej vald'}</span>
                {visit.doctor && (
                  <span className="visit-doctor">Läkare: {visit.doctor}</span>
                )}
                {visit.location && (
                  <span className="visit-location">Plats: {visit.location}</span>
                )}
                {visit.time && (
                  <span className="visit-time">Tid: {visit.time}</span>
                )}
              </div>
              <p className="visit-notes">{getSnippet(visit.notes)}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingVisit ? 'Redigera besök' : 'Nytt läkarbesök'}
        icon="🩺"
      >
        <AppointmentFormFields
          formData={formData}
          setFormData={setFormData}
          appointmentTypes={APPOINTMENT_TYPES}
          diagnosisOptions={diagnosisOptions}
        />
        <div className="form-group">
          <Textarea
            label="Anteckningar"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={5}
            placeholder="Beskriv vad som sades på besöket..."
            required
          />
        </div>
        <div className="modal-actions">
          {editingVisit && (
            <Button variant="danger" onClick={() => handleDeleteVisit(editingVisit)}>
              Ta bort
            </Button>
          )}
          <div className="modal-actions-right">
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              Avbryt
            </Button>
            <Button onClick={handleSaveVisit}>
              {editingVisit ? 'Spara' : 'Lägg till'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDetailModal && Boolean(selectedVisit)}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedVisit(null);
        }}
        title="Detaljerat besök"
        icon="🩺"
      >
        {selectedVisit && (
          <div className="visit-detail">
            <p><strong>Datum:</strong> {formatDate(selectedVisit.date)}</p>
            <p><strong>Diagnos:</strong> {diagnoses.find(d => d.id === selectedVisit.diagnosisId)?.name || 'Ej vald'}</p>
            {selectedVisit.title && <p><strong>Rubrik:</strong> {selectedVisit.title}</p>}
            {selectedVisit.time && <p><strong>Tid:</strong> {selectedVisit.time}</p>}
            {selectedVisit.location && <p><strong>Plats:</strong> {selectedVisit.location}</p>}
            {selectedVisit.doctor && <p><strong>Läkare:</strong> {selectedVisit.doctor}</p>}
            {selectedVisit.purpose && (
              <p><strong>Syfte:</strong> {selectedVisit.purpose}</p>
            )}
            {selectedVisit.prepNotes && (
              <p><strong>Förberedelser:</strong> {selectedVisit.prepNotes}</p>
            )}
            <p><strong>Anteckningar:</strong></p>
            <p>{selectedVisit.notes}</p>
            <div className="visit-detail-actions">
              <Button variant="ghost" onClick={() => { setShowDetailModal(false); handleOpenEdit(selectedVisit); }}>
                ✏️ Redigera
              </Button>
              <Button variant="secondary" onClick={() => { setShowDetailModal(false); openAiAnalysis(selectedVisit); }}>
                🤖 AI-analys
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* AI Modal */}
      <Modal
        isOpen={showAiModal}
        onClose={() => {
          setShowAiModal(false);
          setSelectedVisit(null);
          setAnalysis('');
        }}
        title="AI-analys"
        icon="🤖"
        size="large"
      >
        {selectedVisit && (
          <div className="visit-ai">
            <div className="visit-ai-header">
              <h3>{selectedVisit.title || formatDate(selectedVisit.date)}</h3>
              <Button onClick={handleRunAnalysis} disabled={isLoading}>
                {isLoading ? 'Analyserar...' : '🔍 Kör analys'}
              </Button>
            </div>
            {analysis ? (
              <div className="visit-ai-result">
                {analysis.split('\n').map((paragraph, idx) => (
                  paragraph.trim() && <p key={idx}>{paragraph}</p>
                ))}
                <div className="visit-ai-actions">
                  <Button
                    variant="secondary"
                    onClick={handleSaveAnalysis}
                    disabled={hasSavedAnalysis}
                  >
                    {hasSavedAnalysis ? '✅ Sparad' : '💾 Spara analys'}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="visit-ai-placeholder">
                Kör en AI-analys för att få en sammanfattning av besöket.
              </p>
            )}

            <div className="visit-ai-history">
              <h4>Tidigare sparade analyser</h4>
              {savedAnalyses.length === 0 ? (
                <p className="ai-history-empty">Inga sparade analyser.</p>
              ) : (
                <div className="ai-history-list">
                  {savedAnalyses.map(note => (
                    <div
                      key={note.id}
                      className="ai-history-item"
                      onClick={() => {
                        setAnalysis(note.answer);
                        setHasSavedAnalysis(true);
                        setCurrentQuestion(note.question || 'Besöksanalys');
                      }}
                    >
                      <div className="ai-history-meta">
                        <span>{new Date(note.createdAt).toLocaleString('sv-SE')}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAnalysis(note.id);
                          }}
                        >
                          🗑
                        </button>
                      </div>
                      {note.answer.split('\n').map((text, idx) => (
                        text.trim() && <p key={idx}>{text}</p>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default DoctorVisitsView;
