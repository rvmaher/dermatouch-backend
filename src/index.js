import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { config } from "./config/index.js";
import prisma, { disconnectPrisma } from "./prisma/client.js";
import { sendError } from "./utils/responseHandler.js";

// Import routes
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import orderRoutes from "./routes/order.routes.js";
import userRoutes from "./routes/user.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.nodeEnv === 'production' ? ['https://yourdomain.com'] : ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (config.nodeEnv === "development") {
  app.use(morgan("dev"));
}

app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: "ok", db: "ok" });
  } catch {
    res.status(500).json({ status: "error", db: "unreachable" });
  }
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Dermatouch API running 🚀" });
});

// 404 handler
app.use((_req, res) => {
  return sendError(res, "Route not found", 404);
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  const status = err.statusCode || 500;
  return sendError(res, err.message || "Internal Server Error", status);
});

const server = app.listen(config.port, () => {
  console.log(`✅ Server running at http://localhost:${config.port}`);
});

const shutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Shutting down...`);
  server.close(async (err) => {
    if (err) {
      console.error("Error closing server", err);
      process.exit(1);
    }
    await disconnectPrisma();
    console.log("Shutdown complete");
    process.exit(0);
  });
  setTimeout(() => {
    console.warn("Force shutdown");
    process.exit(1);
  }, 30000).unref();
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
  shutdown("uncaughtException");
});
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
  shutdown("unhandledRejection");
});
