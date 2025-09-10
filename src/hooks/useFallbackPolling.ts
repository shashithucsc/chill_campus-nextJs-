import { useEffect, useRef, useCallback } from 'react';
import { useSocket } from '@/contexts/SocketContext';

interface PollOptions {
  interval?: number;
  enabled?: boolean;
  onError?: (error: Error) => void;
}

/**
 * Custom hook for polling APIs when Socket.IO is not available
 * This provides a fallback mechanism for real-time functionality
 */
export function useFallbackPolling(
  endpoint: string,
  onData: (data: any) => void,
  options: PollOptions = {}
) {
  const { isUsingFallback, isConnected } = useSocket();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef(false);
  const lastDataRef = useRef<string>('');

  const {
    interval = 3000, // Poll every 3 seconds by default
    enabled = true,
    onError
  } = options;

  const poll = useCallback(async () => {
    if (!enabled || isPollingRef.current) return;

    isPollingRef.current = true;
    
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const dataString = JSON.stringify(data);
      
      // Only call onData if the data has actually changed
      if (dataString !== lastDataRef.current) {
        lastDataRef.current = dataString;
        onData(data);
      }
    } catch (error) {
      console.error('Polling error:', error);
      if (onError) {
        onError(error as Error);
      }
    } finally {
      isPollingRef.current = false;
    }
  }, [endpoint, onData, enabled, onError]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Initial poll
    poll();
    
    // Set up interval
    intervalRef.current = setInterval(poll, interval);
  }, [poll, interval]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    isPollingRef.current = false;
  }, []);

  useEffect(() => {
    // Only start polling if we're using fallback mode and Socket.IO is not connected
    if (isUsingFallback && !isConnected && enabled) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [isUsingFallback, isConnected, enabled, startPolling, stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    isPolling: isUsingFallback && !isConnected && enabled,
    startPolling,
    stopPolling
  };
}

/**
 * Hook specifically for polling new messages in a community
 */
export function useCommunityMessagePolling(
  communityId: string,
  onNewMessages: (messages: any[]) => void,
  enabled: boolean = true
) {
  return useFallbackPolling(
    `/api/socket/fallback?action=community-messages&communityId=${communityId}`,
    (data) => {
      if (data.success && data.messages && data.messages.length > 0) {
        onNewMessages(data.messages);
      }
    },
    { enabled, interval: 3000 }
  );
}

/**
 * Hook specifically for polling new direct messages in a conversation
 */
export function useConversationMessagePolling(
  conversationId: string,
  onNewMessages: (messages: any[]) => void,
  enabled: boolean = true
) {
  return useFallbackPolling(
    `/api/socket/fallback?action=conversation-messages&conversationId=${conversationId}`,
    (data) => {
      if (data.success && data.messages && data.messages.length > 0) {
        onNewMessages(data.messages);
      }
    },
    { enabled, interval: 2000 } // Poll more frequently for direct messages
  );
}

/**
 * Hook for polling notifications
 */
export function useNotificationPolling(
  onNewNotifications: (notifications: any[]) => void,
  enabled: boolean = true
) {
  return useFallbackPolling(
    '/api/socket/fallback?action=notifications',
    (data) => {
      if (data.success && data.notifications && data.notifications.length > 0) {
        onNewNotifications(data.notifications);
      }
    },
    { enabled, interval: 5000 }
  );
}

/**
 * Hook for polling online users (simplified version)
 */
export function useOnlineUsersPolling(
  onUsersUpdate: (users: string[]) => void,
  enabled: boolean = true
) {
  return useFallbackPolling(
    '/api/socket/fallback?action=online-users',
    (data) => {
      if (data.success && data.users) {
        onUsersUpdate(data.users);
      }
    },
    { enabled, interval: 10000 } // Poll less frequently for online users
  );
}
