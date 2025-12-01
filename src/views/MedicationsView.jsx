import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAI } from '../hooks/useAI';
import { Card, Button, Modal, Input, Textarea, Toggle } from '../components/common';
import { generateId, formatDate } from '../utils/helpers';
import './MedicationsView.css';

export function MedicationsView() {
  const { state, actions } = useApp();
  const { medications, medicationLog, medicationAiNotes, medicationInteractionNotes } = state;
  const {
    analyzeMedication,
    askMedicationFollowUp,
    analyzeMedicationInteractions,
    askMedicationInteractionsFollowUp,
    isLoading
  } = useAI();
  
  const [showModal, setShowModal] = useState(false);
  const [selectedMed, setSelectedMed] = useState(null);
  const [filter, setFilter] = useState('active'); // 'active', 'inactive', 'all'
  const [viewMode, setViewMode] = useState('list'); // 'list', 'history', 'analysis'
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiMed, setAiMed] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [followupQuestion, setFollowupQuestion] = useState('');
  const [hasSavedResponse, setHasSavedResponse] = useState(false);
  const [activeHistoryId, setActiveHistoryId] = useState(null);
  const [analysisResult, setAnalysisResult] = useState('');
  const [analysisQuestion, setAnalysisQuestion] = useState('');
  const [analysisFollowup, setAnalysisFollowup] = useState('');
  const [analysisHasSaved, setAnalysisHasSaved] = useState(false);
  const [analysisSaveTitle, setAnalysisSaveTitle] = useState('');
  const [analysisHistoryId, setAnalysisHistoryId] = useState(null);
  const [analysisError, setAnalysisError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    times: ['08:00'],
    instructions: '',
    startDate: new Date().toISOString().split('T')[0],
    active: true,
  });

  const activeMedicationsList = useMemo(() => medications.filter((med) => med.active), [medications]);
  const filteredMeds = medications.filter(med => {
    if (filter === 'active') return med.active;
    if (filter === 'inactive') return !med.active;
    return true;
  });

  const medicationMap = useMemo(() => {
    const map = {};
    medications.forEach((med) => {
      map[med.id] = med.name;
    });
    return map;
  }, [medications]);

  const historyEntries = useMemo(() => {
    if (!medicationLog) return [];
    return Object.entries(medicationLog).map(([date, meds]) => {
      const medNames = Object.keys(meds)
        .map((id) => medicationMap[id])
        .filter(Boolean);
      return {
        date,
        medNames,
        count: medNames.length,
      };
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [medicationLog, medicationMap]);

  const openNewMedication = () => {
    setFormData({
      name: '',
      dosage: '',
      times: ['08:00'],
      instructions: '',
      startDate: new Date().toISOString().split('T')[0],
      active: true,
    });
    setSelectedMed(null);
    setShowModal(true);
  };

  const openEditMedication = (med) => {
    setFormData({
      name: med.name,
      dosage: med.dosage,
      times: med.times || ['08:00'],
      instructions: med.instructions || '',
      startDate: med.startDate || new Date().toISOString().split('T')[0],
      active: med.active,
    });
    setSelectedMed(med);
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.dosage) return;

    if (selectedMed) {
      actions.updateMedication({ ...selectedMed, ...formData });
    } else {
      actions.addMedication({ id: generateId(), ...formData });
    }

    setShowModal(false);
  };

  const handleDelete = () => {
    if (selectedMed && window.confirm('Vill du ta bort detta läkemedel?')) {
      actions.deleteMedication(selectedMed.id);
      setShowModal(false);
    }
  };

  const getMedicationResponses = (medId) => {
    if (!medId) return [];
    const responses = medicationAiNotes?.[medId] || [];
    return [...responses].sort((a, b) => {
      const aTime = new Date(a.createdAt || 0).getTime();
      const bTime = new Date(b.createdAt || 0).getTime();
      return bTime - aTime;
    });
  };

  const renderSavedAnswer = (answer = '') =>
    answer.split('\n').map((paragraph, idx) =>
      paragraph.trim() ? <p key={idx}>{paragraph}</p> : null
    );

  const openAiModal = (med) => {
    setAiMed(med);
    const responses = getMedicationResponses(med.id);
    if (responses.length > 0) {
      const latest = responses[0];
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
    setFollowupQuestion('');
    setShowAiModal(true);
  };

  const closeAiModal = () => {
    setShowAiModal(false);
    setAiMed(null);
    setAiAnalysis(null);
    setCurrentQuestion('');
    setFollowupQuestion('');
    setHasSavedResponse(false);
    setActiveHistoryId(null);
  };

  const handleRunMedicationAnalysis = async () => {
    if (!aiMed) return;
    setCurrentQuestion('Översiktlig analys av läkemedel');
    setHasSavedResponse(false);
    setActiveHistoryId(null);
    setAiAnalysis(null);
    const result = await analyzeMedication(aiMed);
    setAiAnalysis(result);
  };

  const handleMedicationFollowup = async () => {
    if (!aiMed || !followupQuestion.trim()) return;
    const question = followupQuestion.trim();
    setCurrentQuestion(question);
    setHasSavedResponse(false);
    setActiveHistoryId(null);
    setAiAnalysis(null);
    const result = await askMedicationFollowUp(aiMed, question);
    setAiAnalysis(result);
    setFollowupQuestion('');
  };

  const handleSaveMedicationResponse = () => {
    if (!aiMed || !aiAnalysis || hasSavedResponse) return;
    const note = {
      id: generateId(),
      question: currentQuestion || 'AI-analys',
      answer: aiAnalysis,
      createdAt: new Date().toISOString(),
    };
    actions.addMedicationAiNote(aiMed.id, note);
    actions.addNotification('AI-svar sparat', 'success');
    setHasSavedResponse(true);
    setActiveHistoryId(note.id);
  };

  const handleDeleteMedicationResponse = (noteId) => {
    if (!aiMed) return;
    const confirmed = window.confirm('Ta bort detta sparade AI-svar?');
    if (!confirmed) return;
    actions.deleteMedicationAiNote(aiMed.id, noteId);
    actions.addNotification('AI-svar borttaget', 'info');
    if (activeHistoryId === noteId) {
      setAiAnalysis(null);
      setCurrentQuestion('');
      setHasSavedResponse(false);
      setActiveHistoryId(null);
    }
  };

  const handleSelectSavedResponse = (note) => {
    setAiAnalysis(note.answer);
    setCurrentQuestion(note.question || 'Sparat svar');
    setHasSavedResponse(true);
    setActiveHistoryId(note.id);
  };

  const savedResponses = aiMed ? getMedicationResponses(aiMed.id) : [];
  const handleAnalyzeActiveMedications = async () => {
    if (!activeMedicationsList.length) {
      setAnalysisError('Du behöver minst ett aktivt läkemedel för att kunna analysera.');
      setAnalysisResult('');
      setAnalysisQuestion('');
      setAnalysisHasSaved(false);
      setAnalysisHistoryId(null);
      return;
    }
    setAnalysisError('');
    setAnalysisResult('');
    setAnalysisQuestion('Analys av aktiva läkemedel');
    setAnalysisHasSaved(false);
    setAnalysisHistoryId(null);
    setAnalysisSaveTitle('');
    setAnalysisFollowup('');
    const result = await analyzeMedicationInteractions(activeMedicationsList);
    setAnalysisResult(result);
  };

  const handleMedicationInteractionFollowup = async () => {
    if (!activeMedicationsList.length || !analysisFollowup.trim()) return;
    const question = analysisFollowup.trim();
    setAnalysisResult('');
    setAnalysisQuestion(question);
    setAnalysisHasSaved(false);
    setAnalysisHistoryId(null);
    setAnalysisSaveTitle('');
    const result = await askMedicationInteractionsFollowUp(activeMedicationsList, question);
    setAnalysisResult(result);
    setAnalysisFollowup('');
  };

  const handleSaveInteractionAnalysis = () => {
    if (!analysisResult || analysisHasSaved) return;
    const note = {
      id: generateId(),
      title: analysisSaveTitle.trim() || analysisQuestion || 'Analys av aktiva läkemedel',
      question: analysisQuestion || 'Analys av aktiva läkemedel',
      answer: analysisResult,
      createdAt: new Date().toISOString(),
    };
    actions.addMedicationInteractionNote(note);
    actions.addNotification('AI-svar sparat', 'success');
    setAnalysisHasSaved(true);
    setAnalysisHistoryId(note.id);
    setAnalysisSaveTitle('');
  };

  const handleSelectInteractionSaved = (note) => {
    setAnalysisResult(note.answer);
    setAnalysisQuestion(note.title || note.question || 'Sparat svar');
    setAnalysisHasSaved(true);
    setAnalysisHistoryId(note.id);
    setAnalysisError('');
    setAnalysisSaveTitle(note.title || '');
  };

  const handleDeleteInteractionNote = (noteId) => {
    if (!window.confirm('Ta bort detta sparade svar?')) return;
    actions.deleteMedicationInteractionNote(noteId);
    actions.addNotification('AI-svar borttaget', 'info');
    if (analysisHistoryId === noteId) {
      setAnalysisResult('');
      setAnalysisQuestion('');
      setAnalysisHasSaved(false);
      setAnalysisHistoryId(null);
      setAnalysisSaveTitle('');
    }
  };

  const addTime = () => {
    setFormData({ ...formData, times: [...formData.times, '12:00'] });
  };

  const removeTime = (index) => {
    const newTimes = formData.times.filter((_, i) => i !== index);
    setFormData({ ...formData, times: newTimes.length > 0 ? newTimes : ['08:00'] });
  };

  const updateTime = (index, value) => {
    const newTimes = [...formData.times];
    newTimes[index] = value;
    setFormData({ ...formData, times: newTimes });
  };

  const activeMeds = activeMedicationsList.length;
  const inactiveMeds = medications.length - activeMeds;
  const savedInteractionNotes = useMemo(
    () =>
      [...(medicationInteractionNotes || [])].sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      ),
    [medicationInteractionNotes]
  );

  return (
    <div className="medications-view">
      <div className="view-header">
        <h1 className="page-title">Läkemedel</h1>
        <Button onClick={openNewMedication}>+ Lägg till</Button>
      </div>

      <div className="medications-tabs">
        <button
          className={`medications-tab ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => setViewMode('list')}
        >
          Mina läkemedel
        </button>
        <button
          className={`medications-tab ${viewMode === 'history' ? 'active' : ''}`}
          onClick={() => setViewMode('history')}
        >
          Intagshistorik
        </button>
        <button
          className={`medications-tab ${viewMode === 'analysis' ? 'active' : ''}`}
          onClick={() => setViewMode('analysis')}
        >
          Analys av aktiva läkemedel
        </button>
      </div>

      {viewMode === 'list' ? (
        <>
          {/* Filter tabs */}
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              Aktiva ({activeMeds})
            </button>
            <button 
              className={`filter-tab ${filter === 'inactive' ? 'active' : ''}`}
              onClick={() => setFilter('inactive')}
            >
              Avslutade ({inactiveMeds})
            </button>
            <button 
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Alla
            </button>
          </div>

          {/* Medications list */}
          {filteredMeds.length === 0 ? (
            <Card className="empty-state">
              <span className="empty-icon">💊</span>
              <p>
                {filter === 'active' 
                  ? 'Inga aktiva läkemedel' 
                  : filter === 'inactive' 
                    ? 'Inga avslutade läkemedel' 
                    : 'Inga läkemedel registrerade'}
              </p>
              <Button onClick={openNewMedication}>Lägg till ditt första läkemedel</Button>
            </Card>
          ) : (
            <div className="medications-list">
              {filteredMeds.map(med => (
                <Card key={med.id} className={`med-card ${!med.active ? 'inactive' : ''}`}>
                  <div className="med-header">
                    <div className="med-title-row">
                      <h3 className="med-name">{med.name}</h3>
                    </div>
                    <span className="med-dosage">{med.dosage}</span>
                  </div>
                  
                  <div className="med-times">
                    {med.times.map((time, idx) => (
                      <span key={idx} className="time-chip">{time}</span>
                    ))}
                  </div>
                  
                  {med.instructions && (
                    <p className="med-instructions">{med.instructions}</p>
                  )}
                  
                  <div className="med-footer">
                    <span className="med-date">
                      Sedan {formatDate(med.startDate)}
                    </span>
                    <div className="med-actions">
                      <button
                        className="ai-btn"
                        onClick={() => openAiModal(med)}
                        title="AI-analys"
                      >
                        🤖
                      </button>
                      <button 
                        className="edit-btn"
                        onClick={() => openEditMedication(med)}
                      >
                        ✏️
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : viewMode === 'history' ? (
        <div className="med-history-list">
          {historyEntries.length === 0 ? (
            <Card className="empty-state">
              <span className="empty-icon">📅</span>
              <p>Inga registrerade intag ännu. Markera läkemedel på dashboarden för att skapa historik.</p>
            </Card>
          ) : (
            historyEntries.map(entry => (
              <Card key={entry.date} className="history-card">
                <div className="history-header">
                  <div>
                    <h3>{formatDate(entry.date)}</h3>
                    <p>{entry.count} läkemedel markerade</p>
                  </div>
                </div>
                <div className="history-meds">
                  {entry.medNames.length > 0 ? (
                    entry.medNames.map((name, idx) => (
                      <span key={`${entry.date}-${name}-${idx}`} className="history-med-chip">
                        {name}
                      </span>
                    ))
                  ) : (
                    <p className="summary-empty">Inga läkemedel registrerade denna dag.</p>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="medications-analysis">
          <Card>
            <div className="analysis-header">
              <div>
                <h2>Analys av aktiva läkemedel</h2>
                <p className="analysis-subtitle">
                  Kör en AI-analys för att se hur dina aktiva läkemedel kan påverka varandra.
                </p>
              </div>
              <Button onClick={handleAnalyzeActiveMedications} disabled={isLoading || !activeMedicationsList.length}>
                {isLoading ? 'Analyserar...' : '🔍 Kör analys'}
              </Button>
            </div>
            {activeMedicationsList.length === 0 && (
              <p className="analysis-hint">Inga aktiva läkemedel – aktivera minst ett för att kunna analysera.</p>
            )}
            {analysisError && <p className="analysis-error">{analysisError}</p>}
            {analysisResult ? (
              <div className="ai-content">
                <div className="ai-text">{renderSavedAnswer(analysisResult)}</div>
                <div className="ai-disclaimer">
                  ⚠️ Informationen är generell och ersätter inte medicinsk rådgivning. Kontakta vården vid frågor.
                </div>
                <div className="analysis-save">
                  <Input
                    label="Titel för sparat svar"
                    value={analysisSaveTitle}
                    onChange={(e) => setAnalysisSaveTitle(e.target.value)}
                    placeholder="T.ex. Decemberanalys"
                    disabled={analysisHasSaved}
                  />
                  <Button
                    onClick={handleSaveInteractionAnalysis}
                    disabled={analysisHasSaved}
                  >
                    {analysisHasSaved ? '✅ Svar sparat' : '💾 Spara analys'}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="analysis-placeholder">
                När analysen är klar visas resultatet här.
              </p>
            )}
          </Card>

          <Card>
            <div className="ai-followup">
              <Textarea
                label="Ställ en följdfråga"
                value={analysisFollowup}
                onChange={(e) => setAnalysisFollowup(e.target.value)}
                placeholder="T.ex. Vilka biverkningar bör jag vara extra uppmärksam på?"
                rows={3}
                disabled={isLoading}
              />
              <Button
                onClick={handleMedicationInteractionFollowup}
                disabled={isLoading || !analysisFollowup.trim() || !activeMedicationsList.length}
              >
                {isLoading ? '⏳ Analyserar...' : 'Skicka fråga'}
              </Button>
            </div>
          </Card>

          <Card>
            <div className="ai-history-header">
              <h4>Sparade analyser</h4>
              <p>Återanvänd tidigare AI-svar för att jämföra över tid.</p>
            </div>
            {savedInteractionNotes.length === 0 ? (
              <p className="ai-history-empty">Inga sparade analyser ännu.</p>
            ) : (
              <div className="ai-history-list">
                {savedInteractionNotes.map(note => (
                  <div
                    key={note.id}
                    className={`ai-history-item ${note.id === analysisHistoryId ? 'active' : ''}`}
                    onClick={() => handleSelectInteractionSaved(note)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelectInteractionSaved(note);
                      }
                    }}
                  >
                    <div className="ai-history-meta">
                      <div className="ai-history-info">
                        <span className="ai-history-question">{note.title || note.question}</span>
                        <span className="ai-history-date">
                          {new Date(note.createdAt).toLocaleString('sv-SE', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                      <button
                        className="ai-history-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteInteractionNote(note.id);
                        }}
                      >
                        🗑 Ta bort
                      </button>
                    </div>
                    <div className="ai-history-answer">{renderSavedAnswer(note.answer)}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedMed ? 'Redigera läkemedel' : 'Nytt läkemedel'}
        icon="💊"
      >
        <div className="form-group">
          <Input
            label="Läkemedelsnamn"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="T.ex. Alvedon"
            required
          />
        </div>

        <div className="form-group">
          <Input
            label="Dosering"
            value={formData.dosage}
            onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
            placeholder="T.ex. 500mg"
            required
          />
        </div>

        <div className="form-group">
          <label className="input-label">Doseringstider</label>
          <div className="times-list">
            {formData.times.map((time, index) => (
              <div key={index} className="time-input-row">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => updateTime(index, e.target.value)}
                  className="time-input"
                />
                {formData.times.length > 1 && (
                  <button 
                    className="remove-time-btn"
                    onClick={() => removeTime(index)}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button className="add-time-btn" onClick={addTime}>
            + Lägg till tid
          </button>
        </div>

        <div className="form-group">
          <Textarea
            label="Instruktioner"
            value={formData.instructions}
            onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
            placeholder="T.ex. Ta med mat"
            rows={2}
          />
        </div>

        <div className="form-group">
          <Input
            label="Startdatum"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />
        </div>

        <div className="form-row">
          <Toggle
            label="Aktiv medicinering"
            checked={formData.active}
            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
          />
        </div>

        <div className="modal-actions">
          {selectedMed && (
            <Button variant="danger" onClick={handleDelete}>
              Ta bort
            </Button>
          )}
          <div className="modal-actions-right">
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              Avbryt
            </Button>
            <Button onClick={handleSubmit}>
              {selectedMed ? 'Spara' : 'Lägg till'}
            </Button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={showAiModal && Boolean(aiMed)}
        onClose={closeAiModal}
        title="AI-analys av läkemedel"
        icon="🤖"
        size="large"
      >
        {aiMed && (
          <div className="med-ai-modal">
            <div className="ai-diagnosis-header">
              <div>
                <h3>{aiMed.name}</h3>
                <p>
                  {aiMed.dosage ? `${aiMed.dosage} · ` : ''}
                  {aiMed.times?.length ? aiMed.times.join(', ') : 'Ingen tid angiven'}
                </p>
              </div>
              <Button
                variant="outline"
                size="small"
                onClick={handleRunMedicationAnalysis}
                disabled={isLoading}
              >
                {isLoading ? '⏳ Kör analys...' : '🔄 Kör ny analys'}
              </Button>
            </div>

            {isLoading ? (
              <div className="ai-loading">
                <div className="spinner" />
                <p>Analyserar läkemedel...</p>
              </div>
            ) : aiAnalysis ? (
              <div className="ai-content">
                <div className="ai-text">{renderSavedAnswer(aiAnalysis)}</div>
                <div className="ai-disclaimer">
                  ⚠️ Denna information är generell och ersätter inte medicinsk rådgivning. Kontakta alltid vården vid frågor.
                </div>
                <div className="ai-actions">
                  <Button
                    variant="secondary"
                    onClick={handleSaveMedicationResponse}
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
                <p>Inga AI-analyser ännu. Kör en ny analys för att komma igång.</p>
              </div>
            )}

            <div className="ai-followup">
              <Textarea
                label="Ställ en följdfråga"
                value={followupQuestion}
                onChange={(e) => setFollowupQuestion(e.target.value)}
                placeholder="T.ex. Vad bör jag hålla koll på vid kvällsdosen?"
                rows={3}
                disabled={isLoading}
              />
              <Button
                onClick={handleMedicationFollowup}
                disabled={isLoading || !followupQuestion.trim()}
              >
                {isLoading ? '⏳ Analyserar...' : 'Skicka fråga'}
              </Button>
            </div>

            <div className="ai-history">
              <div className="ai-history-header">
                <h4>Tidigare sparade svar</h4>
                <p>AI-svar sparas per läkemedel så att du kan gå tillbaka senare.</p>
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
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>
                        <button
                          className="ai-history-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMedicationResponse(note.id);
                          }}
                        >
                          🗑 Ta bort
                        </button>
                      </div>
                      <div className="ai-history-answer">{renderSavedAnswer(note.answer)}</div>
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

export default MedicationsView;
