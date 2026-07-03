import React, { useState, useEffect, useRef } from 'react';
import { useConversations, useChatHistory } from '../hooks/useMessages';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../providers/AuthProvider';
import { Loader2, Send, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { UserLink } from '../components/ui/UserLink';
import { useLocation } from 'react-router-dom';
import api from '../lib/api';

export const Messages = () => {
 const { user } = useAuth();
 const socket = useSocket();
 const location = useLocation();
 const searchParams = new URLSearchParams(location.search);
 const initialUserId = searchParams.get('userId');

 const { data: conversations, isLoading: loadingConvos, refetch: refetchConvos } = useConversations();
 
 const [activeUserId, setActiveUserId] = useState<string | null>(initialUserId || null);
 const { data: history, isLoading: loadingHistory } = useChatHistory(activeUserId || undefined);
 
 const [messages, setMessages] = useState<any[]>([]);
 const [newMessage, setNewMessage] = useState('');
 const [isTyping, setIsTyping] = useState(false);
 const [remoteTyping, setRemoteTyping] = useState(false);
 
 const messagesEndRef = useRef<HTMLDivElement>(null);
 const typingTimeoutRef = useRef<number | null>(null);

 // Sync history to local state when active chat changes
 useEffect(() => {
 if (history?.messages) {
 setMessages(history.messages);
 scrollToBottom();
 
 // Mark as read when opening
 if (socket && activeUserId) {
 socket.emit('mark_read', { from: activeUserId });
 refetchConvos();
 }
 }
 }, [history, activeUserId, socket, refetchConvos]);

 // Socket listeners
 useEffect(() => {
 if (!socket) return;

 const handleReceive = (msg: any) => {
 if (msg.senderId === activeUserId || msg.receiverId === activeUserId) {
 setMessages(prev => [...prev, msg]);
 scrollToBottom();
 
 if (msg.senderId === activeUserId) {
 socket.emit('mark_read', { from: activeUserId });
 }
 }
 refetchConvos();
 };

 const handleSent = (msg: any) => {
 if (msg.receiverId === activeUserId) {
 setMessages(prev => [...prev, msg]);
 scrollToBottom();
 }
 refetchConvos();
 };

 const handleTyping = ({ from }: { from: string }) => {
 if (from === activeUserId) setRemoteTyping(true);
 };

 const handleStopTyping = ({ from }: { from: string }) => {
 if (from === activeUserId) setRemoteTyping(false);
 };

 const handleMessagesRead = ({ by }: { by: string }) => {
 if (by === activeUserId) {
 setMessages(prev => prev.map(m => m.senderId === user?.id ? { ...m, isRead: true } : m));
 }
 };

 socket.on('receive_message', handleReceive);
 socket.on('message_sent', handleSent);
 socket.on('typing', handleTyping);
 socket.on('stop_typing', handleStopTyping);
 socket.on('messages_read', handleMessagesRead);

 return () => {
 socket.off('receive_message', handleReceive);
 socket.off('message_sent', handleSent);
 socket.off('typing', handleTyping);
 socket.off('stop_typing', handleStopTyping);
 socket.off('messages_read', handleMessagesRead);
 };
 }, [socket, activeUserId, user?.id, refetchConvos]);

 const scrollToBottom = () => {
 setTimeout(() => {
 messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
 }, 100);
 };

 const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
 setNewMessage(e.target.value);
 
 if (socket && activeUserId) {
 if (!isTyping) {
 setIsTyping(true);
 socket.emit('typing', { to: activeUserId });
 }

 if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
 
 typingTimeoutRef.current = setTimeout(() => {
 setIsTyping(false);
 socket.emit('stop_typing', { to: activeUserId });
 }, 2000);
 }
 };

 const handleSend = (e: React.FormEvent) => {
 e.preventDefault();
 if (!newMessage.trim() || !socket || !activeUserId) return;

 socket.emit('send_message', { to: activeUserId, content: newMessage });
 socket.emit('stop_typing', { to: activeUserId });
 setNewMessage('');
 setIsTyping(false);
 if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
 };

  const [targetUser, setTargetUser] = useState<any>(null);

  useEffect(() => {
    if (activeUserId) {
      const convoUser = conversations?.find((c: any) => c.user.id === activeUserId)?.user;
      if (convoUser) {
        setTargetUser(convoUser);
      } else {
        // Fetch target user if not in conversations
        api.get(`/users/${activeUserId}`).then(res => setTargetUser(res.data)).catch(console.error);
      }
    } else {
      setTargetUser(null);
    }
  }, [activeUserId, conversations]);

  const activeUser = targetUser;

 return (
 <div className="max-w-6xl mx-auto py-10 px-4 h-[calc(100vh-100px)]">
 <div className="bg-surface rounded-2xl border border-border flex h-full overflow-hidden shadow-soft">
 
 {/* Sidebar */}
 <div className="w-1/3 border-r border-border flex flex-col bg-surface shrink-0">
 <div className="p-5 border-b border-border">
 <h2 className="font-black text-lg tracking-tight text-foreground">Conversations</h2>
 </div>
 
 <div className="flex-1 overflow-y-auto">
 {loadingConvos ? (
 <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-foreground" /></div>
 ) : conversations?.length > 0 ? (
 conversations.map((c: any) => (
 <button
 key={c.user.id}
 onClick={() => setActiveUserId(c.user.id)}
 className={`w-full text-left p-4 flex items-center gap-3 hover:bg-zinc-50 transition-colors cursor-pointer ${activeUserId === c.user.id ? 'bg-zinc-100 ' : ''}`}
 >
 <img src={c.user.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${c.user.name}&background=random`} className="w-9 h-9 rounded-full border border-border shrink-0" alt="Avatar" />
 <div className="flex-1 min-w-0">
 <div className="flex justify-between items-baseline mb-0.5">
 <p className="font-bold text-sm text-foreground truncate">{c.user.name}</p>
 <span className="text-[10px] font-bold text-muted">{format(new Date(c.lastMessage.createdAt), 'MMM d')}</span>
 </div>
 <p className={`text-xs truncate font-medium ${c.unreadCount > 0 ? 'font-bold text-foreground' : 'text-muted'}`}>
 {c.lastMessage.senderId === user?.id ? 'You: ' : ''}{c.lastMessage.content}
 </p>
 </div>
 {c.unreadCount > 0 && (
 <span className="bg-zinc-950 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shrink-0">
 {c.unreadCount}
 </span>
 )}
 </button>
 ))
 ) : (
 <div className="p-8 text-center text-xs text-muted font-bold">No chats yet.</div>
 )}
 </div>
 </div>

 {/* Chat Window */}
 <div className="w-2/3 flex flex-col bg-zinc-50 ">
 {activeUserId && activeUser ? (
 <>
 {/* Chat Header */}
 <div className="p-4 bg-surface border-b border-border flex items-center gap-3">
 <UserLink userId={activeUser.id}>
 <img src={activeUser.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${activeUser.name}&background=random`} className="w-9 h-9 rounded-full border border-border shrink-0" alt="Avatar" />
 </UserLink>
 <div>
 <UserLink userId={activeUser.id}>
 <h3 className="font-bold text-sm text-foreground hover:underline">{activeUser.name}</h3>
 </UserLink>
 {remoteTyping && <span className="text-[10px] text-emerald-600 font-bold animate-pulse">Typing...</span>}
 </div>
 </div>

 {/* Chat Messages */}
 <div className="flex-1 overflow-y-auto p-5 space-y-4">
 {loadingHistory ? (
 <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-foreground" /></div>
 ) : (
 <>
 {messages.map((msg: any, i: number) => {
 const isMe = msg.senderId === user?.id;
 const isLast = i === messages.length - 1;
 return (
 <div key={msg.id || i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
 <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm font-medium ${isMe ? 'bg-zinc-950 text-white rounded-br-none' : 'bg-surface border border-border rounded-bl-none text-foreground shadow-sm'}`}>
 {msg.content}
 </div>
 <span className="text-[9px] text-muted font-bold mt-1.5 mx-1 flex items-center gap-1">
 {format(new Date(msg.createdAt), 'h:mm a')}
 {isMe && isLast && (
 <span className={msg.isRead ? 'text-zinc-950 ' : ''}>
 {msg.isRead ? '• Read' : '• Sent'}
 </span>
 )}
 </span>
 </div>
 );
 })}
 <div ref={messagesEndRef} />
 </>
 )}
 </div>

 {/* Chat Input */}
 <div className="p-4 bg-surface border-t border-border">
 <form onSubmit={handleSend} className="flex gap-2">
 <input
 type="text"
 value={newMessage}
 onChange={handleTyping}
 placeholder="Type a message..."
 className="flex-1 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-950 bg-zinc-50 text-foreground font-medium"
 />
 <button type="submit" disabled={!newMessage.trim()} className="bg-zinc-950 text-white disabled:opacity-50 w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-95 shrink-0">
 <Send className="w-4 h-4" />
 </button>
 </form>
 </div>
 </>
 ) : (
 <div className="flex-1 flex flex-col items-center justify-center text-muted p-8">
 <MessageSquare className="w-12 h-12 mb-4 opacity-30" />
 <p className="text-xs font-semibold">Select a conversation or send a message to start chatting</p>
 </div>
 )}
 </div>

 </div>
 </div>
 );
};
