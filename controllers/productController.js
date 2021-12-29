const Product = require("../models/productModel");
const common = require("./common");
const helpers = require("../utils/helpers");
const AppError = require("../utils/appError");

exports.getAllProducts = common.getAll(Product);

exports.createProduct = helpers.catchAsync(async (req, res, next) => {
  product = {
    name: req.body.name,
    price: req.body.price,
    description: req.body.description,
    stock: req.body.stock,
    category: req.body.category,
  };

  const newProduct = await Product.create(product);

  helpers.success(res, 201, newProduct);
});

exports.updateProduct = helpers.catchAsync(async (req, res, next) => {
  const productId = req.params.id;
  const product = await Product.findByIdAndUpdate(productId, req.body, {
    runValidators: true,
    new: true,
  });

  if (!product) {
    return next(new AppError(404, "No document found with that Id."));
  }

  helpers.success(res, 201, product);
});

exports.getProduct = common.getOne(Product);

exports.deleteProduct = common.deleteOne(Product);

exports.getProductByCategory = helpers.catchAsync(async (req, res, next) => {
  const categoryName = req.params.name;

  const products = await Product.find({ category: categoryName });
  console.log(products);

  helpers.success(res, 200, products, true);
});
