const { Router } = require("express");
const router = Router();
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config.js");
const bcrypt = require("bcrypt");
const { User, post } = require("../DB");

router.post("/signup", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    username: username,
    password: hashedPassword,
  });
  res.json({
    message: "Admin Created Successfully",
  });
});

router.post("/signin", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (user) {
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      // Generate a JWT token
      const token = jwt.sign({ username }, JWT_SECRET);
      res.json({ msg: "Successfully signin", token });
    } else {
      res.json({ msg: "please Enter correct password" });
    }
  } else {
    res.json({
      msg: "You haven't sigup Yet ",
    });
  }
});

router.post("/posts", async (req, res) => {
  const token = req.headers.authorization; // Assuming the JWT token is in the Authorization header
  // Verify the JWT token
  const decodedToken = jwt.verify(token, JWT_SECRET);

  // Now you have the username from the token
  const username = decodedToken.username;

  // Fetch the user from the database
  const user = await User.findOne({ username });

  if (user) {
    // No need to compare password here since the user is already authenticated via the token

    // Create a new post using the Post model
    const newPost = await post.create({
      photoLink: req.body.photoLink,
      likes: req.body.likes,
      comment: req.body.comment,
      user: user._id, // Associate the post with the user
    });

    res.json({
      message: "Post Created Successfully",
      post: newPost,
    });
  } else {
    res.status(401).json({ msg: "User not found" });
  }
});
router.get("/allposts", async (req, res) => {
  const posts = await post.find({});
  res.json({ posts });
});

router.delete("/posts/:postId", async (req, res) => {
  const token = req.headers.authorization;
  const decodedToken = jwt.verify(token, JWT_SECRET);
  const username = decodedToken.username;
  const user = await User.findOne({ username });
  if (user) {
    const postId = req.params.postId;
    const posts = await post.findById(postId);

    if (posts.user && post.user.equals(user._id)) {
      await post.findByIdAndDelete(postId);
    }
    res.json({ msg: "your post Succesfully Deleted" });
  }
});
module.exports = router;
