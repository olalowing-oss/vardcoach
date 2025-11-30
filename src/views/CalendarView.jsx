import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, Button, Modal, Input, Textarea, Select, Checkbox } from '../components/common';
import { 
  MONTHS_SV, WEEKDAYS_SV, APPOINTMENT_TYPES, APPOINTMENT_COLORS,
  getDaysInMonth, getFirstDayOfMonth, isToday, isSameDay, 
  formatDate, generateId 
} from '../utils/helpers';
import './CalendarView.css';

export function CalendarView() {
  const { state, actions } = useApp();
  const { appointments, diagnoses, medications } = state;
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedApt, setSelectedApt] = useState(null);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '09:00',
    location: '',
    doctor: '',
    type: 'checkup',
    diagnosisId: '',
    purpose: '',
    prepNotes: '',
    reminder: true,
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getAppointmentsForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return appointments.filter(a => a.date === dateStr);
  };

  const openNewAppointment = (day = null) => {
    const date = day 
      ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      : new Date().toISOString().split('T')[0];
    
    setFormData({
      title: '',
      date,
      time: '09:00',
      location: '',
      doctor: '',
      type: 'checkup',
      diagnosisId: '',
      purpose: '',
      prepNotes: '',
      reminder: true,
    });
    setSelectedApt(null);
    setShowModal(true);
  };

  const openEditAppointment = (apt) => {
    setFormData({
      title: apt.title,
      date: apt.date,
      time: apt.time,
      location: apt.location || '',
      doctor: apt.doctor || '',
      type: apt.type || 'checkup',
      diagnosisId: apt.diagnosisId || '',
      purpose: apt.purpose || '',
      prepNotes: apt.prepNotes || '',
      reminder: apt.reminder ?? true,
    });
    setSelectedApt(apt);
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.date) return;

    const activeMeds = medications.filter(m => m.active);
    
    const appointmentData = {
      ...formData,
      medicationsAtTime: activeMeds.map(m => ({
        name: m.name,
        dosage: m.dosage,
        times: m.times,
      })),
    };

    if (selectedApt) {
      actions.updateAppointment({ ...selectedApt, ...appointmentData });
    } else {
      actions.addAppointment({ 
        id: generateId(), 
        ...appointmentData,
        postNotes: '',
        questions: [],
      });
    }

    setShowModal(false);
  };

  const handleDelete = () => {
    if (selectedApt && window.confirm('Vill du ta bort detta besök?')) {
      actions.deleteAppointment(selectedApt.id);
      setShowModal(false);
    }
  };

  // Generate calendar days
  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Upcoming appointments for list view
  const upcomingApts = appointments
    .filter(a => new Date(a.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="calendar-view">
      <div className="view-header">
        <h1 className="page-title">Kalender</h1>
        <div className="view-actions">
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
              onClick={() => setViewMode('calendar')}
            >
              📅
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              📋
            </button>
          </div>
          <Button onClick={() => openNewAppointment()}>
            + Nytt besök
          </Button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <Card className="calendar-card">
          {/* Calendar Header */}
          <div className="calendar-header">
            <button className="cal-nav" onClick={prevMonth}>‹</button>
            <span className="cal-title">{MONTHS_SV[month]} {year}</span>
            <button className="cal-nav" onClick={nextMonth}>›</button>
          </div>

          {/* Weekday labels */}
          <div className="calendar-grid">
            {WEEKDAYS_SV.map(day => (
              <div key={day} className="weekday">{day}</div>
            ))}
            
            {/* Calendar days */}
            {calendarDays.map((day, idx) => {
              if (!day) {
                return <div key={`empty-${idx}`} className="day empty" />;
              }
              
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayApts = getAppointmentsForDay(day);
              const isCurrentDay = isToday(dateStr);
              
              return (
                <div 
                  key={day}
                  className={`day ${isCurrentDay ? 'today' : ''} ${dayApts.length > 0 ? 'has-events' : ''}`}
                  onClick={() => openNewAppointment(day)}
                >
                  <span className="day-number">{day}</span>
                  {dayApts.slice(0, 2).map(apt => {
                    const color = APPOINTMENT_COLORS[apt.type] || APPOINTMENT_COLORS.other;
                    return (
                      <div 
                        key={apt.id}
                        className="day-event"
                        style={{ background: color.bg, color: color.color }}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditAppointment(apt);
                        }}
                      >
                        {apt.title.substring(0, 8)}
                      </div>
                    );
                  })}
                  {dayApts.length > 2 && (
                    <div className="day-more">+{dayApts.length - 2}</div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        <div className="appointments-list">
          {upcomingApts.length === 0 ? (
            <Card className="empty-state">
              <span className="empty-icon">📅</span>
              <p>Inga kommande besök</p>
              <Button onClick={() => openNewAppointment()}>Boka ditt första besök</Button>
            </Card>
          ) : (
            upcomingApts.map(apt => {
              const color = APPOINTMENT_COLORS[apt.type] || APPOINTMENT_COLORS.other;
              const date = new Date(apt.date);
              
              return (
                <Card 
                  key={apt.id} 
                  className="apt-card"
                  onClick={() => openEditAppointment(apt)}
                  hoverable
                >
                  <div className="apt-date-badge" style={{ background: color.bg, color: color.color }}>
                    <span className="apt-day">{date.getDate()}</span>
                    <span className="apt-month">{MONTHS_SV[date.getMonth()].substring(0, 3)}</span>
                  </div>
                  <div className="apt-info">
                    <h3 className="apt-title">{apt.title}</h3>
                    <div className="apt-meta">
                      <span>🕐 {apt.time}</span>
                      <span>📍 {apt.location}</span>
                    </div>
                    {apt.reminder && <span className="apt-reminder">🔔</span>}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* New/Edit Appointment Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedApt ? 'Redigera besök' : 'Nytt besök'}
        icon="📅"
      >
        <div className="form-grid">
          <Input
            label="Titel"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="T.ex. Läkarbesök"
            required
          />
          
          <Select
            label="Typ av besök"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            options={APPOINTMENT_TYPES}
          />
          
          <Input
            label="Datum"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
          
          <Input
            label="Tid"
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          />
          
          <Input
            label="Plats"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="T.ex. Vårdcentralen"
          />
          
          <Input
            label="Läkare"
            value={formData.doctor}
            onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
            placeholder="T.ex. Dr. Andersson"
          />
          
          {diagnoses.length > 0 && (
            <Select
              label="Kopplad diagnos"
              value={formData.diagnosisId}
              onChange={(e) => setFormData({ ...formData, diagnosisId: e.target.value })}
              options={diagnoses.map(d => ({ value: d.id, label: d.name }))}
              placeholder="Välj diagnos (valfritt)"
            />
          )}
        </div>

        <Textarea
          label="Syfte med besöket"
          value={formData.purpose}
          onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
          placeholder="Vad vill du ta upp?"
          rows={3}
        />

        <Textarea
          label="Förberedelser"
          value={formData.prepNotes}
          onChange={(e) => setFormData({ ...formData, prepNotes: e.target.value })}
          placeholder="Saker att tänka på innan besöket"
          rows={2}
        />

        <Checkbox
          label="Påminn mig dagen innan"
          checked={formData.reminder}
          onChange={(e) => setFormData({ ...formData, reminder: e.target.checked })}
        />

        <div className="modal-actions">
          {selectedApt && (
            <Button variant="danger" onClick={handleDelete}>
              Ta bort
            </Button>
          )}
          <div className="modal-actions-right">
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              Avbryt
            </Button>
            <Button onClick={handleSubmit}>
              {selectedApt ? 'Spara' : 'Lägg till'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default CalendarView;
