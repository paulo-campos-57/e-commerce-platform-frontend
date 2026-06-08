import api from "./api";

export const recommendationService = {
    async getMyRecommendations(customerId) {
        try {
            const response = await api.get(`/v1/recomendacoes`, {
                params: { customerId }
            });
            return response.data?.data || [];
        } catch (error) {
            console.error("Erro no serviço de recomendação:", error);
            throw error;
        }
    }
};