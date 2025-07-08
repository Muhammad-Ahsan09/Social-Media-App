const { pool } = require("../database")

const postComment = async (req, res) => {
    try {
        const user_id = req.params.user_id;
        const post_id = req.params.post_id;

        const {comment} = req.body;

        await pool.query(`INSERT INTO comments(user_id, post_id, comment) values (?, ?, ?);`, [user_id, post_id, comment])

        res.json({message:"Commented successfully"})
    } catch (error) {
        console.log(error.message)
    }
}

const getComments = async (req, res) => {
    try {
        const post_id = req.params.post_id;

        const response = await pool.query(`SELECT users.full_name, users.username, users.profile_pic_url, comments.comment
         FROM users JOIN comments ON users.id = comments.user_id WHERE comments.post_id = ?;`, [post_id])

        const comments = response[0]

        res.json(comments)
    } catch (error) {
        console.log(error.message);
    }
}


module.exports = { postComment, getComments }