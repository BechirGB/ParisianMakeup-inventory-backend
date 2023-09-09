const router = require("express").Router();
const {
  createOrderCtrl,
  getAllordersCtrl,
  getSingleOrderCtrl,
  deleteOrderCtrl,
  updateOrderCtrl,
  totalPurchasesCtrl,
  userOrdersCtrl,
  addNewOrderItemCtrl,
  totalOrders,


} = require("../controllers/ordersController");
const { verifyTokenAndAdmin, verifyToken } = require("../middlewares/verifyToken");
const validateObjectId = require("../middlewares/validateObjectId");

// /api/orders
router
  .route("/")
  .post(verifyToken,createOrderCtrl)
  .get(getAllordersCtrl)
  .get(verifyTokenAndAdmin,totalOrders) 
  .get(verifyTokenAndAdmin,userOrdersCtrl)

  
  router.route("/count").get(totalOrders);
  router.route("/orderitems/:id").put( validateObjectId,verifyTokenAndAdmin,addNewOrderItemCtrl)

// /api/orders/:id
router
  .route("/:id")
  .get(validateObjectId,getSingleOrderCtrl)
  .delete(validateObjectId, verifyToken, deleteOrderCtrl)
  .put(validateObjectId,verifyToken,updateOrderCtrl)
module.exports = router;
