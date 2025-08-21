import React from 'react';
import { Wifi, WifiOff, AlertCircle, Loader2 } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebSocket';

const WebSocketStatus: React.FC = () => {
  const { connectionStatus, isConnected } = useWebSocket();

  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          icon: <Wifi className="w-4 h-4" />,
          color: 'text-success-600',
          bgColor: 'bg-success-50',
          borderColor: 'border-success-200',
          text: 'Real-time updates active'
        };
      case 'connecting':
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin" />,
          color: 'text-warning-600',
          bgColor: 'bg-warning-50',
          borderColor: 'border-warning-200',
          text: 'Connecting...'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          color: 'text-danger-600',
          bgColor: 'bg-danger-50',
          borderColor: 'border-danger-200',
          text: 'Connection error'
        };
      case 'disconnected':
      default:
        return {
          icon: <WifiOff className="w-4 h-4" />,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          text: 'Disconnected'
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className={`
      inline-flex items-center space-x-2 px-3 py-2 rounded-lg border
      ${statusConfig.bgColor} ${statusConfig.borderColor}
      transition-all duration-200
    `}>
      <div className={statusConfig.color}>
        {statusConfig.icon}
      </div>
      <span className={`text-sm font-medium ${statusConfig.color}`}>
        {statusConfig.text}
      </span>
    </div>
  );
};

export default WebSocketStatus;
