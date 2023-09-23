const router = require("express").Router();
const {
  createOrderCtrl,
  getAllordersCtrl,
  getSingleOrderCtrl,
  getOrdersBetweenDatesCtrl,
  deleteOrderCtrl,
  updateOrderCtrl,
  calculateTotalPurchaseCtrl,
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
  router.route("/orderitems/:id").put( validateObjectId,verifyTokenAndAdmin,addNewOrderItemCtrl);
  router.route("/total-purchase").post(calculateTotalPurchaseCtrl);
  router.route('/total').get(getOrdersBetweenDatesCtrl);

// /api/orders/:id
router
  .route("/:id")
  .get(validateObjectId,getSingleOrderCtrl)
  .delete(validateObjectId, verifyToken, deleteOrderCtrl)
  .put(validateObjectId,verifyToken,updateOrderCtrl)
module.exports = router;
