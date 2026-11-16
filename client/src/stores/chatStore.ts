import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import api from '../services/api';
import { Conversation, Message } from '../types';

interface ChatStore {
  socket: Socket | null;
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  typingUser: string | null;
  unreadCount: number;

  initSocket: (token: string) => void;
  disconnectSocket: () => void;
  loadConversations: () => Promise<void>;
  selectConversation: (convo: Conversation) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  sendTyping: () => void;
  sendStopTyping: () => void;
  startOrGetConversation: (listingId: string) => Promise<string>;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  socket: null,
  conversations: [],
  activeConversation: null,
  messages: [],
  isLoading: false,
  typingUser: null,
  unreadCount: 0,

  initSocket: (token: string) => {
    if (get().socket) return;

    const newSocket = io({
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('[Socket] Connected to server');
    });

    newSocket.on('newMessage', (msg: Message) => {
      const active = get().activeConversation;
      if (active && active.id === msg.conversation_id) {
        set((state) => ({
          messages: [...state.messages, msg],
        }));
        newSocket.emit('markRead', { conversationId: active.id });
      }

      // Update conversations list preview
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === msg.conversation_id
            ? { ...c, last_message: msg.content, last_message_at: msg.created_at }
            : c
        ),
      }));
    });

    newSocket.on('userTyping', (data: { conversationId: string; userId: string }) => {
      const active = get().activeConversation;
      if (active && active.id === data.conversationId) {
        set({ typingUser: active.other_user_name });
      }
    });

    newSocket.on('userStopTyping', (data: { conversationId: string }) => {
      const active = get().activeConversation;
      if (active && active.id === data.conversationId) {
        set({ typingUser: null });
      }
    });

    newSocket.on('messagesRead', () => {
      set((state) => ({
        messages: state.messages.map((m) => ({ ...m, is_read: true })),
      }));
    });

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const s = get().socket;
    if (s) {
      s.disconnect();
      set({ socket: null, activeConversation: null, messages: [] });
    }
  },

  loadConversations: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/conversations');
      const convos: Conversation[] = res.data.data;
      const totalUnread = convos.reduce((acc, c) => acc + (c.unread_count || 0), 0);
      set({ conversations: convos, unreadCount: totalUnread, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  selectConversation: async (convo) => {
    const s = get().socket;
    const prev = get().activeConversation;

    if (s && prev) {
      s.emit('leaveConversation', prev.id);
    }

    set({ activeConversation: convo, isLoading: true, messages: [] });

    try {
      const res = await api.get(`/conversations/${convo.id}/messages`);
      set({ messages: res.data.data.messages, isLoading: false });

      if (s) {
        s.emit('joinConversation', convo.id);
        s.emit('markRead', { conversationId: convo.id });
      }

      // Clear unread on this conversation
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === convo.id ? { ...c, unread_count: 0 } : c
        ),
      }));
    } catch {
      set({ isLoading: false });
    }
  },

  sendMessage: async (content: string) => {
    const active = get().activeConversation;
    const socket = get().socket;
    if (!active || !content.trim()) return;

    if (socket && socket.connected) {
      socket.emit('sendMessage', { conversationId: active.id, content });
      socket.emit('stopTyping', { conversationId: active.id });
    } else {
      // REST fallback
      const res = await api.post(`/conversations/${active.id}/messages`, { content });
      set((state) => ({ messages: [...state.messages, res.data.data] }));
    }
  },

  sendTyping: () => {
    const active = get().activeConversation;
    const socket = get().socket;
    if (active && socket) {
      socket.emit('typing', { conversationId: active.id });
    }
  },

  sendStopTyping: () => {
    const active = get().activeConversation;
    const socket = get().socket;
    if (active && socket) {
      socket.emit('stopTyping', { conversationId: active.id });
    }
  },

  startOrGetConversation: async (listingId: string) => {
    const res = await api.post('/conversations', { listingId });
    return res.data.data.id;
  },
}));

