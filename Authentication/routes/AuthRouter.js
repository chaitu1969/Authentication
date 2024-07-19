const express = require("express");
const AuthController = require("../Controller/AuthController");
const AuthRouter = express.Router();

AuthRouter.route("/signup").post(AuthController.signup);
AuthRouter.route("/login").post(AuthController.login);
AuthRouter.route("/forgotPassword").post(AuthController.forgotPassword);
AuthRouter.route("/resetPassword:token").patch(AuthController.resetPassword);

module.exports = AuthRouter;
