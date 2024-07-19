const UserModel = require("../Model/UserModel");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const CustomError = require("../utils/customError");
const sendEmail = require("../utils/Email");

/** controller methods */

const jwtToken = (id) => {
  return jwt.sign({ id: id }, process.env.SECRET_STR, {
    expiresIn: process.env.LOGIN_EXPIRES,
  });
};

exports.signup = asyncErrorHandler(async (req, res, next) => {
  const newUser = await UserModel.create(req.body);

  // const token = await jwt.sign({ id: newUser._id }, process.env.SECRET_STR, {
  //   expiresIn: process.env.LOGIN_EXPIRES,
  // });

  const token = jwtToken({ id: newUser._id });

  res.status(201).json({
    status: "Success",
    JWTtoken: token,
    data: { user: newUser },
  });
});

exports.login = asyncErrorHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const error = new CustomError("Please provide all details", 400);
    return next(error);
  }

  // Check the user exist in DB or not

  const user = await UserModel.findOne({ email }).select("+password");

  // const isMatch = await user.comparePasswordinDb(password, user.password);

  if (!user || !(await user.comparePasswordInDb(password, user.password))) {
    const error = new CustomError("Incorrect email or password", 400);
    return next(error);
  }

  const token = jwtToken({ id: user._id });

  res.status(200).json({ status: "Success", token });
});

exports.protected = asyncErrorHandler(async (req, res, next) => {
  // 1 read the token $ check the request
  const testToken = req.headers.authorization;

  let token;

  if (testToken && testToken.startsWith("Bearer")) {
    token = testToken.split(" ")[1];
  }

  if (!token) {
    const error = new CustomError("you are not logged in ", 401);
    return next(error);
  }

  // validate the token
  const decode = jwt.verify(token, process.env.SECRET_STR);

  // If the user not exist in db but the token is not expired
  const user = await UserModel.findById(decode.id.id);

  if (!user) {
    const error = new CustomError("User not exist in Databse", 401);
    next(error);
  }

  // user changed password after token generated

  const ischanged = await user.isPasswordChanged(decode.iat);

  if (ischanged) {
    const error = new CustomError(
      "The password has been changed recently, Please login again",
      401
    );
    return next(error);
  }

  // Allow user to access route
  req.user = user;

  next();
});

// Authorize the user based on the role

exports.restrict = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      const error = new CustomError("user is not authorized", 403);
      next(error);
    }

    next();
  };
};

/** if there are multiple roles */

// exports.restrict = (...role) => {
//   return (req, res, next) => {
//     if (!role.includes(req.user.role)) {
//       const error = new CustomError("user is not authorized", 403);
//       next(error);
//     }

//     next();
//   };
// };

/**  End of checking multiple roles */

exports.forgotPassword = asyncErrorHandler(async (req, res, next) => {
  // 1. Generate user based on posted email

  const user = await UserModel.findOne({ email: req.body.email });

  if (!user) {
    const error = new CustomError(`user is not exist in Databse`, 401);
    next(error);
  }

  // 2. Generate A random reset token

  const resetToken = await user.createResetPasswordToken();

  // console.log(resetToken);

  await user.save({ validateBeforeSave: false });

  // 3. Send the token back to the user email

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}:/api/v1/users/resetPassword/${resetToken}`;
  const message = `We have received a password reset reqeuest. pleasee use the below link to reset your password \n\n ${resetUrl} \n\n this url is valid for 10 mintutes`;
  const subject = `Password reset url`;

  try {
    await sendEmail({ message: message, subject: subject, email: user.email });

    res.status(200).json({
      status: "success",
      message: "password reset link send successful",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpire = undefined;
    user.save({ validateBeforeSave: false });
    const err = new CustomError(
      "There was an error sending password reset email. please try again later",
      500
    );
    return next(err);
  }

  // res.status(200).json({ resetToken });
});

exports.resetPassword = asyncErrorHandler(async (req, res, next) => {
  const token = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await UserModel.findOne({
    passwordResetToken: token,
    passwordResetTokenExpire: { $gt: Date.now() },
  });

  if (!user) {
    const error = new CustomError("Token is invalid ot has expired ", 400);
    next(error);
  }

  user.password = req.body.password;
  user.conformPassword = req.body.conformPassword;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpire = undefined;

  await user.save();

  const jwtToken = jwtToken(user._id);

  res.status(200).json({ status: "Success", token: jwtToken });
});
