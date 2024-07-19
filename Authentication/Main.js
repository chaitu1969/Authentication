const express = require("express");
const db = require("./DB/db");
const BookRouter = require("./routes/bookroute");
const AuthRouter = require("./routes/AuthRouter");
const globalErrorHandler = require("./Controller/errorController");

const port = process.env.PORT || 4000;

const app = express();

app.use(express.json());

app.use("/api/v1/book", BookRouter);
app.use("/api/v1/user", AuthRouter);

app.use("*", (req, res, next) => {
  const err = new CustomError(
    `Can't find the ${req.originalUrl} on the server`,
    404
  );

  next(err);
});

app.use(globalErrorHandler);

db()
  .then(() => {
    app.listen(port, (err) => {
      err
        ? console.log(`Unable to connect to the server Error : ${err}`)
        : console.log(`Server is up and running on port : ${port}`);
    });
  })
  .catch((err) => console.log(`Error : ${err}`));
