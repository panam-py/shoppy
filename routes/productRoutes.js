const express = require("express");
const productController = require("../controllers/productController");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

const router = express.Router();

router
  .route("/")
  .get(productController.getAllProducts)
  .post(productController.createProduct);

router.get("/category/:name", productController.getProductByCategory);

router
  .route("/:id")
  .get(productController.getProduct)
  .patch(productController.updateProduct)
  .delete(productController.deleteProduct);

router.use(authController.protectRoutes);



module.exports = router;
