"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCustomer = exports.getCustomers = exports.getProductsByBrand = exports.getProducts = exports.getBrands = exports.getBranches = void 0;
const client_1 = require("./client");
const response_1 = require("./response");
//get branches
const getBranches = async () => {
    const res = await client_1.apiClient.get('/branches');
    return (0, response_1.readArrayResponse)(res.data, 'Branches');
};
exports.getBranches = getBranches;
//get brands
const getBrands = async () => {
    const res = await client_1.apiClient.get('/brands');
    return (0, response_1.readArrayResponse)(res.data, 'Brands');
};
exports.getBrands = getBrands;
//get products
const getProducts = async () => {
    const res = await client_1.apiClient.get('/products');
    return (0, response_1.readArrayResponse)(res.data, 'Products');
};
exports.getProducts = getProducts;
// CHANGE: Fetch products filtered by brand_id (for cascading Brand → Product dropdown)
const getProductsByBrand = async (brandId) => {
    const res = await client_1.apiClient.get(`/products/by-brand/${brandId}`);
    return (0, response_1.readArrayResponse)(res.data, 'Products by brand');
};
exports.getProductsByBrand = getProductsByBrand;
//get customers
const getCustomers = async () => {
    const res = await client_1.apiClient.get('/customers');
    return (0, response_1.readArrayResponse)(res.data, 'Customers');
};
exports.getCustomers = getCustomers;
// Create a new customer.
// The backend's addCustomer reads `full_name` from the request body,
// while GET responses expose the same column as `name`.
const createCustomer = async (data) => {
    const res = await client_1.apiClient.post('/customers', data);
    return res.data.data || res.data;
};
exports.createCustomer = createCustomer;
