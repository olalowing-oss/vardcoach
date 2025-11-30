// Color palette
export const colors = {
  primary: '#2E7D5C',
  primaryDark: '#1a5c42',
  primaryLight: '#3d9970',
  secondary: '#3498db',
  purple: '#9b59b6',
  orange: '#e67e22',
  teal: '#1abc9c',
  red: '#e74c3c',
  gray: '#7f8c8d',
  lightGray: '#95a5a6',
  background: '#f5f7fa',
  backgroundDark: '#e4e8ec',
  white: '#ffffff',
  text: '#2c3e50',
  textLight: '#5a6c7d',
  textMuted: '#7f8c8d',
  border: '#e0e6ed',
  success: '#27ae60',
  warning: '#f39c12',
  danger: '#e74c3c',
};

// Breakpoints
export const breakpoints = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
};

// Check if mobile
export const isMobile = () => window.innerWidth <= breakpoints.tablet;

// Base styles
export const styles = {
  // Layout
  container: {
    minHeight: '100vh',
    background: `linear-gradient(135deg, ${colors.background}, ${colors.backgroundDark})`,
    fontFamily: '"Nunito", "Segoe UI", system-ui, sans-serif',
    color: colors.text,
    display: 'flex',
    flexDirection: 'column',
  },

  // Header
  header: {
    background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
    padding: '1rem 1.5rem',
    color: 'white',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  logoIcon: {
    fontSize: '1.75rem',
  },
  logoText: {
    fontSize: '1.25rem',
    fontWeight: 700,
    margin: 0,
  },
  headerActions: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  menuButton: {
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    padding: '0.5rem',
    borderRadius: '8px',
    color: 'white',
    fontSize: '1.5rem',
    cursor: 'pointer',
    display: 'none', // Hidden on desktop
  },
  exportBtn: {
    background: 'rgba(255,255,255,0.2)',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },

  // Main layout
  main: {
    display: 'flex',
    flex: 1,
    minHeight: 'calc(100vh - 120px)',
  },

  // Sidebar navigation (desktop)
  sidebar: {
    width: '200px',
    background: colors.white,
    padding: '1rem 0.75rem',
    boxShadow: '2px 0 10px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    position: 'sticky',
    top: '60px',
    height: 'calc(100vh - 60px)',
    overflowY: 'auto',
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    border: 'none',
    background: 'transparent',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    color: colors.textLight,
    textAlign: 'left',
    transition: 'all 0.2s ease',
    position: 'relative',
  },
  navButtonActive: {
    background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})`,
    color: 'white',
    boxShadow: '0 4px 12px rgba(46,125,92,0.3)',
  },
  navIcon: {
    fontSize: '1.25rem',
  },
  navLabel: {
    fontWeight: 600,
  },
  navBadge: {
    position: 'absolute',
    right: '0.75rem',
    background: colors.red,
    color: 'white',
    fontSize: '0.65rem',
    padding: '0.125rem 0.4rem',
    borderRadius: '10px',
    fontWeight: 700,
  },

  // Mobile bottom navigation
  bottomNav: {
    display: 'none', // Hidden on desktop
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: colors.white,
    boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
    padding: '0.5rem',
    zIndex: 100,
  },
  bottomNavInner: {
    display: 'flex',
    justifyContent: 'space-around',
    maxWidth: '500px',
    margin: '0 auto',
  },
  bottomNavButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.5rem',
    border: 'none',
    background: 'transparent',
    borderRadius: '10px',
    cursor: 'pointer',
    color: colors.textMuted,
    fontSize: '0.7rem',
    minWidth: '60px',
    position: 'relative',
  },
  bottomNavButtonActive: {
    color: colors.primary,
  },
  bottomNavIcon: {
    fontSize: '1.5rem',
  },

  // Content area
  content: {
    flex: 1,
    padding: '1.5rem',
    overflowY: 'auto',
    paddingBottom: '80px', // Space for bottom nav on mobile
  },
  contentInner: {
    maxWidth: '900px',
    margin: '0 auto',
  },

  // Page header
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  pageTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    margin: 0,
  },

  // Cards
  card: {
    background: colors.white,
    borderRadius: '16px',
    padding: '1.25rem',
    marginBottom: '1rem',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
  },
  section: {
    background: colors.white,
    borderRadius: '16px',
    padding: '1.25rem',
    marginBottom: '1rem',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: 700,
    marginBottom: '1rem',
  },

  // Stats grid
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  statCard: {
    background: colors.white,
    borderRadius: '16px',
    padding: '1.25rem',
    textAlign: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.25rem',
  },
  statIcon: {
    fontSize: '1.75rem',
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: 700,
    color: colors.primary,
  },
  statLabel: {
    fontSize: '0.8rem',
    color: colors.textMuted,
  },

  // Buttons
  button: {
    background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})`,
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.25rem',
    borderRadius: '10px',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(46,125,92,0.3)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  buttonSecondary: {
    background: colors.secondary,
    boxShadow: '0 4px 12px rgba(52,152,219,0.3)',
  },
  buttonDanger: {
    background: '#fee',
    color: colors.red,
    boxShadow: 'none',
  },
  buttonGhost: {
    background: '#f0f4f8',
    color: colors.textLight,
    boxShadow: 'none',
  },
  buttonSmall: {
    padding: '0.5rem 0.75rem',
    fontSize: '0.8rem',
  },

  // Form elements
  form: {
    background: colors.white,
    borderRadius: '16px',
    padding: '1.25rem',
    marginBottom: '1.5rem',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '1rem',
    marginBottom: '1rem',
  },
  formGroup: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: 600,
    marginBottom: '0.5rem',
    color: colors.textLight,
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: `2px solid ${colors.border}`,
    borderRadius: '10px',
    fontSize: '1rem',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: `2px solid ${colors.border}`,
    borderRadius: '10px',
    fontSize: '1rem',
    resize: 'vertical',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    outline: 'none',
    minHeight: '100px',
  },
  select: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: `2px solid ${colors.border}`,
    borderRadius: '10px',
    fontSize: '1rem',
    boxSizing: 'border-box',
    outline: 'none',
    background: 'white',
    cursor: 'pointer',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    accentColor: colors.primary,
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    padding: '1rem',
    background: '#f8faf9',
    borderRadius: '10px',
    cursor: 'pointer',
    marginBottom: '0.75rem',
  },

  // Modal
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  modal: {
    background: colors.white,
    borderRadius: '20px',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 1.25rem',
    background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
    color: 'white',
  },
  modalTitle: {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: 600,
    flex: 1,
  },
  modalClose: {
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    color: 'white',
    fontSize: '1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    padding: '1.25rem',
    overflowY: 'auto',
    flex: 1,
  },
  modalTabs: {
    display: 'flex',
    borderBottom: `1px solid ${colors.border}`,
    overflowX: 'auto',
  },
  modalTab: {
    flex: 1,
    padding: '0.875rem 0.5rem',
    border: 'none',
    background: 'transparent',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: colors.textMuted,
    cursor: 'pointer',
    borderBottom: '3px solid transparent',
    whiteSpace: 'nowrap',
  },
  modalTabActive: {
    color: colors.primary,
    borderBottomColor: colors.primary,
  },

  // Appointment cards
  appointmentCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    background: '#f8faf9',
    borderRadius: '12px',
    marginBottom: '0.75rem',
    cursor: 'pointer',
  },
  appointmentDate: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})`,
    color: 'white',
    padding: '0.5rem 0.75rem',
    borderRadius: '10px',
    minWidth: '50px',
  },
  appointmentDay: {
    fontSize: '1.25rem',
    fontWeight: 700,
    lineHeight: 1,
  },
  appointmentMonth: {
    fontSize: '0.65rem',
    textTransform: 'uppercase',
  },

  // Calendar
  calendar: {
    background: colors.white,
    borderRadius: '16px',
    padding: '1rem',
    marginBottom: '1.5rem',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
  },
  calendarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  calendarNav: {
    background: '#f0f4f8',
    border: 'none',
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    fontSize: '1.25rem',
    cursor: 'pointer',
    color: colors.textLight,
  },
  calendarTitle: {
    margin: 0,
    fontSize: '1rem',
    textTransform: 'capitalize',
  },
  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '2px',
  },
  calendarWeekday: {
    textAlign: 'center',
    padding: '0.5rem',
    fontSize: '0.7rem',
    fontWeight: 700,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  calendarDay: {
    minHeight: '50px',
    padding: '0.35rem',
    background: '#fafbfc',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  calendarDayToday: {
    background: '#e8f5e9',
    border: `2px solid ${colors.primary}`,
  },
  calendarDayEmpty: {
    background: 'transparent',
  },
  calendarDot: {
    width: '18px',
    height: '18px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.6rem',
  },

  // Diary
  diaryCard: {
    background: colors.white,
    borderRadius: '16px',
    padding: '1.25rem',
    marginBottom: '1rem',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    position: 'relative',
  },
  diaryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  diaryDate: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})`,
    color: 'white',
    padding: '0.5rem 0.75rem',
    borderRadius: '10px',
  },
  diaryMood: {
    fontSize: '2rem',
  },
  symptomTag: {
    display: 'inline-block',
    background: '#ffeaa7',
    color: '#856404',
    padding: '0.2rem 0.6rem',
    borderRadius: '15px',
    fontSize: '0.75rem',
    marginRight: '0.35rem',
    marginBottom: '0.35rem',
  },

  // Medication
  medicationCard: {
    background: colors.white,
    borderRadius: '16px',
    padding: '1.25rem',
    marginBottom: '1rem',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
  },
  timeChip: {
    background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})`,
    color: 'white',
    padding: '0.3rem 0.75rem',
    borderRadius: '15px',
    fontSize: '0.8rem',
    fontWeight: 600,
    display: 'inline-block',
    marginRight: '0.35rem',
    marginBottom: '0.35rem',
  },
  toggleButton: {
    color: 'white',
    border: 'none',
    padding: '0.4rem 0.75rem',
    borderRadius: '15px',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
  },

  // Badges
  badge: {
    display: 'inline-block',
    padding: '0.2rem 0.6rem',
    borderRadius: '15px',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  badgePrimary: {
    background: '#e8f5e9',
    color: colors.primary,
  },
  badgeSecondary: {
    background: '#e3f2fd',
    color: colors.secondary,
  },
  badgePurple: {
    background: '#f3e5f5',
    color: colors.purple,
  },
  badgeGray: {
    background: '#f0f4f8',
    color: colors.textMuted,
  },

  // Notifications
  notificationContainer: {
    position: 'fixed',
    top: '70px',
    right: '1rem',
    zIndex: 2000,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    maxWidth: '90vw',
  },
  notification: {
    padding: '0.875rem 1rem',
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    animation: 'slideIn 0.3s ease',
    fontSize: '0.9rem',
  },

  // Empty state
  emptyState: {
    textAlign: 'center',
    padding: '2.5rem 1.5rem',
    background: colors.white,
    borderRadius: '16px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '0.75rem',
  },
  emptyText: {
    color: colors.textMuted,
    margin: 0,
  },

  // Footer
  footer: {
    background: colors.white,
    padding: '0.75rem 1.5rem',
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: '0.8rem',
    borderTop: `1px solid ${colors.border}`,
  },

  // Utilities
  textMuted: {
    color: colors.textMuted,
  },
  textPrimary: {
    color: colors.primary,
  },
  mt1: { marginTop: '0.5rem' },
  mt2: { marginTop: '1rem' },
  mb1: { marginBottom: '0.5rem' },
  mb2: { marginBottom: '1rem' },
  flexBetween: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flexCenter: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  gap1: { gap: '0.5rem' },
  gap2: { gap: '1rem' },
};

// Mobile styles override
export const mobileStyles = {
  menuButton: {
    display: 'block',
  },
  sidebar: {
    display: 'none',
  },
  sidebarOpen: {
    display: 'flex',
    position: 'fixed',
    top: '60px',
    left: 0,
    bottom: 0,
    width: '250px',
    zIndex: 200,
    boxShadow: '2px 0 15px rgba(0,0,0,0.2)',
  },
  bottomNav: {
    display: 'block',
  },
  content: {
    padding: '1rem',
    paddingBottom: '100px',
  },
  statsGrid: {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  formGrid: {
    gridTemplateColumns: '1fr',
  },
  pageTitle: {
    fontSize: '1.25rem',
  },
  exportBtn: {
    padding: '0.5rem',
    fontSize: '1rem',
  },
  logoText: {
    fontSize: '1.1rem',
  },
};

// Tablet styles
export const tabletStyles = {
  statsGrid: {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  formGrid: {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
};

// Desktop styles
export const desktopStyles = {
  statsGrid: {
    gridTemplateColumns: 'repeat(4, 1fr)',
  },
  formGrid: {
    gridTemplateColumns: 'repeat(3, 1fr)',
  },
};

// Get responsive styles
export const getResponsiveStyles = (windowWidth) => {
  if (windowWidth <= breakpoints.mobile) {
    return { ...styles, ...mobileStyles };
  } else if (windowWidth <= breakpoints.tablet) {
    return { ...styles, ...mobileStyles, ...tabletStyles };
  }
  return { ...styles, ...desktopStyles };
};
