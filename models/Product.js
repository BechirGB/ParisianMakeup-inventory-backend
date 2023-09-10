const mongoose = require('mongoose');
const Joi = require("joi");

const productSchema = new mongoose.Schema({

  
    name: {
        type: String,
        required: true,
    },
    brand: {
        type: String,
        default: ''
    },
    link:{
      type: String,


    },
 
    quantity:{
      type: Number,
      

    },
    sale_Price:{
      type: Number,

    },

      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    
});


const Product = mongoose.model('Product', productSchema);

  
  module.exports = {
    Product

  };
