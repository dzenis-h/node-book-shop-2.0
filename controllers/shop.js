const fs = require("fs");
const path = require("path");
const Product = require("../models/product");
const Order = require("../models/order");
const stripeConfig = require("stripe")(process.env.STRIPE_SECRET_KEY);
const PDFDocument = require("pdfkit");

exports.getProducts = async (req, res, next) => {
  try {
    const { data, pagination, count } = res.advancedResults;
    res.render("shop/product-list", {
      prods: data,
      pageTitle: "All Products",
      path: "/products",
      pagination,
      count,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(err);
  }
};

exports.getProduct = async (req, res, next) => {
  const { productId } = req.params;
  try {
    const product = await Product.findById(productId);
    res.render("shop/product-detail", {
      product,
      pageTitle: product.title,
      path: "/products",
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getIndex = async (req, res, next) => {
  try {
    const { data, pagination, count } = res.advancedResults;
    res.render("shop/index", {
      prods: data,
      pageTitle: "Shop",
      path: "/",
      pagination,
      count,
      success: req.flash("info")[0],
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getCart = async (req, res, next) => {
  try {
    const user = await req.user.populate("cart.items.productId").execPopulate();
    const products = user.cart.items;
    res.render("shop/cart", {
      path: "/cart",
      pageTitle: "Your Cart",
      products,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postCart = async (req, res, next) => {
  const { productId } = req.body;
  try {
    const product = await Product.findById(productId);
    await req.user.addToCart(product);
    res.redirect("/cart");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postCartDeleteProduct = async (req, res, next) => {
  const { productId } = req.body;
  try {
    await req.user.removeFromCart(productId);
    res.redirect("/cart");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postOrder = async (req, res, next) => {
  // Token is created using Checkout or Elements!
  // Get the payment token ID submitted by the form:
  const { stripeToken } = req.body; // Using Express
  let totalSum = 0;
  res.set({
    Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
  });

  try {
    const user = await req.user.populate("cart.items.productId").execPopulate();

    user.cart.items.forEach((p) => {
      totalSum += p.quantity * p.productId.price;
    });
    const products = user.cart.items.map((i) => {
      return { quantity: i.quantity, product: { ...i.productId._doc } };
    });
    const order = new Order({
      user: {
        email: req.user.email,
        userId: req.user,
      },
      products,
    });
    const result = await order.save();
    stripeConfig.charges.create({
      amount: parseInt(totalSum * 100),
      currency: "usd",
      description: "Demo Order",
      source: stripeToken,
      metadata: { order_id: result._id.toString() },
    });
    await req.user.clearCart();
    res.redirect("/orders");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ "user.userId": req.user._id });
    res.render("shop/orders", {
      path: "/orders",
      pageTitle: "Your Orders",
      orders,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getCheckout = async (req, res, next) => {
  try {
    const user = await req.user.populate("cart.items.productId").execPopulate();
    const products = user.cart.items;
    let total = 0;
    products.forEach((p) => {
      total += p.quantity * p.productId.price;
    });
    res.render("shop/checkout", {
      path: "/checkout",
      pageTitle: "Checkout",
      products,
      totalSum: total,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getInvoice = async (req, res, next) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return next(new Error("No order found."));
    }
    if (order.user.userId.toString() !== req.user._id.toString()) {
      return next(new Error("Unauthorized"));
    }
    const invoiceName = "invoice-" + orderId + ".pdf";
    const invoicePath = path.join("invoices", invoiceName);

    const pdfDoc = new PDFDocument();
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="' + invoiceName + '"',
    });

    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);

    pdfDoc
      .fillColor("firebrick")
      .font("Times-Italic")
      .fontSize(26)
      .text("Invoice", {
        underline: true,
        width: 410,
        align: "center",
      });
    pdfDoc.moveDown();

    pdfDoc.fillColor("black").text("Your items:");
    let totalPrice = 0;
    order.products.forEach((prod) => {
      totalPrice += prod.quantity * prod.product.price;
      pdfDoc
        .fontSize(16)
        .fillColor("green")
        .list([
          prod.product.title +
            " - " +
            prod.quantity +
            " x " +
            "$" +
            prod.product.price,
        ]),
        { list: "textIndent" };
    });

    pdfDoc.fontSize(19).moveDown(2).text("Total Price:", {
      align: "right",
    });
    pdfDoc
      .fontSize(24)
      .fillColor("firebrick")
      .moveDown(0)
      .text(`$ ${totalPrice}`, {
        align: "right",
      });

    pdfDoc.moveDown();

    pdfDoc.end();
  } catch (error) {
    next(error);
  }
};
