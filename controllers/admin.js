const deleteFile = require("../middleware/upload").deleteFile;

const { validationResult } = require("express-validator/check");

const Product = require("../models/product");

exports.getProducts = (req, res, next) => {
  try {
    const { data, pagination, count } = res.advancedResults;
    res.render("admin/products", {
      prods: data,
      pageTitle: "Admin Products",
      path: "/admin/products",
      pagination,
      count,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getAddProduct = (req, res, next) => {
  res.render("admin/add_edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: [],
  });
};

exports.postAddProduct = async (req, res, next) => {
  const { title, price, description } = req.body;
  const image = req.file;

  if (!image) {
    return res.status(422).render("admin/add_edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      product: {
        title,
        price,
        description,
      },
      errorMessage: "Attached file is not an image.",
      validationErrors: [],
    });
  }
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/add_edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      product: {
        title,
        price,
        description,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  // We add '/' so it would create an absolute path and thanks to that the same image
  // will be accessible on both routes (index && admin)
  const imageUrl = `/${image.path}`;

  const product = new Product({
    title,
    price,
    description,
    imageUrl,
    userId: req.user,
  });
  try {
    await product.save();
    res.redirect("/admin/products");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getEditProduct = async (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const { productId } = req.params;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.redirect("/");
    }
    res.render("admin/add_edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: editMode,
      product,
      hasError: false,
      errorMessage: null,
      validationErrors: [],
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postEditProduct = async (req, res, next) => {
  const { productId, title, price, description } = req.body;
  const image = req.file;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("admin/add_edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: true,
      hasError: true,
      product: {
        title,
        price,
        description,
        _id: productId,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }
  try {
    const product = await Product.findById(productId);
    if (product.userId.toString() !== req.user._id.toString()) {
      return res.redirect("/");
    }
    product.title = title;
    product.price = price;
    product.description = description;
    if (image) {
      deleteFile.deleteFile(product.imageUrl);
      product.imageUrl = image.path;
    }
    await product.save();
    res.redirect("/admin/products");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postDeleteProduct = async (req, res, next) => {
  const { prodId } = req.params;
  try {
    const product = await Product.findById(prodId);
    if (!product) {
      return next(new Error("Product not found."));
    }
    deleteFile(product.imageUrl);
    await Product.deleteOne({ _id: prodId, userId: req.user._id });
    res.status(200).json({ message: "Product has been successfully deleted." });
  } catch (err) {
    res.status(500).json({ message: "Product couldn't be deleted." });
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
