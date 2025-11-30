import React from 'react';
import { styles, colors } from '../styles/styles';

const navItems = [
  { id: 'dashboard', label: 'Översikt', icon: '🏠' },
  { id: 'calendar', label: 'Kalender', icon: '📅' },
  { id: 'diagnosis', label: 'Diagnoser', icon: '🔬' },
  { id: 'medications', label: 'Läkemedel', icon: '💊' },
  { id: 'diary', label: 'Dagbok', icon: '📔' },
  { id: 'reminders', label: 'Påminnelser', icon: '🔔' },
  { id: 'questions', label: 'Frågor', icon: '❓' },
];

// Mobile bottom navigation (5 main items)
const mobileNavItems = [
  { id: 'dashboard', label: 'Hem', icon: '🏠' },
  { id: 'calendar', label: 'Kalender', icon: '📅' },
  { id: 'medications', label: 'Läkemedel', icon: '💊' },
  { id: 'diary', label: 'Dagbok', icon: '📔' },
  { id: 'more', label: 'Mer', icon: '☰' },
];

export function Sidebar({ activeView, setActiveView, reminderCount, isOpen, onClose, isMobile }) {
  if (isMobile && !isOpen) return null;

  const sidebarStyle = isMobile
    ? { ...styles.sidebar, ...styles.sidebarOpen }
    : styles.sidebar;

  return (
    <>
      {isMobile && isOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.3)',
            zIndex: 150,
          }}
          onClick={onClose}
        />
      )}
      <nav style={sidebarStyle}>
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => {
              setActiveView(item.id);
              if (isMobile) onClose();
            }}
            style={{
              ...styles.navButton,
              ...(activeView === item.id ? styles.navButtonActive : {}),
            }}
          >
            <span style={styles.navIcon}>{item.icon}</span>
            <span style={styles.navLabel}>{item.label}</span>
            {item.id === 'reminders' && reminderCount > 0 && (
              <span style={styles.navBadge}>{reminderCount}</span>
            )}
          </button>
        ))}
      </nav>
    </>
  );
}

export function BottomNavigation({ activeView, setActiveView, onMoreClick }) {
  return (
    <div style={{ ...styles.bottomNav, display: 'block' }}>
      <div style={styles.bottomNavInner}>
        {mobileNavItems.map(item => (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === 'more') {
                onMoreClick();
              } else {
                setActiveView(item.id);
              }
            }}
            style={{
              ...styles.bottomNavButton,
              ...(activeView === item.id ? styles.bottomNavButtonActive : {}),
            }}
          >
            <span style={styles.bottomNavIcon}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function MobileMenu({ isOpen, onClose, activeView, setActiveView, reminderCount }) {
  if (!isOpen) return null;

  const menuItems = [
    { id: 'diagnosis', label: 'Diagnoser', icon: '🔬' },
    { id: 'reminders', label: 'Påminnelser', icon: '🔔', badge: reminderCount },
    { id: 'questions', label: 'Frågor till läkaren', icon: '❓' },
  ];

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div 
        style={{
          ...styles.modal,
          maxWidth: '300px',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={styles.modalHeader}>
          <span style={{ fontSize: '1.25rem' }}>☰</span>
          <h3 style={styles.modalTitle}>Meny</h3>
          <button style={styles.modalClose} onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: '0.5rem' }}>
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id);
                onClose();
              }}
              style={{
                ...styles.navButton,
                width: '100%',
                marginBottom: '0.25rem',
                ...(activeView === item.id ? styles.navButtonActive : {}),
              }}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              <span style={styles.navLabel}>{item.label}</span>
              {item.badge > 0 && (
                <span style={{
                  ...styles.navBadge,
                  background: activeView === item.id ? 'rgba(255,255,255,0.3)' : colors.red,
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
