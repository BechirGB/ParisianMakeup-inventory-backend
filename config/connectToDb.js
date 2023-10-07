const mongoose = require("mongoose");
const { SellingOrder } = require("../models/selling-order");

module.exports = async () => {
  try {
    await mongoose.connect("mongodb+srv://bechir:ihhBD8RRlVZBArS2@booking.embdhsw.mongodb.net/ProjectManagement?retryWrites=true&w=majority");
    console.log("Connected To MongoDB ^_^");
  } catch (error) {
    console.log("Connection Failed To MongoDB!", error);
  }
};







