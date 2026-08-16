import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { api } from '../api';
import { Link } from 'react-router-dom';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/users/notifications');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleToggle = async () => {
    const nextState = !isOpen;
    setIsOpen(nextState);

    if (nextState && notifications.some(n => !n.isRead)) {
      try {
        await api.post('/notifications/read');
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      } catch (err) {
        console.error('Failed to mark notifications read', err);
      }
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      <button 
        onClick={handleToggle}
        className="p-2 text-zinc-400 hover:text-white transition rounded-full relative"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-50 p-4 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-800">
            <h3 className="font-bold text-sm text-white">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full font-medium">
                {unreadCount} new
              </span>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-6">No notifications yet</p>
          ) : (
            <div className="space-y-2">
              {notifications.map(n => (
                <div 
                  key={n.id} 
                  className={`p-3 rounded-xl border text-xs transition-colors ${
                    !n.isRead ? 'bg-indigo-500/10 border-indigo-500/30 text-white' : 'bg-zinc-950/50 border-zinc-800 text-zinc-400'
                  }`}
                >
                  <p className="font-bold text-sm text-white mb-0.5">{n.title}</p>
                  <p className="text-zinc-300 mb-1.5">{n.body}</p>
                  {n.link && (
                    <Link 
                      to={n.link} 
                      onClick={() => setIsOpen(false)}
                      className="text-indigo-400 font-medium hover:underline text-xs"
                    >
                      View Details →
                    </Link>
                  )}
                  <span className="block text-[10px] text-zinc-500 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
