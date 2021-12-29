const AppError = require("../utils/appError");
const User = require("../models/userModel");
const helpers = require("../utils/helpers");
const Product = require("../models/productModel");

exports.getMe = (req, res, next) => {
  helpers.success(res, 200, req.user);
};

exports.updateMe = helpers.catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      email: req.body.email,
      username: req.body.username,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  updatedUser.password = undefined;

  helpers.success(res, 201, updatedUser);
});

exports.deleteMe = helpers.catchAsync(async (req, res, next) => {
  await User.findByIdAndDelete(req.user.id);
  helpers.success(res, 204, null);
});

exports.changePassword = helpers.catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (
    req.body.currentPassword &&
    req.body.newPassword &&
    req.body.newPasswordConfirm
  ) {
    if (!(await user.checkPassword(user.password, req.body.currentPassword))) {
      return next(new AppError(401, "Incorrect Password!"));
    }

    if (!(req.body.newPassword === req.body.newPasswordConfirm)) {
      return next(
        new AppError(400, "New password and new password confirm do not match")
      );
    }

    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.newPasswordConfirm;

    await user.save();

    return res.status(201).json({
      status: "success",
      message: "Password successfully updated",
    });
  }

  return next(
    new AppError(
      400,
      "Current password, new password and new password confirm fields must not be empty"
    )
  );
});

exports.addToCart = helpers.catchAsync(async (req, res, next) => {
  const productId = req.params.id;
  const product = await Product.findById(productId);

  if (!product) {
    return next(new AppError(404, "This product does not exist"));
  }

  const userCart = req.user.cart;
  let newUserCart = [];

  if (userCart.length < 1) {
    newUserCart.push(productId);
  } else {
    newUserCart = [...userCart];
    userCart.map((el) => {
      if (el.id === productId) {
        return next(new AppError(400, "Item already in cart"));
      } else {
        newUserCart.push(productId);
      }
    });
  }

  await User.findByIdAndUpdate(
    req.user.id,
    {
      cart: newUserCart,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(201).json({
    status: "success",
    message: "Item successfully added to cart",
  });
});

exports.removeFromCart = helpers.catchAsync(async (req, res, next) => {
  const productId = req.params.id;
  const product = await Product.findById(productId);

  if (!product) {
    return next(new AppError(404, "This product does not exist"));
  }

  const userCart = req.user.cart;
  const newUserCart = [];
  const truthArr = [];

  userCart.map((el) => {
    if (el.id === productId) {
      truthArr.push(true);
    } else {
      truthArr.push(false);
    }
  });

  if (!truthArr.includes(true)) {
    return next(new AppError(400, "Item not in cart!"));
  }

  userCart.map((el) => {
    if (!(el.id === productId)) {
      newUserCart.push(el);
    }
  });

  await User.findByIdAndUpdate(
    req.user.id,
    {
      cart: newUserCart,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(201).json({
    status: "success",
    message: "Item successfully removed from cart",
  });
});

exports.checkOut = helpers.catchAsync(async (req, res, next) => {
  const userCart = req.user.cart;
  const newUserCart = [];
  const userOrders = req.user.orders;
  let newUserOrders = [];

  if (userOrders.length < 1) {
    userCart.map((el) => {
      newUserOrders.push(el.id);
    });
  } else {
    newUserOrders = [...userOrders];
    userCart.map((el) => {
      newUserOrders.push(el.id);
    });
  }

  await User.findByIdAndUpdate(
    req.user.id,
    {
      cart: newUserCart,
      orders: newUserOrders,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(201).json({
    status: "success",
    message: "Checkout successful!",
  });
});
