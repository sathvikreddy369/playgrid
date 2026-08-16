import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, ArrowLeft, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { api } from '../api';
import { useAuth } from '../components/AuthProvider';

export default function Messaging() {
  const { user } = useAuth();
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [chats, setChats] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize socket
  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');
    setSocket(newSocket);
    
    return () => {
      newSocket.close();
    };
  }, []);

  // Fetch user's matches to build chat list
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await api.get('/matches/me/matches');
        setChats(res.data.matches);
      } catch (err) {
        console.error('Failed to fetch chats', err);
      }
    };
    if (user) fetchChats();
  }, [user]);

  // Handle room joining and fetching message history
  useEffect(() => {
    if (!activeChat || !socket) return;
    
    socket.emit('join_room', activeChat);
    
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

    const data = {
      matchId: activeChat,
      senderId: user.id,
      text: inputMessage,
      name: user.email?.split('@')[0] || 'Unknown User', // Temporary fallback
      time: new Date().toISOString()
    };

    socket.emit('send_message', data);
    setInputMessage('');
  };

  // End of logic

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col md:flex-row h-screen overflow-hidden">
      
      {/* Sidebar - Chat List */}
      <div className={`w-full md:w-80 border-r border-zinc-800 bg-zinc-950/80 backdrop-blur-xl flex flex-col h-full ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/" className="p-2 hover:bg-zinc-900 rounded-full transition-colors text-zinc-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold">Messages</h1>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search conversations..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {chats.map(chat => (
            <button
              key={chat.id}
              onClick={() => setActiveChat(chat.id)}
              className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors ${
                activeChat === chat.id ? 'bg-zinc-800' : 'hover:bg-zinc-900'
              }`}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-lg">
                  {chat.title.charAt(0)}
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <h3 className="font-bold text-sm truncate">{chat.title}</h3>
                <p className="text-xs text-zinc-400 truncate">Hosted by {chat.host?.profile?.name || 'Unknown'}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      {activeChat ? (
        <div className="flex-1 flex flex-col h-full bg-zinc-950 relative">
          
          {/* Chat Header */}
          <div className="h-16 border-b border-zinc-800 flex items-center px-4 bg-zinc-950/80 backdrop-blur-xl shrink-0 gap-4">
            <button onClick={() => setActiveChat(null)} className="md:hidden p-2 hover:bg-zinc-900 rounded-full text-zinc-400">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold">
              {chats.find(c => c.id === activeChat)?.title?.charAt(0)}
            </div>
            <div>
              <h2 className="font-bold text-sm">{chats.find(c => c.id === activeChat)?.title}</h2>
              <p className="text-xs text-zinc-400">Hosted by {chats.find(c => c.id === activeChat)?.host?.profile?.name || 'Unknown'}</p>
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
                <Send className="w-5 h-5 ml-1" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-zinc-500">
          Select a conversation to start messaging
        </div>
      )}
    </div>
  );
}
