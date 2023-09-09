const mongoose = require('mongoose');

const quantityInStockSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', 
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
});

const QuantityInStock = mongoose.model('QuantityInStock', quantityInStockSchema);

module.exports = QuantityInStock;

