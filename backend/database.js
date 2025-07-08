const mysql = require("mysql2")

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    database: "instagram_clone",
    password: "mianmuhammad09"
}).promise()

module.exports = {pool}