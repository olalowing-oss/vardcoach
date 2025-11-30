import React from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardTitle, Button, Checkbox } from '../components/common';
import { formatShortDate, getRelativeDate, getMoodEmoji } from '../utils/helpers';
import './Dashboard.css';

export function Dashboard() {
  const { state, actions } = useApp();
  const { diagnoses, medications, diaryEntries, appointments, medicationLog } = state;

  // Calculate stats
  const activeMeds = medications.filter(m => m.active).length;
  const upcomingApts = appointments.filter(a => new Date(a.date) >= new Date()).length;
  const diaryCount = diaryEntries.length;

  // Next appointment
  const nextApt = appointments
    .filter(a => new Date(a.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  // Recent diary entries
  const recentDiary = diaryEntries.slice(0, 3);

  // Active medication reminders and daily check
  const todaysMeds = medications.filter(m => m.active);
  const todayKey = new Date().toISOString().split('T')[0];
  const todaysLog = medicationLog?.[todayKey] || {};
  const medsTakenToday = todaysMeds.filter(m => todaysLog?.[m.id]).length;

  const handleMedicationIntakeToggle = (medId, checked) => {
    actions.setMedicationIntake(todayKey, medId, checked);
  };

  return (
    <div className="dashboard">
      <h1 className="page-title">Välkommen! 👋</h1>

      {/* Stats Grid */}
      <div className="stats-grid">
        <Card 
          className="stat-card" 
          onClick={() => actions.setView('diagnoses')}
          hoverable
        >
          <span className="stat-icon">🔬</span>
          <span className="stat-number">{diagnoses.length}</span>
          <span className="stat-label">Diagnoser</span>
        </Card>

        <Card 
          className="stat-card"
          onClick={() => actions.setView('medications')}
          hoverable
        >
          <span className="stat-icon">💊</span>
          <span className="stat-number">{activeMeds}</span>
          <span className="stat-label">Läkemedel</span>
        </Card>

        <Card 
          className="stat-card"
          onClick={() => actions.setView('calendar')}
          hoverable
        >
          <span className="stat-icon">📅</span>
          <span className="stat-number">{upcomingApts}</span>
          <span className="stat-label">Kommande</span>
        </Card>

        <Card 
          className="stat-card"
          onClick={() => actions.setView('diary')}
          hoverable
        >
          <span className="stat-icon">📔</span>
          <span className="stat-number">{diaryCount}</span>
          <span className="stat-label">Dagbok</span>
        </Card>
      </div>

      {/* Medications Today */}
      {todaysMeds.length > 0 && (
        <Card className="section-card">
          <div className="section-header">
            <div className="section-header-title">
              <CardTitle>💊 Läkemedel idag</CardTitle>
              <span className="today-med-progress">
                {medsTakenToday}/{todaysMeds.length} tagna
              </span>
            </div>
            <div className="section-header-actions">
              <button 
                className="link-btn"
                onClick={() => actions.setView('reminders')}
              >
                Påminnelser →
              </button>
              <button 
                className="link-btn"
                onClick={() => actions.setView('medications')}
              >
                Läkemedel →
              </button>
            </div>
          </div>
          
          <div className="reminder-list">
            {todaysMeds.map(med => (
              <div key={med.id} className="quick-reminder">
                <div className="reminder-left">
                  <Checkbox
                    label=""
                    checked={Boolean(todaysLog?.[med.id])}
                    onChange={(e) => handleMedicationIntakeToggle(med.id, e.target.checked)}
                    id={`today-med-${med.id}`}
                    className="reminder-checkbox"
                  />
                  <div className="reminder-info">
                    <span className="reminder-name">{med.name}</span>
                    <span className="reminder-times">{med.times.join(', ')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Next Appointment */}
      {nextApt && (
        <Card className="next-appointment">
          <div className="next-apt-header">
            <span className="next-apt-badge">Nästa besök</span>
            <span className="next-apt-date">{getRelativeDate(nextApt.date)}</span>
          </div>
          <h3 className="next-apt-title">{nextApt.title}</h3>
          <div className="next-apt-details">
            <span>🕐 {nextApt.time}</span>
            <span>📍 {nextApt.location}</span>
          </div>
          <Button 
            variant="outline" 
            size="small"
            onClick={() => actions.setView('calendar')}
          >
            Visa i kalender
          </Button>
        </Card>
      )}

      {/* Recent Diary */}
      {recentDiary.length > 0 && (
        <Card className="section-card">
          <div className="section-header">
            <CardTitle>📔 Senaste anteckningar</CardTitle>
            <button 
              className="link-btn"
              onClick={() => actions.setView('diary')}
            >
              Alla →
            </button>
          </div>
          
          <div className="diary-list">
            {recentDiary.map(entry => (
              <div key={entry.id} className="diary-preview">
                <span className="diary-mood">{getMoodEmoji(entry.mood)}</span>
                <div className="diary-info">
                  <span className="diary-date">{formatShortDate(entry.date)}</span>
                  {entry.notes && (
                    <span className="diary-notes">
                      {entry.notes.substring(0, 50)}
                      {entry.notes.length > 50 && '...'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Empty state */}
      {diagnoses.length === 0 && medications.length === 0 && appointments.length === 0 && (
        <Card className="empty-card">
          <div className="empty-content">
            <span className="empty-icon">🏥</span>
            <h3>Kom igång med Vårdcoachen</h3>
            <p>Börja med att lägga till dina diagnoser, läkemedel eller boka ditt första vårdbesök.</p>
            <div className="empty-actions">
              <Button onClick={() => actions.setView('diagnoses')}>
                Lägg till diagnos
              </Button>
              <Button variant="outline" onClick={() => actions.setView('calendar')}>
                Boka besök
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default Dashboard;
