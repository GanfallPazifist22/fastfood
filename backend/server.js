import express from "express";
import cors from "cors";
import connectDB from "./db.js";
import purchaseRoutes from "./purchaseRoutes.js";
import foodRoutes from "./foodRoutes.js";
import Food from "./models/Food.js";

const app = express();
app.use(cors());
app.use(express.json());

// Connect DB
connectDB();

// Routes
app.use("/purchases", purchaseRoutes);
app.use("/foods", foodRoutes);

// Removed automatic food seeding. Add food items manually via API or database.

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
