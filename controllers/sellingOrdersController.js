const mongoose = require('mongoose');
const { SellingOrder } = require('../models/selling-order');
const { SellingOrderItem } = require('../models/sellingorder-item');
const asyncHandler = require("express-async-handler");
const { calculateQuantityInStock } = require('./quantityInStock');

/**-----------------------------------------------
 * @desc    Get All selling orders
 * @route   /api/sellingorders
 * @method  GET
 * @access  public
 ------------------------------------------------*/
 module.exports.getAllSellingordersCtrl = asyncHandler(async (req, res) => {
    const orders = await SellingOrder.find().populate({ path: 'sellingorderItems', populate: {
      path : 'product'} 
  }).populate("user","username").sort({'date': -1})
  const totalSales = await SellingOrder.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: "$totalPrice" },
      },
    },
  ]);

  let totalSalesValue = 0;

  if (totalSales.length > 0) {
    totalSalesValue = totalSales[0].total;
  }

    res.status(200).json({orders, totalSales : totalSalesValue});
  });
  /**-----------------------------------------------
   * @desc    Get Single SellingOrder
   * @route   /api/sellingorders/:id
   * @method  GET
   * @access  public
   ------------------------------------------------*/
   module.exports.getSingleSellingOrderCtrl = asyncHandler(async (req, res) => {
    try {
        const sellingOrder = await SellingOrder.findById(req.params.id)
            .populate({
                path: 'sellingorderItems',
                populate: { path: 'product' }
            });

        if (!sellingOrder) {
            res.status(404).json({ success: false });
        }
        res.send(sellingOrder);
    } catch (error) {
        res.status(500).json({ success: false });
    }
});
    

/**-----------------------------------------------
 * @desc    Create New Sellingorder
 * @route   /api/sellingorders
 * @method  POST
 * @access  private (only admin)
 ------------------------------------------------*/
 module.exports.createSellingOrderCtrl = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const sellingorderItems = req.body.sellingorderItems;

    const productsInStock = await calculateQuantityInStock();

    for (const sellingorderItemData of sellingorderItems) {
      const productInStock = productsInStock.find((product) =>
        product._id.equals(sellingorderItemData.product)
      );

      if (!productInStock) {
        return res.status(400).json({ message: 'Product not found in stock.' });
      }

      const availableQuantity = productInStock.quantity;
      if(!availableQuantity){
        return res.status(400).json({
          message:'Not enough quantity available in stock for this product.',
        });

      }

      if (sellingorderItemData.quantity > availableQuantity) {
        return res.status(400).json({
          message:'Not enough quantity available in stock for this product.',
        });
      }
      else{
        const sellingorderItemsIds = [];

        for (const sellingorderItemData of sellingorderItems) {
          const newSellingOrderItem = new SellingOrderItem({
            quantity: sellingorderItemData.quantity,
            product: sellingorderItemData.product,
            price: sellingorderItemData.price,
          });
    
          const savedSellingOrderItem = await newSellingOrderItem.save();
          sellingorderItemsIds.push(savedSellingOrderItem._id);
        }
    
        let totalPrice = 0;
    
        for (const sellingorderItemId of sellingorderItemsIds) {
          const sellingorderItem = await SellingOrderItem.findById(sellingorderItemId);
          totalPrice += sellingorderItem.price * sellingorderItem.quantity;
        }
    
        const sellingOrder = new SellingOrder({
          deliveryId: req.body.deliveryId,
          sellingorderItems: sellingorderItemsIds,
          user: req.user.id,
          totalPrice: totalPrice,
          date: req.body.date,
        });
    
        const savedSellingOrder = await sellingOrder.save({session});
        await session.commitTransaction();
        session.endSession();
        if (!savedSellingOrder) {
          return res.status(400).send('The SellingOrder cannot be created!');
        }
    
        res.send(savedSellingOrder);
      } 

      }
    }
    catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error(error);
      res.status(400).send({message:'Error creating the selling order. Please check your input data.'});
    }

  
});

