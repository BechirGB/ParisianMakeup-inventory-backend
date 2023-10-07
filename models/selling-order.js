const mongoose = require ('mongoose');
const { SellingOrderItem } = require('./sellingorder-item');
const { number } = require('joi');


const sellingorderSchema = mongoose.Schema({

    deliveryId:{
        type: String,
        unique:true

    },
    sellingorderItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SellingOrderItem',
        required:true
    }],
   
    totalPrice: {
        type: Number,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
  
    date: {
        type: Date,
    },
})

sellingorderSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

sellingorderSchema.set('toJSON', {
    virtuals: true,
});
sellingorderSchema.pre('remove', async function (next) {
    try {
      await SellingOrderItem.deleteMany({ _id: { $in: this.sellingorderItems } });
  
      next(); 
    } catch (error) {
      next(error); 
    }
  });

const SellingOrder = mongoose.model('SellingOrder', sellingorderSchema);
module.exports= {
    SellingOrder
};
