const express = require("express");
const router = express.Router();
const User = require("../models/user.model");
const { verify } = require("jsonwebtoken");
const { hash, compare } = require("bcryptjs");
const {
  createAccessToken,
  createRefreshToken,
  sendAccessToken,
  sendRefreshToken,
} = require("../security/tokens");
const { isAuth } = require("../security/isAuth");

router.post("/", async (req, res) => {
  try {
    const userId = isAuth(req);
    if (!userId) {
      res.send("Data is protected");
    }
  } catch (err) {
    res.send({
      error: `${err.message}`,
    });
  }
});

router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (username === "" || password === "")
    return res.json({ message: "Cannot empty data" });
  // check user exist
  var user = await User.findOne({ username: username });
  if (user) return res.json({ message: " User is exists" });
  const hashedPassword = await hash(password, 10);
  const doc = new User({
    username,
    password: hashedPassword,
  });
  try {
    await doc.save().then((response) => {
      if (response._id) {
        res.json({ ...response, message: "Tạo user thành công" });
        return;
      }
    });
  } catch (err) {
    res.send("Cannot create user");
  }
});

// 2. Login user
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  var user = await User.findOne({ username });
  if (!user) return res.send({ error: "User does not exist" });
  const valid = await compare(password, user.password);
  if (!valid) return res.send({ error: "Password is not correct" });

  // Create Refresh and Access token
  const accessToken = createAccessToken(user._id);
  const refreshToken = createRefreshToken(user._id);

  // Put the refreshtoken in the Database(MongoDB)
  user.refreshToken = refreshToken;
  await user.save().then(
    (res) => console.log("save refreshToken: ", res),
    (err) => console.log("err save refreshToken: ", err)
  );

  // Send token Refreshtoken as a cookie and accesstoken as a regular response
  sendRefreshToken(res, refreshToken);
  sendAccessToken(req, res, accessToken);
});

router.post("/protected", async (req, res) => {
  try {
    const userId = isAuth(req);
    if (!userId) {
      res.json("Data is protected");
    }
  } catch (err) {
    res.send({
      error: `${err.message}`,
    });
  }
});

// 5. Get a new access token with a refresh token
router.post("/refresh_token", async (req, res) => {
  const token = req.cookies.refreshToken;
  // If we don't have a token in our request
  if (!token) {
    return res.send({
      accessToken: "1",
      error: "1",
    });
  }

  // We have a token, let's verify it!
  let payload = null;
  try {
    payload = verify(token, process.env.REFRESH_TOKEN_SECRECT);
  } catch (err) {
    return res.send({
      accessToken: "",
      error: "2",
    });
  }

  // Token is valid, check if user exist
  const user = await User.findById(payload.userId);
  if (!user) return res.send({ accessToken: "", error: "3" });
  // User exist, check if refreshtoken exist on user
  if (user.refreshToken !== token) {
    return res.send({
      accesstoken: "",
      error: "4",
    });
  }
  // Token exist, create new Refresh and Access token
  const accessToken = createAccessToken(user.id);
  const refreshToken = createRefreshToken(user.id);
  user.refreshToken = refreshToken;
  await user.save();
  // All good to go, send new refreshtoken and accesstoken
  sendRefreshToken(res, refreshToken);
  return res.send({ accessToken });
});
module.exports = router;
