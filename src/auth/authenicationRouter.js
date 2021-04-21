const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const { findByEmail } = require("../user/UserService");
const AuthenticationException = require("./AuthenticationException");

router.post("/api/v1/auth", async (req, res, next) => {
  const { email, password } = req.body;
  const user = await findByEmail(email);
  if (!user) {
    return next(new AuthenticationException());
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return next(new AuthenticationException());
  }
  res.send({
    id: user.id,
    username: user.username,
  });
});

module.exports = router;
