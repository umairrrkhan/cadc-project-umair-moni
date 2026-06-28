import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const visionService={
    solveProblem : async (imageData ) =>{
        const payload = {image : imageData };
        const response = await axios.post(`${API_BASE_URL}/vision/solve`, payload, { headers: getAuthHeaders() });
        return response.data;
    },

    getLibrary: async () => {
        const response = await axios.get(`${API_BASE_URL}/vision/library`, { headers: getAuthHeaders() });
        return response.data;
    },

     deleteImage: async (visionId) => {
        await axios.delete(`${API_BASE_URL}/vision/${visionId}`, { headers: getAuthHeaders() });
    }
}
