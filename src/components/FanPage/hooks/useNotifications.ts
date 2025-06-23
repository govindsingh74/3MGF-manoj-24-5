import { useState, useCallback } from 'react';
import { Notification } from '../types';
import { generateNotificationId } from '../utils';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = generateNotificationId();
    const newNotification = { ...notification, id };
    setNotifications(prev => [...prev, newNotification]);
    
    setTimeout(() => {
      removeNotification(id);
    }, notification.type === 'error' ? 15000 : 10000);
  }, [removeNotification]);

  return {
    notifications,
    addNotification,
    removeNotification
  };
};