import api from './api';

export const noteService = {
    uploadNote: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await api.post('/api/notes/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
    getNotes: async () => {
        const response = await api.get('/api/notes/list');
        return response.data;
    },

    deleteNote: async (noteId) => {
        await api.delete(`/api/notes/${noteId}`);
    }

};