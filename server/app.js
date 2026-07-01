import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import userRoutes from "./routes/userRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";

import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import payzoRoutes from "./routes/payzoRoutes.js";
import goalRoutes from "./routes/goalRoutes.js";
import tripRoutes from "./routes/tripRoutes.js";
import splitRoutes from "./routes/splitRoutes.js";
import accountRoutes from "./routes/accountRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();

app.disable("x-powered-by");

const allowedOrigins = (process.env.CORS_ORIGIN || process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/payzo", payzoRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/splits", splitRoutes);
app.use("/api/accounts", accountRoutes);
app.get("/", (req, res) => {
  res.send("Pocket Planner Backend Running 🚀");
});

app.use(notFound);
app.use(errorHandler);



export default app;