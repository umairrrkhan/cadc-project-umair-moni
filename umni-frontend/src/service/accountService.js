import api from './api';

export const accountService = {
    deleteAccount: async (password) => {
        const response = await api.delete('/auth/account', {
            data: { password }
        });
        return response.data;
    }
};
