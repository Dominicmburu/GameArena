import React from 'react';
import { Alert } from 'react-bootstrap';

const NotificationsContainer = ({ notifications, removeNotification }) => {
  return (
    <div className="notifications-container">
      {notifications.map(notification => (
        <Alert
          key={notification.id}
          variant={notification.type === 'success' ? 'success' :
            notification.type === 'error' ? 'danger' :
              notification.type === 'warning' ? 'warning' : 'info'}
          className="notification-alert"
          dismissible
          onClose={() => removeNotification(notification.id)}
        >
          <div className="d-flex justify-content-between align-items-center">
            <span>{notification.message}</span>
            <small>{notification.timestamp.toLocaleTimeString()}</small>
          </div>
        </Alert>
      ))}
    </div>
  );
};

export default NotificationsContainer;