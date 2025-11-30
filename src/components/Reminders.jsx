import React from 'react';
import { styles, colors } from '../styles/styles';
import { formatDate, getTypeIcon, isPast } from '../utils/helpers';

export function Reminders({ 
  medications, 
  setMedications, 
  appointments, 
  setAppointments,
  reminderSystem,
  isMobile 
}) {
  const { notificationPermission, requestPermission } = reminderSystem;

  const toggleMedReminder = (id) => {
    setMedications(medications.map(m =>
      m.id === id ? { ...m, reminder: !m.reminder } : m
    ));
  };

  const toggleAptReminder = (id) => {
    setAppointments(appointments.map(a =>
      a.id === id ? { ...a, reminder: !a.reminder } : a
    ));
  };

  const activeMeds = medications.filter(m => m.active);
  const upcomingAppointments = appointments.filter(a => !isPast(a.date));

  return (
    <div style={styles.contentInner}>
      <h2 style={styles.pageTitle}>🔔 Påminnelser</h2>

      {/* Notification Permission Banner */}
      {notificationPermission !== 'granted' && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.25rem',
          background: '#fef9e7',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          border: '2px solid #f7dc6f',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div>
            <strong style={{ display: 'block' }}>🔔 Aktivera webbnotiser</strong>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: '#856404' }}>
              För att få påminnelser även när du inte har appen i förgrunden
            </p>
          </div>
          {notificationPermission === 'default' && (
            <button style={styles.button} onClick={requestPermission}>
              Aktivera notiser
            </button>
          )}
          {notificationPermission === 'denied' && (
            <span style={{ color: colors.red, fontSize: '0.85rem' }}>
              ⚠️ Notiser blockerade i webbläsaren
            </span>
          )}
        </div>
      )}

      {notificationPermission === 'granted' && (
        <div style={{
          padding: '1rem',
          background: '#e8f5e9',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          color: colors.primary,
          fontWeight: 600,
        }}>
          ✅ Notiser är aktiverade! Du får påminnelser även när denna flik inte är aktiv.
        </div>
      )}

      {/* Medication Reminders */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>💊 Läkemedelspåminnelser</h3>
        <p style={{ color: colors.textMuted, fontSize: '0.9rem', marginBottom: '1rem' }}>
          Få påminnelser vid varje doseringstid
        </p>

        {activeMeds.length === 0 ? (
          <p style={styles.textMuted}>Inga aktiva läkemedel registrerade</p>
        ) : (
          activeMeds.map(med => (
            <div
              key={med.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                background: 'white',
                borderRadius: '12px',
                marginBottom: '0.75rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                flexWrap: isMobile ? 'wrap' : 'nowrap',
              }}
            >
              <div style={{ flex: 1, minWidth: isMobile ? '100%' : 'auto' }}>
                <strong>{med.name}</strong>
                <span style={{ color: colors.textMuted, marginLeft: '0.5rem' }}>
                  {med.dosage}
                </span>
                <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  {med.times.map((time, i) => (
                    <span key={i} style={styles.timeChip}>{time}</span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => toggleMedReminder(med.id)}
                style={{
                  ...styles.button,
                  background: med.reminder
                    ? `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})`
                    : colors.border,
                  color: med.reminder ? 'white' : colors.textMuted,
                  boxShadow: med.reminder ? '0 4px 12px rgba(46,125,92,0.3)' : 'none',
                  minWidth: '100px',
                }}
              >
                {med.reminder ? '🔔 Aktiv' : '🔕 Av'}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Appointment Reminders */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>📅 Besökspåminnelser</h3>
        <p style={{ color: colors.textMuted, fontSize: '0.9rem', marginBottom: '1rem' }}>
          Få en påminnelse dagen innan ditt besök (kl 18:00)
        </p>

        {upcomingAppointments.length === 0 ? (
          <p style={styles.textMuted}>Inga kommande besök bokade</p>
        ) : (
          upcomingAppointments
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map(apt => (
              <div
                key={apt.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  background: 'white',
                  borderRadius: '12px',
                  marginBottom: '0.75rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  flexWrap: isMobile ? 'wrap' : 'nowrap',
                }}
              >
                <div style={{ flex: 1, minWidth: isMobile ? '100%' : 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>{getTypeIcon(apt.type)}</span>
                    <strong>{apt.title}</strong>
                  </div>
                  <div style={{ color: colors.textMuted, fontSize: '0.9rem', marginTop: '0.25rem' }}>
                    📅 {formatDate(apt.date)} kl {apt.time}
                    {apt.location && ` • 📍 ${apt.location}`}
                  </div>
                </div>
                <button
                  onClick={() => toggleAptReminder(apt.id)}
                  style={{
                    ...styles.button,
                    background: apt.reminder
                      ? `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})`
                      : colors.border,
                    color: apt.reminder ? 'white' : colors.textMuted,
                    boxShadow: apt.reminder ? '0 4px 12px rgba(46,125,92,0.3)' : 'none',
                    minWidth: '100px',
                  }}
                >
                  {apt.reminder ? '🔔 Aktiv' : '🔕 Av'}
                </button>
              </div>
            ))
        )}
      </div>

      {/* Info Box */}
      <div style={{
        background: '#f8fafc',
        borderRadius: '12px',
        padding: '1.25rem',
        marginTop: '1.5rem',
        border: `1px solid ${colors.border}`,
      }}>
        <h4 style={{ margin: '0 0 0.75rem' }}>ℹ️ Hur påminnelser fungerar</h4>
        <ul style={{
          margin: 0,
          paddingLeft: '1.25rem',
          color: colors.textLight,
          lineHeight: 1.8,
        }}>
          <li><strong>Läkemedel:</strong> Påminnelse visas vid exakt doseringstid</li>
          <li><strong>Besök:</strong> Påminnelse visas kl 18:00 dagen innan</li>
          <li><strong>Webbnotiser:</strong> Fungerar även när du har andra flikar öppna</li>
          <li><strong>OBS:</strong> Appen måste vara öppen i en flik för att påminnelser ska fungera</li>
        </ul>
      </div>
    </div>
  );
}
