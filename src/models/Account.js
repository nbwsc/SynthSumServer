const mongoose = require('mongoose');
const Account = mongoose.model(
  'Account',
  mongoose.Schema({
    username: { type: String, unique: true },
    password: String,
    name: String,
    roles: [],
  })
);

module.exports = { Account };
