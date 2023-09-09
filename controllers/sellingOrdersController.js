// Import the required modules and models
const { SellingOrder } = require('../models/selling-order');
const { SellingOrderItem } = require('../models/sellingorder-item');
const asyncHandler = require("express-async-handler");

/**-----------------------------------------------
 * @desc    Get All orders
 * @route   /api/sellingorders
 * @method  GET
 * @access  public
 ------------------------------------------------*/
 module.exports.getAllSellingordersCtrl = asyncHandler(async (req, res) => {
    const orders = await SellingOrder.find().populate({ path: 'sellingorderItems', populate: {
      path : 'product'} 
  }).populate("user","username").sort({'date': -1})

    res.status(200).json(orders);
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
    try {
      const sellingorderItems = req.body.sellingorderItems; // Assuming you have sellingorderItems array in the request
  
      // Create selling order items and store their IDs
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
  
      const savedSellingOrder = await sellingOrder.save();
  
      if (!savedSellingOrder) {
        return res.status(400).send('The SellingOrder cannot be created!');
      }

  
      res.send(savedSellingOrder);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
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
      // Handle error and send an appropriate response
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

    if (!sellingOrder) {
      return res.status(404).send('Selling Order not found');
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
 * @desc    Delete order
 * @route   /api/orders/:id
 * @method  DELETE
 * @access  private (only admin)
 ------------------------------------------------*/
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
