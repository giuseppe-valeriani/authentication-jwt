const express = require("express");
const server = express();
const data = require("./data/data");
const { authenticateToken } = require("./middlewares/auth");

server.use(express.json());

server.get("/data", authenticateToken, (req, res) => {
  const personalData = data.filter((data) => data.name === req.user.name);
  return res.status(200).send(personalData);
});

server.listen(8080, () => console.log("Data Server running on 8080"));
