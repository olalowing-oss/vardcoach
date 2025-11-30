import React from 'react';
import { useApp } from '../context/AppContext';
import { useReminders } from '../hooks/useReminders';
import { Card, Button, Toggle } from '../components/common';
import { formatDate } from '../utils/helpers';
import './RemindersView.css';

export function RemindersView() {
  const { state } = useApp();
  const { appointments } = state;
  const { 
    toggleAppointmentReminder,
    requestPermission,
    getPermissionStatus 
  } = useReminders();

  const permissionStatus = getPermissionStatus();
  
  const upcomingAppointments = appointments
    .filter(a => new Date(a.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const handleRequestPermission = async () => {
    await requestPermission();
    // Force re-render
    window.location.reload();
  };

  return (
    <div className="reminders-view">
      <h1 className="page-title">Påminnelser</h1>

      {/* Permission banner */}
      {permissionStatus === 'default' && (
        <Card className="permission-banner">
          <div className="permission-content">
            <span className="permission-icon">🔔</span>
            <div className="permission-text">
              <h3>Aktivera notifikationer</h3>
              <p>För att få påminnelser behöver du tillåta notifikationer i webbläsaren.</p>
            </div>
          </div>
          <Button onClick={handleRequestPermission}>
            Tillåt notifikationer
          </Button>
        </Card>
      )}

      {permissionStatus === 'denied' && (
        <Card className="permission-denied">
          <span className="permission-icon">⚠️</span>
          <div>
            <h3>Notifikationer blockerade</h3>
            <p>Du har blockerat notifikationer. Ändra detta i webbläsarens inställningar för att få påminnelser.</p>
          </div>
        </Card>
      )}

      {permissionStatus === 'granted' && (
        <Card className="permission-granted">
          <span className="permission-icon">✅</span>
          <span>Notifikationer är aktiverade</span>
        </Card>
      )}

      {/* Appointment reminders */}
      <section className="reminder-section">
        <h2 className="section-title">📅 Besökspåminnelser</h2>
        <p className="section-description">
          Du får en påminnelse kl 18:00 dagen innan besöket.
        </p>
        
        {upcomingAppointments.length === 0 ? (
          <Card className="empty-section">
            <p>Inga kommande besök</p>
          </Card>
        ) : (
          <div className="reminder-list">
            {upcomingAppointments.map(apt => (
              <Card key={apt.id} className="reminder-card">
                <div className="reminder-info">
                  <h3 className="reminder-name">{apt.title}</h3>
                  <p className="reminder-detail">
                    {formatDate(apt.date)} kl {apt.time}
                  </p>
                  <p className="reminder-location">📍 {apt.location}</p>
                </div>
                <Toggle
                  checked={apt.reminder}
                  onChange={() => toggleAppointmentReminder(apt.id)}
                />
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Info box */}
      <Card className="info-box">
        <h3>ℹ️ Så fungerar påminnelser</h3>
        <ul>
          <li><strong>Besök:</strong> Du får en notis kl 18:00 dagen innan besöket.</li>
          <li><strong>Viktigt:</strong> Webbläsaren måste vara öppen (kan vara i bakgrunden) för att påminnelser ska fungera.</li>
        </ul>
      </Card>
    </div>
  );
}

export default RemindersView;
