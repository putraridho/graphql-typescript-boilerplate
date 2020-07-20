const { request } = require("graphql-request");

const { User } = require("../../entity/User");
const { startServer } = require("../../startServer");
const {
  duplicateEmail,
  emailNotLongEnough,
  passwordNotLongEnough,
  invalidEmail,
} = require("./errorMessages");

let getHost = () => "";

beforeAll(async () => {
  const app = await startServer();
  const { port } = app.address();
  getHost = () => `http://127.0.0.1:${port}`;
});

const email = "tom@bob.com";
const password = "jalksdf";

const mutation = (e, p) => `
mutation {
  register(email: "${e}", password: "${p}") {
    path
    message
  }
}
`;

test("Register user", async () => {
  // make sure we can register email
  const response = await request(getHost(), mutation(email, password));
  expect(response).toEqual({ register: null });
  const users = await User.find({ where: { email } });
  expect(users).toHaveLength(1);
  const user = users[0];
  expect(user.email).toEqual(email);
  expect(user.password).not.toEqual(password);

  // test for duplicate emails
  const response2 = await request(getHost(), mutation(email, password));
  expect(response2.register).toHaveLength(1);
  expect(response2.register[0]).toEqual({
    path: "email",
    message: duplicateEmail,
  });

  // catch bad email
  const response3 = await request(getHost(), mutation("b", password));
  expect(response3).toEqual({
    register: [
      {
        path: "email",
        message: emailNotLongEnough,
      },
      {
        path: "email",
        message: invalidEmail,
      },
    ],
  });

  // catch bad password
  const response4 = await request(getHost(), mutation(email, "a"));
  expect(response4).toEqual({
    register: [
      {
        path: "password",
        message: passwordNotLongEnough,
      },
    ],
  });

  // catch bad email & password
  const response5 = await request(getHost(), mutation("a", "a"));
  expect(response5).toEqual({
    register: [
      {
        path: "email",
        message: emailNotLongEnough,
      },
      {
        path: "email",
        message: invalidEmail,
      },
      {
        path: "password",
        message: passwordNotLongEnough,
      },
    ],
  });
});
