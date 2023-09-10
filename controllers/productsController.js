const asyncHandler = require("express-async-handler");
const { Product } = require("../models/Product");

/**-----------------------------------------------
 * @desc    Create New Product
 * @route   POST /api/products
 * @method  POST
 * @access  private (only logged-in user)
 ------------------------------------------------*/
module.exports.createProductCtrl = asyncHandler(async (req, res) => {
  try {
    const product = await Product.create({
      link: req.body.link,
      name: req.body.name,
      brand: req.body.brand,
      sale_Price: req.body.sale_Price,
      user: req.user.id,
    });

    // Send response to the client
    res.status(201).json(product);
  } catch (error) {
    // Handle error and send an appropriate response
    console.error(error);
    res.status(500).json({ error: "Failed to create product." });
  }
});

/**-----------------------------------------------
 * @desc    Get All Products
 * @route   GET /api/products
 * @method  GET
 * @access  public
 ------------------------------------------------*/
module.exports.getAllProductsCtrl = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find();

    res.status(200).json(products);
  } catch (error) {
    // Handle error and send an appropriate response
    console.error(error);
    res.status(500).json({ error: "Failed to fetch products." });
  }
});

/**-----------------------------------------------
 * @desc    Get Single Product
 * @route   GET /api/products/:id
 * @method  GET
 * @access  public
 ------------------------------------------------*/
module.exports.getSingleProductCtrl = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("user", "username");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    // Handle error and send an appropriate response
    console.error(error);
    res.status(500).json({ error: "Failed to fetch product." });
  }
});

/**-----------------------------------------------
 * @desc    Get Products Count
 * @route   GET /api/products/count
 * @method  GET
 * @access  public
 ------------------------------------------------*/
module.exports.getProductCountCtrl = asyncHandler(async (req, res) => {
  try {
    const count = await Product.countDocuments();
    res.status(200).json(count);
  } catch (error) {
    // Handle error and send an appropriate response
    console.error(error);
    res.status(500).json({ error: "Failed to fetch product count." });
  }
});

/**-----------------------------------------------
 * @desc    Update Product
 * @route   PUT /api/products/:id
 * @method  PUT
 * @access  private (only owner of the product)
 ------------------------------------------------*/
module.exports.updateProductCtrl = asyncHandler(async (req, res) => {
  try {
    // Update Product
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          link: req.body.link,
          name: req.body.name,
          brand: req.body.brand,
          sale_Price: req.body.sale_Price,
        },
      },
      { new: true }
    ).populate("user", ["-password"]);

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Send response to the client
    res.status(200).json(updatedProduct);
  } catch (error) {
    // Handle error and send an appropriate response
    console.error(error);
    res.status(500).json({ error: "Failed to update product." });
  }
});
