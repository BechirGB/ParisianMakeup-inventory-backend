const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const passwordComplexity = require("joi-password-complexity");
const tokenDuration = 7200; // 2 hours in seconds

// User Schema
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 100,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 8,
    },
  
    isAdmin: {
        type:Boolean,
        default: false,
    },
    isEnabled: {
        type: Boolean,
        default: true, 
    },

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

UserSchema.virtual("products", {
    ref: "Product",
    foreignField: "user",
    localField: "_id",
});
UserSchema.virtual("orders", {
    ref: "Order",
    foreignField: "user",
    localField: "_id",
});
UserSchema.virtual("sellingorders", {
    ref: "SellingOrder",
    foreignField: "user",
    localField: "_id",
});




    UserSchema.methods.generateAuthToken = function() {
        return jwt.sign({ id: this._id, isAdmin: this.isAdmin }, process.env.JWT_SECRET, {
            expiresIn: tokenDuration,
          });}
const User = mongoose.model("User", UserSchema);

function validateRegisterUser(obj) {
    const schema = Joi.object({
        username: Joi.string().trim().min(2).max(100).required(),
        email: Joi.string().trim().min(5).max(100).required().email(),
        password: passwordComplexity().required(),
    });
    return schema.validate(obj);
}

// Validate Login User
function validateLoginUser(obj) {
    const schema = Joi.object({
        email: Joi.string().trim().min(5).max(100).required().email(),
        password: Joi.string().trim().min(8).required(),
    });
    return schema.validate(obj);
}

// Validate Update User
function validateUpdateUser(obj) {
    const schema = Joi.object({
        username: Joi.string().trim().min(2).max(100),
        password: passwordComplexity(),
    });
    return schema.validate(obj);
}

// Validate Email
function validateEmail(obj) {
    const schema = Joi.object({
        email: Joi.string().trim().min(5).max(100).required().email(),
    });
    return schema.validate(obj);
}

// Validate New Password
function validateNewPassword(obj) {
    const schema = Joi.object({
        password: passwordComplexity().required(),
    });
    return schema.validate(obj);
}

module.exports = {
    User,
    validateRegisterUser,
    validateLoginUser,
    validateUpdateUser,
    validateEmail,
    validateNewPassword
}

