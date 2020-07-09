const { request } = require("graphql-request");
const { createTypeormConn } = require("../utils/createTypeormConn");

const { host } = require("./constants");
const { User } = require("../entity/User");

beforeAll(async () => {
  await createTypeormConn();
});

const email = "tom@bob.com";
const password = "jalksdf";

const mutation = `
mutation {
  register(email: "${email}", password: "${password}")
}
`;

test("Register user", async () => {
  const response = await request(host, mutation);
  expect(response).toEqual({ register: true });
  const users = await User.find({ where: { email } });
  expect(users).toHaveLength(1);
  const user = users[0];
  expect(user.email).toEqual(email);
  expect(user.password).not.toEqual(password);
});
