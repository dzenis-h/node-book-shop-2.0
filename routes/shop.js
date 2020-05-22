const express = require("express");

const shopController = require("../controllers/shop");
const isAuth = require("../middleware/is-auth");

const Product = require("../models/product");
const advancedResults = require("../middleware/advancedResults");

const router = express.Router();

router.get("/", advancedResults(Product), shopController.getIndex);

router.get("/products", advancedResults(Product), shopController.getProducts);

router.get("/products/:productId", shopController.getProduct);

router.get("/cart", isAuth, shopController.getCart);

router.post("/cart", isAuth, shopController.postCart);

router.post("/cart-delete-item", isAuth, shopController.postCartDeleteProduct);

router.get("/orders", isAuth, shopController.getOrders);

router.get("/checkout", isAuth, shopController.getCheckout);

router.get("/orders/:orderId", isAuth, shopController.getInvoice);

module.exports = router;
