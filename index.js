const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const fs = require('fs');
const path = require("path");
const Products = require("./models/products");

const app = express();
const DB = "mongodb://localhost:27017/memento_wold";

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cors());

// Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

app.get("/", (req, res) => {
    res.send("ok");
});

// ✅ Add Product API (with image)
app.post("/api/add_products", upload.single("image"), async (req, res) => {
  try {
    const { name, length, breadth, height, price, stock } = req.body;

    if (!req.file || !name || !length || !breadth || !height || !price || !stock) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const imagePath = `/uploads/${req.file.filename}`; // Path for frontend access

    const newProduct = new Products({
      name,
      images: [imagePath],
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


// ✅ Get product by ID
app.get("/api/disp/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const product = await Products.findById(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
  
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ message: "Error fetching product", error: error.message });
    }
  });
  

// ✅ Delete product
app.delete('/api/products_delete/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Find the product by ID
    const product = await Products.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete the image files associated with the product
    product.images.forEach((imagePath) => {
      // Remove the 'uploads/' prefix if it exists
      const imageFilePath = path.join(__dirname, 'uploads', imagePath.replace('uploads/', ''));

      console.log(`Attempting to delete file at: ${imageFilePath}`); // Log the full image path

      // Check if the file exists before attempting to delete it
      if (fs.existsSync(imageFilePath)) {
        fs.unlink(imageFilePath, (err) => {
          if (err) {
            console.error(`Error deleting image: ${err}`);
            return;
          }
          console.log(`Successfully deleted image: ${imageFilePath}`);
        });
      } else {
        console.log(`Image not found: ${imageFilePath}`);
      }
    });

    // Delete the product from the database
    await Products.findByIdAndDelete(id);

    res.json({ message: "Product and associated images deleted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// Update product endpoint
app.put('/api/update_products/:id', async (req, res) => {
    try {
      const productId = req.params.id;
      const updatedData = req.body; // The updated data from the request body
  
      // Find the product by ID and update it
      const updatedProduct = await Products.findByIdAndUpdate(productId, updatedData, { new: true });
  
      if (!updatedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      res.json(updatedProduct); // Send the updated product back to the client
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

mongoose
  .connect(DB)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
