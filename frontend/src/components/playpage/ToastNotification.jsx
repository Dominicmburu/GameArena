import React from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastNotification = ({ show, message, variant, onClose }) => {
  const getIcon = () => {
    switch(variant) {
      case 'success':
        return <CheckCircle size={16} className="me-2" />;
      case 'error':
        return <AlertCircle size={16} className="me-2" />;
      case 'warning':
        return <AlertTriangle size={16} className="me-2" />;
      default:
        return <Info size={16} className="me-2" />;
    }
  };

  const getTitle = () => {
    switch(variant) {
      case 'success':
        return 'Success';
      case 'error':
        return 'Error';
      case 'warning':
        return 'Warning';
      default:
        return 'Info';
    }
  };

  return (
    <ToastContainer position="top-end" className="p-3">
      <Toast
        show={show}
        onClose={onClose}
        delay={4000}
        autohide
        className="cyber-toast"
      >
        <Toast.Header>
          {getIcon()}
          <strong className="me-auto">
            {getTitle()}
          </strong>
        </Toast.Header>
        <Toast.Body className="text-white">
          {message}
        </Toast.Body>
      </Toast>
    </ToastContainer>
  );
};

export default ToastNotification;