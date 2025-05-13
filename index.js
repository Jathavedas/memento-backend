const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { upload } = require("./cloudinary"); // Import Cloudinary upload
const Products = require("./models/products");
const app = express();

const DB = process.env.MONGO_URI;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use(cors({
  origin: 'https://memento-world.vercel.app',
  methods: ['GET', 'POST', 'DELETE', 'PUT'],
  credentials: true
}));

// Routes
app.get("/", (req, res) => res.send("API Running 🚀"));

// ✅ Upload product with Cloudinary
app.post("/api/add_products", upload.array("images", 5), async (req, res) => {
  try {
    const { name, length, breadth, height, price, stock } = req.body;

    if (!req.files || !name || !length || !breadth || !height || !price || !stock) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const imageUrls = req.files.map(file => file.path); // Cloudinary image URLs

    const newProduct = new Products({
      name,
      images: imageUrls,
      size: {
        length: parseFloat(length),
        breadth: parseFloat(breadth),
        height: parseFloat(height),
      },
      price: parseFloat(price),
      stock: parseInt(stock),
    });

    await newProduct.save();
    res.status(201).json({ message: "Product added", product: newProduct });
  } catch (error) {
    res.status(500).json({ message: "Error adding product", error: error.message });
  }
});

// ✅ Get all products
app.get("/api/disp/products", async (req, res) => {
  try {
    const products = await Products.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error: error.message });
  }
});

// ✅ Get single product
app.get("/api/disp/products/:id", async (req, res) => {
  try {
    const product = await Products.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Delete product (note: no need to delete Cloudinary images unless needed)
app.delete("/api/products_delete/:id", async (req, res) => {
  try {
    const product = await Products.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Optional: delete from Cloudinary too, if you store public_id
    await Products.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Update product
app.put("/api/update_products/:id", async (req, res) => {
  try {
    const updated = await Products.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Product not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating product", error: err.message });
  }
});

// MongoDB connection
mongoose.connect(DB)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
