const express = require("express");
const { createReadStream } = require("fs");
const { randomBytes } = require("crypto");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

/**
 * 1. Using signed cookies to prevent attackers from mocking a cookie.

 */

const COOKIE_SECRET = "kaldsjflkasjfdlkasjdflkjasldkfjalkdfjalksdjf";

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(COOKIE_SECRET));

const USERS = {
  alice: "password",
  bob: "hunter2",
};

const BALANCES = {
  alice: 500,
  bob: 100,
};

const SESSIONS = {};

app.get("/", (req, res) => {
  const sessionId = req.cookies.sessionId;
  const username = SESSIONS[sessionId];

  if (username) {
    const balance = BALANCES[username];
    res.send(`Hi ${username}. Your balance is $${balance}`);
  } else {
    createReadStream("index.html").pipe(res);
  }
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = USERS[username];

  if (req.body.password === password) {
    const nextSessionId = randomBytes(16).toString("base64");
    res.cookie("sessionId", nextSessionId);
    SESSIONS[nextSessionId] = username;
    res.redirect("/");
  } else {
    res.send("NOOOOOOOOOOOOO");
  }
});

app.get("/logout", (req, res) => {
  const sessionId = req.signedCookies.sessionId;

  delete SESSIONS[sessionId];

  res.clearCookie("sessionId");
  res.redirect("/");
});

app.listen(4000);
