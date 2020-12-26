const express = require("express");
const router = express.Router();
const { save } = require("./UserService");

const validateUserName = (req, res, next) => {
  const user = req.body;
  if (user.username === null) {
    req.validationErrors = {
      username: "username should not be null",
    };
  }
  next();
};
const validateEmail = (req, res, next) => {
  const user = req.body;
  if (user.email === null) {
    req.validationErrors = {
      ...req.validationErrors,
      email: "email cannot be null",
    };
  }
  next();
};

router.post(
  "/api/v1/users",
  validateUserName,
  validateEmail,
  async (req, res) => {
    if (req.validationErrors) {
      const response = { validationErrors: { ...req.validationErrors } };
      return res.status(400).send(response);
    }
    await save(req.body);
    return res.send({ message: "user created" });
  }
);

module.exports = router;
