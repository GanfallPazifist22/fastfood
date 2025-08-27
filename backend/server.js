import express from "express";
import connectDB from "./db.js";
import Order from "./models/Order.js";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Use environment variable for MongoDB URL (Docker)
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/fastfood";
connectDB(MONGO_URL);

// Static menu
const menu = [
  { name: "Burger", price: 4.99 },
  { name: "French Fries", price: 2.49 },
  { name: "Pizza", price: 7.99 },
  { name: "Coke or Pepsi", price: 1.49 },
];

// GET /menu
app.get("/menu", (req, res) => {
  res.json(menu);
});

// POST /order
app.post("/order", async (req, res) => {
  try {
    const { items, total, paymentMethod } = req.body;
    if (!items || items.length === 0)
      return res.status(400).json({ error: "No items" });

    const order = new Order({ items, total, paymentMethod });
    await order.save();
    res.status(201).json({ message: "Order saved!", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /orders
app.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
