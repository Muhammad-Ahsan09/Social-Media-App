const dotenv = require("dotenv")

const mysql = require("mysql2")

dotenv.config()

const pool = mysql.createPool({
    host: process.env.TIDB_HOST,
    user: process.env.TIDB_USERNAME,
    database: process.env.TIDB_DATABASE,
    password: process.env.TIDB_PASSWORD,
    port: process.env.TIDB_PORT,

    ssl: {
        rejectUnauthorized: true
    }
}).promise()

module.exports = {pool}