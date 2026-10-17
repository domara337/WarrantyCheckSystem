"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteInstallation = exports.updateInstallation = exports.getInstallationById = exports.getInstallations = exports.createInstallation = void 0;
const client_1 = require("./client");
// Create
const createInstallation = async (data) => {
    const res = await client_1.apiClient.post('/installations', data);
    return res.data;
};
exports.createInstallation = createInstallation;
// Read (All)
const getInstallations = async () => {
    const res = await client_1.apiClient.get('/installations');
    return res.data;
};
exports.getInstallations = getInstallations;
// Read (Single by ID)
const getInstallationById = async (id) => {
    const res = await client_1.apiClient.get(`/installations/${id}`);
    return res.data;
};
exports.getInstallationById = getInstallationById;
// Update
const updateInstallation = async (id, data) => {
    const res = await client_1.apiClient.put(`/installations/${id}`, data);
    return res.data;
};
exports.updateInstallation = updateInstallation;
// Delete
const deleteInstallation = async (id) => {
    const res = await client_1.apiClient.delete(`/installations/${id}`);
    return res.data;
};
exports.deleteInstallation = deleteInstallation;
