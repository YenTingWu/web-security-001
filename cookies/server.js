const express = require("express");
const { createReadStream } = require("fs");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

/**
 * Using cookies to giving a session to the client
 */

const USERS = {
  alice: "password",
  bob: "hunter2",
};

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.get("/", (req, res) => {
  const username = req.cookies.username;

  if (username) {
    res.send(`Hi ${username}`);
  } else {
    createReadStream("index.html").pipe(res);
  }
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = USERS[username];

  if (req.body.password === password) {
    res.cookie("username", username);
    res.send("nice!");
  } else {
    res.send("NOOOOOOOOOOOOO");
  }
});

app.listen(4000);
