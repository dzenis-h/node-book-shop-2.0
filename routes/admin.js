const express = require("express");
const { body } = require("express-validator/check");

const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");
const Product = require("../models/product");
const advancedResults = require("../middleware/advancedResults");

const router = express.Router();

router.get("/add-product", isAuth, adminController.getAddProduct);

router.get(
  "/products",
  isAuth,
  advancedResults(Product, true),
  adminController.getProducts
);

router.post(
  "/add-product",
  [
    body("title", "The title must be at least 3 characters long.")
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body("price", "The price must be a number.").isFloat(),
    body("description", "The description must be between 5 and 400 characters.")
      .isLength({ min: 5, max: 400 })
      .trim()
  ],
  isAuth,
  adminController.postAddProduct
);

router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

router.post(
  "/edit-product",
  [
    body("title", "The title must be at least 3 characters long.")
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body("price", "The price must be a number.").isFloat(),
    body("description", "The description must be between 5 and 400 characters.")
      .isLength({ min: 5, max: 400 })
      .trim()
  ],
  isAuth,
  adminController.postEditProduct
);

router.post("/delete-product", isAuth, adminController.postDeleteProduct);

module.exports = router;
