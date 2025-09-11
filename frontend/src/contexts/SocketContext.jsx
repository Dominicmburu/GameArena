import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { REACT_APP_SOCKET_URL } from '../utils/constants';

// Helper to read a cookie value (handles URI-encoded values)
const getCookie = (name) => {
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split('=')[1]) : undefined;
};

export const useSocket = (serverUrl = `${REACT_APP_SOCKET_URL}`) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // Check if we have session cookies for authentication
    const sessionCookie = getCookie('connect.sid') || getCookie('sessionId') || getCookie('session');
    const csrfToken = getCookie('XSRF-TOKEN') || getCookie('csrfToken') || getCookie('_csrf');
    
    if (!sessionCookie) {
      setError('No authentication session available');
      return;
    }

    // Create socket connection with cookie-based auth
    const newSocket = io(serverUrl, {
      withCredentials: true, // Important: send cookies with the request
      auth: {
        // Send CSRF token if available for additional security
        ...(csrfToken && { csrfToken })
      },
      transports: ['websocket', 'polling'],
      // Additional options for cookie-based auth
      extraHeaders: {
        // Include CSRF headers if available
        ...(csrfToken && {
          'X-XSRF-TOKEN': csrfToken,
          'X-CSRF-Token': csrfToken
        })
      }
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setConnected(true);
      setError(null);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setError(err.message);
      setConnected(false);
      
      // Handle authentication errors
      if (err.message.includes('Authentication') || err.message.includes('Unauthorized')) {
        // Redirect to auth page if session expired
        if (window.location.pathname !== '/auth') {
          window.location.href = '/auth';
        }
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setConnected(false);
      
      // Handle server-side disconnections due to auth issues
      if (reason === 'io server disconnect' || reason === 'transport close') {
        console.warn('Socket disconnected by server, possibly due to authentication');
      }
    });

    // Error handling
    newSocket.on('error', (err) => {
      console.error('Socket error:', err);
      setError(err.message || 'Socket error occurred');
    });

    // Handle authentication errors from server
    newSocket.on('auth_error', (err) => {
      console.error('Socket authentication error:', err);
      setError('Authentication failed');
      setConnected(false);
      
      // Redirect to auth page
      if (window.location.pathname !== '/auth') {
        window.location.href = '/auth';
      }
    });

    setSocket(newSocket);
    socketRef.current = newSocket;

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [serverUrl]);

  // Helper method to emit events with automatic CSRF token inclusion
  const emit = (event, data) => {
    if (socket && connected) {
      const csrfToken = getCookie('XSRF-TOKEN') || getCookie('csrfToken') || getCookie('_csrf');
      
      // Include CSRF token in the data if available
      const eventData = csrfToken ? { ...data, _csrfToken: csrfToken } : data;
      
      socket.emit(event, eventData);
    } else {
      console.warn('Socket not connected, cannot emit:', event);
    }
  };

  // Helper method to subscribe to events
  const subscribe = (event, callback) => {
    if (socket) {
      socket.on(event, callback);
      return () => socket.off(event, callback);
    }
    return () => {};
  };

  // Helper method to check if user is authenticated (has session cookie)
  const isAuthenticated = () => {
    const sessionCookie = getCookie('connect.sid') || getCookie('sessionId') || getCookie('session');
    return !!sessionCookie;
  };

  // Helper method to manually reconnect (useful after login)
  const reconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current.connect();
    }
  };

  return {
    socket,
    connected,
    error,
    emit,
    subscribe,
    isAuthenticated,
    reconnect
  };
};