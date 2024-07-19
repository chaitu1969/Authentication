const CustomError = require("./customError");

module.exports = (error) => {
  return new CustomError(`JWT has expired. please login again`, 401);
};
