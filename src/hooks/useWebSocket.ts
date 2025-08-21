import { useEffect, useRef, useCallback, useState } from 'react';
import { useToast } from '../components/ToastContainer';

export interface WebSocketMessage {
  type: 'habit_completed' | 'habit_skipped' | 'tier_unlocked' | 'streak_updated' | 'notification';
  data: any;
  timestamp: Date;
}

export interface WebSocketHook {
  isConnected: boolean;
  sendMessage: (message: any) => void;
  lastMessage: WebSocketMessage | null;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
}

export const useWebSocket = (): WebSocketHook => {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { showToast } = useToast();

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionStatus('connecting');
    
    try {
      // Connect to WebSocket server (same host, different port)
      const wsUrl = `ws://localhost:3055`;
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        setIsConnected(true);
        setConnectionStatus('connected');
        console.log('🔌 WebSocket connected');
        
        // Send initial subscription message
        if (ws.current?.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({
            type: 'subscribe',
            events: ['habit_completed', 'habit_skipped', 'tier_unlocked', 'streak_updated']
          }));
        }
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          
          // Handle different message types
          switch (message.type) {
            case 'habit_completed':
              showToast({
                type: 'success',
                title: 'Habit Completed! 🎉',
                message: `Great job completing "${message.data.habitName}"!`
              });
              break;
              
            case 'habit_skipped':
              showToast({
                type: 'warning',
                title: 'Habit Skipped',
                message: `You skipped "${message.data.habitName}" - don't worry, tomorrow is a new day!`
              });
              break;
              
            case 'tier_unlocked':
              showToast({
                type: 'success',
                title: 'New Tier Unlocked! 🚀',
                message: `Congratulations! You've unlocked ${message.data.tier}!`
              });
              break;
              
            case 'streak_updated':
              showToast({
                type: 'info',
                title: 'Streak Updated',
                message: `Your streak is now ${message.data.streak} days! 🔥`
              });
              break;
              
            case 'notification':
              // Handle general notifications
              break;
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.current.onclose = (event) => {
        setIsConnected(false);
        setConnectionStatus('disconnected');
        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        
        // Attempt to reconnect after a delay
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('🔄 Attempting to reconnect...');
          connect();
        }, 3000);
      };

      ws.current.onerror = (error) => {
        setConnectionStatus('error');
        console.error('🔌 WebSocket error:', error);
        setIsConnected(false);
      };

    } catch (error) {
      setConnectionStatus('error');
      console.error('Failed to create WebSocket connection:', error);
    }
  }, [showToast]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    
    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected, cannot send message');
    }
  }, []);

  // Send heartbeat/ping messages
  useEffect(() => {
    if (!isConnected) return;

    const heartbeatInterval = setInterval(() => {
      sendMessage({ type: 'ping' });
    }, 25000); // Send ping every 25 seconds

    return () => clearInterval(heartbeatInterval);
  }, [isConnected, sendMessage]);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    isConnected,
    sendMessage,
    lastMessage,
    connectionStatus
  };
};
