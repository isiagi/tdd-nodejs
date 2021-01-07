const request = require("supertest");
const app = require("../src/app");
const User = require("./../src/user/User");
const sequelize = require("./../src/config/database");
const nodeMailerStub = require("nodemailer-stub");

beforeAll(() => {
  return sequelize.sync();
});

beforeEach(() => {
  return User.destroy({ truncate: true });
});

const postUser = {
  username: "isiagi",
  email: "isiagi@gmail.com",
  password: "pa$$w0rd1",
};

const validUser = (user = postUser) => {
  return request(app).post("/api/v1/users").send(user);
};

describe("User Registration", () => {
  it("returns 200 ok when signup is valid", async () => {
    // validUser().then((response) => {
    //   expect(response.status).toBe(200);
    //   done();
    const response = await validUser();
    expect(response.status).toBe(200);
  });

  // .expect(200, done);

  it("returns message when signup is valid", async () => {
    const response = await validUser();
    expect(response.body.message).toBe("user created");
  });

  it("saves the user to database", async () => {
    await validUser();
    const all = await User.findAll();
    expect(all.length).toBe(1);
  });

  it("saves username and email to database", async () => {
    await validUser();
    const all = await User.findAll();
    expect(all[0].username).toBe("isiagi");
    expect(all[0].email).toBe("isiagi@gmail.com");
  });

  it("hashes the password in database", async () => {
    await validUser();
    const all = await User.findAll();
    expect(all[0].password).not.toBe("pa$$w0rd1");
  });

  it("returns 400 when username is null", async () => {
    const response = await validUser({
      username: null,
      email: "isiagi@gmail.com",
      password: "pa$$w0rd",
    });
    expect(response.status).toBe(400);
  });

  it("return validationError when error occurs", async () => {
    const response = await validUser({
      username: null,
      email: "isiagi@gmail.com",
      password: "pa$$w0rd1",
    });
    const body = response.body;
    expect(body.validationErrors).not.toBeUndefined();
  });

  it("returns 400 when email is null", async () => {
    const response = await validUser({
      username: "isiagi",
      email: null,
      password: "pa$$w0rd1",
    });
    expect(response.status).toBe(400);
  });

  it("returns E-mail and Username are null when a null value is sent", async () => {
    const response = await validUser({
      username: null,
      email: null,
      password: "pa$$w0rd1",
    });
    const body = response.body;
    expect(Object.keys(body.validationErrors)).toEqual(["username", "email"]);
  });

  it("set user inactive", async () => {
    await validUser();
    const users = await User.findAll();
    const savedUser = users[0];
    expect(savedUser.inactive).toBe(true);
  });

  it("set user inactive to false when user is create", async () => {
    const newUser = { ...postUser, inactive: false };
    await validUser(newUser);
    const users = await User.findAll();
    const savedUser = users[0];
    expect(savedUser.inactive).toBe(true);
  });

  it("creates an activationToken for user", async () => {
    await validUser();
    const users = await User.findAll();
    const savedUser = users[0];
    expect(savedUser.activationToken).toBeTruthy();
  });

  it("send account activation mail with accountToken", async () => {
    await validUser();
    const lastMail = nodeMailerStub.interactsWithMail.lastMail();
    expect(lastMail.to[0]).toBe("isiagi@gmail.com");
    const users = await User.findAll();
    const savedUser = users[0];
    expect(lastMail.content).toContain(savedUser.activationToken);
  });

  it.each`
    field         | value                | expectedMessage
    ${"email"}    | ${null}              | ${"email cannot be null"}
    ${"email"}    | ${"mail.com"}        | ${"email is not valid"}
    ${"email"}    | ${"isiagi.mail.com"} | ${"email is not valid"}
    ${"email"}    | ${"isiagi@mail"}     | ${"email is not valid"}
    ${"username"} | ${null}              | ${"username should not be null"}
    ${"username"} | ${"isi"}             | ${"Must have a min : 4, max: 32 characters"}
    ${"username"} | ${"isi".repeat(33)}  | ${"Must have a min : 4, max: 32 characters"}
    ${"password"} | ${null}              | ${"password can not be null"}
    ${"password"} | ${"pa$$w"}           | ${"password must be atleast 6 characters"}
  `(
    "returns $expectedMessage when $field is $value",
    async ({ field, expectedMessage, value }) => {
      const user = {
        username: "isiagi",
        email: "isiagi@gmail.com",
        password: "pa$$w0rd1",
      };
      user[field] = value;
      const response = await validUser(user);
      const body = response.body;
      expect(body.validationErrors[field]).toBe(expectedMessage);
    }
  );
});
// it("returns size validation error when less than 4 characters", async () => {
//   const user = {
//     username: "isi",
//     email: "isiagi@gmail.com",
//     password: "pa$$w0rd",
//   };
//   const response = await validUser(user);
//   const body = response.body;
//   expect(body.validationErrors.username).toBe(
//     "Must have a min : 4, max: 32 characters"
//   );
// });

// it.each([
//   ["email", "email cannot be null"],
//   ["username", "username should not be null"],
//   ["password", "password can not be null"],
// ])("when %s is null %s is recievied", async (field, expectedMessage) => {
//   const user = {
//     username: "isiagi",
//     email: "isiagi@gmail.com",
//     password: "pa$$w0rd",
//   };
//   user[field] = null;
//   const response = await validUser(user);
//   const body = response.body;
//   expect(body.validationErrors[field]).toBe(expectedMessage);
// });
//   it("returns E-mail is null when Emal is null", async () => {
//     const response = await validUser({
//       username: "isiagi",
//       email: null,
//       password: "pa$$w0rd",
//     });
//     const body = response.body;
//     expect(body.validationErrors.email).toBe("email cannot be null");
//   });

//   it("returns username is null username is null", async () => {
//     const response = await validUser({
//       username: null,
//       email: "isiagi@gmail.com",
//       password: "pa$$w0rd",
//     });
//     const body = response.body;
//     expect(body.validationErrors.username).toBe("username should not be null");
//   });

//   it("returns password is null when a null value is sent", async () => {
//     const response = await validUser({
//       username: "user1",
//       email: "user1@mail.com",
//       password: null,
//     });
//     const body = response.body;
//     expect(body.validationErrors.password).toBe("password can not be null");
//   });

// validUser().then(() => {
//   User.findAll().then((userList) => {
//     const savedUser = userList[0];
//     expect(savedUser.password).not.toBe("pa$$w0rd");
//     done();
//   });
// });

// some
// validUser().then(() => {
//   User.findAll().then((userList) => {
//     const savedUser = userList[0];
//     expect(savedUser.username).toBe("isiagi");
//     expect(savedUser.email).toBe("isiagi@gmail.com");
//     done();
//   });
// });
