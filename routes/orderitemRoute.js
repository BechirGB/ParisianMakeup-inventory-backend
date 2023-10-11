const router = require("express").Router();
const {
 
  getOrderItemCtrl,
  UpdateorderItemCtrl,
  getSingleOrderItemCtrl,
  deleteOrderItemCtrl,
  getOrderItemByProductNameCtrl,

} = require("../controllers/ordersController");
const { verifyTokenAndAdmin } = require("../middlewares/verifyToken");
const validateObjectId = require("../middlewares/validateObjectId");

// /api/orders
router
  .route("/")
  .get(getOrderItemCtrl);

router.route('/product/:productName')
  .get(getOrderItemByProductNameCtrl)


// /api/orders/:id
router
  .route("/:orderItemId")
  .put(UpdateorderItemCtrl)
  .get(getSingleOrderItemCtrl)
  .delete(deleteOrderItemCtrl)

module.exports = router;
