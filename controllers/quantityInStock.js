const { OrderItem } = require('../models/order-item');
const { SellingOrderItem } = require('../models/sellingorder-item');
const _ = require('lodash');
const { Product } = require('../models/Product');

async function calculateQuantityInStock() {
  try {
    const orderItemsAggregate = await OrderItem.aggregate([
      {
        $group: {
          _id: { product: "$product" },
          totalQuantity: { $sum: "$quantity" },
        },
      },
    ]);

    const sellingOrderItemsAggregate = await SellingOrderItem.aggregate([
      {
        $group: {
          _id: { product: "$product" },
          totalQuantity: { $sum: { $multiply: [-1, "$quantity"] } },
        },
      },
    ]);
    const orderItemsAg = await OrderItem.aggregate([
      {
        $group: {
          _id: { product: "$product" },
          totalQuantity: { $sum: "$quantity_in_tunisia" },
        },
      },
    ]);

    
    const combinedItems2 = _.groupBy(orderItemsAg.concat(sellingOrderItemsAggregate), '_id.product');

    const productQuantity = _.mapValues(combinedItems2, function (items) {
      if (items.length > 1) {
        return items.reduce((total, item) => Number(total.totalQuantity) + Number(item.totalQuantity));
      } else {
        return items[0].totalQuantity;
      }
    });

    const combinedItems = _.groupBy(orderItemsAggregate.concat(sellingOrderItemsAggregate), '_id.product');

    const productQuantities = _.mapValues(combinedItems, function (items) {
      if (items.length > 1) {
        return items.reduce((total, item) => Number(total.totalQuantity) + Number(item.totalQuantity));
      } else {
        return items[0].totalQuantity;
      }
    });

    const productsInStock = await Product.find();

    for (const product of productsInStock) {
      const productId = product._id.toString();
      if (productQuantities.hasOwnProperty(productId)) {
        product.quantity = productQuantities[productId];
        product.quantity_in_tunisia= productQuantity[productId];

      }
    }

    return productsInStock;
  } catch (error) {
    console.error('Error calculating quantity in stock:', error);
    throw error;
  }
}







module.exports = {
  calculateQuantityInStock,


};










