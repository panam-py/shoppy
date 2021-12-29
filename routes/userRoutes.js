const express = require("express");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

const router = express.Router();

router.post("/signup", authController.signUp);
router.post("/login", authController.logIn);

router.use(authController.protectRoutes);

router
  .route("/me")
  .get(userController.getMe)
  .patch(userController.updateMe)
  .delete(userController.deleteMe);

router.patch("/add/:id", userController.addToCart);
router.patch("/remove/:id", userController.removeFromCart);

router.patch("/me/password", userController.changePassword);
router.patch("/checkout", userController.checkOut);

module.exports = router;
