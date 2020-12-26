const express = require("express");
const router = express.Router();
const { save } = require("./UserService");

router.post("/api/v1/users", async (req, res) => {
  const user = req.body;
  if (user.username === null) {
    return res.status(400).send({
      validationErrors: {
        username: "username should not be null",
      },
    });
  }
  await save(req.body);
  return res.send({ message: "user created" });
});

module.exports = router;
