import React from 'react';
import { useApp } from '../../../context/AppContext';
import './Header.css';

const VIEW_TITLES = {
  dashboard: 'Hem',
  analysis: 'Helhetsanalys',
  calendar: 'Kalender',
  diagnoses: 'Diagnoser',
  medications: 'Läkemedel',
  diary: 'Hälsodagbok',
  visits: 'Läkarbesök',
  reminders: 'Påminnelser',
  questions: 'Frågor till läkaren',
  notebook: 'Anteckningsbok',
};

export function Header() {
  const { state, actions } = useApp();
  const { activeView } = state;

  const title = VIEW_TITLES[activeView] || 'Vårdcoachen';

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-logo">
          <span className="header-logo-icon">🏥</span>
          <span className="header-title">{title}</span>
        </div>
        <button 
          className="header-export-btn"
          onClick={actions.toggleExportModal}
          aria-label="Exportera PDF"
        >
          📄
        </button>
      </div>
    </header>
  );
}

export default Header;
