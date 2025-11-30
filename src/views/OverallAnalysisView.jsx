import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAI } from '../hooks/useAI';
import { Card, Button, Textarea } from '../components/common';
import { generateId } from '../utils/helpers';
import './OverallAnalysisView.css';

export function OverallAnalysisView() {
  const { state, actions } = useApp();
  const { diagnoses, medications, overallAiNotes } = state;
  const { analyzeOverallHealth, askOverallFollowUp, isLoading } = useAI();
  const [analysis, setAnalysis] = useState('');
  const [error, setError] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [hasSavedResponse, setHasSavedResponse] = useState(false);
  const [followupQuestion, setFollowupQuestion] = useState('');
  const [activeHistoryId, setActiveHistoryId] = useState(null);

  const handleAnalyze = async () => {
    if (!diagnoses.length) {
      setError('Du behöver minst en diagnos för att kunna analysera.');
      setAnalysis('');
      setCurrentQuestion('');
      setHasSavedResponse(false);
      setActiveHistoryId(null);
      return;
    }
    setError('');
    setAnalysis('');
    setCurrentQuestion('Övergripande analys');
    setHasSavedResponse(false);
    setActiveHistoryId(null);
    const result = await analyzeOverallHealth(diagnoses, medications);
    setAnalysis(result);
  };

  const handleSaveAnalysis = () => {
    if (!analysis || hasSavedResponse) return;
    const note = {
      id: generateId(),
      question: currentQuestion || 'Övergripande analys',
      answer: analysis,
      createdAt: new Date().toISOString(),
    };
    actions.addOverallAiNote(note);
    actions.addNotification('AI-svar sparat', 'success');
    setHasSavedResponse(true);
    setActiveHistoryId(note.id);
  };

  const handleFollowupSubmit = async () => {
    if (!diagnoses.length || !followupQuestion.trim()) return;
    const question = followupQuestion.trim();
    setAnalysis('');
    setCurrentQuestion(question);
    setHasSavedResponse(false);
    setActiveHistoryId(null);
    const result = await askOverallFollowUp(diagnoses, medications, question);
    setAnalysis(result);
    setFollowupQuestion('');
  };

  const handleSelectSaved = (note) => {
    setAnalysis(note.answer);
    setCurrentQuestion(note.question || 'Sparat svar');
    setHasSavedResponse(true);
    setActiveHistoryId(note.id);
    setError('');
  };

  const handleDeleteSaved = (noteId) => {
    if (!window.confirm('Ta bort detta sparade svar?')) return;
    actions.deleteOverallAiNote(noteId);
    actions.addNotification('AI-svar borttaget', 'info');
    if (activeHistoryId === noteId) {
      setAnalysis('');
      setCurrentQuestion('');
      setHasSavedResponse(false);
      setActiveHistoryId(null);
    }
  };

  const diagnosisList = useMemo(() => diagnoses, [diagnoses]);
  const medicationList = useMemo(() => medications, [medications]);
  const savedAnalyses = useMemo(
    () =>
      [...overallAiNotes].sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      ),
    [overallAiNotes]
  );

  return (
    <div className="overall-analysis">
      <div className="view-header">
        <div>
          <h1 className="page-title">Övergripande analys</h1>
          <p className="page-subtitle">Få en samlad AI-bedömning av alla dina diagnoser och läkemedel.</p>
        </div>
        <Button onClick={handleAnalyze} disabled={isLoading || !diagnoses.length}>
          {isLoading ? 'Analyserar...' : '🔍 Analysera'}
        </Button>
      </div>

      {diagnoses.length === 0 ? (
        <Card className="empty-state">
          <span className="empty-icon">🩺</span>
          <p>Du behöver lägga till minst en diagnos för att göra en övergripande analys.</p>
        </Card>
      ) : (
        <div className="overall-grid">
          <Card className="summary-card">
            <div className="card-header">
              <h3>Pågående diagnoser</h3>
              <span className="count-badge">{diagnosisList.length}</span>
            </div>
            <div className="summary-list">
              {diagnosisList.map((diag) => (
                <div key={diag.id} className="summary-item">
                  <div className="summary-item-header">
                    <span className="summary-item-title">{diag.name}</span>
                    {diag.date && <span className="summary-item-date">{diag.date}</span>}
                  </div>
                  {diag.description && <p className="summary-item-text">{diag.description}</p>}
                  {diag.treatment && (
                    <p className="summary-item-meta">Behandling: {diag.treatment}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card className="summary-card">
            <div className="card-header">
              <h3>Aktuella läkemedel</h3>
              <span className="count-badge">{medicationList.length}</span>
            </div>
            {medicationList.length === 0 ? (
              <p className="summary-empty">Inga läkemedel registrerade.</p>
            ) : (
              <div className="summary-list">
                {medicationList.map((med) => (
                  <div key={med.id} className="summary-item">
                    <div className="summary-item-header">
                      <span className="summary-item-title">{med.name}</span>
                      {med.dosage && <span className="summary-item-badge">{med.dosage}</span>}
                    </div>
                    {med.instructions && (
                      <p className="summary-item-text">{med.instructions}</p>
                    )}
                    {med.times?.length > 0 && (
                      <p className="summary-item-meta">Tider: {med.times.join(', ')}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {(analysis || error || savedAnalyses.length > 0) && (
        <Card className="analysis-card">
          <div className="card-header">
            <h3>AI:s övergripande analys</h3>
          </div>
          {error ? (
            <p className="analysis-error">{error}</p>
          ) : isLoading ? (
            <div className="analysis-loading">
              <div className="spinner" />
              <p>AI analyserar dina diagnoser och läkemedel...</p>
            </div>
          ) : analysis ? (
            <div className="analysis-result">
              {analysis
                .split('\n')
                .map((paragraph, idx) => paragraph.trim() && <p key={idx}>{paragraph}</p>)}
              <div className="analysis-disclaimer">
                ⚠️ Informationen är endast vägledande. Kontakta alltid vården vid frågor eller oro.
              </div>
              <div className="ai-actions">
                <Button variant="secondary" onClick={handleSaveAnalysis} disabled={hasSavedResponse}>
                  {hasSavedResponse ? '✅ Svar sparat' : '💾 Spara svar'}
                </Button>
              </div>
            </div>
          ) : savedAnalyses.length > 0 ? (
            <div className="ai-empty">
              <p>Välj ett sparat svar nedan för att läsa den tidigare analysen.</p>
            </div>
          ) : (
            <div className="ai-empty">
              <p>Klicka på &quot;Analysera&quot; för att generera din första övergripande analys.</p>
            </div>
          )}

          <div className="ai-followup">
            <Textarea
              label="Ställ en följdfråga"
              value={followupQuestion}
              onChange={(e) => setFollowupQuestion(e.target.value)}
              placeholder="T.ex. Finns det läkemedel som överlappar varandra?"
              rows={3}
              disabled={isLoading || !diagnoses.length}
            />
            <Button
              onClick={handleFollowupSubmit}
              disabled={isLoading || !diagnoses.length || !followupQuestion.trim()}
            >
              {isLoading ? '⏳ Analyserar...' : 'Skicka fråga'}
            </Button>
          </div>

          <div className="ai-history">
            <div className="ai-history-header">
              <h4>Tidigare sparade analyser</h4>
              <p>Sparar du flera svar kan du växla mellan dem här.</p>
            </div>
            {savedAnalyses.length === 0 ? (
              <p className="ai-history-empty">Inga sparade analyser ännu.</p>
            ) : (
              <div className="ai-history-list">
                {savedAnalyses.map((note) => (
                  <div
                    key={note.id}
                    className={`ai-history-item ${note.id === activeHistoryId ? 'active' : ''}`}
                    onClick={() => handleSelectSaved(note)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelectSaved(note);
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
                          handleDeleteSaved(note.id);
                        }}
                      >
                        🗑 Ta bort
                      </button>
                    </div>
                    <div className="ai-history-answer">
                      {note.answer
                        ?.split('\n')
                        .map((paragraph, idx) => paragraph.trim() && <p key={idx}>{paragraph}</p>)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

export default OverallAnalysisView;
