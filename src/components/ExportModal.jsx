import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Modal, Button, Checkbox } from '../components/common';
import { exportToPDF } from '../utils/pdfExport';
import './ExportModal.css';

export function ExportModal() {
  const { state, actions } = useApp();
  const { showExportModal, diagnoses, medications, appointments, diaryEntries } = state;
  
  const [options, setOptions] = useState({
    includeDiagnoses: true,
    includeMedications: true,
    includeAppointments: true,
    includeDiary: true,
  });
  
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);

    try {
      await exportToPDF(
        { diagnoses, medications, appointments, diaryEntries },
        options
      );
      actions.toggleExportModal();
    } catch (err) {
      console.error('Export error:', err);
      setError('Det gick inte att skapa PDF:en. Försök igen.');
    } finally {
      setIsExporting(false);
    }
  };

  const toggleOption = (key) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const hasContent = diagnoses.length > 0 || medications.length > 0 || 
                     appointments.length > 0 || diaryEntries.length > 0;

  const hasSelection = Object.values(options).some(v => v);

  return (
    <Modal
      isOpen={showExportModal}
      onClose={actions.toggleExportModal}
      title="Exportera till PDF"
      icon="📄"
    >
      <div className="export-intro">
        <p>
          Skapa en PDF-sammanfattning av din hälsoinformation. 
          Perfekt att ta med till läkarbesök eller för egen dokumentation.
        </p>
      </div>

      {!hasContent ? (
        <div className="export-empty">
          <span className="empty-icon">📋</span>
          <p>Du har ingen data att exportera ännu.</p>
          <p>Lägg till diagnoser, läkemedel eller dagboksanteckningar först.</p>
        </div>
      ) : (
        <>
          <div className="export-options">
            <h3>Välj innehåll</h3>
            
            <label className="export-option">
              <Checkbox
                checked={options.includeDiagnoses}
                onChange={() => toggleOption('includeDiagnoses')}
                disabled={diagnoses.length === 0}
              />
              <div className="option-info">
                <span className="option-icon">🔬</span>
                <div>
                  <span className="option-label">Diagnoser</span>
                  <span className="option-count">
                    {diagnoses.length === 0 ? 'Inga registrerade' : `${diagnoses.length} st`}
                  </span>
                </div>
              </div>
            </label>

            <label className="export-option">
              <Checkbox
                checked={options.includeMedications}
                onChange={() => toggleOption('includeMedications')}
                disabled={medications.length === 0}
              />
              <div className="option-info">
                <span className="option-icon">💊</span>
                <div>
                  <span className="option-label">Läkemedel</span>
                  <span className="option-count">
                    {medications.length === 0 ? 'Inga registrerade' : `${medications.length} st`}
                  </span>
                </div>
              </div>
            </label>

            <label className="export-option">
              <Checkbox
                checked={options.includeAppointments}
                onChange={() => toggleOption('includeAppointments')}
                disabled={appointments.length === 0}
              />
              <div className="option-info">
                <span className="option-icon">📅</span>
                <div>
                  <span className="option-label">Vårdbesök</span>
                  <span className="option-count">
                    {appointments.length === 0 ? 'Inga registrerade' : `Senaste 10 av ${appointments.length} st`}
                  </span>
                </div>
              </div>
            </label>

            <label className="export-option">
              <Checkbox
                checked={options.includeDiary}
                onChange={() => toggleOption('includeDiary')}
                disabled={diaryEntries.length === 0}
              />
              <div className="option-info">
                <span className="option-icon">📔</span>
                <div>
                  <span className="option-label">Hälsodagbok</span>
                  <span className="option-count">
                    {diaryEntries.length === 0 ? 'Inga anteckningar' : `Senaste 15 av ${diaryEntries.length} st`}
                  </span>
                </div>
              </div>
            </label>
          </div>

          {error && (
            <div className="export-error">
              ⚠️ {error}
            </div>
          )}

          <div className="export-actions">
            <Button 
              variant="ghost" 
              onClick={actions.toggleExportModal}
            >
              Avbryt
            </Button>
            <Button 
              onClick={handleExport}
              disabled={!hasSelection}
              loading={isExporting}
            >
              📥 Ladda ner PDF
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}

export default ExportModal;
