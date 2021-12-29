const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email field cannot be empty!"],
    unique: [true, "A user already exists with thos email"],
    validate: [validator.isEmail, "Please provide a valid email!"],
  },
  password: {
    type: String,
    required: [true, "Password field cannot be empty!"],
  },
  passwordConfirm: {
    type: String,
    required: [true, "Password must be confirmed!"],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: "Password confirm and password must match.",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  cart: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
    },
  ],
  orders: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
    },
  ],
  username: String,
});

userSchema.pre(/^find/, function (next) {
  this.populate({
    path: "cart",
    select: "-stock",
  }).populate({
    path: "orders",
    select: "-stock",
  });
  next();
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const newPassword = await bcrypt.hash(this.password, 12);
    this.password = newPassword;
    this.passwordConfirm = undefined;
    this.passwordChangedAt = Date.now() - 1000;
    next();
  }

  return next();
});

userSchema.methods.checkPassword = async function (
  correctPassword,
  candidatePassword
) {
  return await bcrypt.compare(candidatePassword, correctPassword);
};

userSchema.methods.changedPassAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimeStamp;
  }
  // False means not changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return token;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
