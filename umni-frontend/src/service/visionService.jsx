import api from './api';

export const visionService={
    solveProblem : async (imageData ,prompt = null ) =>{
        const payload = {image : imageData };
        if(prompt) payload.prompt = prompt;

        const response = await api.post('/vision/solve',payload);
        return response.data;
    },

    getLibrary: async () => {
        const response = await api.get('/vision/library');
        return response.data;
    },

     deleteImage: async (visionId) => {
        await api.delete(`/vision/${visionId}`);
    }
}