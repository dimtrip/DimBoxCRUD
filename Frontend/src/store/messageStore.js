import { create } from 'zustand';

const useMessageStore = create((set) => ({
    conversations: [],
    currentMessages: [],
    unreadCount: 0,
    loading: false,
    error: null,

    fetchConversations: async () => {
        try {
            set({ loading: true, error: null });
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('Nerasta autentifikavimo prieigos rakto');
            }

            const response = await fetch('http://localhost:5000/api/messages/conversations', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Nepavyko gauti pokalbių');
            }

            const data = await response.json();
            const unread = data.reduce((sum, conv) => sum + conv.unreadCount, 0);

            set({
                conversations: data,
                unreadCount: unread,
                loading: false
            });
        } catch (err) {
            console.error('Nepavyko gauti pokalbių:', err);
            set({ error: err.message, loading: false });
        }
    },

    fetchMessages: async (username) => {
        try {
            set({ loading: true, error: null });
            const token = localStorage.getItem('token');

            const response = await fetch(`http://localhost:5000/api/messages/${username}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Nepavyko gauti pranešimų');

            const data = await response.json();
            set({ currentMessages: data, loading: false });
        } catch (err) {
            set({ error: err.message, loading: false });
        }
    },

    sendMessage: async (receiverUsername, content, replyTo) => {
        try {
            set({ loading: true, error: null });
            const token = localStorage.getItem('token');

            const response = await fetch('http://localhost:5000/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ receiverUsername, content, replyTo })
            });

            if (!response.ok) throw new Error('Nepavyko išsiųsti pranešimo');

            const data = await response.json();
            set((state) => ({
                currentMessages: [...state.currentMessages, data],
                loading: false
            }));
            return data;
        } catch (err) {
            set({ error: err.message, loading: false });
            throw err;
        }
    },

    deleteMessage: async (messageId) => {
        try {
            set({ loading: true, error: null });
            const token = localStorage.getItem('token');

            const response = await fetch(`http://localhost:5000/api/messages/${messageId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Nepavyko ištrinti pranešimo');

            set((state) => ({
                currentMessages: state.currentMessages.filter(msg => msg._id !== messageId),
                loading: false
            }));
        } catch (err) {
            set({ error: err.message, loading: false });
            throw err;
        }
    }
}));

export default useMessageStore;