import cors from "cors";
import express from "express";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import morgan from "morgan";
import { dbReady } from "./data/database.js";
import productRoutes from "./routes/productRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));
const frontendDistPath = join(__dirname, "../../frontend/dist");
const clientUrl = process.env.CLIENT_URL ?? "http://localhost:5173";

app.use(cors({ origin: clientUrl }));
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === "test" ? "tiny" : "dev"));
app.use(async (_req, _res, next) => {
  try {
    await dbReady;
    next();
  } catch (error) {
    next(error);
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "campus-stock-api" });
});

app.use("/api/products", productRoutes);
app.use("/api/reports", reportRoutes);

if (existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get("*", (_req, res) => {
    res.sendFile(join(frontendDistPath, "index.html"));
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Unexpected server error." });
});

export default app;
