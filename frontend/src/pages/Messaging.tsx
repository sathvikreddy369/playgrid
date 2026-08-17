import { useState, useEffect, useRef } from 'react';
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
    <div className="min-h-screen bg-[#F7F7F2] text-[#172033] flex flex-col md:flex-row h-screen overflow-hidden pb-16 md:pb-0 font-sans">
      
      {/* Sidebar - Chat & Message Requests */}
      <div className={`w-full md:w-80 border-r border-[#E6E8EC] bg-white flex flex-col h-full ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-[#E6E8EC] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="p-2 hover:bg-[#F7F7F2] rounded-full transition-colors text-[#667085] hover:text-[#172033]">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-extrabold uppercase tracking-wider text-[#172033]">Messages</h1>
            </div>
          </div>
          
          {/* Tab Switcher */}
          <div className="flex bg-[#F7F7F2] border border-[#E6E8EC] rounded-xl p-1">
            <button
              onClick={() => setActiveTab('CHATS')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'CHATS' ? 'bg-[#2457D6] text-white shadow-sm' : 'text-[#667085] hover:text-[#172033]'
              }`}
            >
              Match Rooms
            </button>
            <button
              onClick={() => setActiveTab('REQUESTS')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all relative ${
                activeTab === 'REQUESTS' ? 'bg-[#2457D6] text-white shadow-sm' : 'text-[#667085] hover:text-[#172033]'
              }`}
            >
              Requests {incomingRequests.length > 0 && `(${incomingRequests.length})`}
            </button>
          </div>
        </div>

        {activeTab === 'CHATS' ? (
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {chats.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#98A2B3]">
                No active match chat rooms yet. Join a match to start chatting!
              </div>
            ) : (
              chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setActiveChat(chat.id)}
                  className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors ${
                    activeChat === chat.id ? 'bg-[#F7F7F2] border border-[#E6E8EC]' : 'hover:bg-[#F7F7F2]/60'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#2457D6] flex items-center justify-center font-bold text-sm text-white shadow-sm">
                    {chat.title.charAt(0)}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-bold text-sm truncate text-[#172033]">{chat.title}</h3>
                    <p className="text-xs text-[#667085] truncate">Host: {chat.host?.profile?.name || 'Player'}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {incomingRequests.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#98A2B3]">
                No pending message requests.
              </div>
            ) : (
              incomingRequests.map((req) => (
                <div key={req.id} className="bg-white border border-[#E6E8EC] rounded-xl p-3 space-y-2 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#D97706]" />
                    <span className="text-xs font-bold text-[#172033]">
                      {req.sender?.profile?.name || req.sender?.email?.split('@')[0]}
                    </span>
                  </div>
                  <p className="text-xs text-[#667085]">Wants to start a conversation with you.</p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleMessageRequestAction(req.id, 'ACCEPTED')}
                      className="flex-1 py-1.5 bg-[#FF7A3D] hover:bg-[#EA622D] text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1 shadow-sm uppercase tracking-wider"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Accept
                    </button>
                    <button
                      onClick={() => handleMessageRequestAction(req.id, 'DECLINED')}
                      className="flex-1 py-1.5 bg-white border border-[#E6E8EC] hover:bg-[#DC2626]/10 text-[#667085] hover:text-[#DC2626] font-bold text-xs rounded-lg flex items-center justify-center gap-1"
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
        <div className="flex-1 flex flex-col h-full bg-[#F7F7F2] relative">
          
          {/* Chat Header */}
          <div className="h-16 border-b border-[#E6E8EC] flex items-center px-4 bg-white/95 backdrop-blur-md shrink-0 gap-4">
            <button onClick={() => setActiveChat(null)} className="md:hidden p-2 hover:bg-[#F7F7F2] rounded-full text-[#667085]">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-[#2457D6] flex items-center justify-center font-bold text-white shadow-sm">
              {chats.find(c => c.id === activeChat)?.title?.charAt(0)}
            </div>
            <div>
              <h2 className="font-bold text-sm text-[#172033]">{chats.find(c => c.id === activeChat)?.title}</h2>
              <p className="text-xs text-[#667085]">Host: {chats.find(c => c.id === activeChat)?.host?.profile?.name || 'Player'}</p>
            </div>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg: any) => (
              <div
                key={msg.id || Math.random()}
                className={`flex flex-col ${msg.senderId === user?.id ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[10px] text-[#98A2B3] mb-1 px-1 font-semibold">{msg.name}</span>
                <div 
                  className={`max-w-[75%] lg:max-w-[50%] px-4 py-2.5 rounded-2xl ${
                    msg.senderId === user?.id 
                      ? 'bg-[#2457D6] text-white rounded-tr-sm font-medium shadow-sm' 
                      : 'bg-white border border-[#E6E8EC] text-[#172033] rounded-tl-sm shadow-sm'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
                <span className="text-[10px] text-[#98A2B3] mt-1 px-1">
                  {new Date(msg.time || msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-[#E6E8EC] bg-white shrink-0">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-white border border-[#E6E8EC] rounded-full px-4 py-3 text-sm text-[#172033] focus:outline-none focus:border-[#2457D6] focus:ring-1 focus:ring-[#2457D6] transition-colors placeholder:text-[#98A2B3]"
              />
              <button 
                type="submit"
                disabled={!inputMessage.trim()}
                className="w-12 h-12 bg-[#FF7A3D] hover:bg-[#EA622D] disabled:opacity-50 text-white rounded-full flex items-center justify-center transition-colors shrink-0 shadow-sm"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-[#98A2B3] text-sm">
          Select a match room or message request to start messaging
        </div>
      )}

      <MobileNav />
    </div>
  );
}
