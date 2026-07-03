import React, { useState } from 'react';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '../hooks/useNotifications';
import { Bell, Check, ExternalLink, UserPlus, ShieldAlert, Calendar, MessageSquare, Trophy, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export const NotificationBell = () => {
 const [isOpen, setIsOpen] = useState(false);
 const { data: notifications } = useNotifications(true);
 const markAsRead = useMarkAsRead();
 const markAllAsRead = useMarkAllAsRead();

 const count = notifications?.length || 0;

 const getIcon = (type: string) => {
   if (type?.includes('FRIEND')) return <UserPlus className="w-5 h-5 text-blue-500" />;
   if (type?.includes('COMMUNITY')) return <ShieldAlert className="w-5 h-5 text-purple-500" />;
   if (type?.includes('MATCH')) return <Calendar className="w-5 h-5 text-emerald-500" />;
   if (type?.includes('MESSAGE')) return <MessageSquare className="w-5 h-5 text-orange-500" />;
   if (type?.includes('REPUTATION') || type?.includes('TRUST')) return <Trophy className="w-5 h-5 text-yellow-500" />;
   return <Bell className="w-5 h-5 text-zinc-500" />;
 };

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
 <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
 <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 ">
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
 <ul className="divide-y divide-border">
 {notifications.map((n: any) => (
 <li key={n.id} className="p-4 hover:bg-zinc-50 transition-colors flex gap-3 group">
 <div className="mt-1 shrink-0 bg-white p-2 rounded-full border border-border shadow-sm">
   {getIcon(n.type)}
 </div>
 <div className="flex-1">
   <p className="text-sm text-foreground font-semibold mb-1 leading-snug">{n.content}</p>
   <div className="flex items-center justify-between mt-2">
   <span className="text-xs text-muted font-bold flex items-center gap-1">
     <Clock className="w-3 h-3" /> {formatDistanceToNow(new Date(n.createdAt))} ago
   </span>
   <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
   {n.link && (
   <Link 
   to={n.link} 
   onClick={() => {
   markAsRead.mutate(n.id);
   setIsOpen(false);
   }}
   className="text-blue-600 p-1.5 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200"
   title="View"
   >
   <ExternalLink className="w-4 h-4" />
   </Link>
   )}
   <button 
   onClick={() => markAsRead.mutate(n.id)}
   className="text-emerald-600 p-1.5 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-200"
   title="Mark as read"
   >
   <Check className="w-4 h-4" />
   </button>
   </div>
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
