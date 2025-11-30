import React, { useState } from 'react';
import { styles } from '../../styles/styles';

export function ExportModal({ onClose, onExport }) {
  const [options, setOptions] = useState({
    diagnoses: true,
    medications: true,
    appointments: true,
    diary: true,
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(options);
    } finally {
      setIsExporting(false);
    }
  };

  const items = [
    { key: 'diagnoses', label: '🔬 Diagnoser', desc: 'Alla registrerade diagnoser' },
    { key: 'medications', label: '💊 Läkemedel', desc: 'Aktiva och avslutade läkemedel' },
    { key: 'appointments', label: '📅 Vårdbesök', desc: 'Senaste 10 besöken' },
    { key: 'diary', label: '📔 Dagbok', desc: 'Senaste 15 anteckningarna' },
  ];

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <span style={{ fontSize: '1.5rem' }}>📄</span>
          <h3 style={styles.modalTitle}>Exportera till PDF</h3>
          <button style={styles.modalClose} onClick={onClose}>✕</button>
        </div>
        
        <div style={styles.modalBody}>
          <p style={{ color: '#5a6c7d', marginBottom: '1.5rem' }}>
            Välj vilken information som ska inkluderas i PDF-exporten:
          </p>

          {items.map(item => (
            <label key={item.key} style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={options[item.key]}
                onChange={e => setOptions({ ...options, [item.key]: e.target.checked })}
                style={styles.checkbox}
              />
              <div>
                <strong>{item.label}</strong>
                <span style={{ display: 'block', fontSize: '0.85rem', color: '#7f8c8d' }}>
                  {item.desc}
                </span>
              </div>
            </label>
          ))}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button
              style={{ ...styles.button, ...styles.buttonGhost, flex: 1 }}
              onClick={onClose}
            >
              Avbryt
            </button>
            <button
              style={{ ...styles.button, flex: 1 }}
              onClick={handleExport}
              disabled={!Object.values(options).some(v => v) || isExporting}
            >
              {isExporting ? '⏳ Exporterar...' : '📥 Ladda ner PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
