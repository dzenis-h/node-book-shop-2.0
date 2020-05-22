const crypto = require("crypto");

const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator/check");
const mailer = require("../middleware/passwordReset");

const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
    },
    validationErrors: [],
  });
};

exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email,
        password,
      },
      validationErrors: errors.array(),
    });
  }

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(422).render("auth/login", {
        path: "/login",
        pageTitle: "Login",
        errorMessage: "Invalid email or password.",
        oldInput: {
          email,
          password,
        },
        validationErrors: [],
      });
    }

    const doMatch = await bcrypt.compare(password, user.password);
    if (doMatch) {
      req.session.isLoggedIn = true;
      req.session.user = user;
      return await req.session.save((err) => {
        if (err) console.log(err);
        res.redirect("/");
      });
    }
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      errorMessage: "Invalid email or password.",
      oldInput: {
        email,
        password,
      },
      validationErrors: [],
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    res.redirect("/login");
    return next(error);
  }
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: message,

    oldInput: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationErrors: [],
  });
};

exports.postSignup = async (req, res, next) => {
  const { email, password } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email,
        password,
        confirmPassword: req.body.confirmPassword,
      },
      validationErrors: errors.array(),
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email,
      password: hashedPassword,
      cart: { items: [] },
    });
    await user.save();
    res.redirect("/login");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) console.log(error);
    res.redirect("/");
  });
};

exports.getReset = (req, res, next) => {
  let errorMessage = req.flash("error");
  errorMessage.length > 0 ? (errorMessage = message[0]) : (errorMessage = null);

  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage,
  });
};

exports.postReset = async (req, res, next) => {
  const { email } = req.body;

  try {
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        console.log(err);
        return res.redirect("/reset");
      }
      const token = buffer.toString("hex");
      const user = await User.findOne({ email: email });
      if (!user) {
        req.flash("error", "No account with that email found.");
        return res.redirect("/reset");
      }
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000;
      req.flash("info", "Recovery email has been successfully sent!");
      await user.save();
      res.redirect("/");
      mailer.sendMail({
        to: req.body.email,
        from: "shop@node-books.com",
        subject: "Password reset",
        html: `
            <section style="background-color: black; color: white; border: 2px solid firebrick;">
            <h4>Did you requested a password reset?</h4>
            <p>If YES, please click this <a href="http://localhost:5000/reset/${token}">link</a> to set a new password.</p>
            <p>If you did NOT request a password change, we strongly suggest that you change your current password ASAP.</p>
            <h5 style="color: firebrick">NOTE: The link will expire an hour from now.</h5>
            </section>
            `,
      });
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getNewPassword = async (req, res, next) => {
  const { token } = req.params;
  try {
    const user = User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });
    let message = req.flash("error");
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    res.render("auth/new-password", {
      path: "/new-password",
      pageTitle: "New Password",
      errorMessage: message,
      userId: user._id.toString(),
      passwordToken: token,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postNewPassword = async (req, res, next) => {
  const { newPassword, passwordToken, userId } = req.body;

  try {
    let resetUser;

    const user = await User.findOne({
      resetToken: passwordToken,
      resetTokenExpiration: { $gt: Date.now() },
      _id: userId,
    });
    resetUser = user;
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    resetUser.password = hashedPassword;
    resetUser.resetToken = undefined;
    resetUser.resetTokenExpiration = undefined;
    await resetUser.save();
    res.redirect("/login");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
