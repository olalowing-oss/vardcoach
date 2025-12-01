import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAI } from '../hooks/useAI';
import { Card, Button, Textarea, Input } from '../components/common';
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
  const [saveTitle, setSaveTitle] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

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
    setCurrentQuestion('Helhetsanalys');
    setHasSavedResponse(false);
    setActiveHistoryId(null);
    const result = await analyzeOverallHealth(diagnoses, medications);
    setAnalysis(result);
  };

  const handleOpenSaveDialog = () => {
    setShowSaveDialog(true);
    setSaveTitle('');
  };

  const handleSaveAnalysis = () => {
    if (!analysis || hasSavedResponse) return;
    const note = {
      id: generateId(),
      title: saveTitle.trim() || currentQuestion || 'Helhetsanalys',
      question: currentQuestion || 'Helhetsanalys',
      answer: analysis,
      createdAt: new Date().toISOString(),
    };
    actions.addOverallAiNote(note);
    actions.addNotification('AI-svar sparat', 'success');
    setHasSavedResponse(true);
    setActiveHistoryId(note.id);
    setShowSaveDialog(false);
    setSaveTitle('');
  };

  const handleExportPDF = (note) => {
    // Create a printable version
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      actions.addNotification('Kunde inte öppna utskriftsfönster. Kontrollera popup-blockerare.', 'error');
      return;
    }

    const title = note?.title || 'Helhetsanalys';
    const content = note?.answer || analysis;
    const date = note?.createdAt
      ? new Date(note.createdAt).toLocaleString('sv-SE', { dateStyle: 'long', timeStyle: 'short' })
      : new Date().toLocaleString('sv-SE', { dateStyle: 'long', timeStyle: 'short' });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="sv">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - Vårdhjälpen</title>
        <style>
          @page { margin: 2cm; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            border-bottom: 2px solid #667eea;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          h1 {
            color: #667eea;
            margin: 0 0 10px 0;
            font-size: 28px;
          }
          .meta {
            color: #666;
            font-size: 14px;
          }
          .content {
            margin: 20px 0;
          }
          .content p {
            margin: 10px 0;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
          }
          .disclaimer {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
          }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${title}</h1>
          <div class="meta">
            <strong>Datum:</strong> ${date}<br>
            <strong>Genererad av:</strong> Vårdhjälpen AI-assistent
          </div>
        </div>

        <div class="content">
          ${content.split('\n').map(p => p.trim() ? `<p>${p}</p>` : '').join('')}
        </div>

        <div class="disclaimer">
          <strong>⚠️ Viktig information:</strong><br>
          Denna information är endast vägledande och ersätter inte professionell medicinsk rådgivning.
          Kontakta alltid vården vid frågor eller oro.
        </div>

        <div class="footer">
          <p>Detta dokument genererades från Vårdhjälpen - Din personliga vårdassistent</p>
          <p class="no-print">
            <button onclick="window.print()" style="padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
              🖨️ Skriv ut / Spara som PDF
            </button>
            <button onclick="window.close()" style="padding: 10px 20px; background: #ccc; color: #333; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin-left: 10px;">
              Stäng
            </button>
          </p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
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
    setCurrentQuestion(note.title || note.question || 'Sparat svar');
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
          <h1 className="page-title">Helhetsanalys</h1>
          <p className="page-subtitle">Få en samlad AI-bedömning av alla dina diagnoser och läkemedel.</p>
        </div>
        <Button onClick={handleAnalyze} disabled={isLoading || !diagnoses.length}>
          {isLoading ? 'Analyserar...' : '🔍 Analysera'}
        </Button>
      </div>

      {diagnoses.length === 0 ? (
        <Card className="empty-state">
          <span className="empty-icon">🩺</span>
          <p>Du behöver lägga till minst en diagnos för att göra en helhetsanalys.</p>
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
            <h3>AI:s helhetsanalys</h3>
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
              {currentQuestion && <h4 className="analysis-title">{currentQuestion}</h4>}
              {analysis
                .split('\n')
                .map((paragraph, idx) => paragraph.trim() && <p key={idx}>{paragraph}</p>)}
              <div className="analysis-disclaimer">
                ⚠️ Informationen är endast vägledande. Kontakta alltid vården vid frågor eller oro.
              </div>
              <div className="ai-actions">
                {!showSaveDialog ? (
                  <>
                    <Button variant="secondary" onClick={handleOpenSaveDialog} disabled={hasSavedResponse}>
                      {hasSavedResponse ? '✅ Svar sparat' : '💾 Spara svar'}
                    </Button>
                    <Button variant="secondary" onClick={() => handleExportPDF()}>
                      📄 Exportera PDF
                    </Button>
                  </>
                ) : (
                  <div className="save-dialog">
                    <Input
                      label="Titel för analysen (valfritt)"
                      value={saveTitle}
                      onChange={(e) => setSaveTitle(e.target.value)}
                      placeholder="T.ex. Månadsanalys november 2025"
                      autoFocus
                    />
                    <div className="save-dialog-actions">
                      <Button onClick={handleSaveAnalysis}>
                        💾 Spara
                      </Button>
                      <Button variant="secondary" onClick={() => setShowSaveDialog(false)}>
                        Avbryt
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : savedAnalyses.length > 0 ? (
            <div className="ai-empty">
              <p>Välj ett sparat svar nedan för att läsa den tidigare analysen.</p>
            </div>
          ) : (
            <div className="ai-empty">
              <p>Klicka på &quot;Analysera&quot; för att generera din första helhetsanalys.</p>
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
                  >
                    <div className="ai-history-meta">
                      <div className="ai-history-info">
                        <span className="ai-history-question" onClick={() => handleSelectSaved(note)} style={{ cursor: 'pointer' }}>
                          {note.title || note.question}
                        </span>
                        <span className="ai-history-date">
                          {new Date(note.createdAt).toLocaleString('sv-SE', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                      <div className="ai-history-actions">
                        <button
                          className="ai-history-action"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExportPDF(note);
                          }}
                          title="Exportera som PDF"
                        >
                          📄
                        </button>
                        <button
                          className="ai-history-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSaved(note.id);
                          }}
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                    <div
                      className="ai-history-answer"
                      onClick={() => handleSelectSaved(note)}
                      style={{ cursor: 'pointer' }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelectSaved(note);
                        }
                      }}
                    >
                      {note.id === activeHistoryId ? (
                        // Show full text when active
                        note.answer
                          ?.split('\n')
                          .map((paragraph, idx) => paragraph.trim() && <p key={idx}>{paragraph}</p>)
                      ) : (
                        // Show preview when not active
                        <>
                          {note.answer
                            ?.split('\n')
                            .slice(0, 3)
                            .map((paragraph, idx) => paragraph.trim() && <p key={idx}>{paragraph}</p>)}
                          {note.answer?.split('\n').filter(p => p.trim()).length > 3 && (
                            <p className="ai-history-more">... klicka för att läsa mer</p>
                          )}
                        </>
                      )}
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
