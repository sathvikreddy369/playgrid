import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';

import { Link } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { api } from '../api';
import { useAuth } from '../components/AuthProvider';
import { supabase } from '../lib/supabase';
import MobileNav from '../components/MobileNav';

export default function Messaging() {
  const { user } = useAuth();
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [chats, setChats] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'CHATS' | 'REQUESTS'>('CHATS');
  const [inputMessage, setInputMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize socket
  useEffect(() => {
    let newSocket: Socket | null = null;
    
    const initSocket = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const token = localStorage.getItem('demo_token') || session?.access_token;
      
      newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
        auth: { token },
        withCredentials: true
      });
      
      setSocket(newSocket);
    };
    
    if (user) {
      initSocket();
    }
    
    return () => {
      if (newSocket) newSocket.close();
    };
  }, [user]);

  // Fetch match chats and message requests
  const fetchChatsAndRequests = async () => {
    try {
      const [matchesRes, requestsRes] = await Promise.all([
        api.get('/matches/me/matches').catch(() => null),
        api.get('/users/message-requests').catch(() => null)
      ]);

      if (matchesRes?.data?.matches) setChats(matchesRes.data.matches);
      if (requestsRes?.data?.requests) setIncomingRequests(requestsRes.data.requests);
    } catch (err) {
      console.error('Failed to fetch chats and requests', err);
    }
  };

  useEffect(() => {
    if (user) fetchChatsAndRequests();
  }, [user]);

  // Handle room joining and fetching message history
  useEffect(() => {
    if (!activeChat || !socket) return;
    
    socket.emit('join_match_room', activeChat);
    
    const fetchHistory = async () => {
      try {
        const res = await api.get(`/messages/${activeChat}`);
        setMessages(res.data.messages);
      } catch (err) {
        console.error('Failed to fetch message history', err);
      }
    };
    fetchHistory();

    const handleReceive = (data: any) => {
      if (data.matchId === activeChat) {
        setMessages(prev => [...prev, data]);
      }
    };

    socket.on('receive_message', handleReceive);

    return () => {
      socket.off('receive_message', handleReceive);
    };
  }, [activeChat, socket]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChat]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeChat || !socket || !user) return;

    socket.emit('send_message', {
      matchId: activeChat,
      text: inputMessage.trim()
    });
    setInputMessage('');
  };

  const handleMessageRequestAction = async (requestId: string, action: 'ACCEPTED' | 'DECLINED') => {
    try {
      await api.post(`/users/message-requests/${requestId}/action`, { action });
      await fetchChatsAndRequests();
    } catch (err) {
      console.error('Failed to update message request action', err);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col md:flex-row h-screen overflow-hidden pb-16 md:pb-0">
      
      {/* Sidebar - Chat & Message Requests */}
      <div className={`w-full md:w-80 border-r border-zinc-800 bg-zinc-950/80 backdrop-blur-xl flex flex-col h-full ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="p-2 hover:bg-zinc-900 rounded-full transition-colors text-zinc-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-bold">Messages</h1>
            </div>
          </div>
          
          {/* Tab Switcher */}
          <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('CHATS')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'CHATS' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Match Rooms
            </button>
            <button
              onClick={() => setActiveTab('REQUESTS')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all relative ${
                activeTab === 'REQUESTS' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Requests {incomingRequests.length > 0 && `(${incomingRequests.length})`}
            </button>
          </div>
        </div>

        {activeTab === 'CHATS' ? (
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {chats.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500">
                No active match chat rooms yet. Join a match to start chatting!
              </div>
            ) : (
              chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setActiveChat(chat.id)}
                  className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors ${
                    activeChat === chat.id ? 'bg-zinc-800' : 'hover:bg-zinc-900'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-sm">
                    {chat.title.charAt(0)}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-bold text-sm truncate text-white">{chat.title}</h3>
                    <p className="text-xs text-zinc-400 truncate">Host: {chat.host?.profile?.name || 'Player'}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {incomingRequests.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500">
                No pending message requests.
              </div>
            ) : (
              incomingRequests.map((req) => (
                <div key={req.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white">
                      {req.sender?.profile?.name || req.sender?.email?.split('@')[0]}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">Wants to start a conversation with you.</p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleMessageRequestAction(req.id, 'ACCEPTED')}
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Accept
                    </button>
                    <button
                      onClick={() => handleMessageRequestAction(req.id, 'DECLINED')}
                      className="flex-1 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-bold text-xs rounded-lg flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Decline
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      {activeChat ? (
        <div className="flex-1 flex flex-col h-full bg-zinc-950 relative">
          
          {/* Chat Header */}
          <div className="h-16 border-b border-zinc-800 flex items-center px-4 bg-zinc-950/80 backdrop-blur-xl shrink-0 gap-4">
            <button onClick={() => setActiveChat(null)} className="md:hidden p-2 hover:bg-zinc-900 rounded-full text-zinc-400">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold">
              {chats.find(c => c.id === activeChat)?.title?.charAt(0)}
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">{chats.find(c => c.id === activeChat)?.title}</h2>
              <p className="text-xs text-zinc-400">Host: {chats.find(c => c.id === activeChat)?.host?.profile?.name || 'Player'}</p>
            </div>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg: any) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg.id || Math.random()}
                className={`flex flex-col ${msg.senderId === user?.id ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[10px] text-zinc-500 mb-1 px-1">{msg.name}</span>
                <div 
                  className={`max-w-[75%] lg:max-w-[50%] px-4 py-2.5 rounded-2xl ${
                    msg.senderId === user?.id 
                      ? 'bg-indigo-600 text-white rounded-tr-sm' 
                      : 'bg-zinc-800 text-zinc-100 rounded-tl-sm'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
                <span className="text-[10px] text-zinc-500 mt-1 px-1">
                  {new Date(msg.time || msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-zinc-800 bg-zinc-950 shrink-0">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition"
              />
              <button 
                type="submit"
                disabled={!inputMessage.trim()}
                className="w-12 h-12 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-full flex items-center justify-center transition-colors shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-zinc-500 text-sm">
          Select a match room or message request to start messaging
        </div>
      )}

      <MobileNav />
    </div>
  );
}
