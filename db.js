const settings = require("./settings.json");
const mysql = require("mysql");

if (settings.database.type.mysql.enabled === true) {
    const connection = mysql.createConnection({
        host: "localhost",
        user: "me",
        password: "secret",
        database: "my_db",
    });
} else if (settings.database.type.json.enabled === true) {

} else if (settings.database.type.mongodb.enabled === true) {
    
} else if (settings.database.type.sqlite.enabled === true) {
    
} else if (settings.database.type.mariadb.enabled === true) {
    
}