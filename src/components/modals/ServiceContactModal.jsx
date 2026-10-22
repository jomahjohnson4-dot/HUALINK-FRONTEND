import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, MessageCircle, Send, X } from 'lucide-react';
import { io } from 'socket.io-client';
import { createInquiry } from '../../api/inquiryService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const socket = io(API_BASE_URL);

export default function ServiceContactModal({ booking, providerPhone, currentUser, onClose, initialMessage, contactName, contactLabel }) {
  const { t } = useTranslation();

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

    // 4. File the message as a lead so it shows up in the admin inquiries feed
    createInquiry({
      customerName: currentUser?.name || contactName || 'Guest',
      customerContact:
        currentUser?.phone ||
        booking?.clientPhone ||
        (currentUserId && currentUserId !== 'guest-visitor' ? currentUserId : 'guest-visitor'),
      productOrService: booking?.serviceTitle || contactName || contactLabel || 'General Inquiry',
      message: input.trim(),
      timestamp: new Date().toISOString(),
    }).catch((err) => console.error('Error saving inquiry:', err));

    setInput('');
  };

  const openWhatsApp = () => {
    const formattedPhone = (providerPhone || '').replace(/[^0-9]/g, '');
    const defaultText = encodeURIComponent(
      t('contact.whatsappGreeting', { id: booking?.id })
    );
    window.open(`https://wa.me/${formattedPhone}?text=${defaultText}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl overflow-hidden flex flex-col h-[500px]">
        
        {/* Modal Header — dark slate canvas with a subtle red accent rule */}
        <div className="p-4 bg-slate-900 border-b border-gray-800 border-t-2 border-t-red-600 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-white">
              {contactName || t('contact.provider')}
            </h3>
            <p className="text-[10px] text-slate-400">
              {contactLabel ||
                (booking?.serviceTitle
                  ? t('contact.inquiryLabel', { service: booking.serviceTitle })
                  : t('contact.bookingIdLabel', { id: booking?.id }))}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-800 bg-slate-950/60 p-2 gap-2">
          <button
            onClick={() => setChatMode('internal')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              chatMode === 'internal'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/25'
                : 'bg-slate-800/60 text-gray-300 hover:text-white'
            }`}
          >
            <MessageSquare size={14} />
            <span>{t('contact.inAppChat')}</span>
          </button>
          
          <button
            onClick={() => setChatMode('whatsapp')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              chatMode === 'whatsapp'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                : 'bg-slate-800/60 text-gray-300 hover:text-white'
            }`}
          >
            <MessageCircle size={14} />
            <span>{t('contact.whatsappDirect')}</span>
          </button>
        </div>

        {/* Dynamic Body — dark slate chat canvas */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0F172A]">
          {chatMode === 'internal' ? (
            messages.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-12">{t('contact.noMessages')}</p>
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
                          ? 'bg-red-600 text-white font-medium rounded-br-none shadow-md shadow-red-600/20'
                          : 'bg-slate-800 text-slate-100 border border-gray-700/60 rounded-bl-none'
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
                <h4 className="text-sm font-bold text-white">{t('contact.chatViaWhatsapp')}</h4>
                <p className="text-xs text-slate-400 mt-1">{t('contact.whatsappRedirect')}</p>
              </div>
              <button
                onClick={openWhatsApp}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                {t('contact.openWhatsapp')}
              </button>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar for Internal Chat */}
        {chatMode === 'internal' && (
          <div className="p-3 bg-slate-900 border-t border-gray-800 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={t('common.typeMessage')}
              className="flex-1 bg-slate-800 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors"
            />
            <button
              onClick={sendMessage}
              aria-label={t('contact.sendMessageAria')}
              className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-xl cursor-pointer font-bold transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}