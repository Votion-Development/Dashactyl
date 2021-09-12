const express = require("express");
const app = express();
const expressWs = require("express-ws")(app);
const ejs = require("ejs");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const { MongoClient } = require("mongodb");
const chalk = require("chalk");
const fetch = require('node-fetch');
const path = require('path');

const settings = require("./settings.json");
const CLIENT_ID = settings.discord.client_id
const CLIENT_SECRET = settings.discord.client_secret

//MongoDB Stuff

const store = new MongoDBStore({
  uri: settings.database.url,
  databaseName: settings.database.dbname,
  collection: "sessions",
});

const client = new MongoClient(settings.database.url);

async function dbconnect() {
  await client.connect();
  console.log(chalk.green('[DATABASE] Connected to the database'));
}
dbconnect()
const db = client.db(settings.database.dbname);
const users = db.collection('users');

// Catch errors
store.on("error", function (error) {
  console.log(error);
});

app.use(require('express-session')({
    secret: settings.website.secret,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
    store: store,
    resave: true,
    saveUninitialized: true,
  })
);

app.use(express.json({
  inflate: true,
  limit: '500kb',
  reviver: null,
  strict: true,
  type: 'application/json',
  verify: undefined
}));

app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, '/pages'));

app.use(express.static('public'))

/*
app.get("/", function (req, res) {
  res.send("Hello " + JSON.stringify(req.session));
});
*/

app.get("/", function (req, res) {
  if (settings.api.arcio.enabled === true) req.session.arcsessiontoken = Math.random().toString(36).substring(2, 15);
  res.render(`index`, { settings:settings, session:JSON.stringify(req.session) })
});

if (settings.api.arcio.enabled === true) {
  app.get("/arc-sw.js", function (req, res) {
    res.type('.js');
    res.send(`!function(t){var e={};function n(r){if(e[r])return e[r].exports;var o=e[r]={i:r,l:!1,exports:{}};return t[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=t,n.c=e,n.d=function(t,e,r){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:r})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var o in t)n.d(r,o,function(e){return t[e]}.bind(null,o));return r},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=93)}({3:function(t,e,n){"use strict";n.d(e,"a",(function(){return r})),n.d(e,"c",(function(){return o})),n.d(e,"g",(function(){return i})),n.d(e,"j",(function(){return a})),n.d(e,"i",(function(){return d})),n.d(e,"b",(function(){return f})),n.d(e,"k",(function(){return u})),n.d(e,"d",(function(){return p})),n.d(e,"e",(function(){return l})),n.d(e,"f",(function(){return m})),n.d(e,"h",(function(){return v}));var r={images:["bmp","jpeg","jpg","ttf","pict","svg","webp","eps","svgz","gif","png","ico","tif","tiff","bpg","avif","jxl"],video:["mp4","3gp","webm","mkv","flv","f4v","f4p","f4bogv","drc","avi","mov","qt","wmv","amv","mpg","mp2","mpeg","mpe","m2v","m4v","3g2","gifv","mpv","av1","ts","tsv","tsa","m2t","m3u8"],audio:["mid","midi","aac","aiff","flac","m4a","m4p","mp3","ogg","oga","mogg","opus","ra","rm","wav","webm","f4a","pat"],interchange:["json","yaml","xml","csv","toml","ini","bson","asn1","ubj"],archives:["jar","iso","tar","tgz","tbz2","tlz","gz","bz2","xz","lz","z","7z","apk","dmg","rar","lzma","txz","zip","zipx"],documents:["pdf","ps","doc","docx","ppt","pptx","xls","otf","xlsx"],other:["srt","swf"]},o=["js","cjs","mjs","css"],c="arc:",i={COMLINK_INIT:"".concat(c,"comlink:init"),NODE_ID:"".concat(c,":nodeId"),CLIENT_TEARDOWN:"".concat(c,"client:teardown"),CLIENT_TAB_ID:"".concat(c,"client:tabId"),CDN_CONFIG:"".concat(c,"cdn:config"),P2P_CLIENT_READY:"".concat(c,"cdn:ready"),STORED_FIDS:"".concat(c,"cdn:storedFids"),SW_HEALTH_CHECK:"".concat(c,"cdn:healthCheck"),WIDGET_CONFIG:"".concat(c,"widget:config"),WIDGET_INIT:"".concat(c,"widget:init"),WIDGET_UI_LOAD:"".concat(c,"widget:load"),BROKER_LOAD:"".concat(c,"broker:load"),RENDER_FILE:"".concat(c,"inlay:renderFile"),FILE_RENDERED:"".concat(c,"inlay:fileRendered")},a="serviceWorker",d="/".concat("shared-worker",".js"),f="/".concat("dedicated-worker",".js"),u="/".concat("arc-sw-core",".js"),s="".concat("arc-sw",".js"),p=("/".concat(s),"/".concat("arc-sw"),"arc-db"),l="key-val-store",m=2**17,v="".concat("https://warden.arc.io","/mailbox/propertySession");"".concat("https://warden.arc.io","/mailbox/transfers")},93:function(t,e,n){"use strict";n.r(e);var r=n(3);if("undefined"!=typeof ServiceWorkerGlobalScope){var o="https://arc.io"+r.k;importScripts(o)}else if("undefined"!=typeof SharedWorkerGlobalScope){var c="https://arc.io"+r.i;importScripts(c)}else if("undefined"!=typeof DedicatedWorkerGlobalScope){var i="https://arc.io"+r.b;importScripts(i)}}});`);
  });
};

