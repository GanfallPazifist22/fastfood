// ...existing code...
import express from "express";
import Food from "./models/Food.js";
const router = express.Router();

// Delete a food item by ID (used for payment actions)
// Decrease food quantity by 1 (or specified amount) after payment, do not delete item
router.delete('/:id', async (req, res) => {
  try {
  const amount = req.body.amount || 1;
  const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ error: 'Food not found.' });
    }
    if (food.quantity < amount) {
      return res.status(400).json({ error: 'Not enough quantity available.' });
    }
    food.quantity -= amount;
    await food.save();
    res.json({ message: `Food '${food.name}' quantity decreased by ${amount}.`, food });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get all foods
router.get("/", async (req, res) => {
  try {
    const foods = await Food.find();
    res.json(foods);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new food
// ...existing code...
// Permanently delete a food item by ID
router.delete('/remove/:id', async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);
    if (!food) {
      return res.status(404).json({ error: 'Food not found.' });
    }
    res.json({ message: `Food '${food.name}' permanently deleted.`, food });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post("/", async (req, res) => {
  try {
    const { name, quantity } = req.body;
    if (!name || typeof quantity !== "number") {
      return res.status(400).json({ error: "Name and quantity are required." });
    }
    const food = new Food({ name, quantity });
    await food.save();
    res.status(201).json(food);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
