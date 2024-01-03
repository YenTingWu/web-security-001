const express = require("express");
const { randomBytes } = require("crypto");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const escapeHTML = require("escape-html");

/**
 * 1. User html escape to bypass the code injection
 * 2.
 */

const COOKIE_SECRET = "kaldsjflkasjfdlkasjdflkjasldkfjalkdfjalksdjf";

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(COOKIE_SECRET));
app.use((_, res, next) => {
  res.set("X-XSS-Protection", 0);
  next();
});

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

  const source = escapeHTML(req.query.source);

  if (username) {
    const balance = BALANCES[username];
    res.send(`
        ${source ? `Hi, ${source} reader!` : ""}
        Hi ${username}. Your balance is $${balance}
        <form method="POST" action="/transfer">
          Send amount:
          <input name="amount" />
          To user:
          <input name="to" />
          <input type='submit' value='send' />  
        </form>
      `);
  } else {
    res.send(`
      <h1>
        Login to your bank account:
      </h1>
      <form method="POST" action="/login">
        Username:
        <input name="username" type="text" />
        Password:
        <input name="password" type="password" />
        <input type="submit" value="Login" />
      </form>
    `);
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

app.post("/transfer", (req, res) => {
  const sessionId = req.cookies.sessionId;
  const username = SESSIONS[sessionId];

  if (!username) {
    res.send("fail!").status(400);
    return;
  }

  const amount = Number(req.body.amount);
  const to = req.body.to;

  BALANCES[username] -= amount;
  BALANCES[to] += amount;

  res.redirect("/");
});

app.listen(4000);
