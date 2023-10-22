const router = require("express").Router();
const {
  createSellingOrderCtrl,
  getAllSellingordersCtrl,
  getSingleSellingOrderCtrl,
  addNewSellingOrderItemCtrl,
  updateSellingOrderCtrl,
  deleteSellingorderCtrl,
  totalSellingOrders,
  getSellingOrdersBetweenDatesCtrl
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
  .get(verifyToken,totalSellingOrders);
router.route("/total")
 .get(verifyToken,getSellingOrdersBetweenDatesCtrl);

router.route("/sellingorderitems/:id")
  .put(verifyToken,addNewSellingOrderItemCtrl);

// Routes for /api/SellingOrders/:id
router.route("/:id")
  .get( getSingleSellingOrderCtrl)
  .put(updateSellingOrderCtrl)
  .delete(verifyToken, deleteSellingorderCtrl);

module.exports = router;

