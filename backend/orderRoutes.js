import express from "express";
import Order from "./models/Order.js";

const router = express.Router();

// Create order
router.post("/", async (req, res) => {
  try {
    const { items, total, paymentMethod } = req.body;
    // Check and update food quantities
    for (const item of items) {
      const food = await (await import("./models/Food.js")).default.findOne({ name: item.name });
      if (!food || food.quantity <= 0) {
        return res.status(400).json({ error: `${item.name} is out of stock.` });
      }
      if (food.quantity < item.quantity) {
        return res.status(400).json({ error: `Not enough ${item.name} in stock.` });
      }
      food.quantity -= item.quantity;
      await food.save();
    }
    const order = new Order({ items, total, paymentMethod });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
