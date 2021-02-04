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
  check("username")
    .notEmpty()
    .withMessage("username should not be null")
    .bail()
    .isLength({ min: 4, max: 32 })
    .withMessage("Must have a min : 4, max: 32 characters"),
  check("email")
    .notEmpty()
    .withMessage("email cannot be null")
    .bail()
    .isEmail()
    .withMessage("email is not valid"),
  check("password")
    .notEmpty()
    .withMessage("password can not be null")
    .bail()
    .isLength({ min: 6 })
    .withMessage("password must be atleast 6 characters"),
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
    try {
      await save(req.body);
      return res.send({ message: "user created" });
    } catch (error) {
      res.status(502).send({ message: "E-mail Failure" });
    }
  }
);

module.exports = router;
