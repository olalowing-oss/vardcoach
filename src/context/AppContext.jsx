import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { supabase, isSupabaseEnabled } from '../services/supabaseClient';
import { useAuth } from './AuthContext';
import { demoProfileData } from '../data/demoProfile';

// Initial State
const PROFILE_STORAGE_KEY = 'vardcoachen-profile-id';

const defaultDataShape = {
  diagnoses: [],
  medications: [],
  diaryEntries: [],
  appointments: [],
  aiNotes: {},
  medicationAiNotes: {},
  medicationInteractionNotes: [],
  overallAiNotes: [],
  medicationLog: {},
  doctorVisits: [],
  visitAiNotes: {},
  notes: [],
};

const normalizeDataShape = (data = {}) => ({
  diagnoses: Array.isArray(data.diagnoses) ? data.diagnoses : [],
  medications: Array.isArray(data.medications) ? data.medications : [],
  diaryEntries: Array.isArray(data.diaryEntries)
    ? data.diaryEntries
    : Array.isArray(data.diary)
      ? data.diary
      : [],
  appointments: Array.isArray(data.appointments) ? data.appointments : [],
  aiNotes: typeof data.aiNotes === 'object' && data.aiNotes !== null ? data.aiNotes : {},
  medicationAiNotes: typeof data.medicationAiNotes === 'object' && data.medicationAiNotes !== null ? data.medicationAiNotes : {},
  medicationInteractionNotes: Array.isArray(data.medicationInteractionNotes) ? data.medicationInteractionNotes : [],
  overallAiNotes: Array.isArray(data.overallAiNotes) ? data.overallAiNotes : [],
  medicationLog: typeof data.medicationLog === 'object' && data.medicationLog !== null ? data.medicationLog : {},
  doctorVisits: Array.isArray(data.doctorVisits) ? data.doctorVisits : [],
  visitAiNotes: typeof data.visitAiNotes === 'object' && data.visitAiNotes !== null ? data.visitAiNotes : {},
  notes: Array.isArray(data.notes) ? data.notes : [],
});

const loadLocalData = () => {
  if (typeof window === 'undefined') {
    return { ...defaultDataShape };
  }
  const storage = window.localStorage;
  const safeParse = (key, fallback) => {
    const saved = storage.getItem(`vardcoachen-${key}`);
    if (!saved) return fallback;
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(`Error loading ${key}:`, e);
      return fallback;
    }
  };

  return normalizeDataShape({
    diagnoses: safeParse('diagnoses', []),
    medications: safeParse('medications', []),
    diaryEntries: safeParse('diary', []),
    appointments: safeParse('appointments', []),
    aiNotes: safeParse('aiNotes', {}),
    medicationAiNotes: safeParse('medicationAiNotes', {}),
    medicationInteractionNotes: safeParse('medicationInteractionNotes', []),
    overallAiNotes: safeParse('overallAiNotes', []),
    medicationLog: safeParse('medicationLog', {}),
    doctorVisits: safeParse('doctorVisits', []),
    visitAiNotes: safeParse('visitAiNotes', {}),
    notes: safeParse('notes', []),
  });
};

