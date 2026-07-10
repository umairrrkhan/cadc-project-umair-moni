import api from './api';

export const noteService = {
    uploadNote: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await api.post('/notes/upload', formData, {
            timeout: 60000,
        });
        return response.data;
    },
    getNotes: async () => {
        const response = await api.get('/notes/list');
        return response.data;
    },

    deleteNote: async (noteId) => {
        await api.delete(`/notes/${noteId}`);
    }

};