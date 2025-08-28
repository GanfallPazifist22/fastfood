import mongoose from "mongoose";

const purchaseLogSchema = new mongoose.Schema({
  items: [
    {
      name: String,
      quantity: Number,
      price: Number
    }
  ],
  total: Number,
  time: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PurchaseLog', purchaseLogSchema);


export default mongoose.model("PurchaseLog", purchaseLogSchema);