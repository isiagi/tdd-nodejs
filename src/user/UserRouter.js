const express = require("express");
const router = express.Router();
const { save } = require("./UserService");
const { check, validationResult } = require("express-validator");

// const validateUserName = (req, res, next) => {
//   const user = req.body;
//   if (user.username === null) {
//     req.validationErrors = {
//       username: "username should not be null",
//     };
//   }
//   next();
// };
// const validateEmail = (req, res, next) => {
//   const user = req.body;
//   if (user.email === null) {
//     req.validationErrors = {
//       ...req.validationErrors,
//       email: "email cannot be null",
//     };
//   }
//   next();
// };

router.post(
  "/api/v1/users",
  check("username").notEmpty().withMessage("username should not be null"),
  check("email").notEmpty().withMessage("email cannot be null"),
  check("password").notEmpty().withMessage("password can not be null"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const validationErrors = {};
      errors
        .array()
        .forEach((error) => (validationErrors[error.param] = error.msg));
      // const response = { validationErrors: { ...req.validationErrors } };
      return res.status(400).send({ validationErrors });
    }
    await save(req.body);
    return res.send({ message: "user created" });
  }
);

module.exports = router;
