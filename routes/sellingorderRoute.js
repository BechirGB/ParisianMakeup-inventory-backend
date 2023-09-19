const router = require("express").Router();
const {
  createSellingOrderCtrl,
  getAllSellingordersCtrl,
  getSingleSellingOrderCtrl,
  addNewSellingOrderItemCtrl,
  updateSellingOrderCtrl,
  deleteSellingorderCtrl,
  totalSellingOrders,
} = require("../controllers/sellingOrdersController");
const {
  verifyTokenAndAdmin,
  verifyToken,
} = require("../middlewares/verifyToken");
const validateObjectId = require("../middlewares/validateObjectId");

// Routes for /api/SellingOrders
router.route("/")
  .post(verifyToken,createSellingOrderCtrl)
  .get(getAllSellingordersCtrl);

router.route("/count")
  .get(totalSellingOrders);

router.route("/sellingorderitems/:id")
  .put(verifyToken,addNewSellingOrderItemCtrl);

// Routes for /api/SellingOrders/:id
router.route("/:id")
  .get(getSingleSellingOrderCtrl)
  .put(verifyToken,updateSellingOrderCtrl)
  .delete(verifyToken, deleteSellingorderCtrl);

module.exports = router;

