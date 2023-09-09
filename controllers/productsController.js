const fs = require("fs");
const path = require("path");
const asyncHandler = require("express-async-handler");
const {
  Product
} = require("../models/Product");
const OrderItem = require("../models/order-item"); // Import your OrderItem model
const SellingOrderItem = require("../models/sellingorder-item"); 


/**-----------------------------------------------
 * @desc    Create New Product
 * @route   /api/products
 * @method  Product
 * @access  private (only logged in user)
 ------------------------------------------------*/
 module.exports.createProductCtrl = asyncHandler(async (req, res) => {
 
  // 4. Create new Product and save it to DB
  const product = await Product.create({
    barcode: req.body.barcode,
    name: req.body.name,
    brand: req.body.brand,
    user: req.user.id,
 
  });

  // 5. Send response to the client
  res.status(201).json(product);

});

/**-----------------------------------------------
 * @desc    Get All Products
 * @route   /api/Products
 * @method  GET
 * @access  public
 ------------------------------------------------*/
module.exports.getAllProductsCtrl = asyncHandler(async (req, res) => {
 
    products = await Product.find()
      .sort({ createdAt: -1 })
      .populate("user","username");
  
  res.status(200).json(products);
});

/**-----------------------------------------------
 * @desc    Get Single Product
 * @route   /api/Products/:id
 * @method  GET
 * @access  public
 ------------------------------------------------*/
module.exports.getSingleProductCtrl = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
  .populate("user", "username")
  
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.status(200).json(product);
});

/**-----------------------------------------------
 * @desc    Get Products Count
 * @route   /api/Products/count
 * @method  GET
 * @access  public
 ------------------------------------------------*/
module.exports.getProductCountCtrl = asyncHandler(async (req, res) => {
  const count = await Product.count();
  res.status(200).json(count);
})
/**-----------------------------------------------
 * @desc    Update Product
 * @route   PUT /api/Products/:id
 * @method  PUT
 * @access  private (only owner of the Product)
 ------------------------------------------------*/
 module.exports.updateProductCtrl = asyncHandler(async (req, res) => {
  try {
    // Update Product
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          barcode: req.body.barcode,
          name: req.body.name,
          brand: req.body.brand,
        },
      },
      { new: true }
    ).populate("user", ["-password"]);

    // Send response to the client
    res.status(200).json(updatedProduct);
  } catch (error) {
    // Handle error and send an appropriate response
    res.status(500).json({ error: "Failed to update product." });
  }
});
