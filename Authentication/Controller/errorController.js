const { dublicationErrorHandler } = require("../utils/dublicationErrorHandler");
const handleTokenExpireError = require("../utils/handleTokenExpireError");
const JWTErrorHandler = require("../utils/JWTErrorHandler");
const {
  handleValidationError,
  handleCastError,
} = require("../utils/ValidationError");

/** Development error */
const devErrors = (res, error) => {
  res.status(error.statusCode).json({
    status: error.statusCode,
    message: error.message,
    stackTree: error.stack,
    error: error,
  });
};

/** prodError */
const prodError = (res, error) => {
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.statusCode,
      message: error.message,
    });
  } else {
    res.status(500).json({
      status: "Error",
      message: "Something went wrong! Please try again later",
    });
  }
};

/** Global error handler middleware */

module.exports = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "Error";

  if (process.env.NODE_ENV === "development") {
    // console.log(error);
    if (error.name === "ValidationError")
      error = handleValidationError(error, res);

    devErrors(res, error);
  }
  if (process.env.NODE_ENV === "production") {
    if (error.code == 11000) error = dublicationErrorHandler(error);
    if (error.code == "CastError") error = handleCastError(error, res);
    if (error.name === "TokenExpiredError")
      error = handleTokenExpireError(error);
    if (error.name === "JsonWebTokenError") error = JWTErrorHandler(error);

    prodError(res, error);
  }
};
