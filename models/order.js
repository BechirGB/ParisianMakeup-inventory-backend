const mongoose = require ('mongoose');
const { OrderItem } = require('./order-item');

const orderSchema = mongoose.Schema({
    order_Id:{
        type:String,
        unique: true,
        required: true,

    },

    store:{
        type: String,
        required: true

    },
    orderItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderItem',
        required:true
    }],
   
    totalPrice: {
        type: Number,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true

    },
    dateOrdered: {
        type: Date,
    },
})

orderSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

orderSchema.set('toJSON', {
    virtuals: true,
});
orderSchema.pre('remove', async function (next) {
  try {
      await OrderItem.deleteMany({ _id: { $in: this.orderItems } });
      next();
  } catch (err) {
      next(err);
  }
});

const Order = mongoose.model('Order', orderSchema);
module.exports = {
    Order

  };

