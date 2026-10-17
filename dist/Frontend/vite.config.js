"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_react_1 = __importDefault(require("@vitejs/plugin-react"));
const vite_1 = __importDefault(require("@tailwindcss/vite"));
const vite_2 = require("vite");
exports.default = (0, vite_2.defineConfig)({
    plugins: [(0, plugin_react_1.default)(), (0, vite_1.default)()],
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                secure: false,
            },
        },
    },
});
