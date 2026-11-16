import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Send,
  MessageSquare,
  Check,
  CheckCheck,
  Tag,
  ShoppingBag,
  ExternalLink,
  ChevronLeft,
} from 'lucide-react';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';
import { MakeOfferModal } from '../components/product/MakeOfferModal';
import { Conversation, Message } from '../types';

export const ChatPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const requestedConvoId = searchParams.get('convo');

  const { user, token } = useAuthStore();
  const {
    conversations,
    activeConversation,
    messages,
    isLoading,
    typingUser,
    initSocket,
    loadConversations,
    selectConversation,
    sendMessage,
    sendTyping,
    sendStopTyping,
  } = useChatStore();

  const [inputMessage, setInputMessage] = useState('');
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize socket & fetch conversations on load
  useEffect(() => {
    if (token) {
      initSocket(token);
      loadConversations();
    }
  }, [token]);

  // Handle URL requested conversation
  useEffect(() => {
    if (requestedConvoId && conversations.length > 0) {
      const match = conversations.find((c: Conversation) => c.id === requestedConvoId);
      if (match && activeConversation?.id !== match.id) {
        selectConversation(match);
      }
    } else if (!activeConversation && conversations.length > 0) {
      selectConversation(conversations[0]);
    }
  }, [requestedConvoId, conversations]);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    const text = inputMessage.trim();
    setInputMessage('');
    await sendMessage(text);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
    sendTyping();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-80px)] min-h-[550px] flex flex-col">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs flex-1 flex overflow-hidden">
        {/* Left: Conversations List (Hidden on mobile if conversation is active) */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col ${
            activeConversation ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="font-black text-slate-900 text-lg">Messages</h2>
            <span className="text-xs font-bold text-slate-500">{conversations.length} chats</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {conversations.length > 0 ? (
              conversations.map((convo: Conversation) => {
                const isSelected = activeConversation?.id === convo.id;
                return (
                  <button
                    key={convo.id}
                    onClick={() => selectConversation(convo)}
                    className={`w-full p-4 flex items-start gap-3 text-left transition-colors ${
                      isSelected ? 'bg-brand-50/60' : 'hover:bg-slate-50'
                    }`}
                  >
                    {convo.other_user_avatar ? (
                      <img
                        src={convo.other_user_avatar}
                        alt=""
                        className="w-11 h-11 rounded-xl object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-brand-900 text-white font-bold flex items-center justify-center shrink-0">
                        {convo.other_user_name.charAt(0)}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="font-bold text-slate-900 text-sm truncate">
                          {convo.other_user_name}
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          {new Date(convo.last_message_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-slate-700 truncate mb-1">
                        {convo.listing_title}
                      </p>

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-400 truncate max-w-[180px]">
                          {convo.last_message || 'Start the conversation...'}
                        </p>
                        {convo.unread_count > 0 && (
                          <span className="w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                            {convo.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center space-y-2 text-slate-400">
                <MessageSquare size={32} className="mx-auto text-slate-300" />
                <p className="text-xs font-medium">No conversations yet.</p>
                <p className="text-[11px]">Contact a seller from any listing to chat.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Active Chat Thread */}
        {activeConversation ? (
          <div className="flex-1 flex flex-col h-full bg-slate-50/30">
            {/* Top Product Context Header */}
            <div className="p-3.5 px-4 bg-white border-b border-slate-200/80 flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => useChatStore.setState({ activeConversation: null })}
                  className="md:hidden p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  <ChevronLeft size={18} />
                </button>

                {activeConversation.listing_image && (
                  <img
                    src={activeConversation.listing_image}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover shrink-0"
                  />
                )}

                <div>
                  <h3 className="text-xs font-bold text-slate-900 line-clamp-1">
                    {activeConversation.listing_title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900">
                      ₹{activeConversation.listing_price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-slate-400">• With {activeConversation.other_user_name}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsOfferModalOpen(true)}
                  className="px-3 py-1.5 bg-accent-50 text-accent-700 hover:bg-accent-100 border border-accent-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Tag size={13} />
                  <span>Offer</span>
                </button>

                <Link
                  to={`/checkout/${activeConversation.listing_id}`}
                  className="px-3 py-1.5 bg-brand-900 text-white hover:bg-brand-800 rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                >
                  <ShoppingBag size={13} />
                  <span>Buy</span>
                </Link>

                <Link
                  to={`/product/${activeConversation.listing_id}`}
                  className="p-1.5 text-slate-400 hover:text-slate-700"
                  title="Open product page"
                >
                  <ExternalLink size={16} />
                </Link>
              </div>
            </div>

            {/* Messages Thread Container */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
              {messages.map((m: Message) => {
                const isMe = m.sender_id === user?.id;
                return (
                  <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`max-w-md rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-xs ${
                        isMe
                          ? 'bg-brand-900 text-white rounded-br-xs'
                          : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                      }`}
                    >
                      <p className="whitespace-pre-line leading-relaxed">{m.content}</p>
                    </div>

                    <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 px-1">
                      <span>
                        {new Date(m.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {isMe && (
                        <span>
                          {m.is_read ? (
                            <CheckCheck size={12} className="text-teal-500" />
                          ) : (
                            <Check size={12} className="text-slate-400" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {typingUser && (
                <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                  <span>{typingUser} is typing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex gap-2">
              <input
                type="text"
                placeholder="Type your message to negotiate or arrange meetup..."
                value={inputMessage}
                onChange={handleInputChange}
                onBlur={sendStopTyping}
                className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="px-4 py-2.5 bg-brand-900 hover:bg-brand-800 text-white rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </form>

            {/* Offer Modal inside Chat */}
            <MakeOfferModal
              isOpen={isOfferModalOpen}
              onClose={() => setIsOfferModalOpen(false)}
              listingId={activeConversation.listing_id}
              listingTitle={activeConversation.listing_title}
              listingPrice={activeConversation.listing_price}
              onOfferSuccess={() => {
                sendMessage('I have sent a price offer for your item. Please review it!');
              }}
            />
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center p-8 text-center text-slate-400">
            <div className="space-y-2">
              <MessageSquare size={48} className="mx-auto text-slate-200" />
              <h3 className="font-bold text-slate-700 text-sm">Select a conversation</h3>
              <p className="text-xs">Chat directly with buyers and sellers in your neighbourhood.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
