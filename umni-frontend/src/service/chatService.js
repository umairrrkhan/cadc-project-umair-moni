import api from './api';

const normalizeSession = (s) => {
    if (!s || typeof s !== 'object') return s;
    return { ...s, id: s.id || s._id };
};

const normalizeMessages = (data) => {
    if (Array.isArray(data)) return data;
    if (data?.messages) return data.messages;
    if (data?.content) return data.content;
    return [];
};

export const chatService = {
    createSession: async (title = 'New Chat') => {
        const response = await api.post('/chat/session/new', { title });
        return normalizeSession(response.data);
    },

    getSessions : async () => {
        const response = await api.get('/chat/session');
        return (response.data || []).map(normalizeSession);
    },

    getMessages: async (chatId) => {
        const response = await api.get(`/chat/session/${chatId}/messages`);
        return normalizeMessages(response.data);
    },

    sendMessage: async (chatId, content) => {
        const response = await api.post(`/chat/session/${chatId}/message`, { message: content });
        return response.data;
    },

    deleteSession: async (chatId) => {
    await api.delete(`/chat/session/${chatId}`);
    
    }
}
