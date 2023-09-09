const mongoose = require('mongoose');
const Joi = require("joi");

const productSchema = new mongoose.Schema({
   barcode: {
    type: String,
    unique: true,
    required: true
  },
    name: {
        type: String,
        required: true,
    },
    brand: {
        type: String,
        default: ''
    },
    quantity:{
      type: Number,

    },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    
});


const Product = mongoose.model('Product', productSchema);
// Validate Create Product
function validateCreateProduct(obj) {
    const schema = Joi.object({
    });
    return schema.validate(obj);
  }
  
  // Validate Update Product
  function validateUpdateProduct(obj) {
    const schema = Joi.object({

    });
    return schema.validate(obj);
  }
  
  module.exports = {
    Product

  };
