const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const rateLimiter = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const cookieParser = require("cookie-parser");

const errorController = require("./controllers/errorController");
const productRouter = require("./routes/productRoutes");
const userRouter = require("./routes/userRoutes");
const AppError = require("./utils/appError");

const app = express();

// SETTING UP ENVIRONMENT VARIABLES
dotenv.config({ path: "./config.env" });

// MIDDLEWARES

// Set security http
app.use(helmet());

// Limit requests per IP to 100 per hour
const limiter = rateLimiter({
  max: 100,
  windowsMs: 60 * 60 * 1000,
  messgae: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Parse requests
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// Data sanitization against NoSQL injection and xss
app.use(mongoSanitize());
// app.use(xss());

// ROUTES
app.use("/api/v1/products", productRouter);
app.use("/api/v1/users", userRouter);

// Handle not found routes
app.all("*", (req, res, next) => {
  next(
    new AppError(
      404,
      `This route ${req.originalUrl} deos not exist on this server`
    )
  );
});

// ERROR HANDLING
app.use(errorController);

module.exports = app;