const generateProfileId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `profile-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
};

const initialState = {
  activeView: 'dashboard',
  diagnoses: [],
  medications: [],
  diaryEntries: [],
  appointments: [],
  notifications: [],
  isLoading: false,
  aiResponse: null,
  showExportModal: false,
  mobileMenuOpen: false,
  selectedAppointment: null,
  aiNotes: {},
  medicationAiNotes: {},
  medicationInteractionNotes: [],
  overallAiNotes: [],
  medicationLog: {},
  doctorVisits: [],
  visitAiNotes: {},
  notes: [],
};

// Action Types
const ACTIONS = {
  SET_VIEW: 'SET_VIEW',
  SET_DIAGNOSES: 'SET_DIAGNOSES',
  ADD_DIAGNOSIS: 'ADD_DIAGNOSIS',
  UPDATE_DIAGNOSIS: 'UPDATE_DIAGNOSIS',
  DELETE_DIAGNOSIS: 'DELETE_DIAGNOSIS',
  SET_MEDICATIONS: 'SET_MEDICATIONS',
  ADD_MEDICATION: 'ADD_MEDICATION',
  UPDATE_MEDICATION: 'UPDATE_MEDICATION',
  DELETE_MEDICATION: 'DELETE_MEDICATION',
  SET_DIARY: 'SET_DIARY',
  ADD_DIARY_ENTRY: 'ADD_DIARY_ENTRY',
  DELETE_DIARY_ENTRY: 'DELETE_DIARY_ENTRY',
  ADD_VISIT: 'ADD_VISIT',
  UPDATE_VISIT: 'UPDATE_VISIT',
  DELETE_VISIT: 'DELETE_VISIT',
  ADD_NOTE: 'ADD_NOTE',
  UPDATE_NOTE: 'UPDATE_NOTE',
  DELETE_NOTE: 'DELETE_NOTE',
  SET_APPOINTMENTS: 'SET_APPOINTMENTS',
  ADD_APPOINTMENT: 'ADD_APPOINTMENT',
  UPDATE_APPOINTMENT: 'UPDATE_APPOINTMENT',
  DELETE_APPOINTMENT: 'DELETE_APPOINTMENT',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  SET_LOADING: 'SET_LOADING',
  SET_AI_RESPONSE: 'SET_AI_RESPONSE',
  TOGGLE_EXPORT_MODAL: 'TOGGLE_EXPORT_MODAL',
  TOGGLE_MOBILE_MENU: 'TOGGLE_MOBILE_MENU',
  SET_SELECTED_APPOINTMENT: 'SET_SELECTED_APPOINTMENT',
  LOAD_ALL_DATA: 'LOAD_ALL_DATA',
  ADD_AI_NOTE: 'ADD_AI_NOTE',
  DELETE_AI_NOTE: 'DELETE_AI_NOTE',
  ADD_MEDICATION_AI_NOTE: 'ADD_MEDICATION_AI_NOTE',
  DELETE_MEDICATION_AI_NOTE: 'DELETE_MEDICATION_AI_NOTE',
  ADD_OVERALL_AI_NOTE: 'ADD_OVERALL_AI_NOTE',
  DELETE_OVERALL_AI_NOTE: 'DELETE_OVERALL_AI_NOTE',
  ADD_MEDICATION_INTERACTION_NOTE: 'ADD_MEDICATION_INTERACTION_NOTE',
  DELETE_MEDICATION_INTERACTION_NOTE: 'DELETE_MEDICATION_INTERACTION_NOTE',
  SET_MEDICATION_INTAKE: 'SET_MEDICATION_INTAKE',
  ADD_VISIT_ANALYSIS: 'ADD_VISIT_ANALYSIS',
  DELETE_VISIT_ANALYSIS: 'DELETE_VISIT_ANALYSIS',
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_VIEW:
      return { ...state, activeView: action.payload, mobileMenuOpen: false };
    
    case ACTIONS.SET_DIAGNOSES:
      return { ...state, diagnoses: action.payload };
    
    case ACTIONS.ADD_DIAGNOSIS:
      return { ...state, diagnoses: [...state.diagnoses, action.payload] };
    
    case ACTIONS.UPDATE_DIAGNOSIS:
      return {
        ...state,
        diagnoses: state.diagnoses.map(d => 
          d.id === action.payload.id ? action.payload : d
        )
      };
    
    case ACTIONS.DELETE_DIAGNOSIS:
      return {
        ...state,
        diagnoses: state.diagnoses.filter(d => d.id !== action.payload)
      };
    
    case ACTIONS.SET_MEDICATIONS:
      return { ...state, medications: action.payload };
    
    case ACTIONS.ADD_MEDICATION:
      return { ...state, medications: [...state.medications, action.payload] };
    
    case ACTIONS.UPDATE_MEDICATION:
      return {
        ...state,
        medications: state.medications.map(m => 
          m.id === action.payload.id ? action.payload : m
        )
      };
    
    case ACTIONS.DELETE_MEDICATION:
      return {
        ...state,
        medications: state.medications.filter(m => m.id !== action.payload)
      };
    
    case ACTIONS.SET_DIARY:
      return { ...state, diaryEntries: action.payload };
    
    case ACTIONS.ADD_DIARY_ENTRY:
      return { ...state, diaryEntries: [action.payload, ...state.diaryEntries] };
    
    case ACTIONS.DELETE_DIARY_ENTRY:
      return {
        ...state,
        diaryEntries: state.diaryEntries.filter(e => e.id !== action.payload)
      };

    case ACTIONS.ADD_VISIT:
      return { ...state, doctorVisits: [action.payload, ...state.doctorVisits] };

    case ACTIONS.UPDATE_VISIT:
      return {
        ...state,
        doctorVisits: state.doctorVisits.map(v =>
          v.id === action.payload.id ? action.payload : v
        )
      };

    case ACTIONS.DELETE_VISIT: {
      const updated = { ...state.visitAiNotes };
      delete updated[action.payload];
      return {
        ...state,
        doctorVisits: state.doctorVisits.filter(v => v.id !== action.payload),
        visitAiNotes: updated,
      };
    }

    case ACTIONS.ADD_NOTE:
      return { ...state, notes: [action.payload, ...state.notes] };

    case ACTIONS.UPDATE_NOTE:
      return {
        ...state,
        notes: state.notes.map(note => note.id === action.payload.id ? action.payload : note)
      };

    case ACTIONS.DELETE_NOTE:
      return {
        ...state,
        notes: state.notes.filter(note => note.id !== action.payload)
      };
    
    case ACTIONS.SET_APPOINTMENTS:
      return { ...state, appointments: action.payload };
    
    case ACTIONS.ADD_APPOINTMENT:
      return { ...state, appointments: [...state.appointments, action.payload] };
    
    case ACTIONS.UPDATE_APPOINTMENT:
      return {
        ...state,
        appointments: state.appointments.map(a => 
          a.id === action.payload.id ? action.payload : a
        )
      };
    
    case ACTIONS.DELETE_APPOINTMENT:
      return {
        ...state,
        appointments: state.appointments.filter(a => a.id !== action.payload)
      };
    
    case ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };
    
    case ACTIONS.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    
    case ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };
    
    case ACTIONS.SET_AI_RESPONSE:
      return { ...state, aiResponse: action.payload };
    
    case ACTIONS.TOGGLE_EXPORT_MODAL:
      return { ...state, showExportModal: !state.showExportModal };
    
    case ACTIONS.TOGGLE_MOBILE_MENU:
      return { ...state, mobileMenuOpen: !state.mobileMenuOpen };
    
    case ACTIONS.SET_SELECTED_APPOINTMENT:
      return { ...state, selectedAppointment: action.payload };
    
    case ACTIONS.LOAD_ALL_DATA:
      return { ...state, ...action.payload };

    case ACTIONS.ADD_AI_NOTE: {
      const { diagnosisId, note } = action.payload;
      const existingNotes = state.aiNotes[diagnosisId] || [];
      return {
        ...state,
        aiNotes: {
          ...state.aiNotes,
          [diagnosisId]: [...existingNotes, note]
        }
      };
    }

    case ACTIONS.DELETE_AI_NOTE: {
      const { diagnosisId, noteId } = action.payload;
      const existingNotes = state.aiNotes[diagnosisId] || [];
      return {
        ...state,
        aiNotes: {
          ...state.aiNotes,
          [diagnosisId]: existingNotes.filter(note => note.id !== noteId)
        }
      };
    }

    case ACTIONS.ADD_MEDICATION_AI_NOTE: {
      const { medicationId, note } = action.payload;
      const existingNotes = state.medicationAiNotes[medicationId] || [];
      return {
        ...state,
        medicationAiNotes: {
          ...state.medicationAiNotes,
          [medicationId]: [...existingNotes, note]
        }
      };
    }

    case ACTIONS.DELETE_MEDICATION_AI_NOTE: {
      const { medicationId, noteId } = action.payload;
      const existingNotes = state.medicationAiNotes[medicationId] || [];
      return {
        ...state,
        medicationAiNotes: {
          ...state.medicationAiNotes,
          [medicationId]: existingNotes.filter(note => note.id !== noteId)
        }
      };
    }

    case ACTIONS.ADD_OVERALL_AI_NOTE: {
      const note = action.payload;
      return {
        ...state,
        overallAiNotes: [...state.overallAiNotes, note]
      };
    }

    case ACTIONS.DELETE_OVERALL_AI_NOTE:
      return {
        ...state,
        overallAiNotes: state.overallAiNotes.filter(note => note.id !== action.payload)
      };

    case ACTIONS.ADD_MEDICATION_INTERACTION_NOTE: {
      const note = action.payload;
      return {
        ...state,
        medicationInteractionNotes: [...state.medicationInteractionNotes, note]
      };
    }

    case ACTIONS.DELETE_MEDICATION_INTERACTION_NOTE:
      return {
        ...state,
        medicationInteractionNotes: state.medicationInteractionNotes.filter(note => note.id !== action.payload)
      };

    case ACTIONS.ADD_VISIT_ANALYSIS: {
      const { visitId, note } = action.payload;
      const existing = state.visitAiNotes[visitId] || [];
      return {
        ...state,
        visitAiNotes: {
          ...state.visitAiNotes,
          [visitId]: [...existing, note]
        }
      };
    }

    case ACTIONS.DELETE_VISIT_ANALYSIS: {
      const { visitId, noteId } = action.payload;
      return {
        ...state,
        visitAiNotes: {
          ...state.visitAiNotes,
          [visitId]: (state.visitAiNotes[visitId] || []).filter(note => note.id !== noteId)
        }
      };
    }

    case ACTIONS.SET_MEDICATION_INTAKE: {
      const { date, medId, taken } = action.payload;
      const existingLog = state.medicationLog[date] || {};
      const updatedDay = { ...existingLog };
      if (taken) {
        updatedDay[medId] = true;
      } else {
        delete updatedDay[medId];
      }
      const updatedLog = { ...state.medicationLog };
      if (Object.keys(updatedDay).length === 0) {
        delete updatedLog[date];
      } else {
        updatedLog[date] = updatedDay;
      }
      return {
        ...state,
        medicationLog: updatedLog,
      };
    }
    
    default:
      return state;
  }
}

// Context
const AppContext = createContext(null);

// Provider Component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user, loading: authLoading } = useAuth();
  const hasHydrated = useRef(false);
  const profileIdRef = useRef(
    typeof window !== 'undefined'
      ? window.localStorage.getItem(PROFILE_STORAGE_KEY)
      : null
  );
  const supabaseReadyRef = useRef(false);
  const supabaseSyncTimeout = useRef(null);

  // Load data from Supabase (if configured) or localStorage on mount
  useEffect(() => {
    let isMounted = true;
    let hydrationTimer;

    const loadData = async () => {
      // Wait for authentication to finish
      if (authLoading) {
        return;
      }

      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      const localData = loadLocalData();
      let payload = localData;

      if (isSupabaseEnabled && supabase) {
        try {
          let profileId;

          // If user is authenticated, use their user ID
          if (user) {
            profileId = user.id;
            profileIdRef.current = profileId;
          } else {
            // Fallback to generated profile ID for local use
            profileId = profileIdRef.current;
            if (!profileId && typeof window !== 'undefined') {
              profileId = generateProfileId();
              profileIdRef.current = profileId;
              window.localStorage.setItem(PROFILE_STORAGE_KEY, profileId);
            }
          }

          if (profileId) {
            const { data, error } = await supabase
              .from('health_profiles')
              .select('data')
              .eq('id', profileId)
              .maybeSingle();

            if (error && error.code !== 'PGRST116') {
              throw error;
            }

            let remoteData = data?.data;
            const shouldSeedFromLocal = !user;

            if (!remoteData || Object.keys(remoteData).length === 0) {
              remoteData = shouldSeedFromLocal ? { ...localData } : normalizeDataShape();
              const { error: upsertError } = await supabase
                .from('health_profiles')
                .upsert({
                  id: profileId,
                  data: remoteData
                });
              if (upsertError) {
                throw upsertError;
              }
            }

            payload = normalizeDataShape(remoteData);
            supabaseReadyRef.current = true;
          }
        } catch (error) {
          console.error('Supabase init failed, falling back to local data:', error);
        }
      }

      if (isMounted) {
        dispatch({ type: ACTIONS.LOAD_ALL_DATA, payload });
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      }
    };

    loadData().finally(() => {
      hydrationTimer = setTimeout(() => {
        hasHydrated.current = true;
      }, 0);
    });

    // Request notification permission
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      isMounted = false;
      if (hydrationTimer) {
        clearTimeout(hydrationTimer);
      }
    };
  }, [user, authLoading]);

  // Save to localStorage when data changes
  useEffect(() => {
    if (!hasHydrated.current) return;
    localStorage.setItem('vardcoachen-diagnoses', JSON.stringify(state.diagnoses));
  }, [state.diagnoses]);

  useEffect(() => {
    if (!hasHydrated.current) return;
    localStorage.setItem('vardcoachen-medications', JSON.stringify(state.medications));
  }, [state.medications]);

  useEffect(() => {
    if (!hasHydrated.current) return;
    localStorage.setItem('vardcoachen-diary', JSON.stringify(state.diaryEntries));
  }, [state.diaryEntries]);

  useEffect(() => {
    if (!hasHydrated.current) return;
    localStorage.setItem('vardcoachen-appointments', JSON.stringify(state.appointments));
  }, [state.appointments]);

  useEffect(() => {
    if (!hasHydrated.current) return;
    localStorage.setItem('vardcoachen-aiNotes', JSON.stringify(state.aiNotes));
  }, [state.aiNotes]);

  useEffect(() => {
    if (!hasHydrated.current) return;
    localStorage.setItem('vardcoachen-medicationAiNotes', JSON.stringify(state.medicationAiNotes));
  }, [state.medicationAiNotes]);

  useEffect(() => {
    if (!hasHydrated.current) return;
    localStorage.setItem('vardcoachen-medicationInteractionNotes', JSON.stringify(state.medicationInteractionNotes));
  }, [state.medicationInteractionNotes]);

  useEffect(() => {
    if (!hasHydrated.current) return;
    localStorage.setItem('vardcoachen-overallAiNotes', JSON.stringify(state.overallAiNotes));
  }, [state.overallAiNotes]);

  useEffect(() => {
    if (!hasHydrated.current) return;
    localStorage.setItem('vardcoachen-medicationLog', JSON.stringify(state.medicationLog));
  }, [state.medicationLog]);

  useEffect(() => {
    if (!hasHydrated.current) return;
    localStorage.setItem('vardcoachen-notes', JSON.stringify(state.notes));
  }, [state.notes]);

  useEffect(() => {
    if (!hasHydrated.current) return;
    localStorage.setItem('vardcoachen-doctorVisits', JSON.stringify(state.doctorVisits));
  }, [state.doctorVisits]);

  useEffect(() => {
    if (!hasHydrated.current) return;
    localStorage.setItem('vardcoachen-visitAiNotes', JSON.stringify(state.visitAiNotes));
  }, [state.visitAiNotes]);

  useEffect(() => {
    if (
      !hasHydrated.current ||
      !isSupabaseEnabled ||
      !supabase ||
      !profileIdRef.current ||
      !supabaseReadyRef.current
    ) {
      return;
    }

    const payload = {
      diagnoses: state.diagnoses,
      medications: state.medications,
      diaryEntries: state.diaryEntries,
      appointments: state.appointments,
      aiNotes: state.aiNotes,
      medicationAiNotes: state.medicationAiNotes,
      medicationInteractionNotes: state.medicationInteractionNotes,
      overallAiNotes: state.overallAiNotes,
      medicationLog: state.medicationLog,
      doctorVisits: state.doctorVisits,
      visitAiNotes: state.visitAiNotes,
      notes: state.notes,
    };

    if (supabaseSyncTimeout.current) {
      clearTimeout(supabaseSyncTimeout.current);
    }

    supabaseSyncTimeout.current = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from('health_profiles')
          .upsert({
            id: profileIdRef.current,
            data: payload
          });
        if (error) {
          console.error('Supabase sync error:', error);
        }
      } catch (error) {
        console.error('Supabase sync failed:', error);
      } finally {
        supabaseSyncTimeout.current = null;
      }
    }, 1000);

    return () => {
      if (supabaseSyncTimeout.current) {
        clearTimeout(supabaseSyncTimeout.current);
        supabaseSyncTimeout.current = null;
      }
    };
  }, [
    state.diagnoses,
    state.medications,
    state.diaryEntries,
    state.appointments,
    state.aiNotes,
    state.medicationAiNotes,
    state.medicationInteractionNotes,
    state.overallAiNotes,
    state.medicationLog,
    state.doctorVisits,
    state.visitAiNotes,
    state.notes
  ]);

  // Action creators
  const actions = {
    setView: (view) => dispatch({ type: ACTIONS.SET_VIEW, payload: view }),
    
    // Diagnoses
    addDiagnosis: (diagnosis) => dispatch({ type: ACTIONS.ADD_DIAGNOSIS, payload: diagnosis }),
    updateDiagnosis: (diagnosis) => dispatch({ type: ACTIONS.UPDATE_DIAGNOSIS, payload: diagnosis }),
    deleteDiagnosis: (id) => dispatch({ type: ACTIONS.DELETE_DIAGNOSIS, payload: id }),
    
    // Medications
    addMedication: (medication) => dispatch({ type: ACTIONS.ADD_MEDICATION, payload: medication }),
    updateMedication: (medication) => dispatch({ type: ACTIONS.UPDATE_MEDICATION, payload: medication }),
    deleteMedication: (id) => dispatch({ type: ACTIONS.DELETE_MEDICATION, payload: id }),
    
    // Diary
    addDiaryEntry: (entry) => dispatch({ type: ACTIONS.ADD_DIARY_ENTRY, payload: entry }),
    deleteDiaryEntry: (id) => dispatch({ type: ACTIONS.DELETE_DIARY_ENTRY, payload: id }),
    
    // Appointments
    addAppointment: (appointment) => dispatch({ type: ACTIONS.ADD_APPOINTMENT, payload: appointment }),
    updateAppointment: (appointment) => dispatch({ type: ACTIONS.UPDATE_APPOINTMENT, payload: appointment }),
    deleteAppointment: (id) => dispatch({ type: ACTIONS.DELETE_APPOINTMENT, payload: id }),
    setSelectedAppointment: (apt) => dispatch({ type: ACTIONS.SET_SELECTED_APPOINTMENT, payload: apt }),
    addVisit: (visit) => dispatch({ type: ACTIONS.ADD_VISIT, payload: visit }),
    updateVisit: (visit) => dispatch({ type: ACTIONS.UPDATE_VISIT, payload: visit }),
    deleteVisit: (id) => dispatch({ type: ACTIONS.DELETE_VISIT, payload: id }),
    addVisitAnalysis: (visitId, note) => dispatch({ type: ACTIONS.ADD_VISIT_ANALYSIS, payload: { visitId, note } }),
    deleteVisitAnalysis: (visitId, noteId) => dispatch({ type: ACTIONS.DELETE_VISIT_ANALYSIS, payload: { visitId, noteId } }),
    
    // Notifications
    addNotification: (message, type = 'info') => {
      const id = Date.now();
      dispatch({ 
        type: ACTIONS.ADD_NOTIFICATION, 
        payload: { id, message, type, time: new Date() } 
      });
      setTimeout(() => {
        dispatch({ type: ACTIONS.REMOVE_NOTIFICATION, payload: id });
      }, 10000);
    },
    removeNotification: (id) => dispatch({ type: ACTIONS.REMOVE_NOTIFICATION, payload: id }),
    
    // UI
    setLoading: (loading) => dispatch({ type: ACTIONS.SET_LOADING, payload: loading }),
    setAiResponse: (response) => dispatch({ type: ACTIONS.SET_AI_RESPONSE, payload: response }),
    toggleExportModal: () => dispatch({ type: ACTIONS.TOGGLE_EXPORT_MODAL }),
    toggleMobileMenu: () => dispatch({ type: ACTIONS.TOGGLE_MOBILE_MENU }),
    addAiNote: (diagnosisId, note) => dispatch({ type: ACTIONS.ADD_AI_NOTE, payload: { diagnosisId, note } }),
    deleteAiNote: (diagnosisId, noteId) => dispatch({ type: ACTIONS.DELETE_AI_NOTE, payload: { diagnosisId, noteId } }),
    addMedicationAiNote: (medicationId, note) =>
      dispatch({ type: ACTIONS.ADD_MEDICATION_AI_NOTE, payload: { medicationId, note } }),
    deleteMedicationAiNote: (medicationId, noteId) =>
      dispatch({ type: ACTIONS.DELETE_MEDICATION_AI_NOTE, payload: { medicationId, noteId } }),
    addOverallAiNote: (note) => dispatch({ type: ACTIONS.ADD_OVERALL_AI_NOTE, payload: note }),
    deleteOverallAiNote: (noteId) => dispatch({ type: ACTIONS.DELETE_OVERALL_AI_NOTE, payload: noteId }),
    addMedicationInteractionNote: (note) =>
      dispatch({ type: ACTIONS.ADD_MEDICATION_INTERACTION_NOTE, payload: note }),
    deleteMedicationInteractionNote: (noteId) =>
      dispatch({ type: ACTIONS.DELETE_MEDICATION_INTERACTION_NOTE, payload: noteId }),
    setMedicationIntake: (date, medId, taken) =>
      dispatch({ type: ACTIONS.SET_MEDICATION_INTAKE, payload: { date, medId, taken } }),
    addNote: (note) => dispatch({ type: ACTIONS.ADD_NOTE, payload: note }),
    updateNote: (note) => dispatch({ type: ACTIONS.UPDATE_NOTE, payload: note }),
    deleteNote: (id) => dispatch({ type: ACTIONS.DELETE_NOTE, payload: id }),
    importDemoData: () => {
      const normalized = normalizeDataShape(demoProfileData);
      dispatch({ type: ACTIONS.LOAD_ALL_DATA, payload: normalized });
      const id = Date.now();
      dispatch({
        type: ACTIONS.ADD_NOTIFICATION,
        payload: {
          id,
          message: 'Demodata importerad!',
          type: 'success',
          time: new Date()
        }
      });
      setTimeout(() => {
        dispatch({ type: ACTIONS.REMOVE_NOTIFICATION, payload: id });
      }, 5000);
    }
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook for using the context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
