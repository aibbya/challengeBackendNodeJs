const User = require("../database/models/users");

module.exports.batchUsers = async (userIds) => {
  console.log("keys USer====", userIds);
  const users = await User.find({ _id: { $in: userIds } });
  return userIds.map((userId) => users.find((user) => user.id === userId));
};
