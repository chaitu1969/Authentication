const mongoose = require("mongoose");

require("dotenv").config();

const url = process.env.DB_URL;

const db = async () => {
  await mongoose
    .connect(url)
    .then(() => {
      console.log("Database is connected");
    })
    .catch((err) => {
      console.log(`Unable to connect DB Error : ${err}`);
    });
};

module.exports = db;