app.get("/login", function (req, res) {
  if (req.session.isLoggedIn) res.redirect("/dashboard")
  res.redirect("https://discord.com/api/oauth2/authorize?client_id=886274617994535013&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback&response_type=code&scope=identify%20email")
});

app.get("/callback", async function (req, res) {
  if (!req.query.code) res.send("No code was provided!")
  const code = req.query.code;
  let json = await fetch(
    'https://discord.com/api/oauth2/token',
    {
      method: 'post',
      body: "client_id=" + CLIENT_ID + "&client_secret=" + CLIENT_SECRET + "&grant_type=authorization_code&code=" + encodeURIComponent(req.query.code) + "&redirect_uri=" + encodeURIComponent(settings.discord.oauth2.link + settings.discord.oauth2.callbackpath),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }
  );
  if (json.ok === true) {
    let codeinfo = JSON.parse(await json.text());
    let scopes = codeinfo.scope;
    let missingscopes = [];

    if (scopes.replace(/identify/g, "") == scopes) missingscopes.push("identify");
    if (scopes.replace(/email/g, "") == scopes) missingscopes.push("email");
    //if (newsettings.api.client.bot.joinguild.enabled == true) if (scopes.replace(/guilds.join/g, "") == scopes) missingscopes.push("guilds.join");
    if (missingscopes.length !== 0) return res.send("ERROR MISSINGSCOPES Scopes: " + missingscopes.join("%20"));
    let userjson = await fetch(
      'https://discord.com/api/users/@me',
      {
        method: "get",
        headers: {
          "Authorization": `Bearer ${codeinfo.access_token}`
        }
      }
    );
    let userinfo = JSON.parse(await userjson.text());
    console.log(userinfo)

    let check_if_banned = (await fetch(
      `https://discord.com/api/guilds/${settings.discord.guildID}/bans/${userinfo.id}`,
      {
        method: "get",
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bot ${settings.discord.bot.token}`
        }
      }
    )).status;

    if (check_if_banned == 200) {
      return res.send("You are banned from the hosts discord so you cannot use this dashboard.")
    } else if (check_if_banned == 404) {
      await fetch(
        `https://discord.com/api/guilds/${settings.discord.guildID}/members/${userinfo.id}`,
        {
          method: "put",
          headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bot ${settings.discord.bot.token}`
          },
          body: JSON.stringify({
            access_token: codeinfo.access_token
          })
        }
      );
    } else {
      console.log(chalk.red("[ERROR] The status code contacting discord was " + check_if_banned + ", instead of 200 or 404. This means that your machine has some serious internet issues."));
    }

    if (userinfo.verified == true) {
        
      let ip = (settings.ip["trust x-forwarded-for"] == true ? (req.headers['x-forwarded-for'] || req.connection.remoteAddress) : req.connection.remoteAddress);
      ip = (ip ? ip : "::1").replace(/::1/g, "::ffff:127.0.0.1").replace(/^.*:/, '');
      
      if (settings.ip.block.includes(ip)) return res.send("ERROR IP BLOCKED")

      const userInDB = await users.findOne({ userid: userinfo.id })

      if (userInDB === null) {
        let addedPanelUser_raw = await fetch(
          `${settings.pterodactyl.domain}/api/application/users`,
          {
            method: "post",
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${settings.pterodactyl.apikey}`, 'Accept': 'application/json' },
            body: JSON.stringify({
              "email": userinfo.email,
              "username": userinfo.id,
              "first_name": userinfo.username,
              "last_name": userinfo.discriminator
            }),
          }
        );

        const addedPanelUser = await addedPanelUser_raw.json()

        console.log(addedPanelUser.attributes.id)

        const addedUser = await users.insertMany([{ userid: userinfo.id, username: userinfo.username, useremail: userinfo.email, panelid: addedPanelUser.attributes.id, paneluuid: addedPanelUser.attributes.uuid, panelusercreatedat: addedPanelUser.attributes.created_at }]);
        console.log('Added a user to the database: ' + addedUser);
      }

      res.redirect(`/dashboard?token=${codeinfo.access_token}`);
    }
  }
});

app.get("/dashboard", function (req, res) {
  res.send("working")
});

app.get("/logout", function (req, res) {
  req.session.destroy()
  res.redirect("/")
});

const listener = app.listen(settings.website.port, function() {
  console.log(chalk.green("[WEBSITE] The dashboard has successfully loaded on port " + listener.address().port + "."));
});