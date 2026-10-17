"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/** Verify a Bearer JWT and attach its user claims to the request. */
const authMiddleware = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization?.startsWith("Bearer ")) {
        res.status(401).json({ error: "Authentication token required." });
        return;
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        res.status(500).json({ error: "Authentication is not configured." });
        return;
    }
    try {
        const payload = jsonwebtoken_1.default.verify(authorization.slice(7), secret);
        if (typeof payload === "string" || !payload.id || !payload.email || !payload.role) {
            res.status(401).json({ error: "Invalid authentication token." });
            return;
        }
        req.user = {
            id: String(payload.id),
            email: String(payload.email),
            role: String(payload.role),
        };
        next();
    }
    catch {
        res.status(401).json({ error: "Invalid or expired authentication token." });
    }
};
exports.authMiddleware = authMiddleware;
