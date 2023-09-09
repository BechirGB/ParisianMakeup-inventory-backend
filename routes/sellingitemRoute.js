const router = require("express").Router();
const {
    getsellingorderItemCtrl
  ,
  updateSellingOrderItemCtrl,
  getSinglesellingorderItemCtrl,
  deleteSellingorderitemCtrl

} = require("../controllers/sellingOrdersController");
const { verifyTokenAndAdmin } = require("../middlewares/verifyToken");
const validateObjectId = require("../middlewares/validateObjectId");

router
  .route("/")
  .get(getsellingorderItemCtrl);


  


router
  .route("/:sellingItemId")
  .put(updateSellingOrderItemCtrl)
  .get(getSinglesellingorderItemCtrl)
  .delete(deleteSellingorderitemCtrl)

  module.exports = router;
