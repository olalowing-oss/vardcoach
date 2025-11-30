import { useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';

export function useReminders() {
  const { state, actions } = useApp();
  const { appointments } = state;

  const checkReminders = useCallback(() => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const today = now.toISOString().split('T')[0];

    appointments
      .filter(a => a.reminder)
      .forEach(apt => {
        const aptDate = new Date(apt.date);
        const dayBefore = new Date(aptDate);
        dayBefore.setDate(dayBefore.getDate() - 1);
        
        if (dayBefore.toISOString().split('T')[0] === today && currentTime === '18:00') {
          const message = `📅 Imorgon: ${apt.title} kl ${apt.time}`;
          actions.addNotification(message, 'appointment');
          
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Vårdcoachen - Besökspåminnelse', {
              body: `Imorgon: ${apt.title} kl ${apt.time} på ${apt.location}`,
              icon: '📅',
              tag: `apt-${apt.id}`,
              requireInteraction: true,
            });
          }
        }
      });
  }, [appointments, actions]);

  useEffect(() => {
    const interval = setInterval(checkReminders, 60000);
    checkReminders();
    return () => clearInterval(interval);
  }, [checkReminders]);

  // Request notification permission
  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  // Get notification permission status
  const getPermissionStatus = () => {
    if ('Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  };

  // Toggle appointment reminder
  const toggleAppointmentReminder = (appointmentId) => {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (appointment) {
      actions.updateAppointment({
        ...appointment,
        reminder: !appointment.reminder
      });
    }
  };

  // Get active reminders count
  const getActiveRemindersCount = () => {
    return appointments.filter(a => a.reminder && new Date(a.date) >= new Date()).length;
  };

  return {
    checkReminders,
    requestPermission,
    getPermissionStatus,
    toggleAppointmentReminder,
    getActiveRemindersCount,
  };
}

export default useReminders;
