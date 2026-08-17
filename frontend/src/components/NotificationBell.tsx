import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { api } from '../api';
import { Link } from 'react-router-dom';

import { useAuth } from './AuthProvider';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}

export default function NotificationBell() {
  const { session } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    if (!session) return;
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
  }, [session]);

  const handleToggle = async () => {
    const nextState = !isOpen;
    setIsOpen(nextState);

    if (nextState && notifications.some(n => !n.isRead)) {
      try {
        await api.post('/users/notifications/read');
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
        className="p-2 text-[#667085] hover:text-[#172033] transition-colors rounded-full relative"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#FF7A3D] rounded-full animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E6E8EC] rounded-xl shadow-lg z-50 p-4 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E6E8EC]">
            <h3 className="font-extrabold text-sm text-[#172033]">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs px-2 py-0.5 bg-[#2457D6]/10 text-[#2457D6] rounded-full font-bold">
                {unreadCount} new
              </span>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="text-xs text-[#98A2B3] text-center py-6">No notifications yet</p>
          ) : (
            <div className="space-y-2">
              {notifications.map(n => (
                <div 
                  key={n.id} 
                  className={`p-3 rounded-xl border text-xs transition-colors ${
                    !n.isRead ? 'bg-[#2457D6]/5 border-[#2457D6]/20 text-[#172033]' : 'bg-[#F7F7F2] border-[#E6E8EC] text-[#667085]'
                  }`}
                >
                  <p className="font-bold text-sm text-[#172033] mb-0.5">{n.title}</p>
                  <p className="text-[#667085] mb-1.5">{n.body}</p>
                  {n.link && (
                    <Link 
                      to={n.link} 
                      onClick={() => setIsOpen(false)}
                      className="text-[#2457D6] font-bold hover:underline text-xs"
                    >
                      View Details →
                    </Link>
                  )}
                  <span className="block text-[10px] text-[#98A2B3] mt-1">
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
