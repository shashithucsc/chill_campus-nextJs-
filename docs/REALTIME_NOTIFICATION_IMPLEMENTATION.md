# Real-time Notification System Implementation

This document outlines the implementation of real-time notifications in the ChillCampus application using Socket.IO.

## Overview

The real-time notification system allows users to receive instant notifications when someone interacts with their content. This includes:

- Comments on posts
- Reactions/likes on posts
- Replies to comments

Notifications are delivered in real-time via Socket.IO and displayed as toast notifications in the UI.

## Technical Implementation

### Backend Components

1. **NotificationService**
   - Located in `src/lib/notificationService.ts`
   - Responsible for creating notifications and emitting socket events
   - Handles different types of notifications (comments, likes, replies, etc.)

2. **Socket.IO Server**
   - Located in `src/lib/socket.ts`
   - Manages socket connections and events
   - Includes helper functions for emitting events to specific users

### Frontend Components

1. **SocketContext**
   - Located in `src/contexts/SocketContext.tsx`
   - Manages socket connection and event handling on the client side
   - Provides a context API for components to access socket functionality
   - Handles displaying notification toasts

2. **NotificationToast**
   - Located in `src/app/components/NotificationToast.tsx`
   - Renders a styled toast notification
   - Shows notification title, message, and action link

## Notification Flow

1. An action occurs (e.g., a user comments on a post)
2. The API endpoint handling the action calls NotificationService to create a notification
3. NotificationService creates a notification in the database and emits a socket event
4. The Socket.IO server sends the event to the specific user's socket
5. The client-side SocketContext receives the event and displays a toast notification
6. The notification is also stored in the database for later viewing

## Socket Events

- `notification:new`: Sent when a new notification is created

## Integration Points

To add notifications to a new action:

1. Use the appropriate NotificationService method in your API endpoint
2. Ensure the recipient user ID is correctly specified
3. The rest happens automatically through the socket events

## Testing

You can test the notification system by:
1. Opening two browser windows with different user accounts
2. Having one user comment on or like a post by the other user
3. The recipient should see a real-time toast notification

## Future Enhancements

- Notification preferences per user
- Batching notifications for high-volume scenarios
- Push notifications for mobile devices
