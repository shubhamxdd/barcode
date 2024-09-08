const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productCategory: {
    type: String,
    required: true
  },
  productSubcategory: {
    type: String,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  barcode: {
    type: Number,
    unique: true,
    required: true
  }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
