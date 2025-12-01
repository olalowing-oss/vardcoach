import React from 'react';
import { useApp } from '../../../context/AppContext';
import { useReminders } from '../../../hooks/useReminders';
import './BottomNav.css';

const NAV_ITEMS = [
  { id: 'dashboard', icon: '🏠', label: 'Hem' },
  { id: 'calendar', icon: '📅', label: 'Kalender' },
  { id: 'medications', icon: '💊', label: 'Läkemedel' },
  { id: 'diary', icon: '📔', label: 'Dagbok' },
  { id: 'more', icon: '☰', label: 'Mer' },
];

export function BottomNav() {
  const { state, actions } = useApp();
  const { activeView, mobileMenuOpen } = state;
  const { getActiveRemindersCount } = useReminders();

  const handleNavClick = (id) => {
    if (id === 'more') {
      actions.toggleMobileMenu();
    } else {
      actions.setView(id);
    }
  };

  const reminderCount = getActiveRemindersCount();

  return (
    <>
      {/* Expandable menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={actions.toggleMobileMenu}>
          <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <span className="mobile-menu-title">Mer</span>
              <button className="mobile-menu-close" onClick={actions.toggleMobileMenu}>
                ✕
              </button>
            </div>
            <nav className="mobile-menu-items">
              <button 
                className={`mobile-menu-item ${activeView === 'analysis' ? 'active' : ''}`}
                onClick={() => {
                  actions.setView('analysis');
                  actions.toggleMobileMenu();
                }}
              >
                <span className="mobile-menu-icon">🩺</span>
                <span>Helhetsanalys</span>
              </button>
              <button 
                className={`mobile-menu-item ${activeView === 'notebook' ? 'active' : ''}`}
                onClick={() => {
                  actions.setView('notebook');
                  actions.toggleMobileMenu();
                }}
              >
                <span className="mobile-menu-icon">📒</span>
                <span>Anteckningsbok</span>
              </button>
              <button 
                className={`mobile-menu-item ${activeView === 'diagnoses' ? 'active' : ''}`}
                onClick={() => {
                  actions.setView('diagnoses');
                  actions.toggleMobileMenu();
                }}
              >
                <span className="mobile-menu-icon">🔬</span>
                <span>Diagnoser</span>
              </button>
              <button 
                className={`mobile-menu-item ${activeView === 'visits' ? 'active' : ''}`}
                onClick={() => {
                  actions.setView('visits');
                  actions.toggleMobileMenu();
                }}
              >
                <span className="mobile-menu-icon">🏥</span>
                <span>Läkarbesök</span>
              </button>
              <button 
                className={`mobile-menu-item ${activeView === 'reminders' ? 'active' : ''}`}
                onClick={() => {
                  actions.setView('reminders');
                  actions.toggleMobileMenu();
                }}
              >
                <span className="mobile-menu-icon">🔔</span>
                <span>Påminnelser</span>
                {reminderCount > 0 && (
                  <span className="menu-badge">{reminderCount}</span>
                )}
              </button>
              <button 
                className={`mobile-menu-item ${activeView === 'questions' ? 'active' : ''}`}
                onClick={() => {
                  actions.setView('questions');
                  actions.toggleMobileMenu();
                }}
              >
                <span className="mobile-menu-icon">❓</span>
                <span>Frågor till läkaren</span>
              </button>
              <button 
                className="mobile-menu-item"
                onClick={() => {
                  actions.toggleExportModal();
                  actions.toggleMobileMenu();
                }}
              >
                <span className="mobile-menu-icon">📄</span>
                <span>Exportera PDF</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Bottom navigation bar */}
      <nav className="bottom-nav">
        {NAV_ITEMS.map((item) => {
          const isActive = item.id === 'more' 
            ? mobileMenuOpen || ['analysis', 'notebook', 'diagnoses', 'visits', 'reminders', 'questions'].includes(activeView)
            : activeView === item.id;
          
          return (
            <button
              key={item.id}
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
              aria-label={item.label}
            >
              <span className="bottom-nav-icon">{item.icon}</span>
              <span className="bottom-nav-label">{item.label}</span>
              {item.id === 'more' && reminderCount > 0 && (
                <span className="nav-badge">{reminderCount}</span>
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
}

export default BottomNav;
