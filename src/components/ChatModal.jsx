import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Send, ShieldCheck, X } from 'lucide-react';
import { io } from 'socket.io-client';
import { createInquiry } from '../api/inquiryService';
import { ProductImage } from './ProductCard';
import { formatPrice } from './productFormat';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Product-scoped live chat widget.
 *
 * The socket is created lazily (`autoConnect: false`) so the connection is
 * only opened while a chat window is actually on screen. Messages travel over
 * Socket.IO, are persisted through the REST endpoint and are additionally
 * filed as sales inquiries so they show up in the admin inquiries feed.
 */
const socket = io(API_BASE_URL, { autoConnect: false });

export default function ChatModal({ product, onClose, currentUser, initialMessage }) {
  const { t } = useTranslation();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState(initialMessage || '');
  const chatBottomRef = useRef(null);

  const name = product?.name || product?.title || t('product.product');
  const priceLabel = formatPrice(product?.price ?? product?.basePrice);
  const bookingId = `PRD-${product?.id || 'general'}`;
  const currentUserId = currentUser?.id || currentUser?._id || 'guest-visitor';

  // Escape closes the widget.
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Keep the newest message in view.
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load the thread history and subscribe to live replies.
  useEffect(() => {
    socket.connect();

    fetch(`${API_BASE_URL}/api/messages/${bookingId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && Array.isArray(data.data)) setMessages(data.data);
        else if (Array.isArray(data)) setMessages(data);
      })
      .catch((err) => console.error('[ChatModal] Failed to load history:', err));

    socket.emit('join_booking_chat', bookingId);

    const handleNewMessage = (newMsg) => {
      if (newMsg?.bookingId && newMsg.bookingId !== bookingId) return;

      setMessages((prev) => {
        const exists = prev.some((msg) => msg.id && newMsg.id && msg.id === newMsg.id);
        return exists ? prev : [...prev, newMsg];
      });
    };

    socket.on('receive_message', handleNewMessage);

    return () => {
      socket.off('receive_message', handleNewMessage);
      socket.disconnect();
    };
  }, [bookingId]);

  const sendMessage = () => {
    const content = input.trim();
    if (!content) return;

    const message = {
      id: Date.now().toString(),
      bookingId,
      content,
      text: content,
      senderId: currentUserId,
      receiverId: 'hualink_admin',
      createdAt: new Date().toISOString(),
    };

    // Optimistic UI update, then hand the message to the server.
    setMessages((prev) => [...prev, message]);
    socket.emit('send_message', message);

    fetch(`${API_BASE_URL}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    }).catch((err) => console.error('[ChatModal] Failed to persist message:', err));

    // File the message as a lead so it reaches the admin inquiries feed.
    createInquiry({
      customerName: currentUser?.name || 'Guest',
      customerContact: currentUser?.phone || currentUser?.email || currentUserId,
      productOrService: name,
      message: content,
      timestamp: new Date().toISOString(),
    }).catch((err) => console.error('[ChatModal] Failed to file inquiry:', err));

    setInput('');
  };

  const modal = (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('product.liveChatAbout', { name })}
    >
      {/* Blurred backdrop — clicking it closes the chat cleanly */}
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col h-[480px]">
        {/* Header — the product being discussed, with its thumbnail */}
        <div className="p-4 bg-white border-b border-gray-200 flex items-center gap-3 shrink-0">
          <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
            <ProductImage
              product={product || {}}
              className="w-full h-full object-cover"
              alt={name}
            />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-gray-900 leading-snug truncate">{name}</h3>
            <p className="text-[11px] text-gray-500 font-semibold flex items-center gap-1 mt-0.5">
              <ShieldCheck size={11} className="text-emerald-600 shrink-0" />
              {t('chat.liveSalesChat')}
            </p>
            <p className="text-[11px] text-red-600 font-bold mt-0.5">{priceLabel}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t('chat.closeChat')}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Message feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0F172A]">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-2 text-slate-500">
              <MessageSquare size={26} className="text-slate-600" />
              <p className="text-xs font-medium">{t('common.noMessages')}</p>
              <p className="text-[11px] text-slate-600">
                {t('common.chatEmptyHint')}
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMine = msg.senderId === currentUserId;
              const messageText = msg.content || msg.text || '';

              return (
                <div
                  key={msg.id || idx}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`p-3 rounded-xl max-w-[80%] text-xs ${
                      isMine
                        ? 'bg-[#DC2626] text-white font-medium rounded-br-none shadow-md shadow-red-600/20'
                        : 'bg-slate-800 text-slate-100 border border-gray-700/60 rounded-bl-none'
                    }`}
                  >
                    {messageText}
                  </div>
                  {msg.createdAt ? (
                    <span className="text-[9px] text-slate-500 mt-1 px-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  ) : null}
                </div>
              );
            })
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Composer */}
        <div className="p-3 bg-white border-t border-gray-200 flex gap-2 shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={t('common.typeMessage')}
            aria-label={t('chat.messageInput')}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#DC2626] transition-colors"
          />
          <button
            type="button"
            onClick={sendMessage}
            aria-label={t('chat.sendMessage')}
            className="bg-[#DC2626] hover:bg-red-700 text-white w-11 rounded-xl flex items-center justify-center cursor-pointer transition-colors shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  // The portal keeps the chat above the product modal it was opened from. The
  // inline fallback keeps server rendering and markup tests working, where no
  // DOM body exists.
  if (typeof document === 'undefined') return modal;

  return createPortal(modal, document.body);
}
