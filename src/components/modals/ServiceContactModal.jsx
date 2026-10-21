import { useState, useEffect, useRef } from 'react';
import { MessageSquare, MessageCircle, Send, X } from 'lucide-react';
import { io } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const socket = io(API_BASE_URL);

export default function ServiceContactModal({ booking, providerPhone, currentUser, onClose, initialMessage, contactName, contactLabel }) {
  const [chatMode, setChatMode] = useState('internal'); // 'internal' or 'whatsapp'
  const [messages, setMessages] = useState([]);
  // Pre-fill the composer so the inquiry context (e.g. the service name) is
  // ready to send the moment the widget opens.
  const [input, setInput] = useState(initialMessage || '');
  const chatBottomRef = useRef(null);

  // Fallback current user ID for client matching
  const currentUserId = currentUser?.id || currentUser?._id || 'client-id';

  // Auto-scroll to the bottom when new messages arrive
  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, chatMode]);

  // Load chat history & handle real-time WebSockets
  useEffect(() => {
    if (booking?.id) {
      // 1. Fetch existing chat history from database
      fetch(`${API_BASE_URL}/api/messages/${booking.id}`)
        .then((res) => res.json())
        .then((resData) => {
          if (resData.success && Array.isArray(resData.data)) {
            setMessages(resData.data);
          }
        })
        .catch((err) => console.error('Error fetching chat history:', err));

      // 2. Join the dynamic Socket.io booking room
      socket.emit('join_booking_chat', booking.id);

      // 3. Listen for incoming live messages from server
      const handleNewMessage = (newMsg) => {
        // Prevent duplicate append if message was already added locally
        setMessages((prev) => {
          const exists = prev.some((m) => m.id && newMsg.id && m.id === newMsg.id);
          if (exists) return prev;
          return [...prev, newMsg];
        });
      };

      socket.on('receive_message', handleNewMessage);

      // Cleanup listener on unmount
      return () => {
        socket.off('receive_message', handleNewMessage);
      };
    }
  }, [booking?.id]);

  const sendMessage = () => {
    if (!input.trim() || !booking?.id) return;

    const msgData = {
      id: Date.now().toString(),
      bookingId: booking.id,
      content: input.trim(),
      text: input.trim(),
      senderId: currentUserId,
      receiverId: booking.userId || 'provider-id',
      createdAt: new Date().toISOString(),
    };

    // 1. Instantly append message to local UI state
    setMessages((prev) => [...prev, msgData]);

    // 2. Emit event via Socket.IO
    socket.emit('send_message', msgData);

    // 3. Optional REST POST fallback to ensure database persistence
    fetch(`${API_BASE_URL}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msgData),
    }).catch((err) => console.error('Error saving message:', err));

    setInput('');
  };

  const openWhatsApp = () => {
    const formattedPhone = (providerPhone || '').replace(/[^0-9]/g, '');
    const defaultText = encodeURIComponent(`Hello, I am reaching out regarding Service Order #${booking?.id}`);
    window.open(`https://wa.me/${formattedPhone}?text=${defaultText}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl overflow-hidden flex flex-col h-[500px]">
        
        {/* Modal Header */}
        <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-white">
              {contactName || 'Contact Service Provider'}
            </h3>
            <p className="text-[10px] text-slate-400">
              {contactLabel ||
                (booking?.serviceTitle ? `Inquiry: ${booking.serviceTitle}` : `Booking ID: ${booking?.id}`)}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 p-2 gap-2">
          <button
            onClick={() => setChatMode('internal')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              chatMode === 'internal' ? 'bg-orange-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <MessageSquare size={14} />
            <span>In-App Live Chat</span>
          </button>
          
          <button
            onClick={() => setChatMode('whatsapp')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              chatMode === 'whatsapp' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <MessageCircle size={14} />
            <span>WhatsApp Direct</span>
          </button>
        </div>

        {/* Dynamic Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {chatMode === 'internal' ? (
            messages.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-12">No messages yet. Send a message to start live chat.</p>
            ) : (
              messages.map((msg, idx) => {
                const isMe = msg.senderId === currentUserId;
                const messageText = msg.content || msg.text || '';
                return (
                  <div
                    key={msg.id || idx}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`p-3 rounded-xl max-w-[80%] text-xs ${
                        isMe
                          ? 'bg-orange-500 text-slate-950 font-medium rounded-br-none'
                          : 'bg-slate-800 text-slate-200 rounded-bl-none'
                      }`}
                    >
                      {messageText}
                    </div>
                  </div>
                );
              })
            )
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 p-6">
              <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-full">
                <MessageCircle size={32} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Chat via WhatsApp</h4>
                <p className="text-xs text-slate-400 mt-1">Redirect to WhatsApp to talk directly with the assigned provider.</p>
              </div>
              <button
                onClick={openWhatsApp}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Open WhatsApp Chat
              </button>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar for Internal Chat */}
        {chatMode === 'internal' && (
          <div className="p-3 bg-slate-800/50 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
            />
            <button
              onClick={sendMessage}
              className="bg-orange-500 hover:bg-orange-400 text-slate-950 p-2 rounded-xl cursor-pointer font-bold"
            >
              <Send size={16} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}