// Date formatting helpers
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('sv-SE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatShortDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('sv-SE', {
    month: 'short',
    day: 'numeric'
  });
};

export const formatTime = (timeString) => {
  return timeString;
};

export const getRelativeDate = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const dateOnly = date.toDateString();
  
  if (dateOnly === today.toDateString()) return 'Idag';
  if (dateOnly === tomorrow.toDateString()) return 'Imorgon';
  
  return formatShortDate(dateString);
};

// Month names in Swedish
export const MONTHS_SV = [
  'Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni',
  'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'
];

export const WEEKDAYS_SV = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];

export const WEEKDAYS_FULL_SV = [
  'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'
];

// Mood helpers
export const MOOD_EMOJIS = ['😢', '😕', '😐', '🙂', '😄'];
export const MOOD_LABELS = ['Mycket dåligt', 'Dåligt', 'Okej', 'Bra', 'Mycket bra'];

export const getMoodEmoji = (mood) => MOOD_EMOJIS[mood - 1] || '😐';
export const getMoodLabel = (mood) => MOOD_LABELS[mood - 1] || 'Okej';

// Appointment type colors
export const APPOINTMENT_COLORS = {
  checkup: { bg: '#e8f5e9', color: '#2E7D5C' },
  specialist: { bg: '#e3f2fd', color: '#1976d2' },
  test: { bg: '#fff3e0', color: '#f57c00' },
  surgery: { bg: '#fce4ec', color: '#c2185b' },
  followup: { bg: '#f3e5f5', color: '#7b1fa2' },
  other: { bg: '#f5f5f5', color: '#616161' },
};

export const APPOINTMENT_TYPES = [
  { value: 'checkup', label: 'Rutinkontroll' },
  { value: 'specialist', label: 'Specialistbesök' },
  { value: 'test', label: 'Provtagning' },
  { value: 'surgery', label: 'Operation/Ingrepp' },
  { value: 'followup', label: 'Uppföljning' },
  { value: 'other', label: 'Annat' },
];

// Common symptoms
export const COMMON_SYMPTOMS = [
  'Huvudvärk', 'Trötthet', 'Illamående', 'Yrsel', 'Smärta',
  'Sömnsvårigheter', 'Ångest', 'Feber', 'Hosta', 'Andfåddhet'
];

// ID generators
export const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// Validation helpers
export const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

export const isValidTime = (timeString) => {
  return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeString);
};

// Sort helpers
export const sortByDate = (a, b, ascending = true) => {
  const dateA = new Date(a.date);
  const dateB = new Date(b.date);
  return ascending ? dateA - dateB : dateB - dateA;
};

// Filter helpers
export const filterUpcoming = (appointments) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return appointments.filter(a => new Date(a.date) >= today);
};

export const filterPast = (appointments) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return appointments.filter(a => new Date(a.date) < today);
};

// Calendar helpers
export const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

export const getFirstDayOfMonth = (year, month) => {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Convert to Monday = 0
};

export const isSameDay = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.toDateString() === d2.toDateString();
};

export const isToday = (dateString) => {
  return isSameDay(dateString, new Date());
};

// Local storage helpers
export const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(`vardcoachen-${key}`, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Error saving to localStorage:', e);
    return false;
  }
};

export const loadFromStorage = (key, defaultValue = []) => {
  try {
    const saved = localStorage.getItem(`vardcoachen-${key}`);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    console.error('Error loading from localStorage:', e);
    return defaultValue;
  }
};

// Text truncation
export const truncate = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Debounce helper
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
