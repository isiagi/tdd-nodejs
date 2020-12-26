const express = require("express");
const UserRouter = require("./user/UserRouter");
const app = express();

app.use(express.json());
app.use(UserRouter);

module.exports = app;

// const user = Object.assign({}, req.body, { password: hash });
// const user = {
//   username: req.body.username,
//   email: req.body.email,
//   password: hash,
// };
