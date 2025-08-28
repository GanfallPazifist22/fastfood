import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true } // current stock
});

export default mongoose.model("Food", foodSchema);
