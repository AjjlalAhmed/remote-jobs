// Impoting thing we need 
const sqlLite3 = require("sqlite3").verbose();
const db = new sqlLite3.Database("./db/remote_jobs.db");
module.exports = db;