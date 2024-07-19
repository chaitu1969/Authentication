const CustomError = require("./customError");

// utils/errorHandler.js
exports.handleValidationError = (err, res) => {
  // const errors = Object.keys(err.errors).map((val) => val.message);
  // console.log(error);
  // const errorMessage = errors.join("");
  const errorMessage = err.message;
  const msg = `Invalid input data: ${errorMessage}`;

  return new CustomError(msg, 400);
};

// utils/errorHandler.js
exports.handleCastError = (err, res) => {
  return res.status(400).json({
    status: "Failed",
    type: "Cast Error",
    message: `Invalid value "${err.value}" for field "${err.path}". Must be a valid number.`,
  });
};
