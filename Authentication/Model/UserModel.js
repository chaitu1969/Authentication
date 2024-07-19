const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, "Name must required"],
    },
    email: {
      type: String,
      require: [true, "email must required"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please enter a valid email"],
    },
    photo: String,
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    password: {
      type: String,
      require: [true, "please provide a password"],
      minlength: [8, "Minimum password length is 8"],
      select: false,
    },
    conformPassword: {
      type: String,
      require: [true, "please conform your password"],
      minlength: [8, "Minimum password length is 8"],
      validate: {
        validator: function (value) {
          return value === this.password;
        },
        message: "Password and conform password is not match",
      },
    },
    passwordResetToken: String,
    passwordResetTokenExpire: Date,
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  // Encrypt password
  const salt = await bcrypt.genSalt(12);

  this.password = await bcrypt.hash(this.password, salt);

  this.conformPassword = undefined;
  next();
});

// userSchema.methods.comparePasswordInDb = async function (password, pswdDB) {
//   return await bcrypt.compare(password, pswdDB);
// };

/** Compares password : Promise */

userSchema.methods.comparePasswordInDb = async function (password, pswdDB) {
  return await bcrypt.compare(password, pswdDB);
};

/** checking isPasswordChanged : Boolean */

userSchema.methods.isPasswordChanged = async function (JWTtimestamp) {
  if (this.updatedAt) {
    const userTimestamp = parseInt(this.updatedAt.getTime() / 1000, 10);

    return JWTtimestamp < userTimestamp;
  }
  return false;
};

/** Generate a random token to rest Password : Any */

userSchema.methods.createResetPasswordToken = async function () {
  const resetToken = await crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = await crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetTokenExpire = Date.now() + 10 * 60 * 1000;

  // console.log(resetToken, this.passwordResetToken, Date.now());

  return resetToken;
};

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
