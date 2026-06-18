import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/chat';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export const chatService = {
    createSession: async (title = 'New Chat') => {
        const response = await axios.post(`${API_BASE_URL}/session/new`, { title }, { headers: getAuthHeaders() });
        return response.data;
    },

    getSession : async () => {
        const response = await axios.get(`${API_BASE_URL}/session`, { headers: getAuthHeaders() });
        return response.data;
    },

    getMessages: async (chatId) => {
        const response = await axios.get(`${API_BASE_URL}/session/${chatId}/messages`, { headers: getAuthHeaders() });
        return response.data;
    },

    sendMessage: async (chatId, content) => {
        const response = await axios.post(`${API_BASE_URL}/session/${chatId}/message`, { message: content }, { headers: getAuthHeaders() });
        return response.data;
    }
}