const mongoose = require('mongoose');

const sellingorderItemSchema = mongoose.Schema({
    quantity: {
        type: Number,
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    price: {
        type: Number,
      },
})

sellingorderItemSchema.set('toJSON', {
    virtuals: true,
  })
const SellingOrderItem = mongoose.model('SellingOrderItem', sellingorderItemSchema);

module.exports = { SellingOrderItem };