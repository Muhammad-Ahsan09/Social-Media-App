const mysql = require("mysql2")

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    database: "instagram_clone",
    password: "your db password"
}).promise()

module.exports = {pool}