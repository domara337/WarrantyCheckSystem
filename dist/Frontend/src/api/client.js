"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiClient = void 0;
const axios_1 = __importDefault(require("axios"));
// Define the base URL for the API based on the environment variables and development mode
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
    //if the app is currently running in development mode, use the local API endpoint, otherwise use the production endpoint
    (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');
//creates an instance of the axios client with the base URL and default headers
exports.apiClient = axios_1.default.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});
// Include the current tab's authorization token in API requests.
exports.apiClient.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});
