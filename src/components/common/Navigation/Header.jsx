import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';
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
  profile: 'Profil',
};

export function Header() {
  const { state, actions } = useApp();
  const { user, profile, signOut, isSupabaseEnabled } = useAuth();
  const { activeView } = state;
  const [showUserMenu, setShowUserMenu] = useState(false);

  const title = VIEW_TITLES[activeView] || 'Vårdcoachen';

  const handleLogout = async () => {
    try {
      await signOut();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-logo">
          <span className="header-logo-icon">🏥</span>
          <span className="header-title">{title}</span>
        </div>
        <div className="header-actions">
          <button
            className="header-export-btn"
            onClick={actions.toggleExportModal}
            aria-label="Exportera PDF"
          >
            📄
          </button>
          {isSupabaseEnabled && user && (
            <div className="header-user-menu">
              <button
                className="header-user-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                aria-label="Användarmeny"
              >
                👤
              </button>
              {showUserMenu && (
                <div className="user-menu-dropdown">
                  <div className="user-menu-info">
                    <div className="user-menu-name">{profile?.full_name || user.email}</div>
                    <div className="user-menu-email">{user.email}</div>
                  </div>
                  <button
                    className="user-menu-item"
                    onClick={() => {
                      actions.setView('profile');
                      setShowUserMenu(false);
                    }}
                  >
                    ⚙️ Inställningar
                  </button>
                  <button
                    className="user-menu-item user-menu-logout"
                    onClick={handleLogout}
                  >
                    🚪 Logga ut
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
