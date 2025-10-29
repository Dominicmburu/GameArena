import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { REACT_APP_SOCKET_URL } from '../utils/constants';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const initializingRef = useRef(false);
  const maxReconnectAttempts = 5;

  // Use AuthContext for authentication state
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Cleanup function
  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (socketRef.current) {
      console.log('Cleaning up socket connection');
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    setSocket(null);
    setConnected(false);
    initializingRef.current = false;
  }, []);

  // Initialize socket connection
  const initializeSocket = useCallback(() => {
    // Don't initialize if conditions aren't met
    if (!isAuthenticated || authLoading || initializingRef.current) {
      if (!isAuthenticated && !authLoading) {
        console.log('User not authenticated, skipping socket connection');
        setError('Not authenticated');
      }
      return;
    }

    // Prevent duplicate initialization
    if (socketRef.current?.connected) {
      console.log('Socket already connected, skipping initialization');
      return;
    }

    // Clean up any existing socket
    cleanup();

    initializingRef.current = true;
    console.log('Initializing socket connection...');

    // Add delay to ensure auth token is set
    setTimeout(() => {
      const newSocket = io(REACT_APP_SOCKET_URL, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: maxReconnectAttempts,
        timeout: 20000,
        autoConnect: true
      });

      // Connection success
      newSocket.on('connect', () => {
        console.log('✓ Socket connected:', newSocket.id);
        setConnected(true);
        setError(null);
        setReconnectAttempt(0);
        initializingRef.current = false;
      });

      // Server confirmation
      newSocket.on('connected', (data) => {
        console.log('✓ Server confirmed connection:', data);
      });

      // Connection error
      newSocket.on('connect_error', (err) => {
        console.error('Connection problem:', err.message);
        setError(err.message);
        setConnected(false);
        initializingRef.current = false;

        // Handle authentication errors
        if (err.message.includes('AUTH_') || err.message.includes('authentication')) {
          console.error('Authentication error detected:', err.message);
          setReconnectAttempt(maxReconnectAttempts); // Stop reconnection attempts
          
          // Don't redirect, let AuthContext handle it
          setError('Authentication failed');
        } else {
          // Increment reconnect attempts for other errors
          setReconnectAttempt(prev => {
            const next = prev + 1;
            if (next >= maxReconnectAttempts) {
              console.error('Max reconnection attempts reached');
              setError('Failed to connect after multiple attempts');
            }
            return next;
          });
        }
      });

      // Disconnection
      newSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setConnected(false);
        initializingRef.current = false;
        
        if (reason === 'io server disconnect') {
          // Server disconnected us
          console.log('Server disconnected, attempting reconnect...');
          setReconnectAttempt(prev => prev + 1);
          
          // Try to reconnect if we haven't exceeded attempts
          if (reconnectAttempt < maxReconnectAttempts && isAuthenticated) {
            reconnectTimeoutRef.current = setTimeout(() => {
              if (isAuthenticated && !socketRef.current?.connected) {
                newSocket.connect();
              }
            }, 2000);
          }
        } else if (reason === 'io client disconnect') {
          // Client disconnected intentionally
          console.log('Client disconnected intentionally');
        } else {
          // Other reasons (transport close, ping timeout, etc.)
          console.log('Disconnect reason:', reason);
        }
      });

      // General socket errors
      newSocket.on('error', (err) => {
        console.error('Socket error:', err);
        setError(err.message || 'Socket error');
        initializingRef.current = false;
      });

      // Reconnection attempt
      newSocket.on('reconnect_attempt', (attemptNumber) => {
        console.log(`Reconnection attempt ${attemptNumber}...`);
        setReconnectAttempt(attemptNumber);
      });

      // Reconnection success
      newSocket.on('reconnect', (attemptNumber) => {
        console.log(`✓ Reconnected after ${attemptNumber} attempts`);
        setReconnectAttempt(0);
        setError(null);
      });

      // Reconnection failed
      newSocket.on('reconnect_failed', () => {
        console.error('Reconnection failed after all attempts');
        setError('Failed to reconnect');
        initializingRef.current = false;
      });

      setSocket(newSocket);
      socketRef.current = newSocket;
    }, 500); // 500ms delay to ensure token is set
  }, [isAuthenticated, authLoading, reconnectAttempt, cleanup]);

  // Initialize socket when authentication is ready
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      initializeSocket();
    } else if (!isAuthenticated && !authLoading) {
      // User is not authenticated, clean up
      cleanup();
    }

    return () => {
      cleanup();
    };
  }, [isAuthenticated, authLoading, initializeSocket, cleanup]);

  // Emit helper with error handling
  const emit = useCallback((event, data) => {
    if (!socketRef.current) {
      console.warn(`Cannot emit ${event}: Socket not initialized`);
      return false;
    }

    if (!connected) {
      console.warn(`Cannot emit ${event}: Socket not connected`);
      return false;
    }

    try {
      socketRef.current.emit(event, data);
      return true;
    } catch (err) {
      console.error(`Error emitting ${event}:`, err);
      return false;
    }
  }, [connected]);

  // Subscribe helper with automatic cleanup
  const subscribe = useCallback((event, callback) => {
    if (!socketRef.current) {
      console.warn(`Cannot subscribe to ${event}: Socket not initialized`);
      return () => {};
    }

    try {
      socketRef.current.on(event, callback);
      
      // Return unsubscribe function
      return () => {
        if (socketRef.current) {
          socketRef.current.off(event, callback);
        }
      };
    } catch (err) {
      console.error(`Error subscribing to ${event}:`, err);
      return () => {};
    }
  }, []);

  // Manual reconnect function
  const reconnect = useCallback(() => {
    if (!isAuthenticated) {
      console.error('Cannot reconnect: Not authenticated');
      setError('Not authenticated');
      return;
    }

    if (reconnectAttempt >= maxReconnectAttempts) {
      console.error('Cannot reconnect: Max attempts reached');
      setError('Max reconnection attempts reached');
      return;
    }

    console.log('Manual reconnection requested...');
    setReconnectAttempt(0);
    
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current.connect();
    } else {
      initializeSocket();
    }
  }, [isAuthenticated, reconnectAttempt, initializeSocket]);

  // Emit to specific user helper
  const emitToUser = useCallback((userId, event, data) => {
    if (!socketRef.current || !connected) {
      console.warn(`Cannot emit to user: Socket not connected`);
      return false;
    }

    try {
      socketRef.current.emit('message_user', {
        userId,
        event,
        data
      });
      return true;
    } catch (err) {
      console.error(`Error emitting to user:`, err);
      return false;
    }
  }, [connected]);

  const value = {
    socket,
    connected,
    error,
    reconnectAttempt,
    maxReconnectAttempts,
    emit,
    subscribe,
    emitToUser,
    reconnect,
    isAuthenticated: isAuthenticated && !authLoading
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};