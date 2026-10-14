import jwt from "jsonwebtoken";

interface AuthenticatedRequest {
	headers: { authorization?: string };
	user?: { id: string; email: string; role: string };
}

interface MiddlewareResponse {
	status: (code: number) => MiddlewareResponse;
	json: (body: unknown) => MiddlewareResponse;
}

type NextFunction = () => void;

/** Verify a Bearer JWT and attach its user claims to the request. */
export const authMiddleware = (
	req: AuthenticatedRequest,
	res: MiddlewareResponse,
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

		req.user = {
			id: String(payload.id),
			email: String(payload.email),
			role: String(payload.role),
		};
		next();
	} catch {
		res.status(401).json({ error: "Invalid or expired authentication token." });
	}
};
