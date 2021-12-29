const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const helpers = require("../utils/helpers");
const AppError = require("../utils/appError");
const { promisify } = require("util");
const bcrypt = require("bcryptjs");

const createAndSendToken = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token: token,
    data: { user },
  });
};

const verifyToken = async (token) => {
  return await promisify(jwt.verify)(token, process.env.JWT_SECRET_KEY);
};

exports.signUp = helpers.catchAsync(async (req, res, next) => {
  userDetails = {
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    username: req.body.username,
  };
  const newUser = await User.create(userDetails);

  createAndSendToken(newUser, 201, res);
});

exports.logIn = helpers.catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user || !(await user.checkPassword(user.password, req.body.password))) {
    return next(new AppError(401, "Invalid Email or Password"));
  }

  createAndSendToken(user, 200, res);
});

exports.protectRoutes = helpers.catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    const decodedToken = await verifyToken(token);

    const user = await User.findById(decodedToken.id);

    if (!user) {
      return next(
        new AppError(401, "The user who owns this token no longer exists!")
      );
    }

    if (user.changedPassAfter(decodedToken.iat)) {
      return next(
        new AppError(401, "User recently changed password! Please log in again")
      );
    }

    user.password = undefined;
    req.user = user;

    return next();
  } else {
    return next(
      new AppError(401, "You are not logged in, Please log in to continue")
    );
  }
});
