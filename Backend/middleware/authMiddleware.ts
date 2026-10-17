import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getUserRoleById } from "../models/users.model";

interface AuthenticatedUser {
	id: string;
	email: string;
	role: string;
}

declare global {
	namespace Express {
		interface Request {
			user?: AuthenticatedUser;
		}
	}
}

export const authMiddleware = (
	req: Request,
	res: Response,
	next: NextFunction,
): void => {
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
		const payload = jwt.verify(authorization.slice(7), secret);
		if (typeof payload === "string" || !payload.id || !payload.email || !payload.role) {
			res.status(401).json({ error: "Invalid authentication token." });
			return;
		}

		let role = String(payload.role).trim().toLowerCase().replace(/[\s-]+/g, "_");
		if (role === "super_admin") role = "admin";
		req.user = {
			id: String(payload.id),
			email: String(payload.email),
			role,
		};
		next();
	} catch {
		res.status(401).json({ error: "Invalid or expired authentication token." });
	}
};

export const adminMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	if (!req.user) {
		res.status(401).json({ error: "Authentication token required." });
		return;
	}
	try {
		const storedRole = await getUserRoleById(req.user.id);
		const role = storedRole?.trim().toLowerCase().replace(/[\s-]+/g, "_");
		if (role !== "admin" && role !== "super_admin") {
			res.status(403).json({ error: "Administrator access required." });
			return;
		}
		next();
	} catch (error) {
		console.error("Failed to verify administrator access:", error);
		res.status(500).json({ error: "Unable to verify administrator access." });
	}
};