/**-----------------------------------------------
 * @desc    Delete Sellingorder
 * @route   /api/sellingorders/:id
 * @method  DELETE
 * @access  private All
 ------------------------------------------------*/
 module.exports.deleteSellingorderCtrl = asyncHandler(async (req, res) => {
  const sellingorderId = req.params.id;

  const sellingorder = await SellingOrder.findById(sellingorderId);
  if (!sellingorder) {
    return res.status(404).json({ message: "Selling order not found" });
  }

  try {
    await SellingOrderItem.deleteMany({ _id: { $in: sellingorder.sellingorderItems } });

    await SellingOrder.deleteOne({ _id: sellingorderId });

    res.status(200).json({
      message: "Selling order has been deleted successfully",
      sellingorderId: sellingorderId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
  module.exports.totalSellingOrders= asyncHandler(async (req, res) => {
    const count = await SellingOrder.count();
    res.status(200).json(count);
  })
/**-----------------------------------------------
 * @desc    Update Selling Order
 * @route   /api/sellingorders/:id
 * @method  PUT
 * @access  private (only admin)
 ------------------------------------------------*/
 module.exports.updateSellingOrderCtrl = asyncHandler(async (req, res) => {
  try {
    const updatedSellingOrder = await SellingOrder.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          deliveryId: req.body.deliveryId,
          date: req.body.date,
        },
      },
      { new: true }
    )
      res.status(200).json(updatedSellingOrder);
    } catch (error) {
      res.status(500).json({ error: "Failed to update SellingOrder." });
    }
  })
/**-----------------------------------------------
 * @desc    Update Selling Order
 * @route   /api/sellingorders/:id
 * @method  PUT
 * @access  private (only admin)
 ------------------------------------------------*/
 module.exports.addNewSellingOrderItemCtrl= asyncHandler(async (req, res) => {
  
  try {
    const sellingOrder = await SellingOrder.findById(req.params.id);
    const productsInStock = await calculateQuantityInStock();

    if (!sellingOrder) {
      return res.status(404).send('Selling Order not found');
    }
    for (const sellingorderItemData of  req.body.sellingorderItems) {
      // Find the corresponding product in stock
      const productInStock = productsInStock.find((product) =>
        product._id.equals(sellingorderItemData.product)
      );

      if (!productInStock) {
        return res.status(400).json({ message: 'Product not found in stock.' });
      }

      const availableQuantity = productInStock.quantity;

      if (sellingorderItemData.quantity > availableQuantity) {
        return res.status(400).json({
          message:'Not enough quantity available in stock for this product.',
        });
      }
    }


    if (req.body.sellingorderItems && Array.isArray(req.body.sellingorderItems)) {
      const newSellingOrderItems = [];

      for (const sellingOrderItemData of req.body.sellingorderItems) {
        const newSellingOrderItem = new SellingOrderItem({
          quantity: sellingOrderItemData.quantity,
          product: sellingOrderItemData.product,
          price: sellingOrderItemData.price,
        });

        const savedSellingOrderItem = await newSellingOrderItem.save();
        newSellingOrderItems.push(savedSellingOrderItem._id);
      }

      sellingOrder.sellingorderItems = sellingOrder.sellingorderItems.concat(newSellingOrderItems);

      const totalPrices = await Promise.all(newSellingOrderItems.map(async (sellingorderItemId) => {
        const sellingorderItem = await SellingOrderItem.findById(sellingorderItemId);
        const totalPrice = sellingorderItem.price * sellingorderItem.quantity;
        return totalPrice;
      }));

      const totalPrice = totalPrices.reduce((a, b) => a + b, 0);
      sellingOrder.totalPrice += totalPrice; 
    }

    const updatedSellingOrder = await sellingOrder.save();

    res.status(200).json(updatedSellingOrder);

  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while adding new selling order items.');
  }
});

module.exports.getSellingOrderItemCtrl = asyncHandler(async (req, res) => {
  try {
    const sellingorderItems = await SellingOrderItem.find();
    res.send(sellingorderItems);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});
module.exports.getsellingorderItemCtrl=asyncHandler(async(req,res)=>{
  try {
    const sellingorderItems= await SellingOrderItem.find();
    res.send(sellingorderItems);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports.getSinglesellingorderItemCtrl = asyncHandler(async (req, res) => {
  try {
    // Find the order item by its ID
    const sellingorderItem = await SellingOrderItem.findById(req.params.sellingItemId);

    if (!sellingorderItem) {
      return res.status(404).send('Order item not found.');
    }

    res.send(sellingorderItem);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

function calculateUpdatedTotalPrice(sellingorderItem) {
  const totalPrice = (sellingorderItem.quantity * sellingorderItem.price )* 1;
  
  return totalPrice;
}

/**-----------------------------------------------
 * @desc    Update Selling Order Item
 * @route   PUT /api/sellingorderitems/:id
 * @method  PUT
 * @access  private (only admin)
 ------------------------------------------------*/
module.exports.updateSellingOrderItemCtrl = asyncHandler(async (req, res) => {
  try {
    const sellingorderItem = await SellingOrderItem.findByIdAndUpdate(
      req.params.sellingItemId,
      {
        $set: {
          quantity: req.body.quantity,
          price: req.body.price,
          product: req.body.product,
        },
      },
      { new: true }
    );

    if (!sellingorderItem) {
      return res.status(404).send('Order item not found.');
    }

    const updatedTotalPrice = calculateUpdatedTotalPrice(sellingorderItem);

    const order = await SellingOrder.findOneAndUpdate(
      { sellingorderItems: sellingorderItem._id },
      { $set: { totalPrice: updatedTotalPrice } },
      { new: true }
    );

    if (!order) {
      return res.status(404).send('Associated order not found.');
    }

    res.send(sellingorderItem);
  } catch (err) {
    console.error(err);

    if (err.message && err.message.startsWith('E11000 duplicate key error')) {
      return res.status(400).send('Duplicate key error. Check uniqueness constraints.');
    }

    res.status(500).send('Internal Server Error');
  }
})

 /**-----------------------------------------------
 * @desc    Delete SellingOrderItem
 * @route   /api/sellingorderitems/:id
 * @method  DELETE
 * @access  private (only admin)
 ------------------------------------------------*/
module.exports.deleteSellingorderitemCtrl = asyncHandler(async (req, res) => {
  try {
    const sellingorderItem = await SellingOrderItem.findById(req.params.sellingItemId);
    if (!sellingorderItem) {
      return res.status(404).json({ message: "Selling order item not found" });
    }

    const sellingOrder = await SellingOrder.findOne({ sellingorderItems: sellingorderItem._id });

    if (!sellingOrder) {
      return res.status(404).json({ message: "Associated SellingOrder not found" });
    }

    const deletedItemPrice = sellingorderItem.quantity * sellingorderItem.price;

    sellingOrder.totalPrice -= deletedItemPrice;

    sellingOrder.sellingorderItems = sellingOrder.sellingorderItems.filter(
      (itemId) => itemId.toString() !== sellingorderItem._id.toString()
    );

    await sellingOrder.save();

    await SellingOrderItem.findByIdAndDelete(req.params.sellingItemId);

    res.status(200).json({
      message: "Selling order item has been deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
/**-----------------------------------------------
 * @desc    Get SellinOrders between Two Dates and Calculate Total Purchase
 * @route   /api/selligorders/total
 * @method  GET
 * @access  public
 ------------------------------------------------*/
 module.exports.getSellingOrdersBetweenDatesCtrl = asyncHandler(async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = {};

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const sellingorders = await SellingOrder.find(query)
      .populate({
        path: 'sellingorderItems',
        populate: {
          path: 'product'
        }
      })
      .populate('user', 'username')
      .sort({ 'date': -1 });

    let totalSales = 0;

    if (startDate && endDate) {
      totalSales = await SellingOrder.aggregate([
        {
          $match: {
            date: {
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

      if (totalSales.length > 0) {
        totalSales = totalSales[0].total;
      } else {
        totalSales = 0;
      }
    } else {
      totalSales = await SellingOrder.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: "$totalPrice" },
          },
        },
      ]);

      if (totalSales.length > 0) {
        totalSales = totalSales[0].total;
      } else {
        totalSales = 0;
      }
    }

    res.status(200).json({ sellingorders, totalSales });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while fetching orders and calculating total purchase" });
  }
});
