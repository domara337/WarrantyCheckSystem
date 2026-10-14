import express from "express";
import cors from "cors";

import branchesRoutes from "./routes/branches.routes";
import brandsRoutes from "./routes/brands.routes";
import customersRoutes from "./routes/customers.routes";
import installationRoutes from "./routes/installation.routes";
import productsRoutes from "./routes/products.routes";
import userRoutes from "./routes/user.routes";
import warrantyItemsRoutes from "./routes/warrantyItems.routes";

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get(["/health", "/api/health"], (_req, res) => {
  res.status(200).json({ status: "ok", message: "Warranty Checker API is running" });
});

app.use("/api/branches", branchesRoutes);
app.use("/api/brands", brandsRoutes);
app.use("/api/customers", customersRoutes);
app.use("/api/installations", installationRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/warranty-items", warrantyItemsRoutes);

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;
