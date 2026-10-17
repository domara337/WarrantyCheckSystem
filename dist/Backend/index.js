"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const branches_routes_1 = __importDefault(require("./routes/branches.routes"));
const brands_routes_1 = __importDefault(require("./routes/brands.routes"));
const customers_routes_1 = __importDefault(require("./routes/customers.routes"));
const installation_routes_1 = __importDefault(require("./routes/installation.routes"));
const products_routes_1 = __importDefault(require("./routes/products.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const warrantyItems_routes_1 = __importDefault(require("./routes/warrantyItems.routes"));
const app = (0, express_1.default)();
const port = Number(process.env.PORT) || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get(["/health", "/api/health"], (_req, res) => {
    res.status(200).json({ status: "ok", message: "Warranty Checker API is running" });
});
app.use("/api/branches", branches_routes_1.default);
app.use("/api/brands", brands_routes_1.default);
app.use("/api/customers", customers_routes_1.default);
app.use("/api/installations", installation_routes_1.default);
app.use("/api/products", products_routes_1.default);
app.use("/api/users", user_routes_1.default);
app.use("/api/warranty-items", warrantyItems_routes_1.default);
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}
exports.default = app;
