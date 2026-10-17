"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = __importDefault(require("pg"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load .env correctly when running locally
if (process.env.NODE_ENV !== "production") {
    // Looks for .env in the root project folder regardless of where db.ts is nested
    dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), ".env") });
}
// Validate database configuration and get the url  and port from environment variables
const databaseUrl = process.env.DATABASE_URL;
const port = process.env.PG_PORT ? Number(process.env.PG_PORT) : 6543;
// Validate database configuration
if (!databaseUrl) {
    const missing = ["PG_HOST", "PG_DATABASE", "PG_USER", "PG_PASSWORD"].filter((key) => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(`Missing database configuration: set DATABASE_URL or ${missing.join(", ")}.`);
    }
    // Validate port if provided and ensure it's a valid integer between 1 and 65535
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error("PG_PORT must be an integer between 1 and 65535.");
    }
}
// Automatically enable SSL for Supabase / remote connection strings
const useSsl = process.env.PG_SSL === "true" ||
    (databaseUrl && (databaseUrl.includes("sslmode=require") || databaseUrl.includes("supabase.com")));
const db = new pg_1.default.Pool({
    ...(databaseUrl
        ? { connectionString: databaseUrl }
        : {
            user: process.env.PG_USER,
            host: process.env.PG_HOST,
            database: process.env.PG_DATABASE,
            password: process.env.PG_PASSWORD,
            port,
        }),
    // Force SSL enabled for Supabase
    ...(useSsl && { ssl: { rejectUnauthorized: false } }),
    max: 1,
    connectionTimeoutMillis: 5000,
    query_timeout: 10000,
    statement_timeout: 10000,
    idleTimeoutMillis: 10000,
});
// Handle unexpected errors on the database client
db.on("error", (err) => {
    console.error("Unexpected error on idle database client", err);
});
exports.default = db;
