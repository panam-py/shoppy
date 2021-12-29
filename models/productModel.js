const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Every product must have a name!"],
    unique: [true, "Product name already taken"],
  },
  price: {
    type: Number,
    required: [true, "Product must have a price!"],
  },
  description: String,
  stock: Number,
  category: {
    type: String,
    required: [true, "Every product must have a category!"],
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
