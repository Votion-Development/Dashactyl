const path = require("path");
const express = require("express");
const app = express();
const cors = require('cors');
const session = require('express-session');
const { loadWebconfig } = require('./lib/functions');
const webconfig = loadWebconfig();
const MongoDBStore = require('connect-mongodb-session')(session);
const log = require("./lib/logger")
require("./lib/database")

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors({
    origin: 'http://personal1.jmgcoding.com:3001',
    credentials: true,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}));

const store = new MongoDBStore({
    uri: webconfig.connection_uri,
    databaseName: webconfig.database,
    collection: 'sessions'
});

store.on('error', function (error) {
    log.error(error);
});

app.use(session({
    secret: webconfig.secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: webconfig.ssl
    },
    store: store
}))


app.use(express.static(path.resolve(__dirname, './frontend/build')));

app.use('/api', require("./router/index"));

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, './frontend/build', 'index.html'));
});

app.listen(3003, () => {
    log.web("Server started on port 3003");
});