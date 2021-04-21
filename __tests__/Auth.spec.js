const request = require("supertest");
const app = require("../src/app");
const sequelize = require("./../src/config/database");
const User = require("./../src/user/User");
const bcrypt = require("bcrypt");

beforeAll(async () => {
  await sequelize.sync();
});

beforeEach(() => {
  return User.destroy({ truncate: true });
});

const addUser = async () => {
  const user = {
    username: "user1",
    email: "user1@mail.com",
    password: "p4ssword",
    inactive: false,
  };
  const hash = await bcrypt.hash(user.password, 10);
  user.password = hash;
  return await User.create(user);
};

const postAuthenication = async (credentials, options={}) => {
  return await request(app).post("/api/v1/auth").send(credentials);
};

describe("Authenication", () => {
  it("return 200 when correct credentials are passed", async () => {
    await addUser();
    const response = await postAuthenication({
      email: "user1@mail.com",
      password: "p4ssword",
    });
    expect(response.status).toBe(200);
  });
  it("returns only user id and username when login success", async () => {
    const user = await addUser();
    const response = await postAuthenication({
      email: "user1@mail.com",
      password: "p4ssword",
    });
    expect(response.body.id).toBe(user.id);
    expect(response.body.username).toBe(user.username);
    expect(Object.keys(response.body)).toEqual(["id", "username"]);
  });
  it("return 401 when user does not exist", async () => {
    const response = await postAuthenication({
      email: "user1@mail.com",
      password: "p4ssword",
    });
    expect(response.status).toBe(401);
  });
  it("return 401 when password is wrong", async () => {
    await addUser();
    const response = await postAuthenication({
      email: "user1@mail.com",
      password: "psword",
    });
    expect(response.status).toBe(401);
  });
});
