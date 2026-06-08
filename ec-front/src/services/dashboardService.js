import axios from "axios";

const pythonUrl = import.meta.env.VITE_PYTHON_API_URL || "http://127.0.0.1:8000";

const pythonApi = axios.create({
    baseURL: pythonUrl,
    headers: {
        "Content-Type": "application/json",
    },
});

export const dashboardService = {
    async getPrecoAvaliacao() {
        const response = await pythonApi.get("/dashboard/preco-avaliacao");
        return response.data;
    },

    async getTopCategorias() {
        const response = await pythonApi.get("/dashboard/top-categorias");
        return response.data;
    },

    async getDistribuicaoGeografica() {
        const response = await pythonApi.get("/dashboard/distribuicao-geografica");
        return response.data;
    },

    async getMetodosPagamento() {
        const response = await pythonApi.get("/dashboard/metodos-pagamento");
        return response.data;
    },
};