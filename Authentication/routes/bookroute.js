const express = require("express");
const BookRouter = express.Router();
const BookController = require("../Controller/BookController");
const AuthController = require("../Controller/AuthController");
// router.param("name", BookController.BookByName);

BookRouter.use(AuthController.protected);

BookRouter.route("/")
  .get(BookController.getBook)
  .post(AuthController.restrict("admin"), BookController.createBook);

BookRouter.route("/:name")
  .get(BookController.getByName)
  .put(BookController.updateBook)
  .delete(AuthController.restrict("admin"), BookController.deleteBook);

module.exports = BookRouter;
