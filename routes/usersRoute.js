const router = require("express").Router();
const {
  getAllUsersCtrl,
  getUserProfileCtrl,
  updateUserProfileCtrl,
  getUsersCountCtrl,
  deleteUserProfileCtrl,
  enableDisableUserCtrl
} = require("../controllers/usersController");
const {
  verifyTokenAndAdmin,
  verifyTokenAndOnlyUser,
  verifyToken,
  verifyTokenAndAuthorization,
} = require("../middlewares/verifyToken");
const validateObjectId = require("../middlewares/validateObjectId");

// /api/users/profile
router.route("/profile").get(getAllUsersCtrl);

// /api/users/profile/profile-photo-upload

   
router.put('/enable-disable/:id', enableDisableUserCtrl);


// /api/users/profile/:id
router 
  .route("/profile/:id")
  .get(validateObjectId, getUserProfileCtrl)
  .put(validateObjectId, verifyTokenAndAdmin, updateUserProfileCtrl)
  .delete(validateObjectId, verifyTokenAndAuthorization,deleteUserProfileCtrl);

// /api/users/count
router.route("/count").get(verifyTokenAndAdmin, getUsersCountCtrl);

module.exports = router;
