import React, { useState } from 'react';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '../hooks/useNotifications';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: notifications } = useNotifications(true);
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const count = notifications?.length || 0;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        aria-label={count > 0 ? `Notifications, ${count} unread` : 'Notifications'}
        className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50"
      >
        <Bell className="w-6 h-6" />
        {count > 0 && (
          <span aria-hidden="true" className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded-full border-2 border-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-900">
            <h3 className="font-bold">Notifications</h3>
            {count > 0 && (
              <button 
                onClick={() => markAllAsRead.mutate()}
                className="text-xs text-blue-600 font-medium hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {count === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                You're all caught up!
              </div>
            ) : (
              <ul className="divide-y divide-gray-50 dark:divide-gray-700">
                {notifications.map((n: any) => (
                  <li key={n.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <p className="text-sm text-gray-800 dark:text-gray-200 mb-2">{n.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(n.createdAt))} ago
                      </span>
                      <div className="flex gap-2">
                        {n.link && (
                          <Link 
                            to={n.link} 
                            onClick={() => {
                              markAsRead.mutate(n.id);
                              setIsOpen(false);
                            }}
                            className="text-blue-600 p-1 hover:bg-blue-50 rounded"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        )}
                        <button 
                          onClick={() => markAsRead.mutate(n.id)}
                          className="text-green-600 p-1 hover:bg-green-50 rounded"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
