const asyncHandler = require("express-async-handler");
const { Order } = require("../models/order");
const { OrderItem } = require('../models/order-item');
const { User }= require('../models/User');
const quantityInStockController = require('../controllers/quantityInStock');

/**-----------------------------------------------
 * @desc    Create New order
 * @route   /api/orders
 * @method  POST
 * @access  private (only admin)
 ------------------------------------------------*/
module.exports.createOrderCtrl = asyncHandler(async (req, res) => {

  const orderItemsIds = Promise.all(req.body.orderItems.map(async (orderItem) =>{
    let newOrderItem = new OrderItem({
        quantity: orderItem.quantity,
        product: orderItem.product,
        discount:orderItem.discount,
        price:orderItem.price,
    })

    const productId = orderItem.product._id;
    quantityInStockController.calculateQuantityInStock(productId);

    const savedOrderItem = await newOrderItem.save();

    return savedOrderItem._id;

}))
const orderItemsIdsResolved =  await orderItemsIds;

const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemId)=>{
    const orderItem = await OrderItem.findById(orderItemId);
    const totalPrice = (orderItem.price * orderItem.quantity) -((orderItem.price * orderItem.quantity /100) * orderItem.discount) ;

    return totalPrice
}))

const totalPrice = totalPrices.reduce((a,b) => a +b , 0);

let order = new Order({
    order_Id:req.body.order_Id,
    store:req.body.store,
    orderItems: orderItemsIdsResolved,
    totalPrice: totalPrice,
    user: req.user.id,
    dateOrdered:req.body.dateOrdered
})
order = await order.save();

if(!order)
return res.status(400).send('the order cannot be created!')

res.send(order);

})

/**-----------------------------------------------
 * @desc    Get All orders
 * @route   /api/orders
 * @method  GET
 * @access  public
 ------------------------------------------------*/
 module.exports.getAllordersCtrl = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate({ 
      path: 'orderItems', 
      populate: {
        path: 'product'
      }
    })
    .populate("user", "username")
    .sort({ 'dateOrdered': -1 });

  const totalPurchase = await Order.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: "$totalPrice" },
      },
    },
  ]);

  let totalPurchaseValue = 0;

  if (totalPurchase.length > 0) {
    totalPurchaseValue = totalPurchase[0].total;
  }

  res.status(200).json({ orders, totalPurchase: totalPurchaseValue });
});

/**-----------------------------------------------
 * @desc    Get Single Order
 * @route   /api/orders/:id
 * @method  GET
 * @access  public
 ------------------------------------------------*/
 module.exports.getSingleOrderCtrl = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate({ 
    path: 'orderItems', populate: {
        path : 'product'}
    });

  
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  res.status(200).json(order);
});

/**-----------------------------------------------
 * @desc    Delete order
 * @route   /api/orders/:id
 * @method  DELETE
 * @access  private (only admin)
 ------------------------------------------------*/


module.exports.deleteOrderCtrl = asyncHandler(async (req, res) => {
  const orderId = req.params.id;

  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  const orderItemIds = order.orderItems.map(item => item.toString()); // Convert to strings
  await OrderItem.deleteMany({ _id: { $in: orderItemIds } });

  // Delete the order itself
  await Order.deleteOne({ _id: order._id });

  res.status(200).json({
    message: "Order has been deleted successfully",
    orderId: order._id,
  });
});

module.exports.updateOrderCtrl = asyncHandler(async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          order_Id:req.body.order_Id,
          store: req.body.store,
          dateOrdered: req.body.dateOrdered,
        },
      },
      { new: true }
    )

    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: "Failed to update Order." });
  }
})





