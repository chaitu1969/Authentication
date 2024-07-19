const CustomError = require("./customError");

exports.dublicationErrorHandler = (err) => {
  //   const name = err.KeyValue.email;
  //   console.log(err);
  const message = `There is already data exist with values. please use another data`;
  return new CustomError(message, 400);
};
