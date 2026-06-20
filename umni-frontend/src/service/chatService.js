import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/chat';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

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
        const response = await axios.post(`${API_BASE_URL}/session/new`, { title }, { headers: getAuthHeaders() });
        return normalizeSession(response.data);
    },

    getSessions : async () => {
        const response = await axios.get(`${API_BASE_URL}/session`, { headers: getAuthHeaders() });
        return (response.data || []).map(normalizeSession);
    },

    getMessages: async (chatId) => {
        const response = await axios.get(`${API_BASE_URL}/session/${chatId}/messages`, { headers: getAuthHeaders() });
        return normalizeMessages(response.data);
    },

    sendMessage: async (chatId, content) => {
        const response = await axios.post(`${API_BASE_URL}/session/${chatId}/message`, { message: content }, { headers: getAuthHeaders() });
        return response.data;
    },

    deleteSession: async (chatId) => {
    await axios.delete(`${API_BASE_URL}/session/${chatId}`, {
        headers: getAuthHeaders()
    });
    
    }
}