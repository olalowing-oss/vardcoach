import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';
import { useReminders } from '../../../hooks/useReminders';
import './Sidebar.css';

const NAV_ITEMS = [
  { id: 'dashboard', icon: '🏠', label: 'Hem' },
  { id: 'analysis', icon: '🩺', label: 'Helhetsanalys' },
  { id: 'calendar', icon: '📅', label: 'Kalender' },
  { id: 'visits', icon: '🏥', label: 'Läkarbesök' },
  { id: 'diagnoses', icon: '🔬', label: 'Diagnoser' },
  { id: 'medications', icon: '💊', label: 'Läkemedel' },
  { id: 'diary', icon: '📔', label: 'Hälsodagbok' },
  { id: 'notebook', icon: '📒', label: 'Anteckningsbok' },
  { id: 'reminders', icon: '🔔', label: 'Påminnelser' },
  { id: 'questions', icon: '❓', label: 'Frågor till läkaren' },
];

export function Sidebar() {
  const { state, actions } = useApp();
  const { activeView } = state;
  const { user, profile, signOut, isSupabaseEnabled } = useAuth();
  const { getActiveRemindersCount } = useReminders();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const reminderCount = getActiveRemindersCount();

  const handleLogout = async () => {
    try {
      await signOut();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="sidebar-logo-icon">🏥</span>
          <span className="sidebar-logo-text">Vårdcoachen</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`sidebar-nav-item ${activeView === item.id ? 'active' : ''}`}
            onClick={() => actions.setView(item.id)}
          >
            <span className="sidebar-nav-icon">{item.icon}</span>
            <span className="sidebar-nav-label">{item.label}</span>
            {item.id === 'reminders' && reminderCount > 0 && (
              <span className="sidebar-badge">{reminderCount}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Footer with user info and export */}
      <div className="sidebar-footer">
        {isSupabaseEnabled && user && (
          <div className="sidebar-user">
            <button
              className="sidebar-user-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="sidebar-user-avatar">👤</div>
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{profile?.full_name || user.email?.split('@')[0]}</div>
                <div className="sidebar-user-email">{user.email}</div>
              </div>
            </button>
            {showUserMenu && (
              <div className="sidebar-user-menu">
                <button
                  className="sidebar-user-menu-item"
                  onClick={() => {
                    actions.setView('profile');
                    setShowUserMenu(false);
                  }}
                >
                  <span>⚙️</span>
                  <span>Inställningar</span>
                </button>
                <button
                  className="sidebar-user-menu-item sidebar-user-logout"
                  onClick={handleLogout}
                >
                  <span>🚪</span>
                  <span>Logga ut</span>
                </button>
              </div>
            )}
          </div>
        )}
        <button
          className="sidebar-export-btn"
          onClick={actions.toggleExportModal}
        >
          <span>📄</span>
          <span>Exportera PDF</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
