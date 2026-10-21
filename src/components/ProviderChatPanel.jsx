import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, ShieldCheck } from 'lucide-react';
import { io } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const socket = io(API_BASE_URL);

export const ProviderChatPanel = ({ providerId = 'hualink_admin', selectedBooking }) => {
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const chatBottomRef = useRef(null);

  useEffect(() => {
    if (!providerId) return;

    // Join general provider channel for notifications
    socket.emit('join_provider_channel', providerId);

    // Join specific room if a booking is selected
    if (selectedBooking?.id) {
      socket.emit('join_booking_chat', selectedBooking.id);

      // Fetch message history for this booking
      fetch(`${API_BASE_URL}/api/messages/${selectedBooking.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.success && Array.isArray(data.data)) {
            setMessages(data.data);
          } else if (Array.isArray(data)) {
            setMessages(data);
          }
        })
        .catch((err) => console.error('Failed to load message history:', err));
    }

    const handleReceiveMessage = (newMsg) => {
      if (newMsg.bookingId === selectedBooking?.id) {
        setMessages((prev) => [...prev, newMsg]);
      }
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [providerId, selectedBooking?.id]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendReply = (e) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || !selectedBooking?.id) return;

    const msgData = {
      bookingId: selectedBooking.id,
      serviceId: selectedBooking.serviceId || 'service_general',
      providerId: providerId,
      senderId: providerId,
      senderRole: 'provider',
      content: replyText.trim(),
      createdAt: new Date().toISOString(),
    };

    // Optimistic UI update
    setMessages((prev) => [...prev, msgData]);
    socket.emit('send_message', msgData);
    setReplyText('');
  };

  return (
    <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col h-[550px] overflow-hidden font-sans">
      {/* Header */}
      <div className="p-4 bg-slate-900 border-b border-gray-800 border-t-2 border-t-red-600 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600/10 border border-red-600/30 rounded-xl flex items-center justify-center text-red-500 font-bold">
            <MessageSquare size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Support Communications</h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] rounded-full font-semibold">
                <ShieldCheck size={10} /> Active Room
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Ref ID: <span className="text-red-500 font-mono">{selectedBooking?.id || 'General Session'}</span>
              {selectedBooking?.serviceTitle && ` | Service: ${selectedBooking.serviceTitle}`}
            </p>
          </div>
        </div>
      </div>

      {/* Message Feed — dark slate canvas */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0F172A]">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs font-medium">
            No message history available for this thread yet.
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isProvider = msg.senderRole === 'provider' || msg.senderId === providerId;
            return (
              <div key={msg._id || idx} className={`flex flex-col ${isProvider ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs font-medium leading-relaxed ${
                    isProvider
                      ? 'bg-red-600 text-white font-semibold rounded-br-none shadow-md shadow-red-600/20'
                      : 'bg-slate-800 text-slate-100 border border-gray-700/60 rounded-bl-none'
                  }`}
                >
                  {msg.content || msg.text}
                </div>
                {msg.createdAt && (
                  <span className="text-[9px] text-slate-500 mt-1 px-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            );
          })
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Reply Input Bar */}
      <form onSubmit={sendReply} className="p-3 bg-slate-900 border-t border-gray-800 flex items-center gap-2">
        <input
          type="text"
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Type live dispatch response..."
          className="flex-1 bg-slate-800 border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!selectedBooking?.id}
          className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Send</span>
          <Send size={13} />
        </button>
      </form>
    </div>
  );
};

export default ProviderChatPanel;