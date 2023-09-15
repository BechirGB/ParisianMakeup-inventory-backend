const asyncHandler = require("express-async-handler");
const { User, validateUpdateUser } = require("../models/User");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");

const { Order } = require("../models/order");

/**-----------------------------------------------
 * @desc    Get All Users Profile
 * @route   /api/users/profile
 * @method  GET
 * @access  private (only admin)
 ------------------------------------------------*/
module.exports.getAllUsersCtrl = asyncHandler(async (req, res) => {
  const users = await User.find();
  res.status(200).json(users);
});

/**-----------------------------------------------
 * @desc    Get User Profile
 * @route   /api/users/profile/:id
 * @method  GET
 * @access  public
 ------------------------------------------------*/
module.exports.getUserProfileCtrl = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
   .select("password")
   .populate("products")
   ;

  if (!user) {
    return res.status(404).json({ message: "user not found" });
  }

  res.status(200).json(user);
});
/**-----------------------------------------------
 * @desc    Enable/Disable User Account
 * @route   /api/users/enable-disable/:id
 * @method  PUT
 * @access  private (admin only)
 ------------------------------------------------*/
 module.exports.enableDisableUserCtrl = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.isEnabled = !user.isEnabled; 

  await user.save();

  res.status(200).json({ message: `User account ${user.isEnabled ? 'enabled' : 'disabled'}` });
});


/**-----------------------------------------------
 * @desc    Update User Profile
 * @route   /api/users/profile/:id
 * @method  PUT
 * @access private (admin only)
 ------------------------------------------------*/
module.exports.updateUserProfileCtrl = asyncHandler(async (req, res) => {


  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        isAdmin: req.body.isAdmin,
      },
    },
    { new: true }
  ).select("-password")

  res.status(200).json(updatedUser);
});

/**-----------------------------------------------
 * @desc    Get Users Count
 * @route   /api/users/count
 * @method  GET
 * @access  private (only admin)
 ------------------------------------------------*/
module.exports.getUsersCountCtrl = asyncHandler(async (req, res) => {
  const count = await User.count();
  res.status(200).json(count);
});


/**-----------------------------------------------
 * @desc    Delete User Profile (Account)
 * @route   /api/users/profile/:id
 * @method  DELETE
 * @access  private (only admin or user himself)
 ------------------------------------------------*/
module.exports.deleteUserProfileCtrl = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "user not found" });
  }





 
  
  await Order.deleteMany({ user: user._id });

  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({ message: "your profile has been deleted" });
});
