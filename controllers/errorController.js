const AppError = require("../utils/appError");

// Handle MongoDB's cast error
const castError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(400, message);
};

// Handle invalid JWT error
const jwtError = () => {
  new AppError(401, "Invalid Token, Please log in again!");
};

// Handle expired JWT error
const tokenExpiredError = () => {
  new AppError(401, "Token expired, Please log in again!");
};

// Handle MongoDB's duplicate field error
const duplicateFieldsError = (err) => {
  const value = err.keyValue.name;
  const message = `Duplicate field value ${value} for ${err.keyValue}, Please use another value.`;
  return new AppError(400, message);
};

// Handle MongoDB's validation error
const validationError = (err) => {
  const errors = Object.values(err.errors).map((el) => {
    el.message;
  });
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(400, message);
};

const objectIdError = () => {
  return new AppError(400, "Invalid value passed for ObjectId");
};

// DEVELOPMENT ERROR FORMAT
const sendErrorDev = (err, req, res) => {
  // Send entire error details as a response
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// PRODUCTION ERROR FORMAT
const sendErrorProd = (err, req, res) => {
  // If error is operational (initiated by the AppError class), show some details about the error
  if (err.isOperational) {
    console.log(err);
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // If error is not operational return a generic message and log error to the console
  console.log(err);
  return res.status(500).json({
    status: "fail",
    message: "Something went wrong, Please try again later.",
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // If in development return the development error as a response and the production error if in production
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err }; // Copying the contents of the error into a new variable without causing changes
    // Check the various type of errors, handle them
    if (error.name === "CastError") {
      error = castError(error);
      sendErrorProd(error, req, res);
    }
    if (error.code === 11000) {
      error = duplicateFieldsError(error);
      sendErrorProd(error, req, res);
    }
    if (error.name === "ValidationError") {
      error = validationError(error);
      sendErrorProd(error, req, res);
    }
    if (error.name === "JsonWebTokenError") {
      error = jwtError();
      sendErrorProd(error, req, res);
    }
    if (error.name === "TokenExpiredEror") {
      error = tokenExpiredError();
      sendErrorProd(error, req, res);
    }
    if (error.kind === "ObjectId") {
      error = objectIdError();
      sendErrorProd(error, req, res);
    }
    sendErrorProd(err, req, res);
  }
};
