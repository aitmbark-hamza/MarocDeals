import mongoose from "mongoose";

const productSchema = mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  currency: { type: String, default: "MAD" },
  url: { type: String, required: true },
  source: { type: String }, 
  condition: { type: String, default: "new" },
  images: [String],
  availability: { type: String, default: "in stock" },
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);
export default Product;
