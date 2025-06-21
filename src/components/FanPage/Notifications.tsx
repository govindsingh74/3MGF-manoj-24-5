import React from 'react';
import { X, AlertCircle, CheckCircle, Clock } from 'lucide-react';

type Notification = {
  id: string | number;
  type: 'success' | 'error' | 'info';
  message: string;
  txHash?: string;
};

interface NotificationsProps {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

const Notifications: React.FC<NotificationsProps> = ({ notifications, setNotifications }) => {
  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg shadow-lg border backdrop-blur-sm transition-all duration-300 ${
            notification.type === 'success'
              ? 'bg-green-500/10 border-green-500/20 text-green-400'
              : notification.type === 'error'
              ? 'bg-red-500/10 border-red-500/20 text-red-400'
              : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {notification.type === 'success' && <CheckCircle size={18} />}
              {notification.type === 'error' && <AlertCircle size={18} />}
              {notification.type === 'info' && <Clock size={18} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{notification.message}</p>
              {notification.txHash && (
                <a
                  href={`https://explorer.solana.com/tx/${notification.txHash}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs underline hover:no-underline mt-1 block"
                >
                  View on Explorer
                </a>
              )}
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 text-current hover:opacity-70"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Notifications;