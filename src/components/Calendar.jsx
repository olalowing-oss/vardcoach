import React, { useState } from 'react';
import { styles, colors } from '../styles/styles';
import { 
  formatDate, 
  getMonthName, 
  getMonthShort, 
  getCalendarDays, 
  isToday, 
  isPast,
  getTypeIcon, 
  getTypeColor,
  appointmentTypes 
} from '../utils/helpers';
import { AppointmentModal } from './modals/AppointmentModal';

export function Calendar({ 
  appointments, 
  setAppointments, 
  diagnoses, 
  medications,
  diaryEntries,
  setDiaryEntries,
  isMobile 
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [formData, setFormData] = useState(getEmptyForm());

  function getEmptyForm() {
    return {
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      location: '',
      doctor: '',
      type: 'checkup',
      diagnosisId: '',
      purpose: '',
      prepNotes: '',
      postNotes: '',
      questions: '',
      reminder: true,
    };
  }

  const days = getCalendarDays(currentMonth);
  const weekdays = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön'];

  const handleSubmit = (e) => {
    e.preventDefault();
    const newAppointment = {
      ...formData,
      id: Date.now(),
      medicationsAtTime: medications
        .filter(m => m.active)
        .map(m => ({ id: m.id, name: m.name, dosage: m.dosage })),
      createdAt: new Date().toISOString(),
    };
    setAppointments([...appointments, newAppointment]);
    setFormData(getEmptyForm());
    setShowForm(false);
  };

  const handleUpdate = (updated) => {
    setAppointments(appointments.map(a => a.id === updated.id ? updated : a));
    setSelectedAppointment(updated);
  };

  const handleDelete = (id) => {
    if (window.confirm('Är du säker på att du vill ta bort detta besök?')) {
      setAppointments(appointments.filter(a => a.id !== id));
      setSelectedAppointment(null);
    }
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const getAppointmentsForDay = (date) => {
    if (!date) return [];
    return appointments.filter(a => 
      new Date(a.date).toDateString() === date.toDateString()
    );
  };

  return (
    <div style={styles.contentInner}>
      <div style={styles.pageHeader}>
        <h2 style={styles.pageTitle}>📅 Kalender & Besök</h2>
        <button style={styles.button} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Avbryt' : '+ Boka besök'}
        </button>
      </div>

      {/* New Appointment Form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Nytt vårdbesök</h3>
          
          <div style={{
            ...styles.formGrid,
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
          }}>
            <div>
              <label style={styles.label}>Titel *</label>
              <input
                required
                style={styles.input}
                placeholder="T.ex. Blodtryckskontroll"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <label style={styles.label}>Typ</label>
              <select
                style={styles.select}
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
              >
                {appointmentTypes.map(t => (
                  <option key={t.id} value={t.id}>{t.icon} {t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={styles.label}>Datum *</label>
              <input
                required
                type="date"
                style={styles.input}
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <label style={styles.label}>Tid</label>
              <input
                type="time"
                style={styles.input}
                value={formData.time}
                onChange={e => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
            <div>
              <label style={styles.label}>Plats</label>
              <input
                style={styles.input}
                placeholder="Vårdcentralen"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div>
              <label style={styles.label}>Läkare</label>
              <input
                style={styles.input}
                placeholder="Dr. Andersson"
                value={formData.doctor}
                onChange={e => setFormData({ ...formData, doctor: e.target.value })}
              />
            </div>
          </div>

          {diagnoses.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={styles.label}>Kopplad diagnos</label>
              <select
                style={styles.select}
                value={formData.diagnosisId}
                onChange={e => setFormData({ ...formData, diagnosisId: e.target.value })}
              >
                <option value="">Välj diagnos...</option>
                {diagnoses.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={styles.label}>Syfte med besöket</label>
            <textarea
              style={styles.textarea}
              rows={2}
              placeholder="Vad ska du ta upp på besöket?"
              value={formData.purpose}
              onChange={e => setFormData({ ...formData, purpose: e.target.value })}
            />
          </div>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
            cursor: 'pointer',
          }}>
            <input
              type="checkbox"
              checked={formData.reminder}
              onChange={e => setFormData({ ...formData, reminder: e.target.checked })}
              style={styles.checkbox}
            />
            <span>🔔 Påminn mig dagen innan</span>
          </label>

          <button type="submit" style={styles.button}>
            Spara besök
          </button>
        </form>
      )}

      {/* Calendar View */}
      <div style={styles.calendar}>
        <div style={styles.calendarHeader}>
          <button style={styles.calendarNav} onClick={prevMonth}>←</button>
          <h3 style={styles.calendarTitle}>{getMonthName(currentMonth)}</h3>
          <button style={styles.calendarNav} onClick={nextMonth}>→</button>
        </div>

        <div style={styles.calendarGrid}>
          {weekdays.map(day => (
            <div key={day} style={styles.calendarWeekday}>{day}</div>
          ))}
          {days.map((date, i) => {
            const dayAppointments = getAppointmentsForDay(date);
            const today = isToday(date);
            
            return (
              <div
                key={i}
                style={{
                  ...styles.calendarDay,
                  ...(today ? styles.calendarDayToday : {}),
                  ...(!date ? styles.calendarDayEmpty : {}),
                }}
                onClick={() => dayAppointments[0] && setSelectedAppointment(dayAppointments[0])}
              >
                {date && (
                  <>
                    <span style={{ fontWeight: 600 }}>{date.getDate()}</span>
                    {dayAppointments.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', marginTop: '4px' }}>
                        {dayAppointments.slice(0, 2).map(apt => (
                          <span
                            key={apt.id}
                            style={{
                              ...styles.calendarDot,
                              background: getTypeColor(apt.type),
                              color: 'white',
                            }}
                          >
                            {getTypeIcon(apt.type)}
                          </span>
                        ))}
                        {dayAppointments.length > 2 && (
                          <span style={{ fontSize: '0.6rem', color: colors.textMuted }}>
                            +{dayAppointments.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Appointments List */}
      <h3 style={styles.sectionTitle}>📋 Alla besök</h3>
      
      {appointments.length === 0 ? (
        <div style={styles.emptyState}>
          <span style={styles.emptyIcon}>📅</span>
          <p style={styles.emptyText}>Inga besök bokade ännu</p>
        </div>
      ) : (
        [...appointments]
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .map(apt => {
            const past = isPast(apt.date);
            const diagnosis = diagnoses.find(d => d.id === parseInt(apt.diagnosisId));
            
            return (
              <div
                key={apt.id}
                style={{
                  ...styles.appointmentCard,
                  background: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  opacity: past ? 0.6 : 1,
                }}
                onClick={() => setSelectedAppointment(apt)}
              >
                <div style={{
                  ...styles.appointmentDate,
                  background: past ? colors.gray : getTypeColor(apt.type),
                }}>
                  <span style={styles.appointmentDay}>
                    {new Date(apt.date).getDate()}
                  </span>
                  <span style={styles.appointmentMonth}>
                    {getMonthShort(apt.date)}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '1.1rem' }}>{getTypeIcon(apt.type)}</span>
                    <strong style={{ fontSize: '0.95rem' }}>{apt.title}</strong>
                    {past && (
                      <span style={{ ...styles.badge, ...styles.badgeGray }}>Genomfört</span>
                    )}
                    {apt.reminder && !past && (
                      <span style={{ color: colors.primary }}>🔔</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: colors.textMuted, marginTop: '0.25rem' }}>
                    🕐 {apt.time}
                    {apt.location && ` • 📍 ${apt.location}`}
                  </div>
                  {diagnosis && (
                    <span style={{ ...styles.badge, ...styles.badgePurple, marginTop: '0.5rem' }}>
                      🔬 {diagnosis.name}
                    </span>
                  )}
                </div>
                <span style={{ color: colors.primary, fontWeight: 600, fontSize: '0.85rem' }}>
                  Visa →
                </span>
              </div>
            );
          })
      )}

      {/* Appointment Modal */}
      {selectedAppointment && (
        <AppointmentModal
          appointment={selectedAppointment}
          diagnoses={diagnoses}
          medications={medications}
          diaryEntries={diaryEntries.filter(e => e.appointmentId === selectedAppointment.id)}
          allDiaryEntries={diaryEntries}
          setDiaryEntries={setDiaryEntries}
          onClose={() => setSelectedAppointment(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          isMobile={isMobile}
        />
      )}
    </div>
  );
}
