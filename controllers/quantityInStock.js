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
// Function to compare quantity and quantity_in_tunisia
async function compareQuantityInTunisia() {
  try {
    const orderItemsAg = await OrderItem.aggregate([
      {
        $group: {
          _id: { product: "$product" },
          totalQuantity: { $sum: "$quantity_in_tunisia" },
        },
      },
    ]);

    const sellingOrderItemsAggregate = await SellingOrderItem.aggregate([
      {
        $group: {
          _id: { product: "$product" },
          totalQuantity: { $sum: { $multiply: [-1, "$quantity_in_tunisia"] },
        },
      },
    },]);

    const combinedItems = _.groupBy(orderItemsAg.concat(sellingOrderItemsAggregate), '_id.product');

    const productQuantitiesInTunisia = _.mapValues(combinedItems, function (items) {
      if (items.length > 1) {
        const totalQuantity = items.reduce((total, item) => Number(total.totalQuantity) + Number(item.totalQuantity));
        return totalQuantity === 0; // Compare if totalQuantity is equal to 0
      } else {
        return items[0].totalQuantity === 0; // Compare if totalQuantity is equal to 0
      }
    });

    return productQuantitiesInTunisia;
  } catch (error) {
    console.error('Error comparing quantity in Tunisia:', error);
    throw error;
  }
}







module.exports = {
  calculateQuantityInStock,
  compareQuantityInTunisia,


};










