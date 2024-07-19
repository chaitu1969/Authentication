const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "please provide the book name"],
      unique: true,
    },
    author: {
      type: String,
      required: [true, "Please provide the author name"],
    },
    price: {
      type: Number,
      required: [true, "Please provide the price of book"],
      min: [0, "price can't be negative"],
      validate: {
        validator: function (value) {
          return typeof value === "number" || isNaN(value);
        },
        message: (props) => `${props.value} is not a valid number`,
      },
    },
    rating: {
      type: Number,
      default: 1.0,
    },
  },
  { timestamps: true }
);

const BookModel = mongoose.model("Book", BookSchema);

BookModel.cre;

module.exports = BookModel;
