import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAI } from '../hooks/useAI';
import { Card, Button, Modal, Input, Textarea } from '../components/common';
import { generateId, formatDate } from '../utils/helpers';
import './DiagnosesView.css';

export function DiagnosesView() {
  const { state, actions } = useApp();
  const { diagnoses, aiNotes } = state;
  const { analyzeDiagnosis, askDiagnosisFollowUp, isLoading } = useAI();
  
  const [showModal, setShowModal] = useState(false);
  const [selectedDiag, setSelectedDiag] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [hasSavedResponse, setHasSavedResponse] = useState(false);
  const [followupQuestion, setFollowupQuestion] = useState('');
  const [activeHistoryId, setActiveHistoryId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailDiag, setDetailDiag] = useState(null);
  const [focusAiSection, setFocusAiSection] = useState(false);
  const aiSectionRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    doctor: '',
    description: '',
    treatment: '',
  });

  const openNewDiagnosis = () => {
    setFormData({
      name: '',
      date: new Date().toISOString().split('T')[0],
      doctor: '',
      description: '',
      treatment: '',
    });
    setSelectedDiag(null);
    setShowModal(true);
  };

  const openEditDiagnosis = (diag) => {
    setFormData({
      name: diag.name,
      date: diag.date,
      doctor: diag.doctor || '',
      description: diag.description || '',
      treatment: diag.treatment || '',
    });
    setSelectedDiag(diag);
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!formData.name) return;

    if (selectedDiag) {
      actions.updateDiagnosis({ ...selectedDiag, ...formData });
    } else {
      actions.addDiagnosis({ id: generateId(), ...formData });
    }

    setShowModal(false);
  };

  const handleDelete = () => {
    if (selectedDiag && window.confirm('Vill du ta bort denna diagnos?')) {
      actions.deleteDiagnosis(selectedDiag.id);
      setShowModal(false);
    }
  };

  const handleDeleteQuick = (diag) => {
    if (window.confirm('Vill du ta bort denna diagnos?')) {
      actions.deleteDiagnosis(diag.id);
      if (detailDiag?.id === diag.id) {
        closeDetailModal();
      }
    }
  };

  const getSortedResponses = (diagId) => {
    if (!diagId || !aiNotes) return [];
    const responses = aiNotes[diagId] || [];
    return [...responses].sort((a, b) => {
      const aTime = new Date(a.createdAt || 0).getTime();
      const bTime = new Date(b.createdAt || 0).getTime();
      return bTime - aTime;
    });
  };

  const initializeAiView = (diag) => {
    if (!diag) return;
    const sorted = getSortedResponses(diag.id);
    setFollowupQuestion('');

    if (sorted.length > 0) {
      const latest = sorted[0];
      setAiAnalysis(latest.answer);
      setCurrentQuestion(latest.question || 'Sparat svar');
      setHasSavedResponse(true);
      setActiveHistoryId(latest.id);
    } else {
      setAiAnalysis(null);
      setCurrentQuestion('');
      setHasSavedResponse(false);
      setActiveHistoryId(null);
    }
  };

  const openDetailView = (diag, focusAi = false) => {
    setDetailDiag(diag);
    setShowDetailModal(true);
    initializeAiView(diag);
    setFocusAiSection(focusAi);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setDetailDiag(null);
    setAiAnalysis(null);
    setCurrentQuestion('');
    setHasSavedResponse(false);
    setActiveHistoryId(null);
    setFollowupQuestion('');
  };

  useEffect(() => {
    if (showDetailModal && focusAiSection && aiSectionRef.current) {
      aiSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setFocusAiSection(false);
    }
  }, [showDetailModal, focusAiSection]);

  const handleRunNewAnalysis = async () => {
    if (!detailDiag) return;
    setAiAnalysis(null);
    setCurrentQuestion('Översiktlig analys');
    setHasSavedResponse(false);
    setActiveHistoryId(null);
    const result = await analyzeDiagnosis(detailDiag);
    setAiAnalysis(result);
  };

  const handleSaveCurrentResponse = () => {
    if (!detailDiag || !aiAnalysis || hasSavedResponse) return;

    const note = {
      id: generateId(),
      question: currentQuestion || 'AI-analys',
      answer: aiAnalysis,
      createdAt: new Date().toISOString(),
    };

    actions.addAiNote(detailDiag.id, note);
    actions.addNotification('AI-svar sparat', 'success');
    setHasSavedResponse(true);
    setActiveHistoryId(note.id);
  };

  const handleFollowupSubmit = async () => {
    if (!detailDiag || !followupQuestion.trim()) return;

    const question = followupQuestion.trim();
    setAiAnalysis(null);
    setCurrentQuestion(question);
    setHasSavedResponse(false);
    setActiveHistoryId(null);
    
    const result = await askDiagnosisFollowUp(detailDiag, question);
    setAiAnalysis(result);
    setFollowupQuestion('');
  };

  const handleDeleteSavedResponse = (noteId) => {
    if (!detailDiag) return;
    const confirmed = window.confirm('Ta bort detta sparade svar?');
    if (!confirmed) return;
    actions.deleteAiNote(detailDiag.id, noteId);
    actions.addNotification('AI-svar borttaget', 'info');
    if (activeHistoryId === noteId) {
      setAiAnalysis(null);
      setCurrentQuestion('');
      setHasSavedResponse(false);
      setActiveHistoryId(null);
    }
  };

  const savedResponses = detailDiag ? getSortedResponses(detailDiag.id) : [];

  const scrollToAiSection = () => {
    if (aiSectionRef.current) {
      aiSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      setFocusAiSection(true);
    }
  };

  const renderSavedAnswer = (answer) => {
    return answer.split('\n').map((paragraph, idx) => (
      paragraph.trim() ? <p key={idx}>{paragraph}</p> : null
    ));
  };

  const handleSelectSavedResponse = (note) => {
    setAiAnalysis(note.answer);
    setCurrentQuestion(note.question || 'Sparat svar');
    setHasSavedResponse(true);
    setActiveHistoryId(note.id);
  };

  const getSnippet = (text = '') => {
    if (!text) return '';
    const sentences = text.split(/(?<=[.!?])\s+/);
    const snippet = sentences.slice(0, 2).join(' ');
    return sentences.length > 2 ? `${snippet} …` : snippet;
  };

  return (
    <div className="diagnoses-view">
      <div className="view-header">
        <h1 className="page-title">Diagnoser</h1>
        <Button onClick={openNewDiagnosis}>+ Lägg till</Button>
      </div>

      {diagnoses.length === 0 ? (
        <Card className="empty-state">
          <span className="empty-icon">🔬</span>
          <p>Inga diagnoser registrerade</p>
          <Button onClick={openNewDiagnosis}>Lägg till din första diagnos</Button>
        </Card>
      ) : (
        <div className="diagnoses-list">
          {diagnoses.map(diag => (
            <Card key={diag.id} className="diag-card">
              <div className="diag-header">
                <div className="diag-header-main">
                <button className="diag-title" onClick={() => openDetailView(diag)}>
                  {diag.name}
                </button>
                  <span className="diag-date">{formatDate(diag.date)}</span>
                </div>
                <div className="diag-actions">
                  <Button 
                    variant="ghost" 
                    size="small"
                    onClick={() => openDetailView(diag, true)}
                  >
                    🤖 AI-analys
                  </Button>
                  <Button variant="ghost" size="small" onClick={() => openEditDiagnosis(diag)}>
                    ✏️ Redigera
                  </Button>
                  <Button variant="ghost" size="small" onClick={() => handleDeleteQuick(diag)}>
                    🗑 Ta bort
                  </Button>
                </div>
              </div>
              
              {diag.doctor && (
                <p className="diag-doctor">👨‍⚕️ {diag.doctor}</p>
              )}
              
              {diag.description && (
                <p className="diag-description">{getSnippet(diag.description)}</p>
              )}
              
              {diag.treatment && (
                <div className="diag-treatment">
                  <strong>Behandling:</strong> {diag.treatment}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedDiag ? 'Redigera diagnos' : 'Ny diagnos'}
        icon="🔬"
      >
        <div className="form-group">
          <Input
            label="Diagnosnamn"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="T.ex. Hypertoni"
            required
          />
        </div>

        <div className="form-row-2">
          <Input
            label="Datum"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
          
          <Input
            label="Läkare"
            value={formData.doctor}
            onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
            placeholder="T.ex. Dr. Andersson"
          />
        </div>

        <div className="form-group">
          <Textarea
            label="Beskrivning"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Beskriv diagnosen..."
            rows={3}
          />
        </div>

        <div className="form-group">
          <Textarea
            label="Behandling"
            value={formData.treatment}
            onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
            placeholder="Aktuell behandling..."
            rows={3}
          />
        </div>

        <div className="modal-actions">
          {selectedDiag && (
            <Button variant="danger" onClick={handleDelete}>
              Ta bort
            </Button>
          )}
          <div className="modal-actions-right">
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              Avbryt
            </Button>
            <Button onClick={handleSubmit}>
              {selectedDiag ? 'Spara' : 'Lägg till'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDetailModal && Boolean(detailDiag)}
        onClose={closeDetailModal}
        title="Detaljerad diagnos"
        icon="🔬"
        size="large"
      >
        {detailDiag && (
          <div className="diag-detail">
            <p><strong>Datum:</strong> {formatDate(detailDiag.date)}</p>
            {detailDiag.doctor && <p><strong>Läkare:</strong> {detailDiag.doctor}</p>}
            {detailDiag.description && (
              <>
                <p><strong>Beskrivning:</strong></p>
                <p>{detailDiag.description}</p>
              </>
            )}
            {detailDiag.treatment && (
              <p><strong>Behandling:</strong> {detailDiag.treatment}</p>
            )}
            <div className="diag-detail-actions">
              <Button variant="ghost" onClick={() => { closeDetailModal(); openEditDiagnosis(detailDiag); }}>
                ✏️ Redigera
              </Button>
              <Button variant="secondary" onClick={scrollToAiSection}>
                🤖 AI-analys
              </Button>
            </div>

            <div className="ai-analysis" ref={aiSectionRef}>
              <div className="ai-diagnosis-header">
                <div>
                  <h3>{detailDiag.name}</h3>
                  <p>AI-stöd för denna diagnos</p>
                </div>
                <Button 
                  variant="outline"
                  size="small"
                  onClick={handleRunNewAnalysis}
                  disabled={isLoading}
                >
                  {isLoading ? '⏳ Kör analys...' : '🔄 Kör ny analys'}
                </Button>
              </div>
              
              {isLoading ? (
                <div className="ai-loading">
                  <div className="spinner" />
                  <p>Analyserar diagnos...</p>
                </div>
              ) : aiAnalysis ? (
                <div className="ai-content">
                  <div className="ai-text">
                    {renderSavedAnswer(aiAnalysis)}
                  </div>
                  <div className="ai-disclaimer">
                    ⚠️ Denna information är endast för allmän förståelse och ersätter inte medicinsk rådgivning. Kontakta alltid din läkare vid frågor.
                  </div>
                  <div className="ai-actions">
                    <Button 
                      variant="secondary"
                      onClick={handleSaveCurrentResponse}
                      disabled={hasSavedResponse}
                    >
                      {hasSavedResponse ? '✅ Svar sparat' : '💾 Spara svar'}
                    </Button>
                  </div>
                </div>
              ) : savedResponses.length > 0 ? (
                <div className="ai-empty">
                  <p>Välj ett sparat svar i listan nedan för att läsa AI-analysen.</p>
                </div>
              ) : (
                <div className="ai-empty">
                  <p>Inga AI-analyser ännu. Klicka på &quot;Kör ny analys&quot; för att komma igång.</p>
                </div>
              )}

              <div className="ai-followup">
                <Textarea
                  label="Ställ en följdfråga"
                  value={followupQuestion}
                  onChange={(e) => setFollowupQuestion(e.target.value)}
                  placeholder="T.ex. Vilka vanliga biverkningar kan jag förvänta mig?"
                  rows={3}
                  disabled={isLoading}
                />
                <Button
                  onClick={handleFollowupSubmit}
                  disabled={isLoading || !followupQuestion.trim()}
                >
                  {isLoading ? '⏳ Analyserar...' : 'Skicka fråga'}
                </Button>
              </div>

              <div className="ai-history">
                <div className="ai-history-header">
                  <h4>Tidigare sparade svar</h4>
                  <p>AI-svar sparas per diagnos så att du kan gå tillbaka senare.</p>
                </div>
                {savedResponses.length === 0 ? (
                  <p className="ai-history-empty">Inga sparade svar ännu.</p>
                ) : (
                  <div className="ai-history-list">
                    {savedResponses.map(note => (
                      <div 
                        key={note.id} 
                        className={`ai-history-item ${note.id === activeHistoryId ? 'active' : ''}`}
                        onClick={() => handleSelectSavedResponse(note)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleSelectSavedResponse(note);
                          }
                        }}
                      >
                        <div className="ai-history-meta">
                          <div className="ai-history-info">
                            <span className="ai-history-question">{note.question}</span>
                            <span className="ai-history-date">
                              {new Date(note.createdAt).toLocaleString('sv-SE', {
                                dateStyle: 'short',
                                timeStyle: 'short'
                              })}
                            </span>
                          </div>
                          <button
                            className="ai-history-delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSavedResponse(note.id);
                            }}
                          >
                            🗑 Ta bort
                          </button>
                        </div>
                        <div className="ai-history-answer">
                          {renderSavedAnswer(note.answer)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default DiagnosesView;
