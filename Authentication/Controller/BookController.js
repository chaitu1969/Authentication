const BookModel = require("../Model/BookModel");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const CustomError = require("../utils/customError");

exports.isExist = async (name) => {
  let isBookExist = await BookModel.findOne({ name });
  return isBookExist;
};

exports.createBook = asyncErrorHandler(async (req, res, next) => {
  let dataExist = await this.isExist(req.body.name);
  if (dataExist) {
    res.status(400).json({ message: "Book Data already exist" });
  }
  const newBook = new BookModel(req.body);
  const savedBook = await newBook.save();
  res.status(200).json(savedBook);
});

exports.getBook = asyncErrorHandler(async (req, res, next) => {
  let Books = await BookModel.find();
  if (!Books || Books.length === 0) {
    const error = new CustomError(
      "No Books are exist please try again later",
      404
    );
    return next(error);
  }
  res.status(200).json({ status: "Success", data: Books });
});

exports.getByName = asyncErrorHandler(async (req, res, next) => {
  const Book = await BookModel.findOne({ name: req.params.name });
  res.status(200).json({ status: "Success", data: Book });
});

exports.updateBook = asyncErrorHandler(async (req, res, next) => {
  const { author, price } = req.body;

  let isUpdated = await BookModel.findOneAndUpdate(
    { name: req.params.name },
    { author, price },
    { runValidators: true, new: true }
  );

  if (isUpdated === null || !isUpdated) {
    const error = new CustomError("Unable to update the document", 404);
    return next(error);
  }

  res.status(200).json({
    status: "Success",
    updatedDocument: isUpdated,
  });
});

exports.deleteBook = asyncErrorHandler(async (req, res, next) => {
  let name = req.params.name;

  const deletdBook = await BookModel.findOneAndDelete({ name });

  if (!deletdBook) {
    const error = new CustomError(
      "Not Found: The resource you are trying to delete does not exist",
      404
    );
    return next(error);
  }
  res.status(200).json({ DeletedBook: deletdBook });
});
