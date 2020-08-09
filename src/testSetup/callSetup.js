require("ts-node");

const { setup } = require("./setup");

module.exports = async () => {
  await setup();
  return null;
};
