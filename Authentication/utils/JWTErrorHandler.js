const CustomError = require("./customError");

module.exports = (error) => {
  return new CustomError(`Invalid token please login again`, 401);
};
