const request = require("supertest");
const app = require("../src/app");
const sequelize = require("./../src/config/database");
const User = require("./../src/user/User");

beforeAll(async () => {
  await sequelize.sync();
});

beforeEach(() => {
  return User.destroy({ truncate: true });
});

const getUsers = () => {
  return request(app).get("/api/v1/users");
};

const addUsers = async (activeUserCount, inactiveUserCount = 0) => {
  for (let i = 0; i < activeUserCount + inactiveUserCount; i++) {
    await User.create({
      username: `user${i + 1}`,
      email: `user${i + 1}@gmail.com`,
      inactive: i >= activeUserCount,
    });
  }
};

describe("User listing", () => {
  it("Return 200 ok when there are no users in database", async () => {
    const response = await getUsers();
    expect(response.status).toBe(200);
  });

  it("Return page object has response body", async () => {
    const response = await getUsers();
    expect(response.body).toEqual({
      content: [],
      size: 10,
      page: 0,
      totalPages: 0,
    });
  });
  it("Return 10 users in content when there are 11 users in database", async () => {
    await addUsers(11);
    const response = await getUsers();
    expect(response.body.content.length).toBe(10);
  });
  it("Return 6 active users in content from the database when there a 5 inactive", async () => {
    await addUsers(6, 5);
    const response = await getUsers();
    expect(response.body.content.length).toBe(6);
  });
  it("Returns only id, username and email in content body", async () => {
    await addUsers(11);
    const response = await getUsers();
    const users = response.body.content[0];
    expect(Object.keys(users)).toEqual(["id", "username", "email"]);
  });
  it("Returns 2 as total pages when the a 15 active users and 7 inactive", async () => {
    await addUsers(15, 7);
    const response = await getUsers();
    expect(response.body.totalPages).toBe(2);
  });
  it("Returns second page users and page indicator when set to 1 in request parameter", async () => {
    await addUsers(11);
    const response = await request(app).get("/api/v1/users").query({ page: 1 });
    expect(response.body.content[0].username).toBe("user11");
    expect(response.body.page).toBe(1);
  });
  it("Returns first page when page is set below Zero in request parameter", async () => {
    await addUsers(11);
    const response = await request(app)
      .get("/api/v1/users")
      .query({ page: -5 });
    expect(response.body.page).toBe(0);
  });
  it("returns 5 users and corresponding page size when request is 5", async () => {
    await addUsers(11);
    const response = await request(app).get("/api/v1/users").query({ size: 5 });
    expect(response.body.content.length).toBe(5);
    expect(response.body.size).toBe(5);
  });
  it("returns 10 users and 10 corresponding size indicator when page is set at 1000", async () => {
    await addUsers(11);
    const response = await request(app)
      .get("/api/v1/users")
      .query({ size: 1000 });
    expect(response.body.content.length).toBe(10);
    expect(response.body.size).toBe(10);
  });
  it("returns 10 users and corresponding size indicator when page is set at 0", async () => {
    await addUsers(11);
    const response = await request(app).get("/api/v1/users").query({ size: 0 });
    expect(response.body.content.length).toBe(10);
    expect(response.body.size).toBe(10);
  });
  it("returns page as zero and size of 10 users when non-numeric query params are provided for both", async () => {
    await addUsers(11);
    const response = await request(app)
      .get("/api/v1/users")
      .query({ size: "size", page: "page" });
    expect(response.body.content.length).toBe(10);
    expect(response.body.page).toBe(0);
  });
});
