import React from 'react';
import { styles, colors } from '../styles/styles';
import { formatDate, getMonthShort, getTypeIcon, isPast } from '../utils/helpers';

export function Dashboard({ 
  diagnoses, 
  medications, 
  diaryEntries, 
  appointments, 
  setActiveView,
  isMobile 
}) {
  const activeMeds = medications.filter(m => m.active);
  const upcomingAppointments = appointments
    .filter(a => !isPast(a.date))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  const stats = [
    { icon: '📅', count: upcomingAppointments.length, label: 'Kommande besök', view: 'calendar' },
    { icon: '🔬', count: diagnoses.length, label: 'Diagnoser', view: 'diagnosis' },
    { icon: '💊', count: activeMeds.length, label: 'Läkemedel', view: 'medications' },
    { icon: '📔', count: diaryEntries.length, label: 'Anteckningar', view: 'diary' },
  ];

  return (
    <div style={styles.contentInner}>
      <h2 style={{ ...styles.pageTitle, marginBottom: '1.5rem' }}>
        Välkommen tillbaka 👋
      </h2>

      {/* Stats Grid */}
      <div style={{
        ...styles.statsGrid,
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
      }}>
        {stats.map((stat, i) => (
          <div
            key={i}
            style={styles.statCard}
            onClick={() => setActiveView(stat.view)}
          >
            <span style={styles.statIcon}>{stat.icon}</span>
            <span style={styles.statNumber}>{stat.count}</span>
            <span style={styles.statLabel}>{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Upcoming Appointments */}
      <div style={styles.section}>
        <div style={styles.flexBetween}>
          <h3 style={styles.sectionTitle}>📅 Kommande besök</h3>
          <button
            style={{ ...styles.button, ...styles.buttonSmall, ...styles.buttonGhost }}
            onClick={() => setActiveView('calendar')}
          >
            Visa alla
          </button>
        </div>
        
        {upcomingAppointments.length === 0 ? (
          <p style={styles.textMuted}>Inga kommande besök bokade</p>
        ) : (
          upcomingAppointments.map(apt => (
            <div key={apt.id} style={styles.appointmentCard}>
              <div style={styles.appointmentDate}>
                <span style={styles.appointmentDay}>
                  {new Date(apt.date).getDate()}
                </span>
                <span style={styles.appointmentMonth}>
                  {getMonthShort(apt.date)}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: '0.95rem' }}>{apt.title}</strong>
                <div style={{ fontSize: '0.8rem', color: colors.textMuted, marginTop: '0.25rem' }}>
                  🕐 {apt.time}
                  {apt.location && ` • 📍 ${apt.location}`}
                </div>
              </div>
              <span style={{ fontSize: '1.5rem' }}>{getTypeIcon(apt.type)}</span>
              {apt.reminder && <span style={{ color: colors.primary }}>🔔</span>}
            </div>
          ))
        )}
      </div>

      {/* Today's Medications */}
      <div style={styles.section}>
        <div style={styles.flexBetween}>
          <h3 style={styles.sectionTitle}>💊 Dagens läkemedel</h3>
          <button
            style={{ ...styles.button, ...styles.buttonSmall, ...styles.buttonGhost }}
            onClick={() => setActiveView('medications')}
          >
            Hantera
          </button>
        </div>
        
        {activeMeds.length === 0 ? (
          <p style={styles.textMuted}>Inga aktiva läkemedel</p>
        ) : (
          activeMeds.slice(0, 4).map(med => (
            <div
              key={med.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                background: '#f8faf9',
                borderRadius: '10px',
                marginBottom: '0.5rem',
              }}
            >
              <div>
                <strong>{med.name}</strong>
                <div style={{ fontSize: '0.85rem', color: colors.textMuted }}>
                  {med.dosage}
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', justifyContent: 'flex-end' }}>
                {med.times.map((time, i) => (
                  <span key={i} style={styles.timeChip}>{time}</span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Recent Diary Entries */}
      <div style={styles.section}>
        <div style={styles.flexBetween}>
          <h3 style={styles.sectionTitle}>📔 Senaste anteckningar</h3>
          <button
            style={{ ...styles.button, ...styles.buttonSmall, ...styles.buttonGhost }}
            onClick={() => setActiveView('diary')}
          >
            Ny anteckning
          </button>
        </div>
        
        {diaryEntries.length === 0 ? (
          <p style={styles.textMuted}>Inga anteckningar ännu</p>
        ) : (
          [...diaryEntries]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3)
            .map(entry => (
              <div
                key={entry.id}
                style={{
                  padding: '0.75rem 1rem',
                  background: '#f8faf9',
                  borderRadius: '10px',
                  marginBottom: '0.5rem',
                  borderLeft: `4px solid ${colors.primary}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: colors.textMuted }}>
                    {formatDate(entry.date)}
                  </span>
                  <span style={{ fontSize: '1.5rem' }}>
                    {['', '😢', '😕', '😐', '🙂', '😊'][entry.mood] || '😐'}
                  </span>
                </div>
                {entry.symptoms && (
                  <div style={{ marginTop: '0.5rem' }}>
                    {entry.symptoms.split(',').slice(0, 3).map((s, i) => (
                      <span key={i} style={styles.symptomTag}>{s.trim()}</span>
                    ))}
                  </div>
                )}
                {entry.text && (
                  <p style={{
                    margin: '0.5rem 0 0',
                    fontSize: '0.9rem',
                    color: colors.textLight,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {entry.text}
                  </p>
                )}
              </div>
            ))
        )}
      </div>

      {/* Quick Actions */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>⚡ Snabbåtgärder</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
          gap: '0.75rem',
        }}>
          {[
            { icon: '📅', label: 'Boka besök', view: 'calendar' },
            { icon: '📔', label: 'Ny anteckning', view: 'diary' },
            { icon: '💊', label: 'Läkemedel', view: 'medications' },
            { icon: '❓', label: 'Frågor', view: 'questions' },
          ].map((action, i) => (
            <button
              key={i}
              onClick={() => setActiveView(action.view)}
              style={{
                ...styles.button,
                ...styles.buttonGhost,
                flexDirection: 'column',
                padding: '1rem',
                width: '100%',
              }}
            >
              <span style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{action.icon}</span>
              <span style={{ fontSize: '0.8rem' }}>{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
