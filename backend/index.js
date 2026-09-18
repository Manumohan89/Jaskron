import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import "dotenv/config";
import { connectDB } from "./config/db.js";
import { errorHandler } from "./middleware/errorHandler.js";
import apiRoutes from "./routes/index.js";
import { initSocket } from "./utils/socket.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();

  // Allow multiple comma-separated origins via CORS_ORIGIN env var
  // e.g. CORS_ORIGIN=https://your-app.vercel.app,http://localhost:3000
  const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
    .split(",")
    .map((o) => o.trim());

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    })
  );

  // Basic security headers (no extra dependency needed)
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    next();
  });

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));

  // Serve uploaded resource files (downloadable resources uploaded by admins)
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  if (process.env.NODE_ENV !== "test") {
    await connectDB();
  }

  // Root health check (Render uses this for health pings)
  app.get("/", (_req, res) => {
    res.json({ status: "ok", service: "JASKRON Technologies Pvt. Ltd. API" });
  });

  app.use(apiRoutes); // routes already define their own /api/* prefixes + /health

  app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.originalUrl} not found` });
  });

  app.use((err, _req, res, _next) => {
    errorHandler(err, _req, res, _next);
  });

  const port = process.env.PORT || 5000;
  const httpServer = createServer(app);

  // Real-time notifications (certificate issued, workshop status changes, etc.)
  initSocket(httpServer, allowedOrigins);

  httpServer.listen(port, () => {
    console.log(`✅ JASKRON Technologies Pvt. Ltd. API running on port ${port}`);
    console.log(`🔗 API base: http://localhost:${port}/api`);
    console.log(`🔐 Auth: http://localhost:${port}/api/auth`);
    console.log(`🔌 Realtime: socket.io ready`);
    console.log(`❤️  Health: http://localhost:${port}/health`);
  });
}

startServer().catch((error) => {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
});
