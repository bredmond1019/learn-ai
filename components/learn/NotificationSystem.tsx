'use client';

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  AlertTriangle,
  Trophy,
  Star,
  Flame,
  Target,
  Clock,
  Gift,
  Zap,
  BookOpen,
  TrendingUp,
  Award,
  MessageSquare
} from 'lucide-react';

/**
 * Notification Types
 */
export interface Notification {
  id: string;
  type: 'achievement' | 'progress' | 'reminder' | 'system' | 'social' | 'celebration';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  icon?: React.ComponentType<{ className?: string }>;
  timestamp: string;
  read: boolean;
  persistent?: boolean; // Don't auto-dismiss
  actionButton?: {
    label: string;
    action: () => void;
  };
  metadata?: Record<string, any>;
  expiresAt?: string;
  source?: string; // Which part of the system triggered this
}

export interface NotificationConfig {
  enabled: boolean;
  types: {
    achievement: boolean;
    progress: boolean;
    reminder: boolean;
    system: boolean;
    social: boolean;
    celebration: boolean;
  };
  sound: boolean;
  desktop: boolean;
  email: boolean;
  frequency: 'immediate' | 'batched' | 'daily';
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM
    end: string; // HH:MM
  };
}

/**
 * Default notification configuration
 */
const DEFAULT_CONFIG: NotificationConfig = {
  enabled: true,
  types: {
    achievement: true,
    progress: true,
    reminder: true,
    system: true,
    social: true,
    celebration: true
  },
  sound: true,
  desktop: false,
  email: false,
  frequency: 'immediate',
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00'
  }
};

/**
 * Notification Context
 */
interface NotificationContextType {
  notifications: Notification[];
  config: NotificationConfig;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  updateConfig: (config: Partial<NotificationConfig>) => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

/**
 * Notification Provider Component
 */
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [config, setConfig] = useState<NotificationConfig>(DEFAULT_CONFIG);

  // Load saved notifications and config from localStorage
  useEffect(() => {
    try {
      const savedNotifications = localStorage.getItem('learning-notifications');
      const savedConfig = localStorage.getItem('notification-config');
      
      if (savedNotifications) {
        const parsed = JSON.parse(savedNotifications);
        // Filter out expired notifications
        const validNotifications = parsed.filter((n: Notification) => 
          !n.expiresAt || new Date(n.expiresAt) > new Date()
        );
        setNotifications(validNotifications);
      }
      
      if (savedConfig) {
        setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(savedConfig) });
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }, []);

  // Save notifications to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('learning-notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }, [notifications]);

  // Save config to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('notification-config', JSON.stringify(config));
    } catch (error) {
      console.error('Error saving notification config:', error);
    }
  }, [config]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    // Check if notifications are enabled for this type
    if (!config.enabled || !config.types[notification.type]) {
      return;
    }

    // Check quiet hours
    if (config.quietHours.enabled) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const { start, end } = config.quietHours;
      
      if (start < end) {
        // Normal case: 22:00 to 08:00
        if (currentTime >= start || currentTime <= end) {
          return;
        }
      } else {
        // Across midnight: 08:00 to 22:00
        if (currentTime >= start && currentTime <= end) {
          return;
        }
      }
    }

    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Play sound if enabled
    if (config.sound && notification.priority !== 'low') {
      playNotificationSound(notification.type);
    }

    // Show desktop notification if enabled
    if (config.desktop && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.type
      });
    }

    // Auto-dismiss non-persistent notifications
    if (!notification.persistent && notification.priority !== 'urgent') {
      const dismissTime = notification.priority === 'high' ? 10000 : 
                         notification.priority === 'medium' ? 7000 : 5000;
      
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, dismissTime);
    }
  }, [config]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const updateConfig = useCallback((newConfig: Partial<NotificationConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const contextValue: NotificationContextType = {
    notifications,
    config,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    updateConfig,
    unreadCount
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * Hook to use notifications
 */
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

/**
 * Notification Bell Icon Component
 */
export function NotificationBell() {
  const { unreadCount, notifications } = useNotifications();
  const [showPanel, setShowPanel] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowPanel(!showPanel)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {showPanel && (
        <div className="absolute top-full right-0 mt-2 w-80 z-50">
          <NotificationPanel onClose={() => setShowPanel(false)} />
        </div>
      )}
    </div>
  );
}

/**
 * Notification Panel Component
 */
interface NotificationPanelProps {
  onClose: () => void;
}

function NotificationPanel({ onClose }: NotificationPanelProps) {
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    clearNotifications,
    unreadCount 
  } = useNotifications();

  const recentNotifications = notifications.slice(0, 10);

  return (
    <Card className="p-4 shadow-lg border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Notifications</h3>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button size="sm" variant="outline" onClick={markAllAsRead}>
              Mark all read
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {recentNotifications.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No notifications</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {recentNotifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRead={markAsRead}
              onRemove={removeNotification}
            />
          ))}
        </div>
      )}

      {notifications.length > 10 && (
        <div className="mt-4 pt-4 border-t text-center">
          <Button variant="outline" size="sm" onClick={clearNotifications}>
            Clear all notifications
          </Button>
        </div>
      )}
    </Card>
  );
}

/**
 * Individual Notification Item Component
 */
interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
  onRemove: (id: string) => void;
}

