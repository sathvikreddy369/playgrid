import React, { useState, useEffect, useRef } from 'react';
import { useConversations, useChatHistory } from '../hooks/useMessages';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../providers/AuthProvider';
import { Loader2, Send, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

export const Messages = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const { data: conversations, isLoading: loadingConvos, refetch: refetchConvos } = useConversations();
  
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
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
  }, [history, activeUserId, socket]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleReceive = (msg: any) => {
      // If it's for the currently open chat, append it
      if (msg.senderId === activeUserId || msg.receiverId === activeUserId) {
        setMessages(prev => [...prev, msg]);
        scrollToBottom();
        
        // If I received it and I have chat open, mark read immediately
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
  }, [socket, activeUserId, user?.id]);

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

  const activeUser = conversations?.find((c: any) => c.user.id === activeUserId)?.user;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 h-[calc(100vh-64px)]">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 flex h-full overflow-hidden">
        
        {/* Sidebar */}
        <div className="w-1/3 border-r border-gray-100 dark:border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="font-bold text-lg">Messages</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loadingConvos ? (
              <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
            ) : conversations?.length > 0 ? (
              conversations.map((c: any) => (
                <button
                  key={c.user.id}
                  onClick={() => setActiveUserId(c.user.id)}
                  className={`w-full text-left p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${activeUserId === c.user.id ? 'bg-blue-50 dark:bg-gray-750' : ''}`}
                >
                  <img src={c.user.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${c.user.name}`} className="w-10 h-10 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <p className="font-semibold text-sm truncate">{c.user.name}</p>
                      <span className="text-xs text-gray-500">{format(new Date(c.lastMessage.createdAt), 'MMM d')}</span>
                    </div>
                    <p className={`text-sm truncate ${c.unreadCount > 0 ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                      {c.lastMessage.senderId === user?.id ? 'You: ' : ''}{c.lastMessage.content}
                    </p>
                  </div>
                  {c.unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                      {c.unreadCount}
                    </span>
                  )}
                </button>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">No conversations yet.</div>
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="w-2/3 flex flex-col bg-gray-50 dark:bg-gray-900">
          {activeUserId && activeUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                <img src={activeUser.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${activeUser.name}`} className="w-10 h-10 rounded-full" />
                <div>
                  <h3 className="font-bold">{activeUser.name}</h3>
                  {remoteTyping && <span className="text-xs text-blue-500 font-medium animate-pulse">Typing...</span>}
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loadingHistory ? (
                  <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
                ) : (
                  <>
                    {messages.map((msg: any, i: number) => {
                      const isMe = msg.senderId === user?.id;
                      const isLast = i === messages.length - 1;
                      return (
                        <div key={msg.id || i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-bl-none text-gray-900 dark:text-white'}`}>
                            {msg.content}
                          </div>
                          <span className="text-[10px] text-gray-400 mt-1 mx-1 flex items-center gap-1">
                            {format(new Date(msg.createdAt), 'h:mm a')}
                            {isMe && isLast && (
                              <span className={msg.isRead ? 'text-blue-500 font-medium' : ''}>
                                {msg.isRead ? '• Seen' : '• Sent'}
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
              <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                <form onSubmit={handleSend} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={handleTyping}
                    placeholder="Type a message..."
                    className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:border-blue-500 bg-gray-50 dark:bg-gray-900"
                  />
                  <button type="submit" disabled={!newMessage.trim()} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                    <Send className="w-4 h-4 ml-1" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
