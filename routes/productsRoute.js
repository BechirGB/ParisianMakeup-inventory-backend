const router = require("express").Router();
const {
  createProductCtrl,
  getAllProductsCtrl,
  getSingleProductCtrl,
  getProductCountCtrl,
  deleteProductCtrl,
  updateProductCtrl,
  updateProductImageCtrl,
} = require("../controllers/productsController");
const photoUpload = require("../middlewares/photoUpload");
const { verifyToken } = require("../middlewares/verifyToken");
const validateObjectId = require("../middlewares/validateObjectId");

// /api/Products
router
  .route("/")
  .post(verifyToken,createProductCtrl)
  .get(getAllProductsCtrl);

// /api/Products/count
router.route("/count").get(getProductCountCtrl);

// /api/Products/:id
router
  .route("/:id")
  .get(validateObjectId, getSingleProductCtrl)
  .put(validateObjectId, verifyToken, updateProductCtrl);



module.exports = router;
