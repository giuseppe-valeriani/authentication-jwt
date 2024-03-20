require("dotenv").config();
const express = require("express");
const server = express();
const data = require("./data/data");
const jwt = require("jsonwebtoken");
const { generateAccessToken } = require("./middlewares/auth");

server.use(express.json());

server.post("/signup", (req, res) => {
  if (!req.body.name || !req.body.password) {
    return res
      .status(400)
      .json({ message: "Invalid request, please provide User and Password" });
  }
  const addUser = {
    name: req.body.name,
    info: req.body.info,
    password: req.body.password,
    role: "user",
  };
  try {
    data.push(addUser);
    return res.status(200).json(addUser);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

server.post("/login", (req, res) => {
  // Authentication with user and password
  if (
    data.find(
      (person) =>
        person.name === req.body.name && person.password === req.body.password
    )
  ) {
    // Create jwt token
    const user = { name: req.body.name };

    // const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
    const accessToken = generateAccessToken(user);
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
    refreshTokenList.push(refreshToken);

    return res
      .status(200)
      .json({ accessToken: accessToken, refreshToken: refreshToken });
  }
  return res.status(400).send("nope");
});

// This will be stored on a database in production, we don't want it refreshed every time
let refreshTokenList = [];

server.post("/token", (req, res) => {
  const refreshToken = req.body.token;
  if (!refreshToken) {
    return res.status(401).send("Unauthorized");
  }
  if (!refreshTokenList.includes(refreshToken)) {
    return res.status(403).send("Forbidden");
  }
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (error, user) => {
    if (error) {
      return res.status(403).send("Forbidden");
    }
    const accessToken = generateAccessToken({ name: user.name });
    return res.status(200).json({ accessToken: accessToken });
  });
});

server.delete("/logout", (req, res) => {
  refreshTokenList = refreshTokenList.filter(
    (token) => token !== req.body.token
  );
  return res.status(204).send("Logged out");
});

server.listen(7777, () => console.log("Auth Server running on 7777"));
