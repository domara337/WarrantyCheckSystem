"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteWarrantyRecord = exports.updateWarrantyRecord = exports.getAllWarrantyRecords = exports.searchWarranty = exports.createWarranty = exports.createProductEntry = void 0;
const client_1 = require("./client");
const response_1 = require("./response");
// Create the warranty and its installation together through the unified entry endpoint.
const createProductEntry = async (data) => {
    const res = await client_1.apiClient.post('/warranty-items/enter-product', data);
    return res.data;
};
exports.createProductEntry = createProductEntry;
const createWarranty = async (data) => {
    const res = await client_1.apiClient.post('/warranty-items', data);
    return res.data;
};
exports.createWarranty = createWarranty;
const searchWarranty = async (query) => {
    const res = await client_1.apiClient.get(`/warranty-items/search?term=${encodeURIComponent(query)}`);
    return (0, response_1.readArrayResponse)(res.data, 'Warranty search');
};
exports.searchWarranty = searchWarranty;
const getAllWarrantyRecords = async () => {
    const res = await client_1.apiClient.get('/warranty-items');
    return (0, response_1.readArrayResponse)(res.data, 'Warranty records');
};
exports.getAllWarrantyRecords = getAllWarrantyRecords;
const updateWarrantyRecord = async (id, data) => {
    await client_1.apiClient.patch(`/warranty-items/${id}`, data);
};
exports.updateWarrantyRecord = updateWarrantyRecord;
const deleteWarrantyRecord = async (id) => {
    await client_1.apiClient.delete(`/warranty-items/${id}`);
};
exports.deleteWarrantyRecord = deleteWarrantyRecord;
// export const uploadWarrantyExcel = async (file: File) => {
//   const formData = new FormData();
//   formData.append('file', file);
//   const res = await apiClient.post('/upload/warranty-items', formData, {
//     headers: { 'Content-Type': 'multipart/form-data' },
//   });
//   return res.data;
// };
