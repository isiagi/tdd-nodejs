const User = require("./User");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const EmailService = require("./../email/emailService");
const sequelize = require("../config/database");
const emailException = require("../email/emailException");

const generateToken = (length) => {
  return crypto.randomBytes(length).toString("hex").substring(0, 16);
};

const save = async (body) => {
  const { username, email, password } = body;
  const hash = await bcrypt.hash(password, 10);
  const user = {
    username,
    email,
    password: hash,
    activationToken: generateToken(16),
  };
  const transaction = await sequelize.transaction();
  try {
    await User.create(user, { transaction });
    await EmailService.sendAccountActivation(email, user.activationToken);
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw new emailException();
  }
};

const activate = async (body) => {
  const user = await User.findOne({ where: { activationToken: body } });
  user.inactive = false;
  await user.save();
};

const getUsers = async (page, size) => {
  const users = await User.findAll({
    where: { inactive: false },
    attributes: ["id", "username", "email"],
    limit: size,
    offset: page * size,
  });
  const count = await User.count({ where: { inactive: false } });
  return {
    content: users,
    size,
    page,
    totalPages: Math.ceil(count / size),
  };
};

module.exports = {
  save,
  activate,
  getUsers,
};

//   bcrypt.hash(req.body.password, 10).then((hash) => {
//     const user = { ...req.body, password: hash };
//     User.create(user).then(() => {
//       return res.send({ message: "user created" });
//     });
//   });
