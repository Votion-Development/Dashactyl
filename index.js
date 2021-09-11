"use strict";

// Hey! Use comments for everything you do.

// Load packages.

const fs = require("fs");
const yaml = require('js-yaml');
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require("ejs");
const session = require("express-session");
const expressWs = require('express-ws');
const rateLimit = require("express-rate-limit");



// Load settings.

process.env = yaml.load(fs.readFileSync('./settings.yml', 'utf8'));

if (process.env.pterodactyl.domain.slice(-1) == "/") process.env.pterodactyl.domain = process.env.pterodactyl.domain.slice(0, -1);

process.api_messages = yaml.load(fs.readFileSync('./api_messages.yml', 'utf8'));

// Loads database.

const db = require("./db.js");

const sqlite = require("better-sqlite3");
const SqliteStore = require("better-sqlite3-session-store")(session);
const session_db = new sqlite("sessions.db");

// Loads functions.

const functions = require("./functions.js");

// Loads page settings.

process.pagesettings = yaml.load(fs.readFileSync('./frontend/pages.yml', 'utf8')); // Loads "settings.yml" and loads the yaml file as a JSON.

setInterval(
  () => {
    process.pagesettings = yaml.load(fs.readFileSync('./frontend/pages.yml', 'utf8')); // This line of code is suppose to update any new pages.yml settings every minute.
  }, 60000
);

// Makes "process.db" have the database functions.

process.db = db;

// Make "process.functions" have the custom functions..

process.functions = functions;

// Start express website.

const app = express(); // Creates express object.
expressWs(app); // Creates app.ws() function, and does websocket stuff;

process.rateLimit = rateLimit;

app.use(express.json({ // Some settings for express.
  inflate: true,
  limit: '500kb',
  reviver: null,
  strict: true,
  //type: 'application/json',
  verify: undefined
}));



app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) { // https://stackoverflow.com/questions/53048642/node-js-handle-body-parser-invalid-json-error
      //console.error(err);
      res.status(400);
      return res.send({ error: "An error has occured when trying to handle the request." });
  }

  next();
});

app.use(session({
  secret: process.env.website.secret,
  resave: true,
  saveUninitialized: true,
  cookie: {
    secure: process.env.website.secure
  },
  store: new SqliteStore({
    client: session_db, 
    expired: {
      clear: true,
      intervalMs: 900000
    }
  })
}));

app.use(async (req, res, next) => {
  if (req.session.data) {
    let blacklist_status = await process.db.blacklistStatus(req.session.data.userinfo.id);
    if (blacklist_status && !req.session.data.panelinfo.root_admin) {
      delete req.session.data;
      functions.doRedirect(req, res, process.pagesettings.redirectactions.blacklisted);
      return;
    }
  }

  next();
});

const listener = app.listen(process.env.website.port, function() { // Listens the website at a port.
  console.log(`[WEBSITE] The application is now listening on port ${listener.address().port}.`); // Message sent when the port is successfully listening and the website is ready.

  let apifiles = fs.readdirSync('./handlers').filter(file => file.endsWith('.js') && file !== "pages.js"); // Gets a list of all files in the "handlers" folder. Doesn't add any "pages.js" to the array.
  apifiles.push("pages.js"); // Adds "pages.js" to the end of the array. (so it loads last, because it has a "*" request)

  apifiles.forEach(file => { // Loops all files in the "handlers" folder.
    let apifile = require(`./handlers/${file}`); // Loads the file.
    if (typeof apifile.load == "function") apifile.load(app, ifValidAPI, ejs); // Gives "app" to the file.
  });

});

/*
  ifValidAPI(req, res, permission);

  req = request
  res = response
  permissions = permission from settings.yml.
*/

function ifValidAPI(req, res, permission) {
  let auth = req.headers['authorization'];

  if (auth) {
    if (auth.startsWith("Bearer ") && auth !== "Bearer ") {
      let validkeys = Object.entries(process.env.api).filter(key => key[0] == auth.slice("Bearer ".length));
      if (validkeys.length == 1) {
        let validkey = validkeys[0][1];
        if (permission) {
          if (validkey[permission]) {
            return true;
          };

          res.status(403);
          res.send({ error: process.pagesettings.apimessages.missingAPIPermissions }); // Gets missingAPIPermissions message.

          return false;
        };

        return true;
      };
    };
  };

  res.status(403);
  res.send({ error: process.pagesettings.apimessages.invalidAPIkey }); // Gets invalidAPIkey message.

  return false;
};