import api from "./api";

export const userService = {
    async register(userData) {
        const response = await api.post("/users/register", userData);
        return response.data;
    },

    async login(credentials) {
        const response = await api.post("/users/login", credentials);
        return response.data;
    },

    async findAll() {
        const response = await api.get("/users");
        return response.data;
    },

    async findByEmail(email) {
        const response = await api.get(`/users/find/${email}`);
        return response.data;
    },

    async findById(id) {
        const response = await api.get(`/users/find/${id}`);
        return response.data;
    },

    async update(id, userData) {
        const response = await api.put(`/users/update/${id}`, userData);
        return response.data;
    },
    
    async delete(id) {
        const response = await api.delete(`/users/delete/${id}`);
        return response.data;
    },

    async checkAdmin() {
        const response = await api.get("/users/check-admin");
        return response.data;
    },

    async updateMe(userData) {
        const response = await api.patch("/users/update-me", userData);
        return response.data;
    }
}