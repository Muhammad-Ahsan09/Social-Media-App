const { pool } = require("../database")

const getSearchResults = async (req, res) => {
    try {
        const {search_query} = req.params;

        
        const posts = await pool.query(`
        SELECT posts.id, posts.user_id, posts.description, posts.imageUrl, posts.likes,
        users.profile_pic_url, users.full_name FROM posts JOIN users ON posts.user_id = users.id WHERE description LIKE "%${search_query}%";`)

        const users = await pool.query(`SELECT * FROM users WHERE full_name LIKE "%${search_query}%";`)

        console.log(posts[0])
        console.log(users[0])

        res.json([posts[0], users[0]])

    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {getSearchResults}