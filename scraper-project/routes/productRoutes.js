import express from "express";
import Product from "../models/Product.js";
import { mockProducts } from "../data/mockData.js";

const router = express.Router();

// Seed route
router.post("/seed", async (req, res) => {
  try {
    await Product.deleteMany({});
    const created = await Product.insertMany(mockProducts);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
