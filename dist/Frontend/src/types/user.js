"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeRole = void 0;
const normalizeRole = (role) => role.trim().toLowerCase().replace(/[\s-]+/g, '_');
exports.normalizeRole = normalizeRole;
