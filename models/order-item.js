const mongoose = require('mongoose');

const orderItemSchema = mongoose.Schema({
 
   
   
    quantity: {
        type: Number,
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    price:{
        type: Number,
        required: true
        
    },
    
    discount: {
        type: Number,
        default: 0,
      },
    });
      orderItemSchema.set('toJSON', {
        virtuals: true,
      })
const OrderItem = mongoose.model('OrderItem', orderItemSchema);

module.exports= {
    OrderItem
};