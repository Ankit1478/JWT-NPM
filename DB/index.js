const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/Instagram");

const SignUp = new mongoose.Schema({
  username: String,
  password: String,
});

const postScheme = new mongoose.Schema({
  photoLink: String,
  likes: String,
  comment: String,
});

const User = mongoose.model("User", SignUp);
const post = mongoose.model("post", postScheme);

module.exports = {
  User,
  post,
};
