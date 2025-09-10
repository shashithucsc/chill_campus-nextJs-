import { useSocket } from '@/contexts/SocketContext';

// Simple className merger function
function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

interface FallbackStatusProps {
  className?: string;
  showDetails?: boolean;
}

export default function FallbackStatus({ className, showDetails = false }: FallbackStatusProps) {
  const { isConnected, isUsingFallback } = useSocket();

  if (!isUsingFallback && isConnected) {
    return null; // Don't show anything when everything is working normally
  }

  const getStatusInfo = () => {
    if (isUsingFallback) {
      return {
        status: 'fallback',
        color: 'bg-yellow-500',
        textColor: 'text-yellow-800',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        title: 'Fallback Mode',
        description: 'Using polling for updates. Some real-time features may be limited.'
      };
    }
    
    if (!isConnected) {
      return {
        status: 'disconnected',
        color: 'bg-red-500',
        textColor: 'text-red-800',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        title: 'Disconnected',
        description: 'Attempting to reconnect...'
      };
    }

    return {
      status: 'connected',
      color: 'bg-green-500',
      textColor: 'text-green-800',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      title: 'Connected',
      description: 'Real-time features active'
    };
  };

  const statusInfo = getStatusInfo();

  if (showDetails) {
    return (
      <div className={cn(
        "flex items-center gap-2 p-3 rounded-lg border",
        statusInfo.bgColor,
        statusInfo.borderColor,
        statusInfo.textColor,
        className
      )}>
        <div className={cn("w-2 h-2 rounded-full", statusInfo.color)} />
        <div className="flex-1">
          <p className="font-medium text-sm">{statusInfo.title}</p>
          <p className="text-xs opacity-75">{statusInfo.description}</p>
        </div>
        {isUsingFallback && (
          <div className="text-xs opacity-60">
            Polling Mode
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-2 px-2 py-1 rounded-md text-xs",
      statusInfo.bgColor,
      statusInfo.textColor,
      className
    )}>
      <div className={cn("w-1.5 h-1.5 rounded-full", statusInfo.color)} />
      <span>{statusInfo.title}</span>
    </div>
  );
}

// Hook to get fallback status information
export function useFallbackStatus() {
  const { isConnected, isUsingFallback } = useSocket();

  return {
    isConnected,
    isUsingFallback,
    hasRealTimeFeatures: isConnected && !isUsingFallback,
    connectionStatus: isUsingFallback 
      ? 'fallback' 
      : isConnected 
        ? 'connected' 
        : 'disconnected'
  };
}