module.exports.totalOrders= asyncHandler(async (req, res) => {
  const count = await Order.count();
  res.status(200).json(count);
})
module.exports.userOrdersCtrl= asyncHandler(async (req, res) => {

    const userOrderList = await Order.find({user: req.params.userid}).populate({ 
        path: 'orderItems', populate: {
            path : 'product'} 
        }).sort({'dateOrdered': -1});

    if(!userOrderList) {
        res.status(500).json({success: false})
    } 
    res.send(userOrderList);
  
})
module.exports.getOrderItemCtrl=asyncHandler(async(req,res)=>{
  try {
    const orderItems= await OrderItem.find();
    res.send(orderItems);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports.getSingleOrderItemCtrl = asyncHandler(async (req, res) => {
  try {
    const orderItem = await OrderItem.findById(req.params.orderItemId);

    if (!orderItem) {
      return res.status(404).send('Order item not found.');
    }

    res.send(orderItem);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports.UpdateorderItemCtrl = asyncHandler(async (req, res) => {
  try {
    const orderItem = await OrderItem.findByIdAndUpdate(
      req.params.orderItemId,
      {
        $set: {
          quantity: req.body.quantity,
          price: req.body.price,
          product: req.body.product,
          quantity_in_tunisia: req.body.quantity_in_tunisia,
          discount: req.body.discount,
        },
      },
      { new: true }
    );

    if (!orderItem) {
      return res.status(404).send('Order item not found.');
    }

    const updatedTotalPrice = calculateUpdatedTotalPrice(orderItem);

    const order = await Order.findOne({ orderItems: orderItem._id });

    if (!order) {
      return res.status(404).send('Order not found.');
    }

    const totalPrices = await Promise.all(
      order.orderItems.map(async (orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId);
        return calculateUpdatedTotalPrice(orderItem);
      })
    );

    const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

    order.totalPrice = totalPrice;
    await order.save();

    res.send(orderItem);
  } catch (err) {
    console.error(err);

    if (err.message && err.message.startsWith('E11000 duplicate key error')) {
      return res.status(400).send('Duplicate key error. Check uniqueness constraints.');
    }

    res.status(500).send('Internal Server Error');
  }
});



function calculateUpdatedTotalPrice(orderItem) {
  const totalPrice = 
    orderItem.quantity * orderItem.price * (1 - orderItem.discount / 100)* 1;
  return totalPrice;
}
/**-----------------------------------------------
 * @desc    Delete order item
 * @route   /api/orderitems/:id
 * @method  DELETE
 * @access  private (only admin)
 ------------------------------------------------*/
 module.exports.deleteOrderItemCtrl = asyncHandler(async (req, res) => {
  const orderItemId = req.params.orderItemId;

  const orderItem = await OrderItem.findById(orderItemId);

  if (!orderItem) {
    return res.status(404).json({ message: "Order item not found" });
  }

  const order = await Order.findOne({ orderItems: orderItemId });

  if (!order) {
    return res.status(404).json({ message: "Associated SellingOrder not found" });
  }

  const deletedItemPrice = (orderItem.price * orderItem.quantity) - ((orderItem.price * orderItem.quantity / 100) * orderItem.discount);

  order.totalPrice -= deletedItemPrice;

  order.orderItems = order.orderItems.filter(
    (itemId) => itemId.toString() !== orderItemId.toString()
  );

  await order.save();

  await OrderItem.findByIdAndDelete(orderItemId);

  res.status(200).json({
    message: "Order item has been deleted successfully",
    orderItemId: orderItem._id,
  });
});

module.exports.addNewOrderItemCtrl = asyncHandler(async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).send('Order not found');
    }

    if (req.body.orderItems && Array.isArray(req.body.orderItems)) {
      const newOrderItems = [];

      for (const orderItemData of req.body.orderItems) {
        const newOrderItem = new OrderItem({
          quantity: orderItemData.quantity,
          product: orderItemData.product,
          discount: orderItemData.discount,
          price: orderItemData.price,
        });

        const savedOrderItem = await newOrderItem.save();
        newOrderItems.push(savedOrderItem._id);
      }

      order.orderItems = order.orderItems.concat(newOrderItems);

      const totalPrices = await Promise.all(newOrderItems.map(async (orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId);
        const totalPrice = (orderItem.price * orderItem.quantity) - ((orderItem.price * orderItem.quantity / 100) * orderItem.discount);
        return totalPrice;
      }));

      const totalPrice = totalPrices.reduce((a, b) => a + b, 0);
      order.totalPrice += totalPrice; 
    }

    const updatedOrder = await order.save();

    res.status(200).json(updatedOrder);

  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while adding new order items.');
  }
});
/**-----------------------------------------------
 * @desc    Calculate Total Purchase between Two Dates
 * @route   /api/orders/total-purchase
 * @method  POST
 * @access  private (only admin)
 ------------------------------------------------*/
 module.exports.calculateTotalPurchaseCtrl = asyncHandler(async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Please provide start and end dates" });
    }

    const totalPurchase = await Order.aggregate([
      {
        $match: {
          dateOrdered: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalPrice" },
        },
      },
    ]);

    if (totalPurchase.length === 0) {
      return res.status(404).json({ message: "No orders found within the specified date range" });
    }

    res.status(200).json({ totalPurchase: totalPurchase[0].total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while calculating total purchase" });
  }
});
/**-----------------------------------------------
 * @desc    Get Orders between Two Dates and Calculate Total Purchase
 * @route   /api/orders/total
 * @method  GET
 * @access  public
 ------------------------------------------------*/
 module.exports.getOrdersBetweenDatesCtrl = asyncHandler(async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};

    if (startDate && endDate) {
      query.dateOrdered = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const orders = await Order.find(query)
      .populate({
        path: 'orderItems',
        populate: {
          path: 'product'
        }
      })
      .populate('user', 'username')
      .sort({ 'dateOrdered': -1 });

    let totalPurchase = 0;

    if (startDate && endDate) {
      totalPurchase = await Order.aggregate([
        {
          $match: {
            dateOrdered: {
              $gte: new Date(startDate),
              $lte: new Date(endDate),
            },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalPrice" },
          },
        },
      ]);

      if (totalPurchase.length > 0) {
        totalPurchase = totalPurchase[0].total;
      } else {
        totalPurchase = 0;
      }
    } else {
      totalPurchase = await Order.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: "$totalPrice" },
          },
        },
      ]);

      if (totalPurchase.length > 0) {
        totalPurchase = totalPurchase[0].total;
      } else {
        totalPurchase = 0;
      }
    }

    res.status(200).json({ orders, totalPurchase });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while fetching orders and calculating total purchase" });
  }
});
