import React from 'react';
import { useApp } from '../context/AppContext';
import './Notifications.css';

export function Notifications() {
  const { state, actions } = useApp();
  const { notifications } = state;

  if (notifications.length === 0) return null;

  return (
    <div className="notifications-container">
      {notifications.map(notification => (
        <div 
          key={notification.id}
          className={`notification notification-${notification.type}`}
        >
          <span className="notification-message">{notification.message}</span>
          <button 
            className="notification-close"
            onClick={() => actions.removeNotification(notification.id)}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

export default Notifications;
