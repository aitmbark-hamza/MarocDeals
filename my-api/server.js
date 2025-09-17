// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = "mongodb+srv://moroccdeal:moroccdeal2025@moroccdeal.4s4l5a4.mongodb.net/?retryWrites=true&w=majority&appName=moroccdeal";

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

const productSchema = new mongoose.Schema({
  title: String,
  brand: String,
  model: String,
  category: String,
  subcategory: String,
  condition: String,
  availability: String,
  price: Number,
  currency: String,
  originalPrice: Number,
  discount: Number,
  location: Object,
  images: [String],
  description: String,
  seller: Object,
  specs: Object,
  warranty: String,
  priceHistory: Array,
  views: Number,
  link: String,
  source: String
});

const Product = mongoose.model("Product", productSchema);

// Routes
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/products", async (req, res) => {
  const newProduct = new Product(req.body);
  try {
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