function NotificationItem({ notification, onRead, onRemove }: NotificationItemProps) {
  const IconComponent = notification.icon || getDefaultIcon(notification.type);
  
  const handleClick = () => {
    if (!notification.read) {
      onRead(notification.id);
    }
    
    if (notification.actionButton) {
      notification.actionButton.action();
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50 dark:bg-red-900/10';
      case 'high': return 'border-orange-500 bg-orange-50 dark:bg-orange-900/10';
      case 'medium': return 'border-blue-500 bg-blue-50 dark:bg-blue-900/10';
      case 'low': return 'border-gray-300 bg-gray-50 dark:bg-gray-800';
      default: return 'border-gray-300 bg-gray-50 dark:bg-gray-800';
    }
  };

  return (
    <div
      className={`p-3 border-l-4 rounded-r cursor-pointer transition-all ${
        getPriorityColor(notification.priority)
      } ${!notification.read ? 'ring-2 ring-blue-200 dark:ring-blue-800' : ''}`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <IconComponent className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={`text-sm font-medium truncate ${
              !notification.read ? 'text-black dark:text-white' : 'text-gray-600 dark:text-gray-400'
            }`}>
              {notification.title}
            </h4>
            {!notification.read && (
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
            )}
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-500">
              {formatTimestamp(notification.timestamp)}
            </span>
            
            <div className="flex items-center gap-2">
              {notification.actionButton && (
                <Button size="sm" variant="outline" className="text-xs">
                  {notification.actionButton.label}
                </Button>
              )}
              
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(notification.id);
                }}
                className="w-6 h-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Toast Notification Component
 */
export function ToastNotification({ notification }: { notification: Notification }) {
  const { removeNotification } = useNotifications();
  const IconComponent = notification.icon || getDefaultIcon(notification.type);

  useEffect(() => {
    if (!notification.persistent) {
      const timer = setTimeout(() => {
        removeNotification(notification.id);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [notification, removeNotification]);

  const getBgColor = (type: string) => {
    switch (type) {
      case 'achievement': return 'bg-green-500';
      case 'progress': return 'bg-blue-500';
      case 'reminder': return 'bg-yellow-500';
      case 'system': return 'bg-gray-500';
      case 'social': return 'bg-purple-500';
      case 'celebration': return 'bg-pink-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <Card className={`p-4 shadow-lg border-l-4 ${getBgColor(notification.type)} min-w-72 max-w-96`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <IconComponent className="w-6 h-6 text-white" />
        </div>
        
        <div className="flex-1">
          <h4 className="font-medium text-white">{notification.title}</h4>
          <p className="text-sm text-white/90 mt-1">{notification.message}</p>
          
          {notification.actionButton && (
            <Button
              size="sm"
              variant="outline"
              className="mt-3"
              onClick={notification.actionButton.action}
            >
              {notification.actionButton.label}
            </Button>
          )}
        </div>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={() => removeNotification(notification.id)}
          className="text-white hover:bg-white/20 w-6 h-6 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}

/**
 * Toast Container Component
 */
export function ToastContainer() {
  const { notifications } = useNotifications();
  
  const toastNotifications = notifications
    .filter(n => !n.read && (n.type === 'achievement' || n.type === 'celebration'))
    .slice(0, 3); // Show max 3 toasts

  if (toastNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toastNotifications.map(notification => (
        <ToastNotification key={notification.id} notification={notification} />
      ))}
    </div>
  );
}

/**
 * Utility Functions
 */
function getDefaultIcon(type: string) {
  switch (type) {
    case 'achievement': return Trophy;
    case 'progress': return TrendingUp;
    case 'reminder': return Clock;
    case 'system': return Info;
    case 'social': return MessageSquare;
    case 'celebration': return Star;
    default: return Bell;
  }
}

function formatTimestamp(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return time.toLocaleDateString();
}

function playNotificationSound(type: string) {
  // Different sounds for different notification types
  const context = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  const frequencies = {
    achievement: [523, 659, 784], // C-E-G chord
    progress: [440, 554], // A-C# interval
    reminder: [440], // A note
    system: [330], // E note
    social: [466, 587], // A#-D interval
    celebration: [523, 659, 784, 1047] // C-E-G-C octave
  };

  const freq = frequencies[type as keyof typeof frequencies] || [440];
  
  freq.forEach((frequency, index) => {
    setTimeout(() => {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      oscillator.frequency.setValueAtTime(frequency, context.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
      
      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.3);
    }, index * 150);
  });
}

/**
 * Preset notification creators
 */
export const createAchievementNotification = (title: string, message: string, metadata?: any): Omit<Notification, 'id' | 'timestamp' | 'read'> => ({
  type: 'achievement',
  priority: 'high',
  title,
  message,
  icon: Trophy,
  persistent: true,
  actionButton: {
    label: 'View Achievement',
    action: () => console.log('Navigate to achievements')
  },
  metadata
});

export const createProgressNotification = (title: string, message: string): Omit<Notification, 'id' | 'timestamp' | 'read'> => ({
  type: 'progress',
  priority: 'medium',
  title,
  message,
  icon: TrendingUp
});

export const createReminderNotification = (title: string, message: string): Omit<Notification, 'id' | 'timestamp' | 'read'> => ({
  type: 'reminder',
  priority: 'low',
  title,
  message,
  icon: Clock
});

export const createCelebrationNotification = (title: string, message: string): Omit<Notification, 'id' | 'timestamp' | 'read'> => ({
  type: 'celebration',
  priority: 'high',
  title,
  message,
  icon: Star,
  persistent: true
});