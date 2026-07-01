import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is required");
    }

    await connectDB();

    app.listen(PORT, () => {
      console.log("======================================");
      console.log("Pocket Planner backend started");
      console.log(`Server: http://localhost:${PORT}`);
      console.log("======================================");
    });
  } catch (error) {
    console.error("Failed to start backend:", error.message);
    process.exit(1);
  }
};

startServer();