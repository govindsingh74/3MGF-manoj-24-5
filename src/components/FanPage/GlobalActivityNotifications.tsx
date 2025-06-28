import React, { useState, useEffect, useRef } from 'react';
import { X, Heart, ThumbsUp, Smile, Frown, MessageCircle, Send } from 'lucide-react';
import { formatWalletAddress } from './utils';

interface ActivityNotification {
  id: string;
  type: 'like' | 'comment' | 'tip';
  userWallet: string;
  postUserWallet: string;
  emojiType?: string;
  timestamp: number;
  postId: string;
}

interface GlobalActivityNotificationsProps {
  connected: boolean;
}

const GlobalActivityNotifications: React.FC<GlobalActivityNotificationsProps> = ({ connected }) => {
  const [notifications, setNotifications] = useState<ActivityNotification[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCheckRef = useRef<number>(Date.now());

  // Mock activity data - in real app, this would come from real-time subscriptions
  const mockActivities = [
    { type: 'like', emoji: 'heart', users: ['4n7S...bg756', '8kL2...mN9x', 'Bv3Q...7pR2'] },
    { type: 'like', emoji: 'thumbs_up', users: ['9mK4...xY8z', '2nF6...qW3e'] },
    { type: 'like', emoji: 'smiley', users: ['7pL9...rT5u', '1aS8...dF4g'] },
    { type: 'comment', users: ['5hJ3...vB6n', '3cX7...zM2k', '6wE9...lP8q'] },
    { type: 'tip', users: ['4tR2...yH5j', '8nQ6...bV9m'] }
  ];

  const getEmojiIcon = (emojiType: string) => {
    switch (emojiType) {
      case 'heart': return Heart;
      case 'thumbs_up': return ThumbsUp;
      case 'smiley': return Smile;
      case 'shit': return Frown;
      default: return Heart;
    }
  };

  const getActivityIcon = (type: string, emojiType?: string) => {
    switch (type) {
      case 'like':
        return getEmojiIcon(emojiType || 'heart');
      case 'comment':
        return MessageCircle;
      case 'tip':
        return Send;
      default:
        return Heart;
    }
  };

  const getActivityColor = (type: string, emojiType?: string) => {
    switch (type) {
      case 'like':
        return emojiType === 'heart' ? 'text-red-400' : 
               emojiType === 'thumbs_up' ? 'text-blue-400' :
               emojiType === 'smiley' ? 'text-yellow-400' : 'text-purple-400';
      case 'comment':
        return 'text-accent-green';
      case 'tip':
        return 'text-accent-purple';
      default:
        return 'text-accent-purple';
    }
  };

  const getActivityText = (notification: ActivityNotification) => {
    const user = formatWalletAddress(notification.userWallet);
    const postUser = formatWalletAddress(notification.postUserWallet);
    
    switch (notification.type) {
      case 'like':
        const emojiName = notification.emojiType?.replace('_', ' ') || 'heart';
        return `${user} ${emojiName} ${postUser}'s post`;
      case 'comment':
        return `${user} commented on ${postUser}'s post`;
      case 'tip':
        return `${user} tipped ${postUser}`;
      default:
        return `${user} interacted with ${postUser}'s post`;
    }
  };

  const generateRandomActivity = (): ActivityNotification => {
    const activity = mockActivities[Math.floor(Math.random() * mockActivities.length)];
    const userWallet = activity.users[Math.floor(Math.random() * activity.users.length)];
    const postUserWallet = activity.users[Math.floor(Math.random() * activity.users.length)];
    
    return {
      id: `activity-${Date.now()}-${Math.random()}`,
      type: activity.type as 'like' | 'comment' | 'tip',
      userWallet,
      postUserWallet,
      emojiType: activity.type === 'like' ? (activity as any).emoji : undefined,
      timestamp: Date.now(),
      postId: `post-${Math.floor(Math.random() * 1000)}`
    };
  };

  const addNotification = (notification: ActivityNotification) => {
    setNotifications(prev => {
      const newNotifications = [notification, ...prev];
      
      // If more than 10 pending notifications, skip all and pick latest
      if (newNotifications.length > 10) {
        setPendingCount(prev => prev + 10);
        return [notification]; // Keep only the latest
      }
      
      return newNotifications.slice(0, 5); // Keep max 5 visible
    });

    // Auto-remove after 8 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 8000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearPendingCount = () => {
    setPendingCount(0);
  };

  // Simulate real-time activity
  useEffect(() => {
    if (!connected) return;

    const startSimulation = () => {
      intervalRef.current = setInterval(() => {
        // Random chance of activity (30% every 3 seconds)
        if (Math.random() < 0.3) {
          const activity = generateRandomActivity();
          addNotification(activity);
        }
      }, 3000);
    };

    // Start after a short delay
    const timeout = setTimeout(startSimulation, 2000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      clearTimeout(timeout);
    };
  }, [connected]);

  if (!connected || !isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm">
      {/* Pending notifications counter */}
      {pendingCount > 0 && (
        <div 
          className="mb-2 bg-accent-purple/90 text-white px-3 py-2 rounded-lg text-sm cursor-pointer hover:bg-accent-purple transition-colors"
          onClick={clearPendingCount}
        >
          +{pendingCount} more activities (click to dismiss)
        </div>
      )}

      {/* Active notifications */}
      <div className="space-y-2">
        {notifications.map((notification, index) => {
          const Icon = getActivityIcon(notification.type, notification.emojiType);
          const colorClass = getActivityColor(notification.type, notification.emojiType);
          
          return (
            <div
              key={notification.id}
              className={`bg-primary-light/95 dark:bg-primary/95 backdrop-blur-sm border border-white/20 rounded-lg p-3 shadow-lg transform transition-all duration-300 hover:scale-105 ${
                index === 0 ? 'animate-bounce' : ''
              }`}
              style={{
                animation: index === 0 ? 'shake 0.5s ease-in-out' : undefined
              }}
            >
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 ${colorClass}`}>
                  <Icon size={16} fill={notification.type === 'like' ? 'currentColor' : 'none'} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-light dark:text-white leading-relaxed">
                    {getActivityText(notification)}
                  </p>
                  <p className="text-xs text-text-secondary-light dark:text-text-secondary mt-1">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="flex-shrink-0 text-text-secondary-light dark:text-text-secondary hover:text-text-light dark:hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Toggle visibility button */}
      {notifications.length === 0 && (
        <button
          onClick={() => setIsVisible(false)}
          className="mt-2 text-xs text-text-secondary-light dark:text-text-secondary hover:text-text-light dark:hover:text-white transition-colors"
        >
          Hide activity feed
        </button>
      )}
    </div>
  );
};

export default GlobalActivityNotifications;
